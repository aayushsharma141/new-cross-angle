import { defineConfig } from 'checkly'

/**
 * Checkly Configuration
 * -------------------
 * This file defines the Configuration-as-Code for uptime and latency synthetics.
 * It is tied to the Production environment by default.
 */
export default defineConfig({
  projectName: 'CrossAngle Interior',
  logicalId: 'crossangle-interior-production',
  repoUrl: 'https://github.com/crossangle/main',
  checks: {
    // API Check for the Supabase Edge Function Health Probe
    apiChecks: {
      frequency: 5, // Runs every 5 minutes
      locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'], // Distributed ping locations
      tags: ['api', 'production', 'supabase'],
    },
    // Standard checks for the main frontend URL
    browserChecks: {
      frequency: 10,
      locations: ['us-east-1', 'eu-west-1'],
      tags: ['ui', 'production', 'vercel'],
    },
  },
  cli: {
    runLocation: 'us-east-1', // Default location when doing local `npx checkly test`
  },
})
