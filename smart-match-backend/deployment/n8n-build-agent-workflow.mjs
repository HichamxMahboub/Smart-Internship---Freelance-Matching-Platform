// Builds the Interlance assistant workflow and PUTs it over the existing one.
// Architecture: Webhook -> 4 MongoDB enriched aggregates (server-side $lookup joins) ->
// Build Context (Code) -> AI Agent (Groq chat model + Simple Memory, NO model-controlled tools) -> Respond.
// Tools were dropped because mongoDbTool can't run a fixed aggregate pipeline (it errors
// "pipeline must be an array"), which let the model hallucinate. Deterministic context = source of truth.
// Run: N8N_API_KEY=... GROQ_CRED_ID=... node n8n-build-agent-workflow.mjs
const API = 'http://localhost:5678/api/v1';
const KEY = process.env.N8N_API_KEY;
const WF_ID = process.env.WF_ID || 'PawvsLDWmgLEpUTY';
const MONGO_CRED = { id: 'WkubRx6dOSMYLuDx', name: 'Interlance Mongo' };
const GEMINI_CRED = { id: process.env.GEMINI_CRED_ID || 'M2XB0DmZsHSBnMRu', name: process.env.GEMINI_CRED_NAME || 'Gemini AI Studio' };
const MODEL = process.env.RAG_MODEL || 'models/gemini-2.5-flash';

if (!KEY) { console.error('Missing N8N_API_KEY'); process.exit(1); }

// ---- enriched aggregates (refs are strings, users._id is ObjectId -> bridge with $toString) ----
const skillNames = { $map: { input: { $ifNull: [{ $first: '$profile.skills' }, []] }, as: 's', in: { $ifNull: ['$$s.name', '$$s'] } } };

