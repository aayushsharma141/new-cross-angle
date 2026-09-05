import { 
  ARCHITECTURE_MANIFEST, 
  ArchitecturePrinciple, 
  ADRRecord, 
  ArchitectureDebtItem 
} from './architecture.manifest';

export type EnterpriseEntityType =
  | 'business_goal'
  | 'capability'
  | 'customer_journey'
  | 'feature'
  | 'requirement'
  | 'kpi'
  | 'adr'
  | 'principle'
  | 'component'
  | 'repository'
  | 'commit'
  | 'pull_request'
  | 'author'
  | 'deployment'
  | 'environment'
  | 'release'
  | 'service'
  | 'endpoint'
  | 'telemetry'
  | 'telemetry_metric'
  | 'alert_rule'
  | 'slo'
  | 'incident'
  | 'owner'
  | 'test'
  | 'debt';

export type EnterpriseLayer = 
  | 'business' 
  | 'product' 
  | 'presentation' 
  | 'service' 
  | 'gateway' 
  | 'infrastructure' 
  | 'observability' 
  | 'governance'
  | 'delivery';

export interface EnterpriseKnowledgeNode {
  id: string;
  type: EnterpriseEntityType;
  label: string;
  owner: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  layer: EnterpriseLayer;
  status: 'active' | 'deprecated' | 'proposed' | 'healthy' | 'at_risk' | 'merged' | 'resolved';
  created: string;
  updated: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export type EnterpriseRelationType =
  | 'SUPPORTS_GOAL'
  | 'REALIZES_CAPABILITY'
  | 'ENABLES_FEATURE'
  | 'FULFILLS_REQUIREMENT'
  | 'DRIVES_KPI'
  | 'GOVERNED_BY'
  | 'DECIDED_BY'
  | 'IMPLEMENTED_BY'
  | 'DEPENDS_ON'
  | 'DEPLOYED_TO'
  | 'DEPLOYED_TO_ENV'
  | 'SHIPPED_IN_RELEASE'
  | 'MODIFIED_BY'
  | 'AUTHORED_BY'
  | 'REVIEWED_BY'
  | 'PRODUCES_TELEMETRY'
  | 'MONITORED_BY'
  | 'MONITORED_BY_ALERT'
  | 'MEASURED_BY'
  | 'TRIGGERED_INCIDENT'
  | 'TESTED_BY'
  | 'OWNED_BY'
  | 'CONTAINS_DEBT'
  | 'PART_OF_LAYER';

export interface EnterpriseRelation {
  from: string;
  to: string;
  relation: EnterpriseRelationType;
  description?: string;
  weight?: number;
}

export interface StructuredExplanation {
  concept: string;
  reason: string;
  evidence: {
    adrs: string[];
    principles: string[];
    tests: string[];
    dependencyPath: string;
  };
  alternatives: Array<{
    option: string;
    description: string;
    tradeoffVerdict: string;
  }>;
  tradeoffs: Array<{
    dimension: string;
    analysis: string;
    impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }>;
}

export interface CounterfactualMigrationPlan {
  source: string;
  target: string;
  action: string;
  blastRadiusScore: number; // 0 - 100
  architecturalRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedEffort: {
    devDays: number;
    storyPoints: number;
    complexityTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  };
  affectedDomains: {
    repositories: string[];
    components: string[];
    adrsToUpdate: string[];
    governingPrinciples: string[];
    severedContracts: string[];
    runtimeSlosAtRisk: string[];
    activeAlertsTriggered: string[];
  };
  phasedRolloutSequence: Array<{
    phase: number;
    name: string;
    objective: string;
    deliverables: string[];
    rollbackRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  mitigationStrategy: string;
  assignedOwners: string[];
}

export interface ImpactAnalysisResult {
  targetNode: EnterpriseKnowledgeNode | null;
  upstreamDependents: EnterpriseKnowledgeNode[];
  downstreamDependencies: EnterpriseKnowledgeNode[];
  governingPrinciples: ArchitecturePrinciple[];
  associatedAdrs: ADRRecord[];
  associatedGoals: EnterpriseKnowledgeNode[];
  associatedSlos: EnterpriseKnowledgeNode[];
  assignedOwners: string[];
  verifyingTests: string[];
  associatedDebt: ArchitectureDebtItem[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedDebtDelta: string;
  blastRadiusScore: number; // 0 - 100
  counterfactualSimulation?: CounterfactualMigrationPlan;
  dynamicPlan: string[];
}

export interface AQLQueryResult {
  query: string;
  type: 'nodes' | 'impact' | 'simulation' | 'explanation' | 'error';
  totalCount: number;
  data: Array<Record<string, unknown>>;
  structuredExplanation?: StructuredExplanation;
  migrationPlan?: CounterfactualMigrationPlan;
  error?: string;
  explanation?: string;
}

export class ArchitectureKnowledgeGraph {
  private nodes: Map<string, EnterpriseKnowledgeNode> = new Map();
  private edges: EnterpriseRelation[] = [];

  constructor() {
    this.buildEnterpriseGraph();
  }

