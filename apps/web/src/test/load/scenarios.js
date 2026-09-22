import { uploadFlow } from './upload-flow.js';

// Get the test type from environment, defaulting to baseline
const TEST_TYPE = __ENV.TEST_TYPE || 'baseline';

// Strict SLA thresholds for Production Simulation (Tier B)
const productionSLAThresholds = {
  http_req_duration: ['p(50)<150', 'p(95)<350', 'p(99)<500'],
  http_req_failed: ['rate<0.005'], // < 0.5% error rate
};

const baselineOptions = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up
    { duration: '1m', target: 250 }, // Ramp to peak
    { duration: '2m', target: 250 }, // Hold peak
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: productionSLAThresholds,
};

const stressOptions = {
  stages: [
    { duration: '1m', target: 200 },
    { duration: '2m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '1m', target: 2000 }, // Stress
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    ...productionSLAThresholds,
    http_req_failed: ['rate<0.02'], // Relaxed to < 2% under 2000 VU stress
  },
};

const soakOptions = {
  stages: [
    { duration: '2m', target: 100 }, // Gentle ramp up
    { duration: '8h', target: 100 }, // Soak for 8 hours
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: productionSLAThresholds,
};

const chaosOptions = {
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 100,
      maxVUs: 2000,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Max 5% failure during active chaos injection
  },
};

const optionsMap = {
  baseline: baselineOptions,
  stress: stressOptions,
  soak: soakOptions,
  chaos: chaosOptions,
};

export const options = optionsMap[TEST_TYPE];

export default function () {
  uploadFlow();
}
