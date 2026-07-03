import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// ─── Load .env for SSR/Node context ─────────────────────────────────────────────
// Vite only exposes VITE_ vars to the browser bundle via import.meta.env.
// When we run serverless handlers via ssrLoadModule, they execute in Node
// context where process.env.VITE_SUPABASE_URL etc. are NOT automatically set.
// We parse the .env file manually here (at config evaluation time) so that
// process.env is populated before any handler module is loaded.
(function loadEnvForNode() {
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const envPath = path.resolve(__dirname, file);
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Don't overwrite vars already set in the environment (e.g. CI secrets)
      if (!(key in process.env)) process.env[key] = val;
    }
  }
})();

// ─── Vercel API Dev Plugin ──────────────────────────────────────────────────────
function vercelApiPlugin(): Plugin {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ?? '';

        // Only intercept /api/auth/* — let Vite proxy handle /api/supabase/*
        if (!url.startsWith('/api/auth/')) return next();

        // Map URL to handler file: /api/auth/me → api/auth/me.ts
        const routePath = url.split('?')[0].replace(/^\//, '');

        try {
          // Use Vite's ssrLoadModule to transpile TypeScript and resolve imports.
          // This is the official Vite API for running server-side modules in dev
          // plugins — it handles Windows paths, TypeScript, and module aliasing.
          const mod = await server.ssrLoadModule('/' + routePath + '.ts');
          const handler = mod.default;

          if (typeof handler !== 'function') {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No default export in handler' }));
            return;
          }

          // Parse body for POST/PUT/PATCH requests
          let body: Record<string, unknown> = {};
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            body = await new Promise((resolve) => {
              let raw = '';
              req.on('data', (chunk) => { raw += chunk; });
              req.on('end', () => {
                try { resolve(JSON.parse(raw)); }
                catch { resolve({}); }
              });
            });
          }

          // Parse cookies from the Cookie header
          const cookies = Object.fromEntries(
            (req.headers.cookie ?? '').split(';')
              .map(c => c.trim().split('='))
              .filter(p => p.length >= 2)
              .map(([k, ...rest]) => [k.trim(), decodeURIComponent(rest.join('='))])
          );

          // Build VercelRequest shim
          const vercelReq = {
            method: req.method,
            url: req.url,
            headers: req.headers,
            cookies,
            query: Object.fromEntries(new URLSearchParams(url.split('?')[1] ?? '')),
            body,
          };

          // Build VercelResponse shim — buffer Set-Cookie headers so they
          // are all written at once (Node.js requires this for multiple cookies).
          const setCookieValues: string[] = [];
          const vercelRes = {
            statusCode: 200,
            setHeader(name: string, value: string | string[]) {
              if (name.toLowerCase() === 'set-cookie') {
                const vals = Array.isArray(value) ? value : [value];
                setCookieValues.push(...vals);
              } else {
                res.setHeader(name, value);
              }
              return vercelRes;
            },
            getHeader: (name: string) => res.getHeader(name),
            status(code: number) { vercelRes.statusCode = code; return vercelRes; },
            json(data: unknown) {
              res.statusCode = vercelRes.statusCode;
              if (setCookieValues.length) res.setHeader('Set-Cookie', setCookieValues);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return vercelRes;
            },
            end() {
              res.statusCode = vercelRes.statusCode;
              if (setCookieValues.length) res.setHeader('Set-Cookie', setCookieValues);
              res.end();
              return vercelRes;
            },
            send(data: string) {
              res.statusCode = vercelRes.statusCode;
              if (setCookieValues.length) res.setHeader('Set-Cookie', setCookieValues);
              res.end(data);
              return vercelRes;
            },
          };

          await handler(vercelReq, vercelRes);
        } catch (err) {
          console.error(`[vercel-api-dev] Error in ${routePath}:`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal server error', detail: String(err) }));
        }
      });
    },
  };
}

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
      proxy: {
        // PostHog analytics proxy — silences DNS errors when blocked locally
        '/ingest': {
          target: 'https://us.i.posthog.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/ingest/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              if ((err as NodeJS.ErrnoException).code === 'ENOTFOUND') return;
              console.error('[posthog proxy]', err.message);
            });
          },
        },
        '^/s(/.*)?$': {
          target: 'https://us.i.posthog.com',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              if ((err as NodeJS.ErrnoException).code === 'ENOTFOUND') return;
              console.error('[posthog proxy]', err.message);
            });
          },
        },
        // ─── Supabase proxy ─────────────────────────────────────────────────────
        // In production, middleware.ts intercepts /api/supabase/* and injects
        // the access_token cookie as Authorization. In local dev (no edge
        // middleware) we proxy directly to Supabase so the Supabase JS client
        // can reach its endpoints (auth, rest, realtime, etc).
        '/api/supabase': {
          target: process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/supabase/, ''),
        },
      },
    },
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    plugins: [
      react(),
      // Runs api/auth/*.ts serverless handlers locally so auth works in `vite dev`
      vercelApiPlugin(),
      ...(hasSentryReleaseConfig
        ? [
            sentryVitePlugin({
              org: process.env.SENTRY_ORG,
              project: process.env.SENTRY_PROJECT,
              authToken: process.env.SENTRY_AUTH_TOKEN,
              telemetry: false,
              sourcemaps: {
                assets: './**',
                // Delete local .map files after upload so they are never deployed
                filesToDeleteAfterUpload: ['./dist/**/*.js.map'],
              },
              release: {
                // Set VITE_RELEASE=$(git rev-parse --short HEAD) in CI pipeline
                name: process.env.VITE_RELEASE ?? process.env.GITHUB_SHA ?? 'local',
                setCommits: { auto: true },
              },
            }),
          ]
        : []),
    ],
    resolve: {
      // Dedupe ensures every package uses the exact same React instance.
      // Without this, hooks break with "Cannot read properties of null (reading 'useState')".
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@repo/types': path.resolve(__dirname, '../../packages/types/src'),
      },
    },
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 250,
      cssCodeSplit: true,
      // 'hidden' = maps generated but sourceMappingURL stripped so maps are
      // not publicly accessible but can be uploaded to Sentry.
      sourcemap: hasSentryReleaseConfig ? 'hidden' : false,
      modulePreload: { polyfill: false },
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
              if (id.includes('lucide-react')) return 'icons';
              if (id.includes('react-hook-form')) return 'forms';
              if (id.includes('three') && /[/\\]node_modules[/\\]three[/\\]/.test(id)) return 'three';
              if (id.includes('@dnd-kit')) return 'dnd';
              if (id.includes('sonner')) return 'notifications';
              if (id.includes('vaul')) return 'drawer';
              if (id.includes('dompurify')) return 'sanitize';
              if (id.includes('date-fns')) return 'dates';
              if (id.includes('html2canvas')) return 'capture';
              if (id.includes('react-markdown') || id.includes('rehype-') || id.includes('remark-')) return 'markdown';
              if (id.includes('@radix-ui')) return 'radix';
              if (
                id.includes('react-router') ||
                id.includes('@tanstack/react-query') ||
                id.includes('@tanstack/react-table') ||
                id.includes('react-dom') ||
                (id.includes('node_modules') && /[/\\]react[/\\]/.test(id))
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
