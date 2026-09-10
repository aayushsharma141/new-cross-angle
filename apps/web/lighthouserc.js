module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8080/'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'ready in',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['warn', {minScore: 0.9}],
        'categories:seo': ['warn', {minScore: 0.9}],
        // Web Vitals SLO
        'largest-contentful-paint': ['warn', {maxNumericValue: 2500}],
        'cumulative-layout-shift': ['warn', {maxNumericValue: 0.1}],
        // Total Blocking Time is a good proxy for INP in LH
        'total-blocking-time': ['warn', {maxNumericValue: 200}],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
