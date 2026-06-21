// Creates two Gemini-scored matching workflows and POSTs them to n8n.
//  - interlance-candidate-match : body {candidateId} -> ranked OFFERS for that candidate
//  - interlance-recruiter-match : body {offerId}     -> ranked CANDIDATES for that offer
// Each: Webhook -> Offers + Candidates (enriched Mongo aggregates) -> Build (Gemini prompt)
//   -> Gemini (chat-completions-compatible, json_object) -> Parse -> Respond {matches:[...]}.
// Run: N8N_API_KEY=... node n8n-build-match-workflows.mjs
const API = 'http://localhost:5678/api/v1';
const KEY = process.env.N8N_API_KEY;
const MONGO_CRED = { id: 'WkubRx6dOSMYLuDx', name: 'Interlance Mongo' };
const GEMINI_HTTP_CRED = { id: process.env.GEMINI_HTTP_CRED_ID || 'eteOLK68V1j3e4dA', name: 'Gemini HTTP Header' };
const MODEL = process.env.RAG_MODEL || 'gemini-2.5-flash';
if (!KEY) { console.error('Missing N8N_API_KEY'); process.exit(1); }

const offersPipe = [
  { $match: { status: 'PUBLISHED' } },
  { $addFields: { oid: { $toString: '$_id' } } },
  { $lookup: { from: 'companies', let: { cid: '$companyId' }, pipeline: [
      { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$cid'] } } }, { $project: { _id: 0, name: 1 } } ], as: 'company' } },
  { $project: { _id: 0, offerId: '$oid', title: 1, type: 1, location: 1, duration: 1, requiredSkills: 1, description: 1, company: { $first: '$company.name' } } }
];
const candidatesPipe = [
  { $match: { role: 'CANDIDATE' } },
  { $addFields: { uid: { $toString: '$_id' } } },
  { $lookup: { from: 'candidate_profiles', localField: 'uid', foreignField: 'userId', as: 'profile' } },
  { $lookup: { from: 'ai_results', localField: 'uid', foreignField: 'userId', as: 'ai' } },
  { $project: { _id: 0, candidateId: '$uid', fullName: 1,
      headline: { $first: '$profile.headline' }, fieldOfStudy: { $first: '$profile.fieldOfStudy' },
      location: { $first: '$profile.location' },
      skills: { $map: { input: { $ifNull: [{ $first: '$profile.skills' }, []] }, as: 's', in: { $ifNull: ['$$s.name', '$$s'] } } },
      seniority: { $first: '$ai.seniority' }, profileType: { $first: '$ai.profileType' } } }
];

const candidateBuildCode = `
const S = v => v == null ? '' : String(v);
const cands = $('Candidates').all().map(i => i.json);
const offers = $('Offers').all().map(i => i.json);
const body = ($('Webhook').first().json.body) || {};
const cid = S(body.candidateId);
const me = cands.find(c => S(c.candidateId) === cid) || {};
const cap = (a, n) => Array.isArray(a) ? a.slice(0, n).join(', ') : '';
const profile = 'Name: ' + S(me.fullName) + ' | headline: ' + S(me.headline) + ' | field: ' + S(me.fieldOfStudy) + ' | seniority: ' + (S(me.seniority) || 'n/a') + ' | skills: ' + cap(me.skills, 25);
let offersTxt = '';
offers.forEach(o => { offersTxt += '- offerId=' + S(o.offerId) + ' | "' + S(o.title) + '" @ ' + S(o.company) + ' | ' + S(o.type) + ' | ' + S(o.location) + ' | requiredSkills: ' + (Array.isArray(o.requiredSkills) ? o.requiredSkills.join(', ') : '') + ' | ' + S(o.description).slice(0, 200) + '\\n'; });
const sys = 'You are a career matching engine for a recruiting marketplace. Score how well the CANDIDATE fits each OFFER from 0-100 (strict, based on skill/field/seniority overlap). Respond with ONLY a JSON object.';
const user = 'CANDIDATE:\\n' + profile + '\\n\\nOFFERS:\\n' + (offersTxt || '(none)') + '\\n\\nReturn JSON: {"matches":[{"offerId":<id>,"title":<string>,"company":<string>,"type":<string>,"score":<0-100 integer>,"reasons":[<2-3 short strings why it fits>],"gaps":[<0-2 short missing-skill strings>]}]} ranked by score descending. Include every offer exactly once.';
return [{ json: { requestBody: { model: '${MODEL}', temperature: 0.2, max_tokens: 4000, messages: [ { role: 'system', content: sys }, { role: 'user', content: user } ] } } }];
`.trim();

const recruiterBuildCode = `
const S = v => v == null ? '' : String(v);
const cands = $('Candidates').all().map(i => i.json);
const offers = $('Offers').all().map(i => i.json);
const body = ($('Webhook').first().json.body) || {};
const offer = offers.find(o => S(o.offerId) === S(body.offerId)) || {};
const cap = (a, n) => Array.isArray(a) ? a.slice(0, n).join(', ') : '';
const offerTxt = '"' + S(offer.title) + '" @ ' + S(offer.company) + ' | ' + S(offer.type) + ' | ' + S(offer.location) + ' | requiredSkills: ' + (Array.isArray(offer.requiredSkills) ? offer.requiredSkills.join(', ') : '') + ' | ' + S(offer.description).slice(0, 400);
let candsTxt = '';
cands.forEach(c => { candsTxt += '- candidateId=' + S(c.candidateId) + ' | ' + S(c.fullName) + ' | ' + (S(c.headline) || S(c.profileType)) + ' | seniority: ' + (S(c.seniority) || 'n/a') + ' | field: ' + S(c.fieldOfStudy) + ' | skills: ' + cap(c.skills, 20) + '\\n'; });
const sys = 'You are a recruiting matching engine. Score how well each CANDIDATE fits the OFFER from 0-100 (strict, based on skill/field/seniority overlap). Respond with ONLY a JSON object.';
const user = 'OFFER:\\n' + offerTxt + '\\n\\nCANDIDATES:\\n' + (candsTxt || '(none)') + '\\n\\nReturn JSON: {"matches":[{"candidateId":<id>,"name":<string>,"headline":<string>,"score":<0-100 integer>,"reasons":[<2-3 short strings why they fit>],"gaps":[<0-2 short missing-skill strings>]}]} ranked by score descending. Include every candidate exactly once.';
return [{ json: { requestBody: { model: '${MODEL}', temperature: 0.2, max_tokens: 4000, messages: [ { role: 'system', content: sys }, { role: 'user', content: user } ] } } }];
`.trim();

const parseCode = `
const item = $input.first().json || {};
let content = '';
try { content = item.choices[0].message.content; } catch (e) { content = ''; }
if (Array.isArray(content)) content = content.map(p => (p && p.text) || '').join('');
content = String(content).replace(/^\\\`\\\`\\\`json/i, '').replace(/^\\\`\\\`\\\`/, '').replace(/\\\`\\\`\\\`$/, '').trim();
let matches = [];
try { const j = JSON.parse(content); matches = Array.isArray(j) ? j : (j.matches || []); } catch (e) { matches = []; }
matches.sort((a, b) => (b.score || 0) - (a.score || 0));
return [{ json: { matches } }];
`.trim();

function buildWorkflow(name, path, buildCode) {
  const nodes = [
    { id: 'webhook', name: 'Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 2.1, position: [-260, 0],
      parameters: { httpMethod: 'POST', path, responseMode: 'responseNode', options: {} }, webhookId: path },
    { id: 'offers', name: 'Offers', type: 'n8n-nodes-base.mongoDb', typeVersion: 1.3, position: [-60, 0],
      parameters: { operation: 'aggregate', collection: 'offers', query: JSON.stringify(offersPipe) }, credentials: { mongoDb: MONGO_CRED } },
    { id: 'cands', name: 'Candidates', type: 'n8n-nodes-base.mongoDb', typeVersion: 1.3, position: [140, 0],
      parameters: { operation: 'aggregate', collection: 'users', query: JSON.stringify(candidatesPipe) }, credentials: { mongoDb: MONGO_CRED } },
    { id: 'build', name: 'Build', type: 'n8n-nodes-base.code', typeVersion: 2, position: [340, 0], parameters: { jsCode: buildCode } },
    { id: 'gemini', name: 'Gemini', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [540, 0],
      parameters: { method: 'POST', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
        sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.requestBody) }}', options: {} },
      credentials: { httpHeaderAuth: GEMINI_HTTP_CRED }, retryOnFail: true, maxTries: 3, waitBetweenTries: 4000 },
    { id: 'parse', name: 'Parse', type: 'n8n-nodes-base.code', typeVersion: 2, position: [740, 0], parameters: { jsCode: parseCode } },
    { id: 'respond', name: 'Respond', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: [940, 0],
      parameters: { respondWith: 'json', responseBody: '={{ JSON.stringify({ matches: $json.matches }) }}', options: {} } }
  ];
  const connections = {
    'Webhook': { main: [[{ node: 'Offers', type: 'main', index: 0 }]] },
    'Offers': { main: [[{ node: 'Candidates', type: 'main', index: 0 }]] },
    'Candidates': { main: [[{ node: 'Build', type: 'main', index: 0 }]] },
    'Build': { main: [[{ node: 'Gemini', type: 'main', index: 0 }]] },
    'Gemini': { main: [[{ node: 'Parse', type: 'main', index: 0 }]] },
    'Parse': { main: [[{ node: 'Respond', type: 'main', index: 0 }]] }
  };
  return { name, nodes, connections, settings: { executionOrder: 'v1' } };
}

async function upsert(wf, existingId) {
  const url = existingId ? API + '/workflows/' + existingId : API + '/workflows';
  const method = existingId ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: { 'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(wf) });
  const txt = await res.text();
  let id = existingId; try { id = JSON.parse(txt).id; } catch {}
  console.log(wf.name, '->', res.status, 'id:', id || txt.slice(0, 200));
  return id;
}

const candWf = buildWorkflow('Interlance Candidate Match', 'interlance-candidate-match', candidateBuildCode);
const recWf = buildWorkflow('Interlance Recruiter Match', 'interlance-recruiter-match', recruiterBuildCode);
const candId = await upsert(candWf, process.env.CAND_WF_ID || 'bnn1QzM7jCWHqsdT');
const recId = await upsert(recWf, process.env.REC_WF_ID || 'dBKcN8HaABsG4HmC');

// Activate both.
for (const id of [candId, recId]) {
  if (!id) continue;
  const r = await fetch(API + '/workflows/' + id + '/activate', { method: 'POST', headers: { 'X-N8N-API-KEY': KEY } });
  console.log('activate', id, '->', r.status);
}