  private buildEnterpriseGraph() {
    // -------------------------------------------------------------
    // 1. BUSINESS & PRODUCT TIER
    // -------------------------------------------------------------
    const businessGoals: EnterpriseKnowledgeNode[] = [
      {
        id: 'GOAL-01',
        type: 'business_goal',
        label: 'Zero-Downtime Media Modernization & Vendor Agility',
        owner: 'Executive Architecture Council',
        risk: 'LOW',
        layer: 'business',
        status: 'active',
        created: '2026-01-15',
        updated: '2026-08-08',
        tags: ['strategy', 'resilience', 'vendor-independence'],
        metadata: { kpiTarget: 'Zero vendor lock-in, multi-CDN support', horizon: '2026-Q4' }
      },
      {
        id: 'GOAL-02',
        type: 'business_goal',
        label: 'Sub-100ms Global P99 Render & Conversion Funnel',
        owner: 'Product Engineering Lead',
        risk: 'LOW',
        layer: 'business',
        status: 'active',
        created: '2026-01-20',
        updated: '2026-08-08',
        tags: ['performance', 'conversion', 'core-web-vitals'],
        metadata: { kpiTarget: 'LCP < 1.2s, CLS < 0.02', horizon: '2026-Q3' }
      }
    ];

    const capabilities: EnterpriseKnowledgeNode[] = [
      {
        id: 'CAP-01',
        type: 'capability',
        label: 'Curated Portfolio Gallery & Interactive 3D Staging',
        owner: 'Design Systems Team',
        risk: 'LOW',
        layer: 'product',
        status: 'active',
        created: '2026-02-01',
        updated: '2026-08-08',
        tags: ['portfolio', 'staging', 'ux'],
        metadata: { domain: 'presentation', conversionRate: '4.8%' }
      },
      {
        id: 'CAP-02',
        type: 'capability',
        label: 'Vendor-Neutral Media Storage & Dynamic Transcoding',
        owner: 'Platform Engineering',
        risk: 'LOW',
        layer: 'product',
        status: 'active',
        created: '2026-02-05',
        updated: '2026-08-08',
        tags: ['storage', 'acl', 'transcoding'],
        metadata: { domain: 'core-platform', throughput: '1200 rps' }
      }
    ];

    const features: EnterpriseKnowledgeNode[] = [
      {
        id: 'FEAT-01',
        type: 'feature',
        label: 'Dynamic Responsive Asset Resolution (StorageGateway Integration)',
        owner: 'Platform Engineering',
        risk: 'LOW',
        layer: 'product',
        status: 'active',
        created: '2026-02-15',
        updated: '2026-08-08',
        tags: ['media', 'responsive', 'performance'],
        metadata: { userFacing: true, epic: 'EPIC-MEDIA-V2' }
      },
      {
        id: 'FEAT-02',
        type: 'feature',
        label: 'Interactive 3D Interior Staging & Spatial Canvas',
        owner: 'Design Systems Team',
        risk: 'LOW',
        layer: 'product',
        status: 'active',
        created: '2026-03-01',
        updated: '2026-08-08',
        tags: ['threejs', '3d', 'canvas'],
        metadata: { userFacing: true, epic: 'EPIC-STAGING-V1' }
      }
    ];

    const requirements: EnterpriseKnowledgeNode[] = [
      {
        id: 'REQ-01',
        type: 'requirement',
        label: 'Zero Hardcoded CDN Endpoint Dependencies in Presentation Layer',
        owner: 'Platform Architecture Council',
        risk: 'HIGH',
        layer: 'governance',
        status: 'active',
        created: '2026-01-10',
        updated: '2026-08-08',
        tags: ['non-functional', 'architecture-invariant'],
        metadata: { enforcement: 'automated-ci' }
      },
      {
        id: 'REQ-02',
        type: 'requirement',
        label: 'Strict RLS & Security Policy Coverage on 100% of Data Tables',
        owner: 'Security & Compliance Lead',
        risk: 'CRITICAL',
        layer: 'governance',
        status: 'active',
        created: '2026-01-10',
        updated: '2026-08-08',
        tags: ['security', 'rls', 'owasp'],
        metadata: { compliance: 'SOC2 / OWASP Top 10' }
      }
    ];

    const kpis: EnterpriseKnowledgeNode[] = [
      {
        id: 'KPI-LCP',
        type: 'kpi',
        label: 'P99 Mobile Largest Contentful Paint < 1.2s',
        owner: 'Frontend Engineering',
        risk: 'LOW',
        layer: 'business',
        status: 'healthy',
        created: '2026-01-01',
        updated: '2026-08-08',
        tags: ['core-web-vitals', 'p99'],
        metadata: { current: '0.82s', target: '< 1.2s' }
      },
      {
        id: 'KPI-STORAGE-LOCKIN',
        type: 'kpi',
        label: 'Vendor Lock-in Exposure Score = 0 (100% Abstracted)',
        owner: 'Platform Engineering',
        risk: 'LOW',
        layer: 'business',
        status: 'healthy',
        created: '2026-01-01',
        updated: '2026-08-08',
        tags: ['resilience', 'vendor-cost'],
        metadata: { current: '0%', target: '0%' }
      }
    ];

    const customerJourneys: EnterpriseKnowledgeNode[] = [
      {
        id: 'JOURNEY-01',
        type: 'customer_journey',
        label: 'Interior Design Exploration to Quote Inquiry Funnel',
        owner: 'Growth & Product Lead',
        risk: 'LOW',
        layer: 'product',
        status: 'active',
        created: '2026-02-10',
        updated: '2026-08-08',
        tags: ['funnel', 'lead-capture', 'conversion'],
        metadata: { dropOffTolerance: '< 15%', criticalComponents: ['Hero', 'PortfolioGrid', 'QuoteModal'] }
      }
    ];

    [...businessGoals, ...capabilities, ...features, ...requirements, ...kpis, ...customerJourneys].forEach(n => this.nodes.set(n.id, n));

    // Link Capability to Goal & Features
    this.edges.push({ from: 'CAP-02', to: 'GOAL-01', relation: 'SUPPORTS_GOAL' });
    this.edges.push({ from: 'CAP-01', to: 'GOAL-02', relation: 'SUPPORTS_GOAL' });
    this.edges.push({ from: 'FEAT-01', to: 'CAP-02', relation: 'REALIZES_CAPABILITY' });
    this.edges.push({ from: 'FEAT-02', to: 'CAP-01', relation: 'REALIZES_CAPABILITY' });
    this.edges.push({ from: 'FEAT-01', to: 'REQ-01', relation: 'FULFILLS_REQUIREMENT' });
    this.edges.push({ from: 'CAP-02', to: 'KPI-STORAGE-LOCKIN', relation: 'DRIVES_KPI' });
    this.edges.push({ from: 'CAP-01', to: 'KPI-LCP', relation: 'DRIVES_KPI' });
    this.edges.push({ from: 'JOURNEY-01', to: 'CAP-01', relation: 'REALIZES_CAPABILITY' });

    // -------------------------------------------------------------
    // 2. PRINCIPLES & GOVERNANCE TIER
    // -------------------------------------------------------------
    for (const p of ARCHITECTURE_MANIFEST.principles) {
      const pNode: EnterpriseKnowledgeNode = {
        id: p.id,
        type: 'principle',
        label: `${p.id}: ${p.name}`,
        owner: p.owner,
        risk: p.blocking ? 'HIGH' : 'LOW',
        layer: 'governance',
        status: p.status === 'active' ? 'active' : 'proposed',
        created: '2026-01-10',
        updated: '2026-08-08',
        tags: ['governance', 'invariant', p.owner],
        metadata: { ...p }
      };
      this.nodes.set(p.id, pNode);

      // Edge to owner
      if (p.owner) {
        const ownerId = `owner_${p.owner.replace(/\s+/g, '_').toLowerCase()}`;
        if (!this.nodes.has(ownerId)) {
          this.nodes.set(ownerId, {
            id: ownerId,
            type: 'owner',
            label: `${p.owner.toUpperCase()} Lead`,
            owner: p.owner,
            risk: 'LOW',
            layer: 'governance',
            status: 'active',
            created: '2026-01-01',
            updated: '2026-08-08',
            tags: ['team', 'ownership'],
            metadata: { name: p.owner }
          });
        }
        this.edges.push({ from: p.id, to: ownerId, relation: 'OWNED_BY' });
      }

      // Edge to test
      if (p.testFile) {
        const testId = `test_${p.testFile.replace(/[^a-zA-Z0-9]/g, '_')}`;
        if (!this.nodes.has(testId)) {
          this.nodes.set(testId, {
            id: testId,
            type: 'test',
            label: p.testFile,
            owner: p.owner || 'QA / Platform',
            risk: 'LOW',
            layer: 'observability',
            status: 'active',
            created: '2026-01-10',
            updated: '2026-08-08',
            tags: ['vitest', 'invariant', 'ci'],
            metadata: { file: p.testFile, case: p.testCase }
          });
        }
        this.edges.push({ from: p.id, to: testId, relation: 'TESTED_BY' });
      }
    }

    // -------------------------------------------------------------
    // 3. ARCHITECTURE DECISION RECORDS (ADRs)
    // -------------------------------------------------------------
    for (const adr of ARCHITECTURE_MANIFEST.adrs) {
      const adrNode: EnterpriseKnowledgeNode = {
        id: adr.id,
        type: 'adr',
        label: `${adr.id}: ${adr.title}`,
        owner: adr.owner,
        risk: adr.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        layer: 'governance',
        status: adr.status === 'accepted' ? 'active' : 'proposed',
        created: adr.date,
        updated: '2026-08-08',
        tags: ['adr', 'decision', adr.status],
        metadata: { ...adr }
      };
      this.nodes.set(adr.id, adrNode);

      // Link ADR to Capability
      if (adr.id === 'ADR-002') {
        this.edges.push({ from: adr.id, to: 'CAP-02', relation: 'REALIZES_CAPABILITY' });
      } else if (adr.id === 'ADR-004') {
        this.edges.push({ from: adr.id, to: 'CAP-01', relation: 'REALIZES_CAPABILITY' });
      }

      // Edge to owner
      if (adr.owner) {
        const ownerId = `owner_${adr.owner.replace(/\s+/g, '_').toLowerCase()}`;
        if (!this.nodes.has(ownerId)) {
          this.nodes.set(ownerId, {
            id: ownerId,
            type: 'owner',
            label: adr.owner,
            owner: adr.owner,
            risk: 'LOW',
            layer: 'governance',
            status: 'active',
            created: '2026-01-01',
            updated: '2026-08-08',
            tags: ['team'],
            metadata: { name: adr.owner }
          });
        }
        this.edges.push({ from: adr.id, to: ownerId, relation: 'OWNED_BY' });
      }

      // Edge to dependent services
      for (const srv of adr.dependentServices) {
        this.edges.push({ from: adr.id, to: srv, relation: 'IMPLEMENTED_BY' });
      }

      // Link ADR to Principle
      if (adr.id === 'ADR-002') {
        this.edges.push({ from: adr.id, to: 'P1', relation: 'GOVERNED_BY' });
        this.edges.push({ from: adr.id, to: 'P2', relation: 'GOVERNED_BY' });
      } else if (adr.id === 'ADR-004') {
        this.edges.push({ from: adr.id, to: 'P5', relation: 'GOVERNED_BY' });
      }
    }

    // -------------------------------------------------------------
    // 4. COMPONENT & REPOSITORY TIER
    // -------------------------------------------------------------
    const repoNode: EnterpriseKnowledgeNode = {
      id: 'REPO-WEB',
      type: 'repository',
      label: 'github.com/aayushsharma141/new-cross-angle',
      owner: 'Platform Engineering',
      risk: 'LOW',
      layer: 'infrastructure',
      status: 'active',
      created: '2026-01-01',
      updated: '2026-08-08',
      tags: ['monorepo', 'typescript', 'react'],
      metadata: { language: 'TypeScript', bundler: 'Vite 6', react: '18.3' }
    };
    this.nodes.set(repoNode.id, repoNode);

    for (const node of ARCHITECTURE_MANIFEST.graph.nodes) {
      const compNode: EnterpriseKnowledgeNode = {
        id: node.id,
        type: 'component',
        label: node.label,
        owner: node.owner,
        risk: node.layer === 'gateway' || node.layer === 'infrastructure' ? 'MEDIUM' : 'LOW',
        layer: node.layer as EnterpriseLayer,
        status: node.status === 'production' ? 'active' : 'proposed',
        created: '2026-01-15',
        updated: '2026-08-08',
        tags: ['code', node.layer, node.owner],
        metadata: { ...node }
      };
      this.nodes.set(node.id, compNode);
      this.edges.push({ from: node.id, to: 'REPO-WEB', relation: 'DEPLOYED_TO' });
    }

    // Component Dependency Edges
    for (const edge of ARCHITECTURE_MANIFEST.graph.edges) {
      this.edges.push({
        from: edge.from,
        to: edge.to,
        relation: 'DEPENDS_ON',
        description: edge.contract
      });
    }

    // -------------------------------------------------------------
    // 5. GIT DOMAIN (COMMITS, PRS & AUTHORS)
    // -------------------------------------------------------------
    const gitAuthors: EnterpriseKnowledgeNode[] = [
      {
        id: 'AUTHOR-01',
        type: 'author',
        label: 'Aayush Sharma (@aayushsharma141)',
        owner: 'Platform Architecture Lead',
        risk: 'LOW',
        layer: 'governance',
        status: 'active',
        created: '2026-01-01',
        updated: '2026-08-08',
        tags: ['git', 'lead', 'committer'],
        metadata: { email: 'aayush@crossangle.design', role: 'Principal Architect' }
      }
    ];

    const gitPrs: EnterpriseKnowledgeNode[] = [
      {
        id: 'PR-142',
        type: 'pull_request',
        label: 'PR #142: feat(media): Decouple presentation layer through StorageGateway ACL',
        owner: 'Platform Engineering',
        risk: 'LOW',
        layer: 'delivery',
        status: 'merged',
        created: '2026-08-07',
        updated: '2026-08-08',
        tags: ['git', 'pr', 'media', 'acl'],
        metadata: { number: 142, state: 'merged', checksPassed: 12 }
      },
      {
        id: 'PR-138',
        type: 'pull_request',
        label: 'PR #138: feat(tokens): Implement Three-Layer Token Architecture',
        owner: 'Design Systems Team',
        risk: 'LOW',
        layer: 'delivery',
        status: 'merged',
        created: '2026-08-05',
        updated: '2026-08-06',
        tags: ['git', 'pr', 'tokens', 'css'],
        metadata: { number: 138, state: 'merged', checksPassed: 12 }
      }
    ];

    const gitCommits: EnterpriseKnowledgeNode[] = [
      {
        id: 'COMMIT-c8a91f',
        type: 'commit',
        label: 'c8a91f4: feat(storage): implement StorageGateway vendor-neutral resolution interface',
        owner: 'Platform Engineering',
        risk: 'LOW',
        layer: 'delivery',
        status: 'active',
        created: '2026-08-07',
        updated: '2026-08-07',
        tags: ['git', 'commit', 'storage'],
        metadata: { sha: 'c8a91f4d8b2e1', changedFiles: 4 }
      },
      {
        id: 'COMMIT-9f1b2c',
        type: 'commit',
        label: '9f1b2c8: refactor(hero): remove direct ImageKit endpoint dependency',
        owner: 'Frontend Engineering',
        risk: 'LOW',
        layer: 'delivery',
        status: 'active',
        created: '2026-08-07',
        updated: '2026-08-07',
        tags: ['git', 'commit', 'hero'],
        metadata: { sha: '9f1b2c8a1e3f', changedFiles: 2 }
      }
    ];

    [...gitAuthors, ...gitPrs, ...gitCommits].forEach(n => this.nodes.set(n.id, n));

    this.edges.push({ from: 'COMMIT-c8a91f', to: 'AUTHOR-01', relation: 'AUTHORED_BY' });
    this.edges.push({ from: 'COMMIT-9f1b2c', to: 'AUTHOR-01', relation: 'AUTHORED_BY' });
    this.edges.push({ from: 'PR-142', to: 'AUTHOR-01', relation: 'AUTHORED_BY' });
    this.edges.push({ from: 'storage_gateway', to: 'COMMIT-c8a91f', relation: 'MODIFIED_BY' });
    this.edges.push({ from: 'hero_component', to: 'COMMIT-9f1b2c', relation: 'MODIFIED_BY' });
    this.edges.push({ from: 'PR-142', to: 'ADR-002', relation: 'GOVERNED_BY' });

    // -------------------------------------------------------------
    // 6. DELIVERY & DEPLOYMENT DOMAIN
    // -------------------------------------------------------------
    const environments: EnterpriseKnowledgeNode[] = [
      {
        id: 'ENV-PROD',
        type: 'environment',
        label: 'Production (Vercel Edge + Supabase PG Core)',
        owner: 'DevOps / Platform',
        risk: 'LOW',
        layer: 'infrastructure',
        status: 'healthy',
        created: '2026-01-01',
        updated: '2026-08-08',
        tags: ['env', 'production', 'edge'],
        metadata: { region: 'global-edge', uptime: '99.98%' }
      },
      {
        id: 'ENV-STAGING',
        type: 'environment',
        label: 'Staging (Preview Branches & LHCI Verification)',
        owner: 'QA / Platform',
        risk: 'LOW',
        layer: 'infrastructure',
        status: 'healthy',
        created: '2026-01-01',
        updated: '2026-08-08',
        tags: ['env', 'staging', 'ci'],
        metadata: { autoDeploy: true }
      }
    ];

    const releases: EnterpriseKnowledgeNode[] = [
      {
        id: 'REL-2026.6',
        type: 'release',
        label: 'Release v2026.6-enterprise (Engineering Intelligence Platform)',
        owner: 'Executive Architecture Council',
        risk: 'LOW',
        layer: 'delivery',
        status: 'active',
        created: '2026-08-08',
        updated: '2026-08-08',
        tags: ['release', 'semver', 'enterprise'],
        metadata: { semver: '2026.6.0', rollbackCapable: true }
      }
    ];

    const deployments: EnterpriseKnowledgeNode[] = [
      {
        id: 'DEP-84910',
        type: 'deployment',
        label: 'Deployment #84910 (Vercel Edge Production)',
        owner: 'CI/CD Automation',
        risk: 'LOW',
        layer: 'delivery',
        status: 'active',
        created: '2026-08-08T12:00:00Z',
        updated: '2026-08-08T12:05:00Z',
        tags: ['deploy', 'vercel', 'prod'],
        metadata: { duration: '34s', lhciPassed: true, testsPassed: 12 }
      }
    ];

    [...environments, ...releases, ...deployments].forEach(n => this.nodes.set(n.id, n));

    this.edges.push({ from: 'DEP-84910', to: 'ENV-PROD', relation: 'DEPLOYED_TO_ENV' });
    this.edges.push({ from: 'DEP-84910', to: 'REL-2026.6', relation: 'SHIPPED_IN_RELEASE' });
    this.edges.push({ from: 'REL-2026.6', to: 'ADR-002', relation: 'GOVERNED_BY' });

    // -------------------------------------------------------------
    // 7. RUNTIME, TELEMETRY, ALERTS & INCIDENTS DOMAIN
    // -------------------------------------------------------------
    const endpoints: EnterpriseKnowledgeNode[] = [
      {
        id: 'EP-MEDIA-RESOLVE',
        type: 'endpoint',
        label: 'StorageGateway.resolveMediaUrl(id, transform)',
        owner: 'Platform Engineering',
        risk: 'LOW',
        layer: 'gateway',
        status: 'healthy',
        created: '2026-02-01',
        updated: '2026-08-08',
        tags: ['api', 'media', 'gateway'],
        metadata: { p99Latency: '14ms', rps: 1200 }
      },
      {
        id: 'EP-SUPABASE-REST',
        type: 'endpoint',
        label: 'Supabase Data Gateway (PostgREST /rest/v1/*)',
        owner: 'Platform Engineering',
        risk: 'MEDIUM',
        layer: 'infrastructure',
        status: 'healthy',
        created: '2026-01-01',
        updated: '2026-08-08',
        tags: ['database', 'postgrest', 'rls'],
        metadata: { rlsEnforced: true, p99Latency: '28ms' }
      }
    ];

    const alerts: EnterpriseKnowledgeNode[] = [
      {
        id: 'ALERT-SLO-STORAGE',
        type: 'alert_rule',
        label: 'Alert: StorageGateway Resolution Latency > 45ms P99',
        owner: 'Platform SRE Lead',
        risk: 'HIGH',
        layer: 'observability',
        status: 'healthy',
        created: '2026-02-01',
        updated: '2026-08-08',
        tags: ['alert', 'pagerduty', 'slo'],
        metadata: { window: '5m', action: 'PagerDuty P1' }
      }
    ];

    const incidents: EnterpriseKnowledgeNode[] = [
      {
        id: 'INC-2026-0801',
        type: 'incident',
        label: 'INC-0801: ImageKit Transient 503 Gateway Errors',
        owner: 'Platform Engineering',
        risk: 'MEDIUM',
        layer: 'observability',
        status: 'resolved',
        created: '2026-08-01',
        updated: '2026-08-01',
        tags: ['incident', 'vendor-outage', 'resolved'],
        metadata: {
          rootCause: 'Upstream CDN 503 handled seamlessly by StorageGateway fallback retry adapter',
          downtime: '0s (Mitigated by Circuit Breaker)'
        }
      }
    ];

    const slos: EnterpriseKnowledgeNode[] = [
      {
        id: 'SLO-LCP',
        type: 'slo',
        label: 'Mobile Largest Contentful Paint (LCP) <= 1.2s',
        owner: 'Frontend Engineering',
        risk: 'LOW',
        layer: 'observability',
        status: 'healthy',
        created: '2026-02-01',
        updated: '2026-08-08',
        tags: ['web-vitals', 'perf', 'lighthouse'],
        metadata: { current: '0.82s', threshold: '1.2s', compliance: '99.8%' }
      },
      {
        id: 'SLO-STORAGE-LATENCY',
        type: 'slo',
        label: 'StorageGateway Resolution P99 <= 45ms',
        owner: 'Platform Engineering',
        risk: 'LOW',
        layer: 'observability',
        status: 'healthy',
        created: '2026-02-01',
        updated: '2026-08-08',
        tags: ['latency', 'gateway', 'resilience'],
        metadata: { current: '14ms', threshold: '45ms', compliance: '100%' }
      }
    ];

    const telemetries: EnterpriseKnowledgeNode[] = [
      {
        id: 'TEL-OTEL-TRACING',
        type: 'telemetry',
        label: 'OpenTelemetry Distributed Tracing (@opentelemetry/sdk-trace-web)',
        owner: 'Observability Lead',
        risk: 'LOW',
        layer: 'observability',
        status: 'active',
        created: '2026-02-15',
        updated: '2026-08-08',
        tags: ['otel', 'tracing', 'w3c-trace-context'],
        metadata: { samplingRate: '100% errors, 10% transactions', collector: 'OTLP/HTTP' }
      },
      {
        id: 'TEL-POSTHOG-EVENTS',
        type: 'telemetry',
        label: 'PostHog Product Analytics Telemetry Contract',
        owner: 'Growth & Product Lead',
        risk: 'LOW',
        layer: 'observability',
        status: 'active',
        created: '2026-02-15',
        updated: '2026-08-08',
        tags: ['posthog', 'analytics', 'funnel'],
        metadata: { schemaValidation: 'Zod Enforced', totalEvents: 14 }
      }
    ];

    [...endpoints, ...alerts, ...incidents, ...slos, ...telemetries].forEach(n => this.nodes.set(n.id, n));

    this.edges.push({ from: 'storage_gateway', to: 'EP-MEDIA-RESOLVE', relation: 'IMPLEMENTED_BY' });
    this.edges.push({ from: 'EP-MEDIA-RESOLVE', to: 'ALERT-SLO-STORAGE', relation: 'MONITORED_BY_ALERT' });
    this.edges.push({ from: 'EP-MEDIA-RESOLVE', to: 'SLO-STORAGE-LATENCY', relation: 'MEASURED_BY' });
    this.edges.push({ from: 'hero_component', to: 'SLO-LCP', relation: 'MEASURED_BY' });
    this.edges.push({ from: 'storage_gateway', to: 'TEL-OTEL-TRACING', relation: 'PRODUCES_TELEMETRY' });
    this.edges.push({ from: 'INC-2026-0801', to: 'storage_gateway', relation: 'TRIGGERED_INCIDENT' });

    // -------------------------------------------------------------
    // 8. TECHNICAL DEBT TIER
    // -------------------------------------------------------------
    for (const debt of ARCHITECTURE_MANIFEST.debtItems) {
      const debtNode: EnterpriseKnowledgeNode = {
        id: debt.id,
        type: 'debt',
        label: `${debt.id}: ${debt.title}`,
        owner: 'Platform Engineering',
        risk: debt.weight >= 4 ? 'HIGH' : 'MEDIUM',
        layer: debt.category === 'security' ? 'governance' : 'presentation',
        status: 'active',
        created: '2026-02-01',
        updated: '2026-08-08',
        tags: ['debt', debt.category, `weight-${debt.weight}`],
        metadata: { ...debt }
      };
      this.nodes.set(debt.id, debtNode);

      // Link debt to components
      if (debt.id === 'DEBT-001') {
        this.edges.push({ from: debt.id, to: 'hero_component', relation: 'CONTAINS_DEBT' });
        this.edges.push({ from: debt.id, to: 'portfolio_grid', relation: 'CONTAINS_DEBT' });
      } else if (debt.id === 'DEBT-002') {
        this.edges.push({ from: debt.id, to: 'token_engine', relation: 'CONTAINS_DEBT' });
      }
    }
  }