const candidatesPipe = [
  { $match: { role: 'CANDIDATE' } },
  { $addFields: { uid: { $toString: '$_id' } } },
  { $lookup: { from: 'candidate_profiles', localField: 'uid', foreignField: 'userId', as: 'profile' } },
  { $lookup: { from: 'ai_results', localField: 'uid', foreignField: 'userId', as: 'ai' } },
  { $project: { _id: 0, fullName: 1,
      headline: { $first: '$profile.headline' }, fieldOfStudy: { $first: '$profile.fieldOfStudy' },
      location: { $first: '$profile.location' }, skills: skillNames,
      seniority: { $first: '$ai.seniority' }, profileType: { $first: '$ai.profileType' }, primaryStack: { $first: '$ai.primaryStack' } } }
];
const offersPipe = [
  { $addFields: { oid: { $toString: '$_id' } } },
  { $lookup: { from: 'companies', let: { cid: '$companyId' }, pipeline: [ { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$cid'] } } }, { $project: { _id: 0, name: 1 } } ], as: 'company' } },
  { $lookup: { from: 'applications', localField: 'oid', foreignField: 'offerId', as: 'apps' } },
  { $lookup: { from: 'users', let: { ids: { $map: { input: '$apps', as: 'a', in: '$$a.candidateId' } } }, pipeline: [ { $match: { $expr: { $in: [{ $toString: '$_id' }, '$$ids'] } } }, { $project: { _id: 1, fullName: 1 } } ], as: 'appUsers' } },
  { $project: { _id: 0, title: 1, type: 1, location: 1, duration: 1, requiredSkills: 1, status: 1,
      company: { $first: '$company.name' }, applicantCount: { $size: '$apps' },
      applicants: { $map: { input: '$apps', as: 'a', in: {
        candidate: { $first: { $map: { input: { $filter: { input: '$appUsers', as: 'u', cond: { $eq: [{ $toString: '$$u._id' }, '$$a.candidateId'] } } }, as: 'u2', in: '$$u2.fullName' } } },
        matchingScore: '$$a.matchingScore', status: '$$a.status' } } } } }
];
const applicationsPipe = [
  { $lookup: { from: 'offers', let: { oid: '$offerId' }, pipeline: [ { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$oid'] } } }, { $project: { _id: 0, title: 1 } } ], as: 'offer' } },
  { $lookup: { from: 'users', let: { cid: '$candidateId' }, pipeline: [ { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$cid'] } } }, { $project: { _id: 0, fullName: 1 } } ], as: 'cand' } },
  { $project: { _id: 0, candidate: { $first: '$cand.fullName' }, offer: { $first: '$offer.title' }, status: 1, matchingScore: 1, appliedAt: 1 } }
];
const companiesPipe = [
  { $addFields: { cid: { $toString: '$_id' } } },
  { $lookup: { from: 'offers', localField: 'cid', foreignField: 'companyId', as: 'offers' } },
  { $project: { _id: 0, name: 1, sector: 1, description: 1, validationStatus: 1, website: 1,
      offerCount: { $size: '$offers' }, offerTitles: { $map: { input: '$offers', as: 'o', in: '$$o.title' } } } }
];

const mongo = (id, name, pipe) => ({
  id, name, type: 'n8n-nodes-base.mongoDb', typeVersion: 1.3, position: [0, 0],
  parameters: { operation: 'aggregate', collection: 'users', query: JSON.stringify(pipe) },
  credentials: { mongoDb: MONGO_CRED }
});
// each aggregate sets its own base collection
const candNode = mongo('cands', 'Candidates', candidatesPipe);
const offerNode = mongo('offs', 'Offers', offersPipe); offerNode.parameters.collection = 'offers';
const appNode = mongo('apps', 'Applications', applicationsPipe); appNode.parameters.collection = 'applications';
const compNode = mongo('comps', 'Companies', companiesPipe); compNode.parameters.collection = 'companies';

const rules = [
  'You are Interlance AI, the data analyst for the Interlance recruiting marketplace (internships + freelance jobs).',
  'Answer ONLY from the DATA section below — it is the COMPLETE and ONLY source of truth.',
  'NEVER invent or assume a company, offer, candidate, name, skill, number, status or date that is not present in DATA. No example/placeholder names (e.g. "John Doe", "Data Scientist").',
  'Treat any job title / role / skill the user mentions ("Solution Architect", "Backend", "React") as an OFFER title or SKILL, matched fuzzily (ignore typos and case) — never as a user role.',
  'For "candidates for <offer/role/skill X>": find the matching offer; if it has applicants, list them (candidate, matchingScore, status) sorted by score; if it has 0 applicants, say so and instead recommend candidates whose skills overlap the offer requiredSkills, noting they have not applied. If no offer matches, say so and list the available offer titles.',
  'STYLE: lead with a one-line direct answer, then bold section headers + bullet lists (nested bullets for sub-details, no tables). Cite real names/titles/numbers/dates. Omit empty fields. Cap long skill lists to ~8 then "(+N more)". Do not show internal ids. Use conversation memory for follow-ups ("those", "that offer").'
].join('\n');

const buildContextCode = `
const S = v => v == null ? '' : String(v);
const cands = $('Candidates').all().map(i => i.json);
const offers = $('Offers').all().map(i => i.json);
const apps = $('Applications').all().map(i => i.json);
const comps = $('Companies').all().map(i => i.json);
const cap = (arr, n) => arr.slice(0, n).join(', ') + (arr.length > n ? ' (+' + (arr.length - n) + ' more)' : '');

const L = [];
L.push('# DATA');
L.push('');
L.push('## Companies (' + comps.length + ')');
comps.forEach(c => L.push('- ' + S(c.name) + ' | sector: ' + (S(c.sector) || 'n/a') + ' | status: ' + S(c.validationStatus) + ' | offers(' + c.offerCount + '): ' + (c.offerTitles || []).join('; ')));
L.push('');
L.push('## Offers (' + offers.length + ')');
offers.forEach(o => {
  const sk = Array.isArray(o.requiredSkills) ? o.requiredSkills.join(', ') : '';
  L.push('- "' + S(o.title) + '" @ ' + S(o.company) + ' | ' + S(o.type) + ' | ' + S(o.location) + ' | ' + S(o.duration) + ' | required skills: ' + sk + ' | status: ' + S(o.status) + ' | applicants: ' + o.applicantCount);
  (o.applicants || []).forEach(a => L.push('    - applicant: ' + (S(a.candidate) || 'unknown') + ' | matchingScore: ' + S(a.matchingScore) + ' | ' + S(a.status)));
});
L.push('');
L.push('## Candidates (' + cands.length + ')');
cands.forEach(c => {
  const sk = Array.isArray(c.skills) ? cap(c.skills, 10) : '';
  L.push('- ' + S(c.fullName) + ' | ' + (S(c.headline) || S(c.profileType)) + ' | seniority: ' + (S(c.seniority) || 'n/a') + ' | field: ' + S(c.fieldOfStudy) + ' | location: ' + S(c.location) + ' | stack: ' + S(c.primaryStack) + ' | skills: ' + sk);
});
L.push('');
L.push('## Applications (' + apps.length + ')');
apps.forEach(a => L.push('- ' + (S(a.candidate) || 'unknown') + ' -> "' + (S(a.offer) || 'unknown/deleted offer') + '" | ' + S(a.status) + ' | matchingScore: ' + S(a.matchingScore) + ' | ' + S(a.appliedAt)));

const body = ($('Webhook').first().json.body) || {};
const context = ${JSON.stringify(rules)} + '\\n\\n' + L.join('\\n');
return [{ json: { question: S(body.question || ''), sessionId: S(body.sessionId || 'default'), context } }];
`.trim();

const nodes = [
  { id: 'webhook', name: 'Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 2.1, position: [-260, 0],
    parameters: { httpMethod: 'POST', path: 'interlance-assistant', responseMode: 'responseNode', options: {} }, webhookId: 'interlance-assistant' },
  { ...candNode, position: [-60, 0] },
  { ...offerNode, position: [140, 0] },
  { ...appNode, position: [340, 0] },
  { ...compNode, position: [540, 0] },
  { id: 'context', name: 'Build Context', type: 'n8n-nodes-base.code', typeVersion: 2, position: [740, 0],
    parameters: { jsCode: buildContextCode } },
  { id: 'agent', name: 'AI Agent', type: '@n8n/n8n-nodes-langchain.agent', typeVersion: 3.1, position: [980, -40],
    parameters: { promptType: 'define', text: '={{ $json.question }}', options: { systemMessage: '={{ $json.context }}' } },
    retryOnFail: true, maxTries: 2, waitBetweenTries: 4000 },
  { id: 'model', name: 'Gemini Chat Model', type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', typeVersion: 1.1, position: [900, 200],
    parameters: { modelName: MODEL, options: { temperature: 0 } }, credentials: { googlePalmApi: GEMINI_CRED },
    retryOnFail: true, maxTries: 3, waitBetweenTries: 4000 },
  { id: 'memory', name: 'Simple Memory', type: '@n8n/n8n-nodes-langchain.memoryBufferWindow', typeVersion: 1.4, position: [1080, 200],
    parameters: { sessionIdType: 'customKey', sessionKey: '={{ $json.sessionId }}', contextWindowLength: 10 } },
  { id: 'respond', name: 'Respond', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: [1240, -40],
    parameters: { respondWith: 'json', responseBody: '={{ JSON.stringify({ answer: $json.output, sources: ["companies","offers","candidates","applications"] }) }}', options: {} } }
];

const connections = {
  'Webhook': { main: [[{ node: 'Candidates', type: 'main', index: 0 }]] },
  'Candidates': { main: [[{ node: 'Offers', type: 'main', index: 0 }]] },
  'Offers': { main: [[{ node: 'Applications', type: 'main', index: 0 }]] },
  'Applications': { main: [[{ node: 'Companies', type: 'main', index: 0 }]] },
  'Companies': { main: [[{ node: 'Build Context', type: 'main', index: 0 }]] },
  'Build Context': { main: [[{ node: 'AI Agent', type: 'main', index: 0 }]] },
  'AI Agent': { main: [[{ node: 'Respond', type: 'main', index: 0 }]] },
  'Gemini Chat Model': { ai_languageModel: [[{ node: 'AI Agent', type: 'ai_languageModel', index: 0 }]] },
  'Simple Memory': { ai_memory: [[{ node: 'AI Agent', type: 'ai_memory', index: 0 }]] }
};

const workflow = { name: 'Interlance RAG Assistant', nodes, connections, settings: { executionOrder: 'v1' } };
const res = await fetch(API + '/workflows/' + WF_ID, { method: 'PUT', headers: { 'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(workflow) });
console.log('STATUS', res.status);
console.log((await res.text()).slice(0, 400));
