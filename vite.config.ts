import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(async ({ mode, command }) => {
    const plugins: any[] = [react()];



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