  // -------------------------------------------------------------
  // GRAPH MUTATION & DYNAMIC INGESTION METHODS
  // -------------------------------------------------------------
  public addNode(node: EnterpriseKnowledgeNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: EnterpriseRelation): void {
    const exists = this.edges.some(e => e.from === edge.from && e.to === edge.to && e.relation === edge.relation);
    if (!exists) {
      this.edges.push(edge);
    }
  }

  public batchIngest(nodes: EnterpriseKnowledgeNode[], edges: EnterpriseRelation[]): void {
    for (const node of nodes) {
      this.nodes.set(node.id, node);
    }
    for (const edge of edges) {
      this.addEdge(edge);
    }
  }

  public clearDomain(domainTypes: EnterpriseEntityType | EnterpriseEntityType[]): void {
    const types = Array.isArray(domainTypes) ? domainTypes : [domainTypes];
    const nodeIdsToRemove = new Set<string>();

    for (const [id, node] of this.nodes.entries()) {
      if (types.includes(node.type)) {
        nodeIdsToRemove.add(id);
        this.nodes.delete(id);
      }
    }

    this.edges = this.edges.filter(
      edge => !nodeIdsToRemove.has(edge.from) && !nodeIdsToRemove.has(edge.to)
    );
  }

  // -------------------------------------------------------------
  // GRAPH TRAVERSAL & QUERY METHODS
  // -------------------------------------------------------------
  public getNode(id: string): EnterpriseKnowledgeNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): EnterpriseKnowledgeNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): EnterpriseRelation[] {
    return [...this.edges];
  }

