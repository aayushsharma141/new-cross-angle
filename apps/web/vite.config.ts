import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(() => {
  /**
   * Source-map upload to Sentry requires all three env vars to be set.
   * In CI (GitHub Actions / Vercel) set:
   *   SENTRY_AUTH_TOKEN  – from Sentry → Settings → Auth Tokens
   *   SENTRY_ORG         – your org slug  (e.g. "crossangle")
   *   SENTRY_PROJECT     – your project slug (e.g. "crossangle-web")
   */
  const hasSentryReleaseConfig = Boolean(
    process.env.SENTRY_AUTH_TOKEN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT,
  );

  return {
    server: {
      host: '::',
      port: 8080,
    },
    plugins: [
      react(),
      ...(hasSentryReleaseConfig
        ? [
            sentryVitePlugin({
              org: process.env.SENTRY_ORG,
              project: process.env.SENTRY_PROJECT,
              authToken: process.env.SENTRY_AUTH_TOKEN,
              telemetry: false,
              // Hidden sourcemaps: uploaded to Sentry, stripped from the
              // public bundle so stack traces remain readable in Sentry
              // but minified JS is still served to end-users.
              sourcemaps: {
                assets: './**',
                // Delete local .map files after upload so they are never
                // deployed to the CDN / hosting provider.
                filesToDeleteAfterUpload: ['./dist/**/*.js.map'],
              },
              release: {
                // Inject VITE_RELEASE at build time so the frontend SDK
                // and the source-map upload use the same release string.
                // Set VITE_RELEASE=$(git rev-parse --short HEAD) in your CI pipeline.
                name: process.env.VITE_RELEASE ?? process.env.GITHUB_SHA ?? 'local',
                // Automatically set commits for the release when possible
                setCommits: {
                  auto: true,
                },
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@repo/types': path.resolve(__dirname, '../../packages/types/src'),
      },
    },
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      /**
       * Always generate sourcemaps in hidden mode.
       * 'hidden' means .map files are generated but the `//# sourceMappingURL`
       * comment is omitted from the compiled JS, so the maps are not publicly
       * accessible but can be uploaded to Sentry at build time.
       *
       * In development ('inline') mode is fine — no upload occurs.
       */
      sourcemap: hasSentryReleaseConfig ? 'hidden' : false,
      modulePreload: {
        polyfill: false,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('mapbox-gl')) return 'mapbox';
              if (id.includes('@sentry')) return 'sentry';
              if (id.includes('framer-motion')) return 'motion';
              if (id.includes('lenis') || id.includes('gsap')) return 'motion-runtime';
              if (id.includes('@supabase')) return 'supabase';
              if (id.includes('recharts')) return 'charts';
              if (id.includes('@tiptap') || id.includes('lowlight')) return 'editor';
              if (
                id.includes('react-router') ||
                id.includes('@tanstack/react-query') ||
                id.includes('react-dom') ||
                id.includes('/react/')
              ) {
                return 'react-vendor';
              }
            }

            if (id.includes('/src/addons/discovery/')) return 'discovery';

            return undefined;
          },
        },
      },
    },
  };
});
