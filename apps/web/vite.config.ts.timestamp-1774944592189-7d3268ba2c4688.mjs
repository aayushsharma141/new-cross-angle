// vite.config.ts
import { defineConfig } from "file:///C:/Users/aayus/Desktop/main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/aayus/Desktop/main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { sentryVitePlugin } from "file:///C:/Users/aayus/Desktop/main/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\aayus\\Desktop\\main\\apps\\web";
var vite_config_default = defineConfig(() => {
  const hasSentryReleaseConfig = Boolean(
    process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
  );
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins: [
      react(),
      ...hasSentryReleaseConfig ? [
        sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          telemetry: false
        })
      ] : []
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "@repo/types": path.resolve(__vite_injected_original_dirname, "../../packages/types/src")
      }
    },
    build: {
      target: "es2020",
      chunkSizeWarningLimit: 1e3,
      cssCodeSplit: true,
      sourcemap: hasSentryReleaseConfig,
      modulePreload: {
        polyfill: false
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("mapbox-gl")) return "mapbox";
              if (id.includes("@sentry")) return "sentry";
              if (id.includes("framer-motion")) return "motion";
              if (id.includes("lenis") || id.includes("gsap")) return "motion-runtime";
              if (id.includes("@supabase")) return "supabase";
              if (id.includes("recharts")) return "charts";
              if (id.includes("@tiptap") || id.includes("lowlight")) return "editor";
              if (id.includes("react-router") || id.includes("@tanstack/react-query") || id.includes("react-dom") || id.includes("/react/")) {
                return "react-vendor";
              }
            }
            if (id.includes("/src/addons/discovery/")) return "discovery";
            return void 0;
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhYXl1c1xcXFxEZXNrdG9wXFxcXG1haW5cXFxcYXBwc1xcXFx3ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFheXVzXFxcXERlc2t0b3BcXFxcbWFpblxcXFxhcHBzXFxcXHdlYlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYWF5dXMvRGVza3RvcC9tYWluL2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgc2VudHJ5Vml0ZVBsdWdpbiB9IGZyb20gXCJAc2VudHJ5L3ZpdGUtcGx1Z2luXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoKSA9PiB7XG4gIGNvbnN0IGhhc1NlbnRyeVJlbGVhc2VDb25maWcgPSBCb29sZWFuKFxuICAgIHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOICYmXG4gICAgICBwcm9jZXNzLmVudi5TRU5UUllfT1JHICYmXG4gICAgICBwcm9jZXNzLmVudi5TRU5UUllfUFJPSkVDVCxcbiAgKTtcblxuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgcG9ydDogODA4MCxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KCksXG4gICAgICAuLi4oaGFzU2VudHJ5UmVsZWFzZUNvbmZpZ1xuICAgICAgICA/IFtcbiAgICAgICAgICAgIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgICAgICAgICAgICBvcmc6IHByb2Nlc3MuZW52LlNFTlRSWV9PUkcsXG4gICAgICAgICAgICAgIHByb2plY3Q6IHByb2Nlc3MuZW52LlNFTlRSWV9QUk9KRUNULFxuICAgICAgICAgICAgICBhdXRoVG9rZW46IHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOLFxuICAgICAgICAgICAgICB0ZWxlbWV0cnk6IGZhbHNlLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdKSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgICBcIkByZXBvL3R5cGVzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vcGFja2FnZXMvdHlwZXMvc3JjXCIpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICB0YXJnZXQ6IFwiZXMyMDIwXCIsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgICBzb3VyY2VtYXA6IGhhc1NlbnRyeVJlbGVhc2VDb25maWcsXG4gICAgICBtb2R1bGVQcmVsb2FkOiB7XG4gICAgICAgIHBvbHlmaWxsOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpKSB7XG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm1hcGJveC1nbFwiKSkgcmV0dXJuIFwibWFwYm94XCI7XG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkBzZW50cnlcIikpIHJldHVybiBcInNlbnRyeVwiO1xuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJmcmFtZXItbW90aW9uXCIpKSByZXR1cm4gXCJtb3Rpb25cIjtcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibGVuaXNcIikgfHwgaWQuaW5jbHVkZXMoXCJnc2FwXCIpKSByZXR1cm4gXCJtb3Rpb24tcnVudGltZVwiO1xuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAc3VwYWJhc2VcIikpIHJldHVybiBcInN1cGFiYXNlXCI7XG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlY2hhcnRzXCIpKSByZXR1cm4gXCJjaGFydHNcIjtcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHRpcHRhcFwiKSB8fCBpZC5pbmNsdWRlcyhcImxvd2xpZ2h0XCIpKSByZXR1cm4gXCJlZGl0b3JcIjtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwicmVhY3Qtcm91dGVyXCIpIHx8XG4gICAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIikgfHxcbiAgICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcInJlYWN0LWRvbVwiKSB8fFxuICAgICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3JlYWN0L1wiKVxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJyZWFjdC12ZW5kb3JcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCIvc3JjL2FkZG9ucy9kaXNjb3ZlcnkvXCIpKSByZXR1cm4gXCJkaXNjb3ZlcnlcIjtcblxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRTLFNBQVMsb0JBQW9CO0FBQ3pVLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx3QkFBd0I7QUFIakMsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLE1BQU07QUFDaEMsUUFBTSx5QkFBeUI7QUFBQSxJQUM3QixRQUFRLElBQUkscUJBQ1YsUUFBUSxJQUFJLGNBQ1osUUFBUSxJQUFJO0FBQUEsRUFDaEI7QUFFQSxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sR0FBSSx5QkFDQTtBQUFBLFFBQ0UsaUJBQWlCO0FBQUEsVUFDZixLQUFLLFFBQVEsSUFBSTtBQUFBLFVBQ2pCLFNBQVMsUUFBUSxJQUFJO0FBQUEsVUFDckIsV0FBVyxRQUFRLElBQUk7QUFBQSxVQUN2QixXQUFXO0FBQUEsUUFDYixDQUFDO0FBQUEsTUFDSCxJQUNBLENBQUM7QUFBQSxJQUNQO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDcEMsZUFBZSxLQUFLLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsTUFDbkU7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUix1QkFBdUI7QUFBQSxNQUN2QixjQUFjO0FBQUEsTUFDZCxXQUFXO0FBQUEsTUFDWCxlQUFlO0FBQUEsUUFDYixVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sYUFBYSxJQUFJO0FBQ2YsZ0JBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixrQkFBSSxHQUFHLFNBQVMsV0FBVyxFQUFHLFFBQU87QUFDckMsa0JBQUksR0FBRyxTQUFTLFNBQVMsRUFBRyxRQUFPO0FBQ25DLGtCQUFJLEdBQUcsU0FBUyxlQUFlLEVBQUcsUUFBTztBQUN6QyxrQkFBSSxHQUFHLFNBQVMsT0FBTyxLQUFLLEdBQUcsU0FBUyxNQUFNLEVBQUcsUUFBTztBQUN4RCxrQkFBSSxHQUFHLFNBQVMsV0FBVyxFQUFHLFFBQU87QUFDckMsa0JBQUksR0FBRyxTQUFTLFVBQVUsRUFBRyxRQUFPO0FBQ3BDLGtCQUFJLEdBQUcsU0FBUyxTQUFTLEtBQUssR0FBRyxTQUFTLFVBQVUsRUFBRyxRQUFPO0FBQzlELGtCQUNFLEdBQUcsU0FBUyxjQUFjLEtBQzFCLEdBQUcsU0FBUyx1QkFBdUIsS0FDbkMsR0FBRyxTQUFTLFdBQVcsS0FDdkIsR0FBRyxTQUFTLFNBQVMsR0FDckI7QUFDQSx1QkFBTztBQUFBLGNBQ1Q7QUFBQSxZQUNGO0FBRUEsZ0JBQUksR0FBRyxTQUFTLHdCQUF3QixFQUFHLFFBQU87QUFFbEQsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