  public findNode(query: string): EnterpriseKnowledgeNode | undefined {
    if (!query) return undefined;
    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Direct ID check
    if (this.nodes.has(query)) return this.nodes.get(query);

    // 2. Normalized match
    for (const [id, node] of this.nodes.entries()) {
      const cleanId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanLabel = node.label.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanId === cleanQuery || cleanLabel.includes(cleanQuery) || cleanQuery.includes(cleanId)) {
        return node;
      }
    }

    return undefined;
  }

  public getUpstreamDependents(nodeId: string): EnterpriseKnowledgeNode[] {
    const upstreamIds = this.edges
      .filter(e => e.to === nodeId && (e.relation === 'DEPENDS_ON' || e.relation === 'IMPLEMENTED_BY' || e.relation === 'REALIZES_CAPABILITY' || e.relation === 'SUPPORTS_GOAL' || e.relation === 'MODIFIED_BY'))
      .map(e => e.from);

    return upstreamIds.map(id => this.nodes.get(id)).filter((n): n is EnterpriseKnowledgeNode => !!n);
  }

  public getDownstreamDependencies(nodeId: string): EnterpriseKnowledgeNode[] {
    const downstreamIds = this.edges
      .filter(e => e.from === nodeId && (e.relation === 'DEPENDS_ON' || e.relation === 'IMPLEMENTED_BY' || e.relation === 'MEASURED_BY' || e.relation === 'GOVERNED_BY' || e.relation === 'DEPLOYED_TO'))
      .map(e => e.to);

    return downstreamIds.map(id => this.nodes.get(id)).filter((n): n is EnterpriseKnowledgeNode => !!n);
  }

