// Builds + POSTs the Interlance RAG workflow to local n8n via the public REST API.
// Run: node n8n-build-workflow.mjs
const API = 'http://localhost:5678/api/v1';
const KEY = process.env.N8N_API_KEY;
const MONGO_CRED = { id: 'WkubRx6dOSMYLuDx', name: 'Interlance Mongo' };
const HTTP_CRED = { id: 'aKO7lPDOB0Pv6q9k', name: 'OpenRouter Key' };
const MODEL = process.env.RAG_MODEL || 'deepseek/deepseek-chat-v3-0324:free';

// One aggregate over `companies` that $unionWith-pulls every collection, tagged by __c.
const pipeline = [
  { $addFields: { __c: 'companies' } },
  { $unionWith: { coll: 'offers', pipeline: [{ $addFields: { __c: 'offers' } }] } },
  { $unionWith: { coll: 'applications', pipeline: [{ $addFields: { __c: 'applications' } }] } },
  { $unionWith: { coll: 'candidate_profiles', pipeline: [{ $addFields: { __c: 'candidates' } }] } },
  { $unionWith: { coll: 'ai_results', pipeline: [{ $addFields: { __c: 'ai_results' } }] } },
  { $unionWith: { coll: 'users', pipeline: [{ $addFields: { __c: 'users' } }] } }
];

const buildContextCode = `
const docs = $input.all().map(i => i.json);
const by = (c) => docs.filter(d => d.__c === c);
const S = v => v == null ? '' : String(v);

const companies = by('companies');
const offers = by('offers');
const applications = by('applications');
const candidates = by('candidates');
const ai = by('ai_results');
const users = by('users');

const userById = {}; users.forEach(u => userById[S(u._id)] = u);
const companyById = {}; companies.forEach(c => companyById[S(c._id)] = c);
const offerById = {}; offers.forEach(o => offerById[S(o._id)] = o);
const aiByUser = {}; ai.forEach(a => { (aiByUser[S(a.userId)] = aiByUser[S(a.userId)] || []).push(a); });

const L = [];
L.push('# INTERLANCE PLATFORM SNAPSHOT');
L.push('');
L.push('## Companies (' + companies.length + ')');
companies.forEach(c => {
  const offs = offers.filter(o => S(o.companyId) === S(c._id));
  L.push('- ' + S(c.name) + ' | sector: ' + S(c.sector) + ' | status: ' + S(c.validationStatus) + ' | offers: ' + offs.length);
});
L.push('');
L.push('## Offers (' + offers.length + ')');
offers.forEach(o => {
  const comp = companyById[S(o.companyId)];
  const apps = applications.filter(a => S(a.offerId) === S(o._id));
  const skills = Array.isArray(o.requiredSkills) ? o.requiredSkills.join(', ') : '';
  L.push('- "' + S(o.title) + '" @ ' + (comp ? S(comp.name) : '?') + ' | type: ' + S(o.type) + ' | location: ' + S(o.location) + ' | status: ' + S(o.status) + ' | skills: ' + skills + ' | applications: ' + apps.length);
});
L.push('');
L.push('## Applications (' + applications.length + ')');
applications.forEach(a => {
  const o = offerById[S(a.offerId)];
  const u = userById[S(a.candidateId)];
  L.push('- ' + (u ? S(u.fullName) : 'candidate ' + S(a.candidateId)) + ' -> "' + (o ? S(o.title) : S(a.offerId)) + '" | status: ' + S(a.status) + ' | matchingScore: ' + S(a.matchingScore));
});
L.push('');
L.push('## Candidates (' + candidates.length + ')');
candidates.forEach(c => {
  const u = userById[S(c.userId)];
  const an = (aiByUser[S(c.userId)] || [])[0];
  const skills = Array.isArray(c.skills) ? c.skills.map(s => (s && s.name) ? s.name : s).join(', ') : '';
  L.push('- ' + (u ? S(u.fullName) : S(c.userId)) + ' | ' + S(c.headline) + ' | field: ' + S(c.fieldOfStudy) + ' | location: ' + S(c.location) + (an ? ' | profile: ' + S(an.profileType) + ' (' + S(an.seniority) + ')' : '') + ' | skills: ' + skills);
});
L.push('');
L.push('## Users by role');
const roleCount = {}; users.forEach(u => roleCount[S(u.role)] = (roleCount[S(u.role)] || 0) + 1);
Object.keys(roleCount).forEach(r => L.push('- ' + r + ': ' + roleCount[r]));

const context = L.join('\\n');

const body = ($('Webhook').first().json.body) || {};
const question = S(body.question || '');
const history = Array.isArray(body.history) ? body.history : [];

const messages = [{ role: 'system', content: 'You are Interlance AI, the data analyst for a recruiting marketplace (internships + freelance). Answer ONLY from the PLATFORM SNAPSHOT below. Be concise and specific; cite real company names, offer titles, candidate names and numbers. If the snapshot lacks the info, say so plainly. Format with short markdown (bold + bullet lists).\\n\\n' + context }];
history.slice(-6).forEach(h => { if (h && h.role && h.content) messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: S(h.content) }); });
messages.push({ role: 'user', content: question });

const sources = [];
if (companies.length) sources.push('companies');
if (offers.length) sources.push('offers');
if (applications.length) sources.push('applications');
if (candidates.length) sources.push('candidate_profiles');
if (ai.length) sources.push('ai_results');

return [{ json: { requestBody: { model: '${MODEL}', messages, temperature: 0.2, max_tokens: 800 }, sources } }];
`.trim();

