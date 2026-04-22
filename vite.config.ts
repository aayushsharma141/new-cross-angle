import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(async ({ mode, command }) => {
    const plugins: any[] = [react()];



    return {
        root: path.resolve(__dirname, "./apps/web"),
        server: {
            host: "::",
            port: 8080,
            proxy: {
                "/ingest": {
                    target: "https://us.i.posthog.com",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/ingest/, ""),
                },
            },
        },
        plugins,
        envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
        envDir: path.resolve(__dirname, "./apps/web"),
        publicDir: path.resolve(__dirname, "./apps/web/public"),
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./apps/web/src"),
                "@repo/ui": path.resolve(__dirname, "./packages/ui/src"),
                "@repo/types": path.resolve(__dirname, "./packages/types/src"),
                "@repo/utils": path.resolve(__dirname, "./packages/utils/src"),
            },
        },
        build: {
            chunkSizeWarningLimit: 2000,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ["react", "react-dom", "react-router-dom"],
                        ui: ["lucide-react", "framer-motion", "clsx", "tailwind-merge"],
                        radix: [
                            "@radix-ui/react-accordion",
                            "@radix-ui/react-avatar",
                            "@radix-ui/react-checkbox",
                            "@radix-ui/react-dialog",
                            "@radix-ui/react-dropdown-menu",
                            "@radix-ui/react-label",
                            "@radix-ui/react-popover",
                            "@radix-ui/react-progress",
                            "@radix-ui/react-radio-group",
                            "@radix-ui/react-scroll-area",
                            "@radix-ui/react-select",
                            "@radix-ui/react-separator",
                            "@radix-ui/react-slider",
                            "@radix-ui/react-slot",
                            "@radix-ui/react-switch",
                            "@radix-ui/react-tabs",
                            "@radix-ui/react-toast",
                            "@radix-ui/react-tooltip"
                        ],
                        charts: ["recharts"],
                        db: ["@supabase/supabase-js"],
                        forms: ["react-hook-form", "@hookform/resolvers", "zod"],
                        utils: ["date-fns", "gsap"]
                    },
                },
            },
        },
    };
});