  // -------------------------------------------------------------
  // DEEP COUNTERFACTUAL PLANNING ENGINE
  // -------------------------------------------------------------
  public generateMigrationPlan(sourceQuery: string, targetQuery?: string, actionType?: string): CounterfactualMigrationPlan {
    const sourceNode = this.findNode(sourceQuery);
    const sourceName = sourceNode?.label || sourceQuery;
    const targetName = targetQuery || (sourceQuery.toLowerCase().includes('imagekit') ? 'Cloudflare Images & Workers CDN' : 'Vendor-Neutral Adapter');
    const action = actionType || `REPLACE ${sourceName} WITH ${targetName}`;

    const upstream = sourceNode ? this.getUpstreamDependents(sourceNode.id) : [];
    const downstream = sourceNode ? this.getDownstreamDependencies(sourceNode.id) : [];

    const blastRadiusScore = sourceNode?.layer === 'gateway' ? 45 
      : sourceNode?.layer === 'infrastructure' ? 85 
      : sourceNode?.layer === 'service' ? 40 
      : 20;

    const devDays = blastRadiusScore > 75 ? 12 : blastRadiusScore > 40 ? 5 : 2;
    const storyPoints = blastRadiusScore > 75 ? 13 : blastRadiusScore > 40 ? 8 : 3;
    const complexityTier: CounterfactualMigrationPlan['estimatedEffort']['complexityTier'] = 
      blastRadiusScore > 75 ? 'EXTREME' : blastRadiusScore > 40 ? 'HIGH' : 'MEDIUM';

    const severedContracts: string[] = [];
    upstream.forEach(u => severedContracts.push(`Upstream Consumer Interface: ${u.label}`));
    downstream.forEach(d => severedContracts.push(`Downstream Provider Contract: ${d.label}`));

    const runtimeSlos = this.edges
      .filter(e => (e.from === sourceNode?.id || e.to === sourceNode?.id) && e.relation === 'MEASURED_BY')
      .map(e => this.nodes.get(e.to)?.label || e.to);

    return {
      source: sourceName,
      target: targetName,
      action,
      blastRadiusScore,
      architecturalRisk: blastRadiusScore > 75 ? 'CRITICAL' : blastRadiusScore > 40 ? 'HIGH' : 'MEDIUM',
      estimatedEffort: {
        devDays,
        storyPoints,
        complexityTier
      },
      affectedDomains: {
        repositories: ['github.com/aayushsharma141/new-cross-angle (apps/web)'],
        components: [sourceName, ...upstream.map(u => u.label)],
        adrsToUpdate: ['ADR-002: StorageGateway Vendor-Neutral Media Abstraction'],
        governingPrinciples: ['P1: Prefer Identifiers Over Raw URLs', 'P2: Anti-Corruption Layer for External Providers'],
        severedContracts: severedContracts.length > 0 ? severedContracts : ['Vendor-specific SDK Client Contract'],
        runtimeSlosAtRisk: runtimeSlos.length > 0 ? runtimeSlos : ['SLO-STORAGE-LATENCY: P99 <= 45ms', 'SLO-LCP: Mobile LCP <= 1.2s'],
        activeAlertsTriggered: ['ALERT-SLO-STORAGE: StorageGateway Latency Threshold']
      },
      phasedRolloutSequence: [
        {
          phase: 1,
          name: 'ACL Interface Scaffolding',
          objective: `Implement new target adapter (${targetName}) conforming to StorageGateway contract.`,
          deliverables: ['New Provider Adapter Class', 'Unit Contract Mock Tests in Vitest', 'Feature Flag Configuration'],
          rollbackRisk: 'LOW'
        },
        {
          phase: 2,
          name: 'Shadow Writes & Read Verification',
          objective: 'Enable dual-write replication and telemetry validation in staging environment.',
          deliverables: ['Telemetry Latency Benchmarks', '100% Parity Invariant Verification', 'Chaos Resilience Suite Check'],
          rollbackRisk: 'MEDIUM'
        },
        {
          phase: 3,
          name: 'Canary Traffic Cutover',
          objective: `Shift 10% -> 50% -> 100% production media resolution to ${targetName}.`,
          deliverables: ['Real-time SLO Latency Dashboards', 'Zero Downtime Verification', 'Circuit Breaker Fallback Active'],
          rollbackRisk: 'HIGH'
        },
        {
          phase: 4,
          name: 'Legacy Deprecation & Debt Reduction',
          objective: `Decommission ${sourceName} endpoints and update ADR-002 registry.`,
          deliverables: ['Remove Legacy SDK Dependencies', 'Update Architecture Manifest', 'Log -12 ADI Debt Reduction'],
          rollbackRisk: 'LOW'
        }
      ],
      mitigationStrategy: `Isolate all vendor API specifics behind StorageGateway interface. Never allow ${targetName} primitives to bleed into presentation components.`,
      assignedOwners: ['Platform Architecture Lead (@aayushsharma141)', 'Platform Engineering SRE']
    };
  }

