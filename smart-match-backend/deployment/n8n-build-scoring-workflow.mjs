// Creates the "Interlance CV Scoring" workflow (separate webhook).
// Webhook -> Mongo (candidates w/ http cvUrl + name) -> download PDF -> extract text
//   -> Build Scoring prompt -> Groq (one call, scores+ranks all resumes vs the target role) -> Respond.
// Run: N8N_API_KEY=... node n8n-build-scoring-workflow.mjs
const API = 'http://localhost:5678/api/v1';
const KEY = process.env.N8N_API_KEY;
const MONGO_CRED = { id: 'WkubRx6dOSMYLuDx', name: 'Interlance Mongo' };
const GEMINI_HTTP_CRED = { id: process.env.GEMINI_HTTP_CRED_ID || 'eteOLK68V1j3e4dA', name: 'Gemini HTTP Header' };
const MODEL = process.env.RAG_MODEL || 'gemini-2.5-flash';
if (!KEY) { console.error('Missing N8N_API_KEY'); process.exit(1); }

// candidate_profiles -> join users(fullName); keep only http(s) resumes (local /uploads not reachable from n8n).
const resumesPipe = [
  { $lookup: { from: 'users', let: { u: '$userId' }, pipeline: [
      { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$u'] } } }, { $project: { _id: 0, fullName: 1 } }
    ], as: 'user' } },
  { $match: { cvUrl: { $regex: '^https?://' } } },
  { $project: { _id: 0, fullName: { $first: '$user.fullName' }, headline: 1, cvUrl: 1 } }
];

const buildScoringCode = `
const meta = $('Resumes').all().map(i => i.json);
const ex = $input.all().map(i => i.json);
const items = meta.map((m, idx) => ({
  name: m.fullName || m.headline || ('Candidate ' + (idx + 1)),
  text: ((ex[idx] && (ex[idx].text || ex[idx].extractedText)) || '').replace(/\\s+/g, ' ').trim().slice(0, 3500)
}));
const body = ($('CV Webhook').first().json.body) || {};
const ask = String(body.question || body.role || 'a suitable role');
let user = 'TARGET REQUEST: ' + ask + '\\n\\nScore and RANK these candidates best-first for the target role, using ONLY their resume text below.\\n\\n';
items.forEach((it) => { user += '### ' + it.name + '\\n' + (it.text || '(resume unavailable)') + '\\n\\n'; });
const sys = 'You are a senior technical recruiter. From each candidate resume, score their fit for the TARGET role on a 0-100 scale (be strict and evidence-based; only credit skills/experience actually present in the resume). Output markdown: first a one-line summary naming the best-fit candidate, then for each candidate RANKED best-first: a header "**<Name> — <score>/100**", then bullets for "Matched:" (concrete strengths from the resume) and "Gaps:" (what the role needs that is missing). If a resume is unavailable/empty, give it 0 and say the resume could not be read.';
return [{ json: { requestBody: { model: '${MODEL}', temperature: 0, max_tokens: 1300, messages: [ { role: 'system', content: sys }, { role: 'user', content: user } ] } } }];
`.trim();

const formatCode = `
const r = $json; let answer;
if (r && r.choices && r.choices[0] && r.choices[0].message) answer = r.choices[0].message.content;
else if (r && r.error) answer = 'Scoring error: ' + (r.error.message || JSON.stringify(r.error));
else answer = 'No scoring was produced.';
return [{ json: { answer, sources: ['resumes'] } }];
`.trim();

const nodes = [
  { id: 'webhook', name: 'CV Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 2.1, position: [-260, 0],
    parameters: { httpMethod: 'POST', path: 'interlance-cv-score', responseMode: 'responseNode', options: {} }, webhookId: 'interlance-cv-score' },
  { id: 'resumes', name: 'Resumes', type: 'n8n-nodes-base.mongoDb', typeVersion: 1.3, position: [-60, 0],
    parameters: { operation: 'aggregate', collection: 'candidate_profiles', query: JSON.stringify(resumesPipe) },
    credentials: { mongoDb: MONGO_CRED } },
  { id: 'download', name: 'Download CV', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [140, 0],
    parameters: { method: 'GET', url: '={{ $json.cvUrl }}', options: { response: { response: { responseFormat: 'file', outputPropertyName: 'data' } } } },
    continueOnFail: true },
  { id: 'parse', name: 'Parse PDF', type: 'n8n-nodes-base.extractFromFile', typeVersion: 1, position: [340, 0],
    parameters: { operation: 'pdf', binaryPropertyName: 'data', options: {} }, continueOnFail: true },
  { id: 'build', name: 'Build Scoring', type: 'n8n-nodes-base.code', typeVersion: 2, position: [540, 0],
    parameters: { jsCode: buildScoringCode } },
  { id: 'score', name: 'Gemini Score', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [740, 0],
    parameters: {
      method: 'POST', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
      sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.requestBody) }}', options: {}
    },
    credentials: { httpHeaderAuth: GEMINI_HTTP_CRED }, retryOnFail: true, maxTries: 3, waitBetweenTries: 4000 },
  { id: 'format', name: 'Format', type: 'n8n-nodes-base.code', typeVersion: 2, position: [940, 0],
    parameters: { jsCode: formatCode } },
  { id: 'respond', name: 'Respond', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: [1140, 0],
    parameters: { respondWith: 'json', responseBody: '={{ JSON.stringify($json) }}', options: {} } }
];

const connections = {
  'CV Webhook': { main: [[{ node: 'Resumes', type: 'main', index: 0 }]] },
  'Resumes': { main: [[{ node: 'Download CV', type: 'main', index: 0 }]] },
  'Download CV': { main: [[{ node: 'Parse PDF', type: 'main', index: 0 }]] },
  'Parse PDF': { main: [[{ node: 'Build Scoring', type: 'main', index: 0 }]] },
  'Build Scoring': { main: [[{ node: 'Gemini Score', type: 'main', index: 0 }]] },
  'Gemini Score': { main: [[{ node: 'Format', type: 'main', index: 0 }]] },
  'Format': { main: [[{ node: 'Respond', type: 'main', index: 0 }]] }
};

const workflow = { name: 'Interlance CV Scoring', nodes, connections, settings: { executionOrder: 'v1' } };
const WF_ID = process.env.SCORING_WF_ID || '3Eg2at6jFbHT4IA2';
const res = await fetch(API + '/workflows/' + WF_ID, { method: 'PUT', headers: { 'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(workflow) });
const txt = await res.text();
console.log('STATUS', res.status);
try { console.log('workflow id:', JSON.parse(txt).id); } catch { console.log(txt.slice(0, 400)); }
