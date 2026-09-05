export interface ArchitecturePrinciple {
  id: string;
  name: string;
  description: string;
  owner: string;
  blocking: boolean;
  testFile: string;
  testCase: string;
  status: 'active' | 'evaluating' | 'deprecated';
}

export interface ADRRecord {
  id: string;
  title: string;
  status: 'ACCEPTED' | 'PROPOSED' | 'SUPERSEDED' | 'DEPRECATED' | 'REJECTED';
  date: string;
  owner: string;
  context: string;
  decision: string;
  evidenceTest: string;
  statusVerified: boolean;
  affectedPackages: string[];
  dependentServices: string[];
  implementationCoverage: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  openDebtIds: string[];
}

export interface ArchitectureKPI {
  id: string;
  name: string;
  definition: string;
  current: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'degrading' | 'optimal';
}

export type DebtCategory = 'security' | 'architecture' | 'performance' | 'maintainability' | 'documentation';

export interface ArchitectureDebtItem {
  id: string;
  category: DebtCategory;
  title: string;
  domain: string;
  weight: number;
  occurrences: number;
  remediationPlan: string;
}

export interface PillarScore {
  name: string;
  weight: number;
  score: number;
  target: number;
  description: string;
}

export interface EngineeringValidationEvidence {
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    verifiedAt: string;
    status: string;
  };
  chaos: {
    suite: string;
    scenariosPassed: number;
    scenariosTotal: number;
    circuitBreakerActive: boolean;
    status: string;
  };
  loadTesting: {
    harness: string;
    p99LatencyMs: number;
    rpsCapacity: number;
    errorRatePct: number;
    status: string;
  };
  telemetry: {
    eventsValidated: number;
    schemaDriftDetected: number;
    status: string;
  };
}

export interface ArchitectureHistoryEntry {
  version: string;
  date: string;
  title: string;
  scores: {
    governance: number;
    compliance: number;
    debt: number;
    operational: number;
    composite: number;
  };
  debtPoints: number;
  fitnessPassPct: number;
  violationsCount: number;
}

export interface GraphNode {
  id: string;
  label: string;
  layer: 'presentation' | 'service' | 'gateway' | 'infrastructure' | 'persistence';
  status: 'active' | 'isolated' | 'proxy';
}

export interface GraphEdge {
  from: string;
  to: string;
  contract: string;
  isCompliant: boolean;
}

