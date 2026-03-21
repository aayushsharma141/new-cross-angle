import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@repo/types": path.resolve(__dirname, "../../packages/types/src"),
      "@repo/utils": path.resolve(__dirname, "../../packages/utils/src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    sourcemap: true, // required for Sentry
    rollupOptions: {
      output: {
        // Rely on Vite defaults for chunking to prevent circular execution graph errors
      },
    },
  },
}));
// Force restart to clear cache
