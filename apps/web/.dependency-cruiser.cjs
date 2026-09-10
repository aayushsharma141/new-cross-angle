/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    combinedDependencies: false,
    moduleSystems: ["es6", "cjs"],
    prefix: "",
    exclude: {
      path: ["node_modules", "\\.d\\.ts$"],
    },
  },

  forbidden: [
    // ── Layer hierarchy enforcement ─────────────────────────────────────────
    // pages → (components | hooks | lib) → services → repositories → providers → integrations
    // No reverse imports allowed.

    {
      name: "no-provider-in-pages",
      comment: "Page components must not import storage providers directly. Use services or hooks.",
      severity: "error",
      from: { path: "^src/pages" },
      to: { path: "^src/services/media/providers/(ImageKit|Supabase)Provider" },
    },
    {
      name: "no-repository-in-pages",
      comment: "Page components must not access MediaRepository directly. Use MediaService.",
      severity: "error",
      from: { path: "^src/pages" },
      to: { path: "^src/services/media/MediaRepository" },
    },
    {
      name: "no-provider-in-components",
      comment: "UI components must not import storage providers directly.",
      severity: "error",
      from: { path: "^src/components" },
      to: { path: "^src/services/media/providers/(ImageKit|Supabase)Provider" },
    },
    {
      name: "no-supabase-in-components",
      comment: "UI components must not call supabase directly. Use services, hooks, or context.",
      severity: "error",
      from: { path: "^src/components" },
      to: { path: "^src/integrations/supabase/client" },
    },
    {
      name: "no-repository-imports-react",
      comment: "Repositories and services must be framework-agnostic and not import React.",
      severity: "error",
      from: { path: "^src/services/.*(Repository|Provider|StorageGateway)" },
      to: { path: "^react$" },
    },
    {
      name: "no-component-imports-repository",
      comment: "UI components must not access Repositories directly. Use services or hooks.",
      severity: "error",
      from: { path: "^src/components" },
      to: { path: "^src/services/.*Repository" },
    },
    {
      name: "no-circular",
      comment: "Circular dependencies are forbidden.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphan",
      comment: "Every file should be imported somewhere (or be an entry point).",
      severity: "info",
      from: { orphan: true, pathNot: ["^src/main\\.tsx$", "^src/vite-env\\.d\\.ts$", "\\.d\\.ts$"] },
      to: {},
    },

    // ── Auth layer enforcement ───────────────────────────────────────────────
    {
      name: "no-auth-internals-outside-auth",
      comment: "Auth _internals must only be imported by AuthProvider.",
      severity: "error",
      from: { pathNot: "^src/components/auth" },
      to: { path: "^src/components/auth/_internals" },
    },

    // ── Media layer enforcement ──────────────────────────────────────────────
    {
      name: "no-media-internals-outside-service",
      comment: "Media internal modules must only be imported by the media service layer.",
      severity: "error",
      from: { pathNot: "^src/services/media" },
      to: { path: "^src/services/media/(MediaRepository|UploadOrchestrator|providers)" },
    },
  ],
};
