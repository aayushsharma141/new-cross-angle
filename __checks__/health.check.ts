import { ApiCheck, AssertionBuilder } from 'checkly/constructs'

/**
 * Deep Health Probe Target
 * Validates the status and payload of Supabase's Edge Function health probe.
 */
export const healthProbeApiCheck = new ApiCheck('health-probe-api-check', {
  name: 'Edge Function Health Probe (?deep=true)',
  activated: true,
  // Ensure you set process.env.SUPABASE_FUNCTIONS_URL in your Checkly dashboard
  request: {
    url: `${process.env.SUPABASE_FUNCTIONS_URL || 'https://crossangle.supabase.co/functions/v1'}/health?deep=true`,
    method: 'GET',
    headers: [
      { key: 'Accept', value: 'application/json' },
      { key: 'User-Agent', value: 'Checkly-Health-Probe' }
    ],
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.status').equals('ok'),
      AssertionBuilder.jsonBody('$.probe').equals('deep'),
      AssertionBuilder.jsonBody('$.db_status').equals('connected'),
    ],
  },
  // Ensure the whole request + DB ping operates under the 400ms SLO threshold.
  // We set a strict 1s fail state.
  responseTimeSeconds: 1, 
})
