export const TelemetryConfig = {
  isProd: import.meta.env.PROD,
  otlpEndpoint: import.meta.env.VITE_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  propagateCorsUrls: [
    new RegExp('^http://localhost:8080/'),
    new RegExp('^https://iuuivmwqodefdrrrewol\\.supabase\\.co/')
  ],
};
