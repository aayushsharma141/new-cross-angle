import https from 'node:https';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('apps/web/.env') });
dotenv.config({ path: path.resolve('apps/web/.env.local') });

const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co';
const urlObj = new URL(SUPABASE_URL);

if (!ANON_KEY) {
  console.error('Missing VITE_SUPABASE_ANON_KEY in environment or apps/web/.env.local');
  process.exit(1);
}

function testRpcHttp(rpcName, body = {}) {
  return new Promise((resolve) => {
    const dataString = JSON.stringify(body);
    const req = https.request({
      hostname: urlObj.hostname,
      path: `/rest/v1/rpc/${rpcName}`,
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    req.write(dataString);
    req.end();
  });
}

console.log('================================================================');
console.log('PHASE S4: NEGATIVE RBAC & AUTHORIZATION CONTRACT TEST SUITE');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('PART 1: Anonymous HTTP Access via PostgREST /rest/v1/rpc/*');

const rpcChecks = [
  { name: 'get_lead_stats', body: {}, shouldDeny: true, desc: 'anon cannot execute get_lead_stats' },
  { name: 'rpc_register_dam_asset', body: { p_type: 'image', p_source: 'uploaded', p_title: 'x', p_file_id: 'x', p_url: 'x', p_size_bytes: 1, p_mime_type: 'x', p_width: 1, p_height: 1, p_domain: 'x', p_entity_type: 'x', p_entity_id: null, p_role: 'x' }, shouldDeny: true, desc: 'anon cannot execute rpc_register_dam_asset' },
  { name: 'rpc_create_uploading_asset', body: { p_type: 'image', p_source: 'uploaded', p_title: 'x' }, shouldDeny: true, desc: 'anon cannot execute rpc_create_uploading_asset' },
  { name: 'rpc_finalize_dam_asset', body: { p_asset_id: '00000000-0000-0000-0000-000000000000', p_file_id: 'x', p_url: 'x', p_size_bytes: 1, p_mime_type: 'x', p_width: 1, p_height: 1, p_domain: 'x', p_entity_type: 'x', p_entity_id: null, p_role: 'x' }, shouldDeny: true, desc: 'anon cannot execute rpc_finalize_dam_asset' },
  { name: 'update_media_metadata', body: { file_path: 'test', new_metadata: {} }, shouldDeny: true, desc: 'anon cannot execute update_media_metadata' },
  { name: 'get_admin_users', body: {}, shouldDeny: true, desc: 'anon cannot execute get_admin_users' },
  { name: 'record_blog_event', body: { p_event_type: 'view', p_article_id: 'test-slug', p_session_id: 's-1', p_metadata: {}, p_device: 'desktop', p_referrer: '' }, shouldDeny: false, desc: 'anon CAN execute record_blog_event (telemetry)' },
  { name: 'increment_project_view', body: { project_id: '00000000-0000-0000-0000-000000000000' }, shouldDeny: false, desc: 'anon CAN execute increment_project_view (telemetry)' }
];

for (const r of rpcChecks) {
  const res = await testRpcHttp(r.name, r.body);
  if (r.shouldDeny) {
    assert(res.status === 401 || res.status === 403 || res.status === 404, `${r.desc} -> HTTP ${res.status}`);
  } else {
    assert(res.status >= 200 && res.status < 300, `${r.desc} -> HTTP ${res.status}`);
  }
}

console.log('\n================================================================');
console.log(`TOTAL HTTP TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
