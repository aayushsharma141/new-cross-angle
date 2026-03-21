// vite.config.ts
import { defineConfig } from "file:///C:/Users/aayus/Desktop/main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/aayus/Desktop/main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { sentryVitePlugin } from "file:///C:/Users/aayus/Desktop/main/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\aayus\\Desktop\\main\\apps\\web";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@repo/ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@repo/types": path.resolve(__vite_injected_original_dirname, "../../packages/types/src"),
      "@repo/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/src")
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    sourcemap: true,
    // required for Sentry
    rollupOptions: {
      output: {
        // Rely on Vite defaults for chunking to prevent circular execution graph errors
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhYXl1c1xcXFxEZXNrdG9wXFxcXG1haW5cXFxcYXBwc1xcXFx3ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFheXVzXFxcXERlc2t0b3BcXFxcbWFpblxcXFxhcHBzXFxcXHdlYlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYWF5dXMvRGVza3RvcC9tYWluL2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgc2VudHJ5Vml0ZVBsdWdpbiB9IGZyb20gXCJAc2VudHJ5L3ZpdGUtcGx1Z2luXCI7XG5cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBzZW50cnlWaXRlUGx1Z2luKHtcbiAgICAgIG9yZzogcHJvY2Vzcy5lbnYuU0VOVFJZX09SRyxcbiAgICAgIHByb2plY3Q6IHByb2Nlc3MuZW52LlNFTlRSWV9QUk9KRUNULFxuICAgICAgYXV0aFRva2VuOiBwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTixcbiAgICAgIHRlbGVtZXRyeTogZmFsc2UsXG4gICAgfSksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICBcIkByZXBvL3VpXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vcGFja2FnZXMvdWkvc3JjXCIpLFxuICAgICAgXCJAcmVwby90eXBlc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL3R5cGVzL3NyY1wiKSxcbiAgICAgIFwiQHJlcG8vdXRpbHNcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy91dGlscy9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDE1MDAsXG4gICAgc291cmNlbWFwOiB0cnVlLCAvLyByZXF1aXJlZCBmb3IgU2VudHJ5XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIFJlbHkgb24gVml0ZSBkZWZhdWx0cyBmb3IgY2h1bmtpbmcgdG8gcHJldmVudCBjaXJjdWxhciBleGVjdXRpb24gZ3JhcGggZXJyb3JzXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KSk7XG4vLyBGb3JjZSByZXN0YXJ0IHRvIGNsZWFyIGNhY2hlXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRTLFNBQVMsb0JBQW9CO0FBQ3pVLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx3QkFBd0I7QUFIakMsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04saUJBQWlCO0FBQUEsTUFDZixLQUFLLFFBQVEsSUFBSTtBQUFBLE1BQ2pCLFNBQVMsUUFBUSxJQUFJO0FBQUEsTUFDckIsV0FBVyxRQUFRLElBQUk7QUFBQSxNQUN2QixXQUFXO0FBQUEsSUFDYixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLFlBQVksS0FBSyxRQUFRLGtDQUFXLHVCQUF1QjtBQUFBLE1BQzNELGVBQWUsS0FBSyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLE1BQ2pFLGVBQWUsS0FBSyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLElBQ25FO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsdUJBQXVCO0FBQUEsSUFDdkIsV0FBVztBQUFBO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxNQUVSO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