const formatCode = `
const r = $json;
let answer;
if (r && r.choices && r.choices[0] && r.choices[0].message) answer = r.choices[0].message.content;
else if (r && r.error) answer = 'Assistant error: ' + (r.error.message || JSON.stringify(r.error));
else answer = 'No answer was produced.';
const sources = ($('Build Context').first().json.sources) || [];
return [{ json: { answer, sources } }];
`.trim();

const nodes = [
  {
    id: 'webhook', name: 'Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 2.1,
    position: [0, 0],
    parameters: { httpMethod: 'POST', path: 'interlance-assistant', responseMode: 'responseNode', options: {} },
    webhookId: 'interlance-assistant'
  },
  {
    id: 'fetch', name: 'Fetch Data', type: 'n8n-nodes-base.mongoDb', typeVersion: 1.3,
    position: [240, 0],
    parameters: { operation: 'aggregate', collection: 'companies', query: JSON.stringify(pipeline) },
    credentials: { mongoDb: MONGO_CRED }
  },
  {
    id: 'context', name: 'Build Context', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [480, 0],
    parameters: { jsCode: buildContextCode }
  },
  {
    id: 'llm', name: 'OpenRouter', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2,
    position: [720, 0],
    parameters: {
      method: 'POST',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($json.requestBody) }}',
      options: {}
    },
    credentials: { httpHeaderAuth: HTTP_CRED }
  },
  {
    id: 'format', name: 'Format Response', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [960, 0],
    parameters: { jsCode: formatCode }
  },
  {
    id: 'respond', name: 'Respond', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1,
    position: [1200, 0],
    parameters: { respondWith: 'json', responseBody: '={{ JSON.stringify($json) }}', options: {} }
  }
];

const connections = {
  'Webhook': { main: [[{ node: 'Fetch Data', type: 'main', index: 0 }]] },
  'Fetch Data': { main: [[{ node: 'Build Context', type: 'main', index: 0 }]] },
  'Build Context': { main: [[{ node: 'OpenRouter', type: 'main', index: 0 }]] },
  'OpenRouter': { main: [[{ node: 'Format Response', type: 'main', index: 0 }]] },
  'Format Response': { main: [[{ node: 'Respond', type: 'main', index: 0 }]] }
};

const workflow = {
  name: 'Interlance RAG Assistant',
  nodes,
  connections,
  settings: { executionOrder: 'v1' }
};

const res = await fetch(API + '/workflows', {
  method: 'POST',
  headers: { 'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify(workflow)
});
const text = await res.text();
console.log('STATUS', res.status);
console.log(text);