  // -------------------------------------------------------------
  // DYNAMIC IMPACT & RISK ANALYSIS
  // -------------------------------------------------------------
  public analyzeImpact(targetQuery: string, counterfactualAction?: string): ImpactAnalysisResult {
    const target = this.findNode(targetQuery);
    if (!target) {
      return {
        targetNode: null,
        upstreamDependents: [],
        downstreamDependencies: [],
        governingPrinciples: [],
        associatedAdrs: [],
        associatedGoals: [],
        associatedSlos: [],
        assignedOwners: [],
        verifyingTests: [],
        associatedDebt: [],
        riskLevel: 'LOW',
        estimatedDebtDelta: '0 ADI',
        blastRadiusScore: 0,
        dynamicPlan: [`Target '${targetQuery}' not found in knowledge graph.`]
      };
    }

    const upstream = this.getUpstreamDependents(target.id);
    const downstream = this.getDownstreamDependencies(target.id);

    // Find governing principles
    const governingPrinciples: ArchitecturePrinciple[] = [];
    ARCHITECTURE_MANIFEST.principles.forEach(p => {
      if (p.dependentServices.some(s => s.toLowerCase().includes(target.id.toLowerCase()) || target.id.toLowerCase().includes(s.toLowerCase()))) {
        governingPrinciples.push(p);
      }
    });

    // Find associated ADRs
    const associatedAdrs: ADRRecord[] = [];
    ARCHITECTURE_MANIFEST.adrs.forEach(adr => {
      if (adr.dependentServices.some(s => s.toLowerCase().includes(target.id.toLowerCase()) || target.id.toLowerCase().includes(s.toLowerCase()))) {
        associatedAdrs.push(adr);
      }
    });

    // Find associated Goals
    const associatedGoals: EnterpriseKnowledgeNode[] = [];
    this.edges
      .filter(e => (e.from === target.id || e.to === target.id) && e.relation === 'SUPPORTS_GOAL')
      .forEach(e => {
        const goal = this.nodes.get(e.to) || this.nodes.get(e.from);
        if (goal && goal.type === 'business_goal') associatedGoals.push(goal);
      });

    // Find associated SLOs
    const associatedSlos: EnterpriseKnowledgeNode[] = [];
    this.edges
      .filter(e => (e.from === target.id || e.to === target.id) && e.relation === 'MEASURED_BY')
      .forEach(e => {
        const slo = this.nodes.get(e.to) || this.nodes.get(e.from);
        if (slo && slo.type === 'slo') associatedSlos.push(slo);
      });

    // Collect verifying tests
    const verifyingTests = new Set<string>();
    governingPrinciples.forEach(p => {
      if (p.testFile) verifyingTests.add(p.testFile);
    });

    // Collect assigned owners
    const assignedOwners = new Set<string>();
    if (target.owner) assignedOwners.add(target.owner);
    governingPrinciples.forEach(p => {
      if (p.owner) assignedOwners.add(p.owner);
    });
    associatedAdrs.forEach(a => {
      if (a.owner) assignedOwners.add(a.owner);
    });

    // Collect debt items
    const associatedDebt = ARCHITECTURE_MANIFEST.debtItems.filter(d => 
      d.category.toLowerCase().includes(target.layer.toLowerCase()) || 
      d.title.toLowerCase().includes(target.id.toLowerCase())
    );

    // Calculate Blast Radius Score (0-100)
    let blastRadiusScore = 15;
    if (target.layer === 'infrastructure') blastRadiusScore += 65;
    if (target.layer === 'gateway') blastRadiusScore += 45;
    if (target.layer === 'service') blastRadiusScore += 30;
    blastRadiusScore += (upstream.length * 15) + (downstream.length * 10);
    if (associatedSlos.length > 0) blastRadiusScore += 15;
    if (blastRadiusScore > 100) blastRadiusScore = 100;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let estimatedDebtDelta = '0 ADI';

    if (blastRadiusScore > 75 || target.risk === 'CRITICAL') {
      riskLevel = 'CRITICAL';
      estimatedDebtDelta = '+20 ADI (Requires Architecture Review)';
    } else if (blastRadiusScore > 40 || target.risk === 'HIGH') {
      riskLevel = 'HIGH';
      estimatedDebtDelta = '+10 ADI (High Blast Radius)';
    } else if (upstream.length > 0 || downstream.length > 0) {
      riskLevel = 'MEDIUM';
      estimatedDebtDelta = '-2 ADI (Managed Refactor)';
    }

    // Dynamic Execution Plan
    const dynamicPlan: string[] = [];
    if (target.type === 'component') {
      dynamicPlan.push(`1. Verify layer boundary contracts for [${target.label}] in layer '${target.layer}'.`);
      if (downstream.length > 0) {
        dynamicPlan.push(`2. Inspect downstream contracts: ${downstream.map(d => d.label).join(', ')}.`);
      }
      if (upstream.length > 0) {
        dynamicPlan.push(`3. Validate upstream dependents are unimpacted: ${upstream.map(u => u.label).join(', ')}.`);
      }
      if (associatedSlos.length > 0) {
        dynamicPlan.push(`4. Run performance SLO check against: ${associatedSlos.map(s => s.label).join(', ')}.`);
      }
      dynamicPlan.push(`5. Execute invariant verification: vitest run src/test/architecture.test.ts.`);
    } else if (target.type === 'adr') {
      dynamicPlan.push(`1. Review architectural decision record [${target.label}].`);
      dynamicPlan.push(`2. Ensure dependent services maintain contracts.`);
      dynamicPlan.push(`3. Run verification test suite.`);
    } else {
      dynamicPlan.push(`1. Review enterprise governance constraints for [${target.label}].`);
      dynamicPlan.push(`2. Check invariant coverage in test suite.`);
    }

    let counterfactualSimulation: CounterfactualMigrationPlan | undefined;
    if (counterfactualAction) {
      counterfactualSimulation = this.generateMigrationPlan(target.label, undefined, counterfactualAction);
    }

    return {
      targetNode: target,
      upstreamDependents: upstream,
      downstreamDependencies: downstream,
      governingPrinciples,
      associatedAdrs,
      associatedGoals,
      associatedSlos,
      assignedOwners: Array.from(assignedOwners),
      verifyingTests: Array.from(verifyingTests),
      associatedDebt,
      riskLevel,
      estimatedDebtDelta,
      blastRadiusScore,
      counterfactualSimulation,
      dynamicPlan
    };
  }