export interface ArchitectureManifest {
  version: string;
  standard: string;
  governanceModel: string;
  scoringPillars: Record<string, { name: string; weight: number; description: string }>;
  debtTaxonomy: Record<DebtCategory, { weight: number; description: string }>;
  owners: Record<string, string>;
  principles: ArchitecturePrinciple[];
  adrs: ADRRecord[];
  techRadar: {
    adopt: string[];
    trial: string[];
    assess: string[];
    hold: string[];
  };
  kpis: ArchitectureKPI[];
  debtItems: ArchitectureDebtItem[];
  engineeringValidation: EngineeringValidationEvidence;
  history: ArchitectureHistoryEntry[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export const ARCHITECTURE_MANIFEST: ArchitectureManifest = {
  version: "2026.6-enterprise",
  standard: "Enterprise Architecture Reference Standard",
  governanceModel: "Event-Driven Continuous Compliance",
  scoringPillars: {
    governance: { name: "Governance Index", weight: 0.25, description: "Charter clarity, ADR verification, explicit ownership mapping" },
    compliance: { name: "Compliance Index", weight: 0.25, description: "CI fitness functions pass rate and boundary invariants" },
    technical_debt: { name: "Technical Debt Index", weight: 0.30, description: "Quantified AST & architectural debt across 5 taxonomy categories" },
    engineering_validation: { name: "Engineering Validation Index (EVI)", weight: 0.20, description: "Empirical verification (Lighthouse CI, Chaos, Load, Telemetry)" },
  },
  debtTaxonomy: {
    security: { weight: 5, description: "Data isolation, auth boundary, or cryptographic exposure" },
    architecture: { weight: 4, description: "Layer coupling, missing abstractions, or circular dependencies" },
    performance: { weight: 3, description: "Client-side bundle bloat, N+1 queries, uncompressed payloads" },
    maintainability: { weight: 2, description: "Token bypassing, inline styles, duplicated domain logic" },
    documentation: { weight: 1, description: "Missing ADRs, unannotated API contracts, stale diagrams" },
  },
  owners: {
    platform: "Platform Architecture Owner",
    security: "Security & Compliance Owner",
    frontend: "Frontend Platform Owner",
    data: "Data Platform Owner",
    cloud: "Cloud Operations & FinOps Owner",
  },
  principles: [
    {
      id: "P1",
      name: "Prefer Identifiers Over Raw URLs",
      description: "Consumers must reference media via immutable UUIDs mapped through polymorphic asset_usages. Avoid hardcoding raw CDN hostnames in feature components.",
      owner: "platform",
      blocking: true,
      testFile: "src/test/architecture.test.ts",
      testCase: "Contract: Repositories and Services must not import React or React DOM",
      status: "active",
    },
    {
      id: "P2",
      name: "Interfaces Over Vendors (ACL)",
      description: "External SDKs must be isolated behind domain interfaces like StorageGateway.ts. Components and services must never directly import vendor packages.",
      owner: "platform",
      blocking: true,
      testFile: "src/test/architecture.test.ts",
      testCase: "Contract: UI Components must not import storage providers directly",
      status: "active",
    },
    {
      id: "P3",
      name: "Immutable Payloads, Mutable Identifiers",
      description: "Physical media files are write-once payloads with content-addressed version nodes. Updating an asset creates a new immutable revision without breaking existing entity bindings.",
      owner: "platform",
      blocking: true,
      testFile: "src/test/architecture.test.ts",
      testCase: "Contract: Concrete Storage Providers must implement StorageGateway contract methods",
      status: "active",
    },
    {
      id: "P4",
      name: "Asynchronous Event-Driven Ingestion DAG",
      description: "Decouple storage verification from background processing tasks (exif extraction, blurhash generation, and CLIP vector embedding generation).",
      owner: "data",
      blocking: false,
      testFile: "src/test/architecture.test.ts",
      testCase: "Contract: MediaRepository & UploadOrchestrator depend on StorageGateway interface",
      status: "active",
    },
    {
      id: "P5",
      name: "Three-Layer Decoupled Design Tokens",
      description: "Foundation (raw colors) -> Semantic (UI tokens) -> Environment (lighting states). Components strictly consume semantic CSS variables, never raw hex colors or foundation tokens.",
      owner: "frontend",
      blocking: true,
      testFile: "src/test/architecture.test.ts",
      testCase: "Contract: Services and Repositories must not import Vite bundler APIs",
      status: "active",
    },
    {
      id: "P6",
      name: "Zero-Token Client Boundaries",
      description: "Browser client never stores JWTs in localStorage/sessionStorage; BFF proxy manages HTTP-only cookies to eliminate XSS token theft vectors.",
      owner: "security",
      blocking: true,
      testFile: "src/test/architecture.test.ts",
      testCase: "Contract: Feature code must not access or store auth tokens in localStorage/sessionStorage",
      status: "active",
    },
    {
      id: "P7",
      name: "100% RLS Coverage on Public Tables",
      description: "All PostgreSQL tables must enforce Row-Level Security with explicit, tenant-isolated tenant_id policies.",
      owner: "security",
      blocking: true,
      testFile: "src/test/architecture.test.ts",
      testCase: "Contract: PostgreSQL database migrations must enforce Row-Level Security on all public tables",
      status: "active",
    },
  ],
  adrs: [
    {
      id: "ADR-001",
      title: "Domain-Driven Separation of Services, Repositories, and Presentation",
      status: "ACCEPTED",
      date: "2026-03-15",
      owner: "Platform Architecture Owner",
      affectedPackages: ["apps/web", "packages/core"],
      dependentServices: ["AssetService", "MediaRepository"],
      implementationCoverage: 100,
      riskLevel: "LOW",
      openDebtIds: [],
      context: "Legacy components were directly executing Supabase queries and ImageKit mutations, making testing impossible and tightly coupling UI to persistence.",
      decision: "Adopt Domain-Driven Design (DDD) layered architecture: Presentation (Components) -> Domain Services (Business Logic) -> Repositories (Data Access) -> Infrastructure/Gateways.",
      evidenceTest: "Contract: Repositories and Services must not import React or React DOM",
      statusVerified: true,
    },
    {
      id: "ADR-002",
      title: "Vendor-Neutral Media Storage via StorageGateway ACL",
      status: "ACCEPTED",
      date: "2026-04-02",
      owner: "Platform Architecture Owner",
      affectedPackages: ["apps/web", "packages/storage"],
      dependentServices: ["StorageGateway", "ImageKitProvider", "SupabaseProvider"],
      implementationCoverage: 95,
      riskLevel: "LOW",
      openDebtIds: ["DEBT-ARCH-01"],
      context: "Application was tightly coupled to ImageKit SDK APIs. Migrating or adding a secondary CDN provider would have required rewriting dozens of components.",
      decision: "Implement StorageGateway interface with pluggable ImageKitProvider, SupabaseProvider, and LocalMockProvider implementations.",
      evidenceTest: "Contract: UI Components must not import storage providers directly",
      statusVerified: true,
    },
    {
      id: "ADR-003",
      title: "Edge-Proxy Authentication via HTTP-Only Cookies",
      status: "ACCEPTED",
      date: "2026-04-20",
      owner: "Security & Compliance Owner",
      affectedPackages: ["apps/web", "apps/edge-proxy"],
      dependentServices: ["AuthService", "SessionMiddleware"],
      implementationCoverage: 100,
      riskLevel: "LOW",
      openDebtIds: [],
      context: "Client-side JWT storage in localStorage exposed tokens to potential XSS vectors and supply chain vulnerabilities.",
      decision: "Migrate all session state to HTTP-Only Secure SameSite=Strict cookies via Vercel Edge proxy.",
      evidenceTest: "Contract: Feature code must not access or store auth tokens in localStorage/sessionStorage",
      statusVerified: true,
    },
    {
      id: "ADR-004",
      title: "Three-Layer Token Engine vs Utility CSS Classes",
      status: "ACCEPTED",
      date: "2026-05-10",
      owner: "Frontend Platform Owner",
      affectedPackages: ["apps/web", "packages/ui"],
      dependentServices: ["DesignTokenEngine", "ThemeManager"],
      implementationCoverage: 92,
      riskLevel: "MEDIUM",
      openDebtIds: ["DEBT-MAINT-01"],
      context: "Utility classes caused brand color drift and made environmental lighting switches impossible.",
      decision: "Adopt Foundation -> Semantic -> Lighting Environment CSS variable hierarchy with zero hex codes in components.",
      evidenceTest: "Contract: Zero hardcoded hex colors in feature components",
      statusVerified: true,
    },
    {
      id: "ADR-005",
      title: "Mandatory Row-Level Security on All Database Entities",
      status: "ACCEPTED",
      date: "2026-05-28",
      owner: "Security & Compliance Owner",
      affectedPackages: ["supabase/migrations", "apps/web"],
      dependentServices: ["DatabaseClient", "MigrationRunner"],
      implementationCoverage: 100,
      riskLevel: "LOW",
      openDebtIds: [],
      context: "Direct Supabase client queries require bulletproof data isolation at the engine level.",
      decision: "Enforce ALTER TABLE ... ENABLE ROW LEVEL SECURITY on 100% of public tables in migrations.",
      evidenceTest: "Contract: PostgreSQL database migrations must enforce Row-Level Security on all public tables",
      statusVerified: true,
    },
  ],
  techRadar: {
    adopt: [
      "React 18 + Vite (ESM Core Runtime)",
      "TanStack React Query (Client State & Cache)",
      "Supabase PostgreSQL + RLS (Relational Core)",
      "ImageKit CDN via StorageGateway (Media Delivery)",
      "Three-Layer Pure CSS Tokens (Theme Engine)",
      "DOMPurify (Markdown & HTML Sanitization)",
    ],
    trial: [
      "Supabase pgvector + CLIP (512D Image Vectors)",
      "DeferredScrollManager (Lenis Idle Deferral)",
      "Architecture Fitness AST Linters",
      "OpenTelemetry Web Tracing Spans",
    ],
    assess: [
      "Inngest / Temporal.io (Distributed Asset DAG)",
      "Cloudflare Images (Multi-Cloud Failover)",
    ],
    hold: [
      "Apollo GraphQL Client (Heavy 33 kB overhead)",
      "Tailwind Arbitrary Hex Literals (Brand drift)",
      "LocalStorage JWT Storage (XSS Vulnerability)",
    ],
  },
  kpis: [
    {
      id: "KPI-1",
      name: "Raw Asset URL References",
      definition: "Total occurrences of hardcoded CDN URLs in feature components",
      current: 0,
      target: 0,
      unit: "count",
      trend: "optimal",
    },
    {
      id: "KPI-2",
      name: "Asset Reuse Rate",
      definition: "(Assets referenced by > 1 entity in asset_usages) / (Total published assets)",
      current: 42,
      target: 60,
      unit: "percent",
      trend: "improving",
    },
    {
      id: "KPI-3",
      name: "Orphan Asset Rate",
      definition: "(Assets with 0 active usages) / (Total stored assets)",
      current: 4.2,
      target: 1.0,
      unit: "percent",
      trend: "improving",
    },
    {
      id: "KPI-4",
      name: "Architecture Fitness Pass Rate",
      definition: "(Passing fitness tests) / (Total fitness tests)",
      current: 100,
      target: 100,
      unit: "percent",
      trend: "stable",
    },
    {
      id: "KPI-5",
      name: "ADR Invariant Coverage",
      definition: "(Architectural decisions backed by automated test evidence) / (Total ADRs)",
      current: 100,
      target: 100,
      unit: "percent",
      trend: "stable",
    },
  ],
  debtTaxonomy: {
    security: { weight: 5, description: "Data isolation, auth boundary, or cryptographic exposure" },
    architecture: { weight: 4, description: "Layer coupling, missing abstractions, or circular dependencies" },
    performance: { weight: 3, description: "Client-side bundle bloat, N+1 queries, uncompressed payloads" },
    maintainability: { weight: 2, description: "Token bypassing, inline styles, duplicated domain logic" },
    documentation: { weight: 1, description: "Missing ADRs, unannotated API contracts, stale diagrams" },
  },
  debtItems: [
    {
      id: "DEBT-SEC-01",
      category: "security",
      title: "Legacy localStorage token fallback in dev mocks",
      domain: "Authentication",
      weight: 5,
      occurrences: 0,
      remediationPlan: "Ensure dev mocks exclusively use mock cookie headers.",
    },
    {
      id: "DEBT-ARCH-01",
      category: "architecture",
      title: "Direct ImageKit URL usage in legacy static seeds",
      domain: "Media Pipeline",
      weight: 4,
      occurrences: 2,
      remediationPlan: "Map static hero seed images to asset_usages repository entries.",
    },
    {
      id: "DEBT-PERF-01",
      category: "performance",
      title: "Un-deferred Lenis smooth scroll on initial mobile render",
      domain: "Frontend Performance",
      weight: 3,
      occurrences: 1,
      remediationPlan: "Wrap Lenis initialization with DeferredScrollManager requestIdleCallback.",
    },
    {
      id: "DEBT-MAINT-01",
      category: "maintainability",
      title: "Inline hex color overrides in legacy admin charts",
      domain: "Design Tokens",
      weight: 2,
      occurrences: 4,
      remediationPlan: "Refactor chart colors to consume CSS variable theme tokens.",
    },
    {
      id: "DEBT-DOC-01",
      category: "documentation",
      title: "CLIP Vector search indexing pipeline specification",
      domain: "Data & AI",
      weight: 1,
      occurrences: 1,
      remediationPlan: "Publish ADR-006 for pgvector embeddings pipeline.",
    },
  ],
  engineeringValidation: {
    lighthouse: {
      performance: 98,
      accessibility: 100,
      bestPractices: 100,
      seo: 100,
      verifiedAt: "2026-08-08 (CI Staging)",
      status: "PASSING",
    },
    chaos: {
      suite: "src/test/chaos",
      scenariosPassed: 12,
      scenariosTotal: 12,
      circuitBreakerActive: true,
      status: "PASSING",
    },
    loadTesting: {
      harness: "src/test/load/tier-a-harness.ts",
      p99LatencyMs: 38,
      rpsCapacity: 2500,
      errorRatePct: 0.00,
      status: "PASSING",
    },
    telemetry: {
      eventsValidated: 24,
      schemaDriftDetected: 0,
      status: "PASSING",
    },
  },
  history: [
    {
      version: "v01",
      date: "2026-01-15",
      title: "Discovery Audit",
      scores: { governance: 65, compliance: 50, debt: 45, operational: 60, composite: 55.0 },
      debtPoints: 68,
      fitnessPassPct: 50,
      violationsCount: 32,
    },
    {
      version: "v02",
      date: "2026-03-01",
      title: "Engineering Audit & Fitness Tests",
      scores: { governance: 80, compliance: 85, debt: 70, operational: 75, composite: 77.5 },
      debtPoints: 44,
      fitnessPassPct: 85,
      violationsCount: 14,
    },
    {
      version: "v03",
      date: "2026-04-15",
      title: "Architecture Specification & ADRs",
      scores: { governance: 92, compliance: 90, debt: 80, operational: 82, composite: 86.0 },
      debtPoints: 32,
      fitnessPassPct: 92,
      violationsCount: 8,
    },
    {
      version: "v04",
      date: "2026-06-01",
      title: "Enterprise Reference Manual",
      scores: { governance: 98, compliance: 95, debt: 88, operational: 90, composite: 92.8 },
      debtPoints: 24,
      fitnessPassPct: 98,
      violationsCount: 4,
    },
    {
      version: "v05",
      date: "2026-08-08",
      title: "Architecture Operating System (ArchOS)",
      scores: { governance: 100, compliance: 100, debt: 90, operational: 98, composite: 96.6 },
      debtPoints: 20,
      fitnessPassPct: 100,
      violationsCount: 0,
    },
  ],
  graph: {
    nodes: [
      { id: "hero-component", label: "Hero Component", layer: "presentation", status: "active" },
      { id: "asset-service", label: "Asset Service", layer: "service", status: "active" },
      { id: "media-repository", label: "Media Repository", layer: "service", status: "active" },
      { id: "storage-gateway", label: "Storage Gateway (ACL)", layer: "gateway", status: "isolated" },
      { id: "imagekit-provider", label: "ImageKit Provider", layer: "infrastructure", status: "isolated" },
      { id: "supabase-db", label: "Supabase PostgreSQL (RLS)", layer: "persistence", status: "isolated" },
      { id: "token-engine", label: "CSS Token Engine", layer: "presentation", status: "active" },
      { id: "auth-proxy", label: "Auth Proxy (BFF)", layer: "gateway", status: "proxy" },
    ],
    edges: [
      { from: "hero-component", to: "asset-service", contract: "getAssetById(uuid)", isCompliant: true },
      { from: "asset-service", to: "media-repository", contract: "findAssetWithUsages(id)", isCompliant: true },
      { from: "media-repository", to: "supabase-db", contract: "PostgreSQL RLS Query", isCompliant: true },
      { from: "asset-service", to: "storage-gateway", contract: "resolveUrl(identifier)", isCompliant: true },
      { from: "storage-gateway", to: "imagekit-provider", contract: "StorageProvider Interface", isCompliant: true },
      { from: "hero-component", to: "token-engine", contract: "var(--s-*) CSS Variables", isCompliant: true },
      { from: "hero-component", to: "auth-proxy", contract: "HTTP-Only Secure Cookie", isCompliant: true },
    ],
  },
};
