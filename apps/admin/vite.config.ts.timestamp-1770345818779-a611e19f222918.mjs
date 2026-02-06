// vite.config.ts
import { defineConfig } from "file:///C:/Users/aayus/Desktop/main/apps/admin/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/aayus/Desktop/main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/aayus/Desktop/main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\aayus\\Desktop\\main\\apps\\admin";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@repo/ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@repo/types": path.resolve(__vite_injected_original_dirname, "../../packages/types/src"),
      "@repo/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhYXl1c1xcXFxEZXNrdG9wXFxcXG1haW5cXFxcYXBwc1xcXFxhZG1pblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYWF5dXNcXFxcRGVza3RvcFxcXFxtYWluXFxcXGFwcHNcXFxcYWRtaW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2FheXVzL0Rlc2t0b3AvbWFpbi9hcHBzL2FkbWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKEJvb2xlYW4pIGFzIGFueSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIFwiQHJlcG8vdWlcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy91aS9zcmNcIiksXG4gICAgICBcIkByZXBvL3R5cGVzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vcGFja2FnZXMvdHlwZXMvc3JjXCIpLFxuICAgICAgXCJAcmVwby91dGlsc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL3V0aWxzL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVCxTQUFTLG9CQUFvQjtBQUMvVSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUM5RSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDcEMsWUFBWSxLQUFLLFFBQVEsa0NBQVcsdUJBQXVCO0FBQUEsTUFDM0QsZUFBZSxLQUFLLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsTUFDakUsZUFBZSxLQUFLLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsSUFDbkU7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