  // -------------------------------------------------------------
  // ADVANCED AQL 2.0 (COMPOUND BOOLEAN, SIMULATION & STRUCTURED EXPLAINERS)
  // -------------------------------------------------------------
  public executeAQL(queryStr: string): AQLQueryResult {
    const trimmed = queryStr.trim();
    if (!trimmed) {
      return { query: queryStr, type: 'error', totalCount: 0, data: [], error: 'Empty query' };
    }

    const lower = trimmed.toLowerCase();

    // 1. WHAT-IF / COUNTERFACTUAL MIGRATION PLANNING ENGINE
    // Examples: "WHAT IF StorageGateway IS REPLACED", "WHAT IF ImageKit IS REPLACED WITH Cloudflare Images", "WHAT IF ADR-002 IS REPEALED"
    if (lower.startsWith('what if') || lower.includes('if ') && (lower.includes('is replaced') || lower.includes('is removed') || lower.includes('is repealed') || lower.includes('fails') || lower.includes('with '))) {
      const matchWith = trimmed.match(/(?:what if|show impact if|simulate)\s+([a-zA-Z0-9_\-]+)\s+is replaced with\s+([a-zA-Z0-9_\-\s]+)/i);
      const matchSimple = trimmed.match(/(?:what if|show impact if|simulate)\s+([a-zA-Z0-9_\-]+)\s+(is replaced|is removed|is repealed|fails|is deprecated)/i);

      let sourceQuery = 'StorageGateway';
      let targetQuery: string | undefined;
      let action = 'REPLACE StorageGateway';

      if (matchWith) {
        sourceQuery = matchWith[1].trim();
        targetQuery = matchWith[2].trim();
        action = `REPLACE ${sourceQuery} WITH ${targetQuery}`;
      } else if (matchSimple) {
        sourceQuery = matchSimple[1].trim();
        action = `${matchSimple[2].toUpperCase()} ${sourceQuery}`;
      } else {
        sourceQuery = trimmed.replace(/^(what if|show impact if|simulate)\s+/i, '').split(' ')[0];
        action = `SIMULATE CHANGE ON ${sourceQuery}`;
      }

      const plan = this.generateMigrationPlan(sourceQuery, targetQuery, action);

      return {
        query: queryStr,
        type: 'simulation',
        totalCount: 1,
        migrationPlan: plan,
        data: [{
          source: plan.source,
          target: plan.target,
          action: plan.action,
          blastRadius: `${plan.blastRadiusScore} / 100`,
          riskLevel: plan.architecturalRisk,
          devDays: `${plan.estimatedEffort.devDays} days (${plan.estimatedEffort.storyPoints} pts)`,
          complexity: plan.estimatedEffort.complexityTier,
          severedContracts: plan.affectedDomains.severedContracts.join('; '),
          affectedSlos: plan.affectedDomains.runtimeSlosAtRisk.join('; '),
          mitigationStrategy: plan.mitigationStrategy,
          ownersToNotify: plan.assignedOwners.join(', ')
        }],
        explanation: `Migration Plan: ${action} generates a blast radius score of ${plan.blastRadiusScore}/100 with estimated engineering effort of ${plan.estimatedEffort.devDays} dev days across ${plan.phasedRolloutSequence.length} rollout phases.`
      };
    }

    // 2. NATURAL LANGUAGE STRUCTURED EXPLANATIONS (REASON + EVIDENCE + ALTERNATIVES + TRADEOFFS)
    // Example: "Why does Hero depend on StorageGateway?", "Which architectural principle has accumulated the most debt?", "Who owns AssetService?"
    if (lower.startsWith('why ') || lower.startsWith('who ') || lower.startsWith('what principles') || lower.startsWith('how is') || lower.startsWith('which architectural') || lower.startsWith('which capabilities')) {
      if (lower.includes('hero') && (lower.includes('storage') || lower.includes('gateway') || lower.includes('media'))) {
        const explanation: StructuredExplanation = {
          concept: 'Decoupled Anti-Corruption Media Layer',
          reason: 'Hero component accesses media strictly through StorageGateway because ADR-002 establishes StorageGateway as the vendor-neutral Anti-Corruption Layer (ACL), preventing direct vendor lock-in to ImageKit or Supabase Storage.',
          evidence: {
            adrs: ['ADR-002: StorageGateway Vendor-Neutral Media Abstraction'],
            principles: ['P1: Prefer Identifiers Over Raw URLs', 'P2: Anti-Corruption Layer for External Providers'],
            tests: ['src/test/architecture.test.ts (Invariant #1 & #2)'],
            dependencyPath: 'Hero Component ──> AssetService ──> StorageGateway (ACL) ──> ImageKit / Supabase Provider'
          },
          alternatives: [
            {
              option: 'Direct ImageKit Client SDK in Component',
              description: 'Import ImageKit React SDK directly into Hero.tsx with hardcoded endpoints.',
              tradeoffVerdict: 'REJECTED: Causes tight coupling, high vendor switching costs, and violates Principle P1.'
            },
            {
              option: 'Cloudflare Workers Edge Proxy',
              description: 'Route all media requests through a custom Cloudflare Worker proxy.',
              tradeoffVerdict: 'VIABLE ALTERNATIVE: Can be plugged in as a new Provider behind StorageGateway without touching UI.'
            }
          ],
          tradeoffs: [
            {
              dimension: 'Vendor Independence',
              analysis: 'Zero vendor lock-in; swapping CDN providers requires editing 1 adapter class instead of 100+ UI components.',
              impact: 'POSITIVE'
            },
            {
              dimension: 'Runtime Performance',
              analysis: 'Adds ~0.2ms in-memory resolution overhead, far outweighed by CDN edge caching and responsive image optimization.',
              impact: 'POSITIVE'
            },
            {
              dimension: 'Code Modularity',
              analysis: 'Strict separation of presentation and storage concerns enforced automatically in CI.',
              impact: 'POSITIVE'
            }
          ]
        };

        return {
          query: queryStr,
          type: 'explanation',
          totalCount: 1,
          structuredExplanation: explanation,
          data: [{
            concept: explanation.concept,
            reason: explanation.reason,
            governingAdrs: explanation.evidence.adrs.join(', '),
            governingPrinciples: explanation.evidence.principles.join(', '),
            dependencyPath: explanation.evidence.dependencyPath,
            alternativesCount: explanation.alternatives.length,
            tradeoffsCount: explanation.tradeoffs.length
          }],
          explanation: 'Hero consumes StorageGateway to uphold ADR-002 and Principles P1/P2 for zero vendor lock-in.'
        };
      }

      if (lower.includes('debt') && (lower.includes('principle') || lower.includes('most') || lower.includes('media'))) {
        const explanation: StructuredExplanation = {
          concept: 'Principle P1 & P5 Debt Accumulation',
          reason: 'Principle P1 ("Prefer Identifiers Over Raw URLs") and P5 ("Three-Layer Token Architecture") have accumulated the highest technical debt due to 69 legacy hardcoded CDN URLs and 1634 inline hex colors.',
          evidence: {
            adrs: ['ADR-002: StorageGateway Abstraction', 'ADR-004: Three-Layer Token Architecture'],
            principles: ['P1: Prefer Identifiers Over Raw URLs', 'P5: Three-Layer Design Tokens'],
            tests: ['src/test/architecture.test.ts (Invariant Checks)'],
            dependencyPath: 'Legacy Components ──> Inline Hex / Raw CDN URLs'
          },
          alternatives: [
            {
              option: 'Manual Page-by-Page Refactor',
              description: 'Developers fix tokens and URLs as they touch files.',
              tradeoffVerdict: 'SLOW: High regression risk and slow burn-down rate.'
            },
            {
              option: 'Automated Codemod & AST Transformer',
              description: 'Run AST codemods to map raw URLs to StorageGateway UUIDs and hex to semantic CSS variables.',
              tradeoffVerdict: 'RECOMMENDED: Eliminates 90% of debt in single PR cycle with automated verification.'
            }
          ],
          tradeoffs: [
            {
              dimension: 'Maintainability',
              analysis: 'Burn-down of 20 ADI debt points restores 100/100 composite architecture score.',
              impact: 'POSITIVE'
            }
          ]
        };

        return {
          query: queryStr,
          type: 'explanation',
          totalCount: 1,
          structuredExplanation: explanation,
          data: [{
            concept: explanation.concept,
            reason: explanation.reason,
            governingAdrs: explanation.evidence.adrs.join(', '),
            remediation: 'Automated Codemod for DEBT-001 and DEBT-002'
          }],
          explanation: 'P1 and P5 contain 100% of the active architecture debt items (DEBT-001, DEBT-002).'
        };
      }

      if (lower.includes('who') && (lower.includes('asset') || lower.includes('service') || lower.includes('storage'))) {
        return {
          query: queryStr,
          type: 'explanation',
          totalCount: 1,
          data: [{
            component: 'AssetService / StorageGateway',
            owner: 'Platform Engineering (@aayushsharma141)',
            layer: 'service / gateway',
            lead: 'Principal Software Architect',
            governanceContact: 'Platform Architecture Council',
            enforcedTests: 'src/test/architecture.test.ts'
          }],
          explanation: 'AssetService and StorageGateway are governed by Platform Engineering with CI invariant checks.'
        };
      }
    }

    // 3. IMPACT ANALYSIS QUERY
    if (lower.startsWith('impact of') || lower.startsWith('impact on') || lower.startsWith('show impact')) {
      const target = trimmed.replace(/^(impact of|impact on|show impact for|show impact on|show impact)\s+/i, '').trim();
      const impact = this.analyzeImpact(target);
      return {
        query: queryStr,
        type: 'impact',
        totalCount: 1,
        data: [{
          target: impact.targetNode?.label || target,
          type: impact.targetNode?.type || 'unknown',
          risk: impact.riskLevel,
          blastRadius: `${impact.blastRadiusScore} / 100`,
          debtDelta: impact.estimatedDebtDelta,
          owners: impact.assignedOwners.join(', '),
          principles: impact.governingPrinciples.map(p => p.id).join(', ') || 'None',
          adrs: impact.associatedAdrs.map(a => a.id).join(', ') || 'None',
          upstreamDependents: impact.upstreamDependents.map(u => u.label).join(', ') || 'None',
          downstreamDeps: impact.downstreamDependencies.map(d => d.label).join(', ') || 'None',
          slos: impact.associatedSlos.map(s => s.label).join(', ') || 'None',
          plan: impact.dynamicPlan.join(' | ')
        }]
      };
    }

    // 4. SHOW QUERY (WITH COMPOUND BOOLEAN AND/OR FILTERS FOR ALL DOMAINS)
    if (lower.startsWith('show')) {
      const showMatch = trimmed.match(/^show\s+([a-zA-Z_]+)(?:\s+where\s+(.+))?/i);
      if (!showMatch) {
        return { query: queryStr, type: 'error', totalCount: 0, data: [], error: 'Syntax error. Example: SHOW COMPONENTS WHERE LAYER = presentation AND RISK = LOW' };
      }

      const entityTarget = showMatch[1].toLowerCase();
      const whereCondition = showMatch[2];

      let candidateNodes = Array.from(this.nodes.values());

      if (entityTarget.startsWith('comp') || entityTarget.startsWith('node')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'component');
      } else if (entityTarget.startsWith('adr')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'adr');
      } else if (entityTarget.startsWith('principle')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'principle');
      } else if (entityTarget.startsWith('debt')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'debt');
      } else if (entityTarget.startsWith('goal')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'business_goal');
      } else if (entityTarget.startsWith('cap')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'capability');
      } else if (entityTarget.startsWith('feat')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'feature');
      } else if (entityTarget.startsWith('req')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'requirement');
      } else if (entityTarget.startsWith('kpi')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'kpi');
      } else if (entityTarget.startsWith('commit')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'commit');
      } else if (entityTarget.startsWith('pr') || entityTarget.startsWith('pull')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'pull_request');
      } else if (entityTarget.startsWith('author')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'author');
      } else if (entityTarget.startsWith('deploy')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'deployment');
      } else if (entityTarget.startsWith('env')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'environment');
      } else if (entityTarget.startsWith('rel')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'release');
      } else if (entityTarget.startsWith('ep') || entityTarget.startsWith('endpoint')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'endpoint');
      } else if (entityTarget.startsWith('alert')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'alert_rule');
      } else if (entityTarget.startsWith('inc') || entityTarget.startsWith('incident')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'incident');
      } else if (entityTarget.startsWith('tel') || entityTarget.startsWith('telemetry')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'telemetry' || n.type === 'telemetry_metric');
      } else if (entityTarget.startsWith('slo')) {
        candidateNodes = candidateNodes.filter(n => n.type === 'slo');
      } else if (entityTarget === 'all' || entityTarget === 'nodes') {
        // keep all
      } else {
        return { query: queryStr, type: 'error', totalCount: 0, data: [], error: `Unknown entity '${entityTarget}'. Available: components, adrs, principles, debt, goals, capabilities, features, requirements, kpis, commits, prs, authors, deployments, envs, releases, endpoints, alerts, incidents, telemetry, slos, all` };
      }

      // Apply Compound Boolean Filters if WHERE clause exists
      if (whereCondition) {
        const clauses = whereCondition.split(/\s+AND\s+/i);
        candidateNodes = candidateNodes.filter(node => {
          return clauses.every(clause => {
            const [rawField, rawVal] = clause.split('=').map(s => s.trim());
            if (!rawField || !rawVal) return true;
            const field = rawField.toLowerCase();
            const val = rawVal.toLowerCase().replace(/['"]/g, '');

            if (field === 'layer') return node.layer.toLowerCase() === val;
            if (field === 'risk') return node.risk.toLowerCase() === val;
            if (field === 'owner') return node.owner.toLowerCase().includes(val);
            if (field === 'status') return node.status.toLowerCase() === val;
            if (field === 'type') return node.type.toLowerCase() === val;
            if (field === 'tag') return node.tags.some(t => t.toLowerCase() === val);
            return true;
          });
        });
      }

      const tabularData = candidateNodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        layer: n.layer,
        owner: n.owner,
        risk: n.risk,
        status: n.status
      }));

      return {
        query: queryStr,
        type: 'nodes',
        totalCount: tabularData.length,
        data: tabularData
      };
    }

    return {
      query: queryStr,
      type: 'error',
      totalCount: 0,
      data: [],
      error: 'Query syntax unassisted. Try: SHOW COMPONENTS | SHOW COMMITS | SHOW SLOS | WHAT IF ImageKit IS REPLACED WITH Cloudflare Images | Why does Hero depend on StorageGateway?'
    };
  }
}

// Global Singleton Instance
export const archGraph = new ArchitectureKnowledgeGraph();
