import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.API_URL || 'http://host.docker.internal:3001';

export function uploadFlow() {
  const tenants = ['marketing', 'sales', 'engineering'];
  const tenant = tenants[Math.floor(Math.random() * tenants.length)];
  const idempotencyKey = `idemp-${__VU}-${__ITER}`;

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'x-tenant': tenant,
      'x-idempotency-key': idempotencyKey,
    },
  };

  // 1. Upload Request
  const uploadRes = http.post(`${BASE_URL}/upload`, null, params);
  
  check(uploadRes, {
    'upload status is 200': (r) => r.status === 200,
    'has assetId': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!body.assetId;
      } catch (e) {
        return false;
      }
    }
  });

  if (uploadRes.status !== 200) {
    sleep(1);
    return;
  }

  const assetId = JSON.parse(uploadRes.body).assetId;

  // 2. Poll Pipeline Status
  let pipelineReady = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!pipelineReady && attempts < maxAttempts) {
    sleep(0.5); // wait 500ms between polls
    
    const pipelineRes = http.get(`${BASE_URL}/pipeline/${assetId}`);
    
    if (pipelineRes.status === 200) {
      const state = JSON.parse(pipelineRes.body);
      if (state.status === 'ready' || state.status === 'ready_degraded') {
        pipelineReady = true;
      } else if (state.status === 'failed') {
        break; // Stop polling on failure
      }
    }
    attempts++;
  }

  check(pipelineReady, {
    'pipeline reached ready state': (r) => r === true,
  });
}
