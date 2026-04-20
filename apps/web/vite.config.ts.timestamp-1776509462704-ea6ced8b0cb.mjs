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
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    plugins: [
      react(),
      ...hasSentryReleaseConfig ? [
        sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          telemetry: false,
          // Hidden sourcemaps: uploaded to Sentry, stripped from the
          // public bundle so stack traces remain readable in Sentry
          // but minified JS is still served to end-users.
          sourcemaps: {
            assets: "./**",
            // Delete local .map files after upload so they are never
            // deployed to the CDN / hosting provider.
            filesToDeleteAfterUpload: ["./dist/**/*.js.map"]
          },
          release: {
            // Inject VITE_RELEASE at build time so the frontend SDK
            // and the source-map upload use the same release string.
            // Set VITE_RELEASE=$(git rev-parse --short HEAD) in your CI pipeline.
            name: process.env.VITE_RELEASE ?? process.env.GITHUB_SHA ?? "local",
            // Automatically set commits for the release when possible
            setCommits: {
              auto: true
            }
          }
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
      /**
       * Always generate sourcemaps in hidden mode.
       * 'hidden' means .map files are generated but the `//# sourceMappingURL`
       * comment is omitted from the compiled JS, so the maps are not publicly
       * accessible but can be uploaded to Sentry at build time.
       *
       * In development ('inline') mode is fine — no upload occurs.
       */
      sourcemap: hasSentryReleaseConfig ? "hidden" : false,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhYXl1c1xcXFxEZXNrdG9wXFxcXG1haW5cXFxcYXBwc1xcXFx3ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFheXVzXFxcXERlc2t0b3BcXFxcbWFpblxcXFxhcHBzXFxcXHdlYlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYWF5dXMvRGVza3RvcC9tYWluL2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgc2VudHJ5Vml0ZVBsdWdpbiB9IGZyb20gJ0BzZW50cnkvdml0ZS1wbHVnaW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+IHtcclxuICAvKipcclxuICAgKiBTb3VyY2UtbWFwIHVwbG9hZCB0byBTZW50cnkgcmVxdWlyZXMgYWxsIHRocmVlIGVudiB2YXJzIHRvIGJlIHNldC5cclxuICAgKiBJbiBDSSAoR2l0SHViIEFjdGlvbnMgLyBWZXJjZWwpIHNldDpcclxuICAgKiAgIFNFTlRSWV9BVVRIX1RPS0VOICBcdTIwMTMgZnJvbSBTZW50cnkgXHUyMTkyIFNldHRpbmdzIFx1MjE5MiBBdXRoIFRva2Vuc1xyXG4gICAqICAgU0VOVFJZX09SRyAgICAgICAgIFx1MjAxMyB5b3VyIG9yZyBzbHVnICAoZS5nLiBcImNyb3NzYW5nbGVcIilcclxuICAgKiAgIFNFTlRSWV9QUk9KRUNUICAgICBcdTIwMTMgeW91ciBwcm9qZWN0IHNsdWcgKGUuZy4gXCJjcm9zc2FuZ2xlLXdlYlwiKVxyXG4gICAqL1xyXG4gIGNvbnN0IGhhc1NlbnRyeVJlbGVhc2VDb25maWcgPSBCb29sZWFuKFxyXG4gICAgcHJvY2Vzcy5lbnYuU0VOVFJZX0FVVEhfVE9LRU4gJiZcclxuICAgICAgcHJvY2Vzcy5lbnYuU0VOVFJZX09SRyAmJlxyXG4gICAgICBwcm9jZXNzLmVudi5TRU5UUllfUFJPSkVDVCxcclxuICApO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6ICc6OicsXHJcbiAgICAgIHBvcnQ6IDgwODAsXHJcbiAgICB9LFxyXG4gICAgZW52UHJlZml4OiBbJ1ZJVEVfJywgJ05FWFRfUFVCTElDXyddLFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICByZWFjdCgpLFxyXG4gICAgICAuLi4oaGFzU2VudHJ5UmVsZWFzZUNvbmZpZ1xyXG4gICAgICAgID8gW1xyXG4gICAgICAgICAgICBzZW50cnlWaXRlUGx1Z2luKHtcclxuICAgICAgICAgICAgICBvcmc6IHByb2Nlc3MuZW52LlNFTlRSWV9PUkcsXHJcbiAgICAgICAgICAgICAgcHJvamVjdDogcHJvY2Vzcy5lbnYuU0VOVFJZX1BST0pFQ1QsXHJcbiAgICAgICAgICAgICAgYXV0aFRva2VuOiBwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTixcclxuICAgICAgICAgICAgICB0ZWxlbWV0cnk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIC8vIEhpZGRlbiBzb3VyY2VtYXBzOiB1cGxvYWRlZCB0byBTZW50cnksIHN0cmlwcGVkIGZyb20gdGhlXHJcbiAgICAgICAgICAgICAgLy8gcHVibGljIGJ1bmRsZSBzbyBzdGFjayB0cmFjZXMgcmVtYWluIHJlYWRhYmxlIGluIFNlbnRyeVxyXG4gICAgICAgICAgICAgIC8vIGJ1dCBtaW5pZmllZCBKUyBpcyBzdGlsbCBzZXJ2ZWQgdG8gZW5kLXVzZXJzLlxyXG4gICAgICAgICAgICAgIHNvdXJjZW1hcHM6IHtcclxuICAgICAgICAgICAgICAgIGFzc2V0czogJy4vKionLFxyXG4gICAgICAgICAgICAgICAgLy8gRGVsZXRlIGxvY2FsIC5tYXAgZmlsZXMgYWZ0ZXIgdXBsb2FkIHNvIHRoZXkgYXJlIG5ldmVyXHJcbiAgICAgICAgICAgICAgICAvLyBkZXBsb3llZCB0byB0aGUgQ0ROIC8gaG9zdGluZyBwcm92aWRlci5cclxuICAgICAgICAgICAgICAgIGZpbGVzVG9EZWxldGVBZnRlclVwbG9hZDogWycuL2Rpc3QvKiovKi5qcy5tYXAnXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHJlbGVhc2U6IHtcclxuICAgICAgICAgICAgICAgIC8vIEluamVjdCBWSVRFX1JFTEVBU0UgYXQgYnVpbGQgdGltZSBzbyB0aGUgZnJvbnRlbmQgU0RLXHJcbiAgICAgICAgICAgICAgICAvLyBhbmQgdGhlIHNvdXJjZS1tYXAgdXBsb2FkIHVzZSB0aGUgc2FtZSByZWxlYXNlIHN0cmluZy5cclxuICAgICAgICAgICAgICAgIC8vIFNldCBWSVRFX1JFTEVBU0U9JChnaXQgcmV2LXBhcnNlIC0tc2hvcnQgSEVBRCkgaW4geW91ciBDSSBwaXBlbGluZS5cclxuICAgICAgICAgICAgICAgIG5hbWU6IHByb2Nlc3MuZW52LlZJVEVfUkVMRUFTRSA/PyBwcm9jZXNzLmVudi5HSVRIVUJfU0hBID8/ICdsb2NhbCcsXHJcbiAgICAgICAgICAgICAgICAvLyBBdXRvbWF0aWNhbGx5IHNldCBjb21taXRzIGZvciB0aGUgcmVsZWFzZSB3aGVuIHBvc3NpYmxlXHJcbiAgICAgICAgICAgICAgICBzZXRDb21taXRzOiB7XHJcbiAgICAgICAgICAgICAgICAgIGF1dG86IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIDogW10pLFxyXG4gICAgXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxyXG4gICAgICAgICdAcmVwby90eXBlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy90eXBlcy9zcmMnKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFsd2F5cyBnZW5lcmF0ZSBzb3VyY2VtYXBzIGluIGhpZGRlbiBtb2RlLlxyXG4gICAgICAgKiAnaGlkZGVuJyBtZWFucyAubWFwIGZpbGVzIGFyZSBnZW5lcmF0ZWQgYnV0IHRoZSBgLy8jIHNvdXJjZU1hcHBpbmdVUkxgXHJcbiAgICAgICAqIGNvbW1lbnQgaXMgb21pdHRlZCBmcm9tIHRoZSBjb21waWxlZCBKUywgc28gdGhlIG1hcHMgYXJlIG5vdCBwdWJsaWNseVxyXG4gICAgICAgKiBhY2Nlc3NpYmxlIGJ1dCBjYW4gYmUgdXBsb2FkZWQgdG8gU2VudHJ5IGF0IGJ1aWxkIHRpbWUuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEluIGRldmVsb3BtZW50ICgnaW5saW5lJykgbW9kZSBpcyBmaW5lIFx1MjAxNCBubyB1cGxvYWQgb2NjdXJzLlxyXG4gICAgICAgKi9cclxuICAgICAgc291cmNlbWFwOiBoYXNTZW50cnlSZWxlYXNlQ29uZmlnID8gJ2hpZGRlbicgOiBmYWxzZSxcclxuICAgICAgbW9kdWxlUHJlbG9hZDoge1xyXG4gICAgICAgIHBvbHlmaWxsOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ21hcGJveC1nbCcpKSByZXR1cm4gJ21hcGJveCc7XHJcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAc2VudHJ5JykpIHJldHVybiAnc2VudHJ5JztcclxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2ZyYW1lci1tb3Rpb24nKSkgcmV0dXJuICdtb3Rpb24nO1xyXG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbGVuaXMnKSB8fCBpZC5pbmNsdWRlcygnZ3NhcCcpKSByZXR1cm4gJ21vdGlvbi1ydW50aW1lJztcclxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BzdXBhYmFzZScpKSByZXR1cm4gJ3N1cGFiYXNlJztcclxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlY2hhcnRzJykpIHJldHVybiAnY2hhcnRzJztcclxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0B0aXB0YXAnKSB8fCBpZC5pbmNsdWRlcygnbG93bGlnaHQnKSkgcmV0dXJuICdlZGl0b3InO1xyXG4gICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdyZWFjdC1yb3V0ZXInKSB8fFxyXG4gICAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ0B0YW5zdGFjay9yZWFjdC1xdWVyeScpIHx8XHJcbiAgICAgICAgICAgICAgICBpZC5pbmNsdWRlcygncmVhY3QtZG9tJykgfHxcclxuICAgICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCcvcmVhY3QvJylcclxuICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAncmVhY3QtdmVuZG9yJztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3NyYy9hZGRvbnMvZGlzY292ZXJ5LycpKSByZXR1cm4gJ2Rpc2NvdmVyeSc7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0UyxTQUFTLG9CQUFvQjtBQUN6VSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRWpCLFNBQVMsd0JBQXdCO0FBSmpDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxNQUFNO0FBUWhDLFFBQU0seUJBQXlCO0FBQUEsSUFDN0IsUUFBUSxJQUFJLHFCQUNWLFFBQVEsSUFBSSxjQUNaLFFBQVEsSUFBSTtBQUFBLEVBQ2hCO0FBRUEsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLFdBQVcsQ0FBQyxTQUFTLGNBQWM7QUFBQSxJQUNuQyxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixHQUFJLHlCQUNBO0FBQUEsUUFDRSxpQkFBaUI7QUFBQSxVQUNmLEtBQUssUUFBUSxJQUFJO0FBQUEsVUFDakIsU0FBUyxRQUFRLElBQUk7QUFBQSxVQUNyQixXQUFXLFFBQVEsSUFBSTtBQUFBLFVBQ3ZCLFdBQVc7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUlYLFlBQVk7QUFBQSxZQUNWLFFBQVE7QUFBQTtBQUFBO0FBQUEsWUFHUiwwQkFBMEIsQ0FBQyxvQkFBb0I7QUFBQSxVQUNqRDtBQUFBLFVBQ0EsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLFlBSVAsTUFBTSxRQUFRLElBQUksZ0JBQWdCLFFBQVEsSUFBSSxjQUFjO0FBQUE7QUFBQSxZQUU1RCxZQUFZO0FBQUEsY0FDVixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNILElBQ0EsQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxRQUNwQyxlQUFlLEtBQUssUUFBUSxrQ0FBVywwQkFBMEI7QUFBQSxNQUNuRTtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLHVCQUF1QjtBQUFBLE1BQ3ZCLGNBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFTZCxXQUFXLHlCQUF5QixXQUFXO0FBQUEsTUFDL0MsZUFBZTtBQUFBLFFBQ2IsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGFBQWEsSUFBSTtBQUNmLGdCQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0Isa0JBQUksR0FBRyxTQUFTLFdBQVcsRUFBRyxRQUFPO0FBQ3JDLGtCQUFJLEdBQUcsU0FBUyxTQUFTLEVBQUcsUUFBTztBQUNuQyxrQkFBSSxHQUFHLFNBQVMsZUFBZSxFQUFHLFFBQU87QUFDekMsa0JBQUksR0FBRyxTQUFTLE9BQU8sS0FBSyxHQUFHLFNBQVMsTUFBTSxFQUFHLFFBQU87QUFDeEQsa0JBQUksR0FBRyxTQUFTLFdBQVcsRUFBRyxRQUFPO0FBQ3JDLGtCQUFJLEdBQUcsU0FBUyxVQUFVLEVBQUcsUUFBTztBQUNwQyxrQkFBSSxHQUFHLFNBQVMsU0FBUyxLQUFLLEdBQUcsU0FBUyxVQUFVLEVBQUcsUUFBTztBQUM5RCxrQkFDRSxHQUFHLFNBQVMsY0FBYyxLQUMxQixHQUFHLFNBQVMsdUJBQXVCLEtBQ25DLEdBQUcsU0FBUyxXQUFXLEtBQ3ZCLEdBQUcsU0FBUyxTQUFTLEdBQ3JCO0FBQ0EsdUJBQU87QUFBQSxjQUNUO0FBQUEsWUFDRjtBQUVBLGdCQUFJLEdBQUcsU0FBUyx3QkFBd0IsRUFBRyxRQUFPO0FBRWxELG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
