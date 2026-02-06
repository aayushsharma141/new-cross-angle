import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(async ({ mode, command }) => {
    const plugins: any[] = [react()];
    
    // Only load lovable-tagger in dev server mode (not during build)
    if (mode === "development" && command === "serve") {
        try {
            const { componentTagger } = await import("lovable-tagger");
            plugins.push(componentTagger());
        } catch {
            // Ignore if not available
        }
    }
    
    return {
        server: {
            host: "::",
            port: 8080,
        },
        plugins,
        publicDir: path.resolve(__dirname, "./apps/web/public"),
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./apps/web/src"),
                "@repo/ui": path.resolve(__dirname, "./packages/ui/src"),
                "@repo/types": path.resolve(__dirname, "./packages/types/src"),
                "@repo/utils": path.resolve(__dirname, "./packages/utils/src"),
            },
        },
    };
});
