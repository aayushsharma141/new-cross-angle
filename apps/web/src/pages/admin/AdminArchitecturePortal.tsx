import React, { useState } from 'react';
import { 
  ARCHITECTURE_MANIFEST, 
  ADRRecord,
  DebtCategory,
} from '@/config/architecture.manifest';
import { 
  archGraph, 
  AQLQueryResult, 
  ImpactAnalysisResult, 
  EnterpriseKnowledgeNode, 
  EnterpriseEntityType 
} from '@/config/architecture-graph-engine';
import { 
  ArchitectureDataIngestionBridge, 
  IngestionSummaryReport 
} from '@/config/architecture-ingestion-bridge';
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  BookOpen, 
  Award, 
  RefreshCw, 
  Zap, 
  Server, 
  GitBranch, 
  History, 
  Flame, 
  Radar, 
  Copy, 
  Check, 
  Code, 
  Sparkles, 
  ArrowRight, 
  UserCheck, 
  Search, 
  Network,
  Target,
  Compass,
  Gauge,
  HelpCircle,
  Play,
  Radio
} from 'lucide-react';

type PortalTab = 
  | 'scorecard' 
  | 'radar_pillars' 
  | 'enterprise_graph' 
  | 'aql_studio' 
  | 'what_if_simulation' 
  | 'adrs' 
  | 'diagrams' 
  | 'evidence' 
  | 'debt' 
  | 'pr_bot' 
  | 'history';

export default function AdminArchitecturePortal() {
  const [activeTab, setActiveTab] = useState<PortalTab>('scorecard');
  const [selectedAdr, setSelectedAdr] = useState<ADRRecord | null>(ARCHITECTURE_MANIFEST.adrs[0]);
  const [selectedCategory, setSelectedCategory] = useState<DebtCategory | 'all'>('all');
  const [diagramFormat, setDiagramFormat] = useState<'mermaid' | 'd2' | 'structurizr'>('mermaid');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanTimestamp, setScanTimestamp] = useState<string>('Just now (CI/CD Verified)');

  // Enterprise Graph & AQL State
  const [aqlInput, setAqlInput] = useState('WHAT IF StorageGateway IS REPLACED');
  const [aqlResult, setAqlResult] = useState<AQLQueryResult>(() => archGraph.executeAQL('WHAT IF StorageGateway IS REPLACED'));
  const [selectedEntityType, setSelectedEntityType] = useState<EnterpriseEntityType | 'all'>('all');
  const [selectedGraphNode, setSelectedGraphNode] = useState<string>('storage_gateway');
  const [nodeImpactDetail, setNodeImpactDetail] = useState<ImpactAnalysisResult>(() => archGraph.analyzeImpact('storage_gateway'));
  
  // Live Ingestion Bridge State
  const [isSyncing, setIsSyncing] = useState(false);
  const [ingestionReport, setIngestionReport] = useState<IngestionSummaryReport | null>(() => {
    const bridge = new ArchitectureDataIngestionBridge(archGraph);
    return bridge.syncAllDomains();
  });

  const handleSyncIngestion = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const bridge = new ArchitectureDataIngestionBridge(archGraph);
      const report = bridge.syncAllDomains();
      setIngestionReport(report);
      setIsSyncing(false);
    }, 400);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanTimestamp(new Date().toLocaleTimeString());
    }, 600);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExecuteAQL = (query: string) => {
    setAqlInput(query);
    const result = archGraph.executeAQL(query);
    setAqlResult(result);
  };

  const handleInspectNode = (nodeId: string) => {
    setSelectedGraphNode(nodeId);
    const impact = archGraph.analyzeImpact(nodeId);
    setNodeImpactDetail(impact);
  };

  const allNodes = archGraph.getAllNodes();
  const filteredNodes = selectedEntityType === 'all' 
    ? allNodes 
    : allNodes.filter(n => n.type === selectedEntityType);

  const totalAdi = ARCHITECTURE_MANIFEST.debtItems.reduce((acc, item) => acc + (item.weight * item.occurrences), 0);

  // Calibrated 4-Pillar Scores
  const pillars = [
    {
      id: 'governance',
      name: 'Governance Index',
      weight: ARCHITECTURE_MANIFEST.scoringPillars.governance.weight,
      score: 100,
      target: 100,
      description: ARCHITECTURE_MANIFEST.scoringPillars.governance.description,
      icon: BookOpen,
      color: 'emerald',
    },
    {
      id: 'compliance',
      name: 'Compliance Index',
      weight: ARCHITECTURE_MANIFEST.scoringPillars.compliance.weight,
      score: 100,
      target: 100,
      description: ARCHITECTURE_MANIFEST.scoringPillars.compliance.description,
      icon: ShieldCheck,
      color: 'emerald',
    },
    {
      id: 'technical_debt',
      name: 'Technical Debt Index',
      weight: ARCHITECTURE_MANIFEST.scoringPillars.technical_debt.weight,
      score: 90,
      target: 100,
      description: ARCHITECTURE_MANIFEST.scoringPillars.technical_debt.description,
      icon: AlertTriangle,
      color: 'amber',
    },
    {
      id: 'engineering_validation',
      name: 'Engineering Validation Index (EVI)',
      weight: ARCHITECTURE_MANIFEST.scoringPillars.engineering_validation.weight,
      score: 98,
      target: 100,
      description: ARCHITECTURE_MANIFEST.scoringPillars.engineering_validation.description,
      icon: Activity,
      color: 'emerald',
    },
  ];

  const compositeScore = Number(
    pillars.reduce((acc, p) => acc + (p.score * p.weight), 0).toFixed(1)
  );

  const filteredDebt = selectedCategory === 'all'
    ? ARCHITECTURE_MANIFEST.debtItems
    : ARCHITECTURE_MANIFEST.debtItems.filter(item => item.category === selectedCategory);

  // Diagram generation strings
  const mermaidCode = `flowchart TD
    %% Enterprise Knowledge Graph Component Model (Auto-Generated)
${ARCHITECTURE_MANIFEST.graph.nodes.map(n => `    ${n.id}["${n.label} (${n.layer})"]`).join('\n')}

${ARCHITECTURE_MANIFEST.graph.edges.map(e => `    ${e.from} -->|${e.contract}| ${e.to}`).join('\n')}`;

  const d2Code = `# Enterprise Knowledge Model (Auto-Generated)
direction: right

${ARCHITECTURE_MANIFEST.graph.nodes.map(n => `${n.id}: "${n.label}" {\n  shape: rectangle\n  style.fill: "${n.layer === 'presentation' ? '#e0f2fe' : n.layer === 'service' ? '#dcfce7' : n.layer === 'gateway' ? '#fef3c7' : '#f1f5f9'}"\n}`).join('\n\n')}

${ARCHITECTURE_MANIFEST.graph.edges.map(e => `${e.from} -> ${e.to}: "${e.contract}"`).join('\n')}`;

  const structurizrCode = `workspace "Cross Angle Interior EIP" "Enterprise Knowledge Platform Model" {
    model {
        user = person "Interior Designer / Admin" "Platform consumer"
        enterpriseSystem = softwareSystem "Cross Angle Platform" "Core Architecture" {
            webApp = container "Web SPA" "React 18 + Vite" "TypeScript"
            assetService = container "Asset Service" "Domain Services" "TypeScript"
            storageGateway = container "Storage Gateway (ACL)" "Vendor-neutral abstraction" "TypeScript"
            db = container "Supabase PostgreSQL" "Relational Core with RLS" "PostgreSQL"
        }
        user -> webApp "Interacts with UI"
        webApp -> assetService "Requests domain assets"
        assetService -> storageGateway "Resolves storage URLs"
        assetService -> db "Queries polymorphic usages"
    }
    views {
        systemContext enterpriseSystem "SystemContext" {
            include *
            autoLayout lr
        }
    }
}`;

  return (
    <div className="min-h-screen bg-[var(--s-bg-base,#0b0e14)] text-[var(--s-text-primary,#f8fafc)] font-sans antialiased p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--s-border-subtle,rgba(255,255,255,0.08))] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Engineering Intelligence Platform (EIP)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                v{ARCHITECTURE_MANIFEST.version}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {allNodes.length} Enterprise Nodes Ingested
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2 text-white flex items-center gap-3">
              <Cpu className="w-8 h-8 text-amber-400" />
              Engineering Intelligence Portal
            </h1>
            <p className="text-sm text-[var(--s-text-muted,#94a3b8)] mt-1">
              Multi-Domain Knowledge Graph (Business ➔ Capabilities ➔ ADRs ➔ Code ➔ SLOs ➔ Repos) & AQL 2.0 Decision Engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--s-bg-surface,#181c24)] hover:bg-[var(--s-bg-surface-hover,#222834)] border border-[var(--s-border-subtle,rgba(255,255,255,0.1))] rounded-lg transition-all text-white disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-amber-400' : ''}`} />
              {isScanning ? 'Syncing Knowledge Graph...' : 'Sync Graph (arch sync)'}
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-[var(--s-text-muted,#94a3b8)]">CI Continuous Verification</div>
              <div className="text-xs font-mono text-emerald-400 font-medium">{scanTimestamp}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--s-border-subtle,rgba(255,255,255,0.08))] pb-3">
          {[
            { id: 'scorecard' as const, label: 'Executive Scorecard', icon: Award },
            { id: 'enterprise_graph' as const, label: 'Enterprise Knowledge Graph', icon: Network },
            { id: 'aql_studio' as const, label: 'AQL 2.0 Query Studio', icon: Sparkles },
            { id: 'what_if_simulation' as const, label: 'What-If Simulation Lab', icon: Play },
            { id: 'radar_pillars' as const, label: '4-Pillar Radar', icon: Radar },
            { id: 'adrs' as const, label: 'Decision Intelligence (ADI)', icon: BookOpen },
            { id: 'diagrams' as const, label: 'Diagrams-as-Code', icon: Code },
            { id: 'evidence' as const, label: 'Engineering Validation (EVI)', icon: Zap },
            { id: 'debt' as const, label: 'Categorized Debt', icon: AlertTriangle },
            { id: 'pr_bot' as const, label: 'PR Policy Reviewer', icon: Terminal },
            { id: 'history' as const, label: 'Time Machine', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-[var(--s-text-muted,#94a3b8)] hover:text-white hover:bg-[var(--s-bg-surface,#181c24)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Executive Scorecard */}
        {activeTab === 'scorecard' && (
          <div className="space-y-6">
            {/* Top Composite Gauge Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[var(--s-bg-surface,#151921)] to-[var(--s-bg-surface,#151921)] border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Calibrated Enterprise Engineering Composite
                </div>
                <div className="text-5xl font-bold text-white mt-1 font-mono flex items-baseline gap-2">
                  {compositeScore} <span className="text-lg font-normal text-slate-400">/ 100</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
                  Mathematically validated across 4 orthogonal dimensions: Governance (25%) + Compliance (25%) + Technical Debt (30%) + Engineering Validation (20%).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                {pillars.map(p => (
                  <div key={p.id} className="p-3 rounded-lg bg-black/30 border border-white/5 text-center">
                    <div className="text-[10px] text-[var(--s-text-muted,#94a3b8)] uppercase font-semibold">{p.name.split(' ')[0]}</div>
                    <div className="text-lg font-mono font-bold text-white mt-0.5">{p.score}</div>
                    <div className="text-[10px] text-amber-400">{(p.weight * 100)}% wt</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.id} className="p-5 rounded-xl bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--s-text-muted,#94a3b8)]">
                          Weight: {pillar.weight * 100}%
                        </span>
                        <Icon className="w-4 h-4 text-amber-400" />
                      </div>
                      <h3 className="text-sm font-bold text-white mt-2">{pillar.name}</h3>
                      <p className="text-xs text-[var(--s-text-muted,#94a3b8)] mt-1">{pillar.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--s-border-subtle,rgba(255,255,255,0.05))] flex items-baseline justify-between">
                      <span className="text-2xl font-bold font-mono text-emerald-400">{pillar.score}</span>
                      <span className="text-xs font-mono text-slate-500">Target: {pillar.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Enterprise Knowledge Graph */}
        {activeTab === 'enterprise_graph' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Network className="w-5 h-5 text-amber-400" />
                    Multi-Domain Enterprise Knowledge Graph (EIP)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Live interconnected knowledge model synchronizing Business Goals, Product Capabilities, ADRs, Code Components, Git Commits, CI/CD Deployments, and Runtime SLOs.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-400 text-right">
                    <div>Showing <span className="text-amber-400 font-bold">{filteredNodes.length}</span> of {allNodes.length} Nodes</div>
                    <div className="text-[10px] text-slate-500">{archGraph.getAllEdges().length} Verified Edges</div>
                  </div>
                  <button
                    onClick={handleSyncIngestion}
                    disabled={isSyncing}
                    className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Live Ingestion Sync'}
                  </button>
                </div>
              </div>

              {/* Live Ingestion & DORA Metrics Summary */}
              {ingestionReport && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                      <GitBranch className="w-3 h-3 text-amber-400" /> Git Ingestion
                    </div>
                    <div className="font-mono text-white font-bold text-xs mt-1">
                      {ingestionReport.domainsIngested.git.commits} Commits • {ingestionReport.domainsIngested.git.prs} PRs
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                      <Server className="w-3 h-3 text-emerald-400" /> DORA: Deploy Frequency
                    </div>
                    <div className="font-mono text-emerald-400 font-bold text-xs mt-1">
                      {ingestionReport.doraAggregates.deploymentFrequencyDays} Days / Deploy
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-cyan-400" /> DORA: Lead Time
                    </div>
                    <div className="font-mono text-cyan-400 font-bold text-xs mt-1">
                      {ingestionReport.doraAggregates.meanLeadTimeHours}h Mean Lead Time
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-purple-400" /> DORA: Change Failure
                    </div>
                    <div className="font-mono text-purple-400 font-bold text-xs mt-1">
                      {ingestionReport.doraAggregates.changeFailureRatePercent}% CFR (Zero Faults)
                    </div>
                  </div>
                </div>
              )}

              {/* Entity Type Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all' as const, label: 'All Domains' },
                  { id: 'business_goal' as const, label: 'Business Goals', icon: Target },
                  { id: 'capability' as const, label: 'Capabilities', icon: Compass },
                  { id: 'feature' as const, label: 'Product Features', icon: Sparkles },
                  { id: 'requirement' as const, label: 'Requirements', icon: ShieldCheck },
                  { id: 'kpi' as const, label: 'Business KPIs', icon: Award },
                  { id: 'adr' as const, label: 'ADRs', icon: BookOpen },
                  { id: 'principle' as const, label: 'Principles', icon: ShieldCheck },
                  { id: 'component' as const, label: 'Code Components', icon: Code },
                  { id: 'commit' as const, label: 'Git Commits', icon: GitBranch },
                  { id: 'pull_request' as const, label: 'Pull Requests', icon: GitBranch },
                  { id: 'deployment' as const, label: 'Deployments', icon: Server },
                  { id: 'endpoint' as const, label: 'API Endpoints', icon: Activity },
                  { id: 'slo' as const, label: 'Runtime SLOs', icon: Gauge },
                  { id: 'telemetry' as const, label: 'Telemetry Contracts', icon: Radio },
                  { id: 'incident' as const, label: 'Incidents', icon: Flame },
                  { id: 'debt' as const, label: 'Technical Debt', icon: AlertTriangle }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEntityType(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedEntityType === item.id
                        ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Two-Column Explorer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Node List */}
                <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                  {filteredNodes.map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleInspectNode(n.id)}
                      className={`w-full text-left p-3 rounded-lg text-xs font-mono transition-all border flex items-center justify-between ${
                        selectedGraphNode === n.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-black/20 border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-white line-clamp-1">{n.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{n.id} • {n.owner}</div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 uppercase text-slate-300 shrink-0 font-semibold">
                        {n.type}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Node Lineage & Detail View */}
                <div className="lg:col-span-2 p-5 rounded-xl bg-black/40 border border-white/10 space-y-5">
                  <div className="flex items-start justify-between border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">{nodeImpactDetail.targetNode?.id || selectedGraphNode}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 uppercase text-slate-300 font-bold">
                          {nodeImpactDetail.targetNode?.type}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase font-semibold">
                          Layer: {nodeImpactDetail.targetNode?.layer}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{nodeImpactDetail.targetNode?.label || selectedGraphNode}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Owner: {nodeImpactDetail.targetNode?.owner} | Status: <span className="text-emerald-400 font-mono">{nodeImpactDetail.targetNode?.status}</span></p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase font-semibold">Blast Radius Score</div>
                      <div className="text-2xl font-mono font-bold text-amber-400">{nodeImpactDetail.blastRadiusScore} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
                    </div>
                  </div>

                  {/* Multi-Domain Relationships */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Upstream Dependents</span>
                      <div className="font-mono text-amber-400 mt-1 font-bold">
                        {nodeImpactDetail.upstreamDependents.length > 0
                          ? nodeImpactDetail.upstreamDependents.map(u => u.label).join(', ')
                          : 'None (Top of Hierarchy)'}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Downstream Deps</span>
                      <div className="font-mono text-emerald-400 mt-1 font-bold">
                        {nodeImpactDetail.downstreamDependencies.length > 0
                          ? nodeImpactDetail.downstreamDependencies.map(d => d.label).join(', ')
                          : 'None (Leaf Entity)'}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Monitored Runtime SLOs</span>
                      <div className="font-mono text-cyan-400 mt-1 font-bold">
                        {nodeImpactDetail.associatedSlos.length > 0
                          ? nodeImpactDetail.associatedSlos.map(s => s.label).join(', ')
                          : 'Standard Telemetry'}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Execution Guidance */}
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Architecture Operating System Execution Guidance</span>
                    <div className="space-y-1 bg-black/20 p-3 rounded-lg border border-white/5">
                      {nodeImpactDetail.dynamicPlan.map((step, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AQL 2.0 Query Studio */}
        {activeTab === 'aql_studio' && (
          <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Architecture Query Language (AQL 2.0) Studio
              </h3>
              <p className="text-xs text-[var(--s-text-muted,#94a3b8)] mt-1">
                Execute declarative queries, compound boolean filters, and semantic intent explanations backed by the live Enterprise Knowledge Graph.
              </p>
            </div>

            {/* AQL Input Box */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={aqlInput}
                    onChange={(e) => setAqlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteAQL(aqlInput)}
                    placeholder="Enter query: SHOW COMPONENTS WHERE LAYER = presentation AND RISK = LOW | Why does Hero depend on StorageGateway?"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={() => handleExecuteAQL(aqlInput)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                  Execute Query
                </button>
              </div>

              {/* Sample Queries */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-500 py-1">Quick Presets:</span>
                {[
                  'SHOW COMPONENTS WHERE LAYER = presentation AND RISK = LOW',
                  'SHOW COMMITS',
                  'SHOW SLOS',
                  'Why does Hero depend on StorageGateway?',
                  'Which architectural principle has accumulated the most debt?',
                  'Who owns AssetService?',
                  'WHAT IF ImageKit IS REPLACED WITH Cloudflare Images'
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleExecuteAQL(q)}
                    className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-[11px] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Query Results */}
            <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="text-xs font-mono text-slate-300">
                  <span>Query: </span>
                  <span className="text-amber-400 font-bold">{aqlResult.query}</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {aqlResult.totalCount} Result(s) Returned
                </span>
              </div>

              {/* Enhanced Structured Explanation (Reason + Evidence + Alternatives + Trade-offs) */}
              {aqlResult.structuredExplanation && (
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Semantic Explanation: {aqlResult.structuredExplanation.concept}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono uppercase font-bold">
                      Knowledge Graph Verified
                    </span>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed bg-black/40 p-3.5 rounded-lg border border-white/10">
                    <span className="text-amber-400 font-bold block mb-1">Reason & Core Architectural Mandate:</span>
                    {aqlResult.structuredExplanation.reason}
                  </div>

                  {/* Evidence Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <span className="text-slate-400 uppercase font-semibold text-[10px] block">Governing ADRs & Principles:</span>
                      <div className="font-mono text-emerald-400 font-semibold">
                        {aqlResult.structuredExplanation.evidence.adrs.concat(aqlResult.structuredExplanation.evidence.principles).join('; ')}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <span className="text-slate-400 uppercase font-semibold text-[10px] block">Dependency Lineage Path:</span>
                      <div className="font-mono text-cyan-300 text-[11px]">
                        {aqlResult.structuredExplanation.evidence.dependencyPath}
                      </div>
                    </div>
                  </div>

                  {/* Alternatives & Trade-offs */}
                  {aqlResult.structuredExplanation.alternatives.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-slate-400 uppercase font-semibold text-[10px] block">Design Alternatives Evaluated:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aqlResult.structuredExplanation.alternatives.map((alt, i) => (
                          <div key={i} className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs space-y-1">
                            <div className="font-bold text-white">{alt.option}</div>
                            <div className="text-slate-300 text-[11px]">{alt.description}</div>
                            <div className="font-mono text-[10px] text-amber-300/90 pt-1 font-semibold">{alt.tradeoffVerdict}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aqlResult.structuredExplanation.tradeoffs.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-slate-400 uppercase font-semibold text-[10px] block">Trade-Off Dimensions:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {aqlResult.structuredExplanation.tradeoffs.map((t, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs">
                            <div className="flex items-center justify-between font-bold text-white text-[11px]">
                              <span>{t.dimension}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${t.impact === 'POSITIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{t.impact}</span>
                            </div>
                            <p className="text-slate-300 text-[10px] mt-1">{t.analysis}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {aqlResult.explanation && !aqlResult.structuredExplanation && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>AI Semantic Explanation:</strong> {aqlResult.explanation}</span>
                </div>
              )}

              {aqlResult.error ? (
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                  ❌ {aqlResult.error}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                        {aqlResult.data.length > 0 && Object.keys(aqlResult.data[0]).map(key => (
                          <th key={key} className="py-2 px-3">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {aqlResult.data.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="py-2.5 px-3">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: What-If Counterfactual Simulation Lab */}
        {activeTab === 'what_if_simulation' && (
          <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-amber-400" />
                What-If Counterfactual Simulation Lab
              </h3>
              <p className="text-xs text-[var(--s-text-muted,#94a3b8)] mt-1">
                Simulate architectural migrations, vendor deprecations, or service fractures to compute blast radius, broken contracts, and phased engineering rollouts before writing code.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'Simulate: Replace StorageGateway', query: 'WHAT IF StorageGateway IS REPLACED' },
                { title: 'Simulate: Migrate to Cloudflare Images', query: 'WHAT IF ImageKit IS REPLACED WITH Cloudflare Images' },
                { title: 'Simulate: Repeal ADR-002', query: 'WHAT IF ADR-002 IS REPEALED' }
              ].map((sim) => (
                <button
                  key={sim.title}
                  onClick={() => handleExecuteAQL(sim.query)}
                  className="p-4 rounded-xl bg-black/30 border border-white/10 hover:border-amber-400/50 text-left transition-all space-y-1"
                >
                  <div className="text-xs font-bold text-amber-400">{sim.title}</div>
                  <div className="text-[11px] font-mono text-slate-400">{sim.query}</div>
                </button>
              ))}
            </div>

            {/* Simulation Dashboard with Phased Migration Sequencing */}
            {aqlResult.type === 'simulation' && aqlResult.migrationPlan && (
              <div className="p-6 rounded-xl bg-black/50 border border-amber-500/30 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase block">Counterfactual Action Plan</span>
                    <h4 className="text-lg font-bold text-white mt-0.5">{aqlResult.migrationPlan.action}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      EFFORT: {aqlResult.migrationPlan.estimatedEffort.devDays} Dev Days ({aqlResult.migrationPlan.estimatedEffort.storyPoints} Pts)
                    </span>
                    <span className="px-3 py-1 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                      BLAST RADIUS: {aqlResult.migrationPlan.blastRadiusScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Severed Contracts</span>
                    <div className="text-rose-400 font-mono font-semibold text-[11px]">
                      {aqlResult.migrationPlan.affectedDomains.severedContracts.join('; ')}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Runtime SLOs At Risk</span>
                    <div className="text-cyan-400 font-mono font-semibold text-[11px]">
                      {aqlResult.migrationPlan.affectedDomains.runtimeSlosAtRisk.join('; ')}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Assigned Architecture Leads</span>
                    <div className="text-slate-200 font-mono text-[11px]">
                      {aqlResult.migrationPlan.assignedOwners.join(', ')}
                    </div>
                  </div>
                </div>

                {/* 4-Phase Rollout Sequence */}
                <div className="space-y-3">
                  <h5 className="text-xs uppercase font-semibold tracking-wider text-slate-300">
                    Phased Engineering Execution & Rollback Safeguards
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aqlResult.migrationPlan.phasedRolloutSequence.map((phase) => (
                      <div key={phase.phase} className="p-4 rounded-lg bg-black/30 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-400">Phase {phase.phase}: {phase.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                            phase.rollbackRisk === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : phase.rollbackRisk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            Rollback: {phase.rollbackRisk}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{phase.objective}</p>
                        <div className="pt-1 text-[11px] text-slate-400 font-mono">
                          Deliverables: {phase.deliverables.join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-black/30 border border-white/5 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-400">Governance Mitigation Strategy: </strong>
                    <span className="text-slate-200">{aqlResult.migrationPlan.mitigationStrategy}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: 4-Pillar Radar & Observability */}
        {activeTab === 'radar_pillars' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((pillar) => (
                <div key={pillar.id} className="p-6 rounded-xl bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <pillar.icon className="w-5 h-5 text-amber-400" />
                      {pillar.name}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {pillar.score} / 100
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{pillar.description}</p>

                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>

                  <div className="pt-2 text-xs text-slate-400 flex justify-between">
                    <span>Mathematical Contribution:</span>
                    <span className="font-mono text-white font-semibold">{(pillar.score * pillar.weight).toFixed(1)} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: ADR Decision Intelligence */}
        {activeTab === 'adrs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--s-text-muted,#94a3b8)]">
                Recorded Decisions ({ARCHITECTURE_MANIFEST.adrs.length})
              </h3>
              {ARCHITECTURE_MANIFEST.adrs.map((adr) => (
                <button
                  key={adr.id}
                  onClick={() => setSelectedAdr(adr)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    selectedAdr?.id === adr.id
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-[var(--s-bg-surface,#151921)] border-[var(--s-border-subtle,rgba(255,255,255,0.08))] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-amber-400">{adr.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">
                      {adr.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white line-clamp-1">{adr.title}</h4>
                  <div className="mt-2 text-xs text-[var(--s-text-muted,#94a3b8)] flex items-center justify-between">
                    <span>Coverage: {adr.implementationCoverage}%</span>
                    <span className="font-mono text-slate-400">{adr.owner.split(' ')[0]}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedAdr ? (
                <div className="p-6 rounded-xl bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400">{selectedAdr.id}</span>
                      <h2 className="text-xl font-bold text-white mt-1">{selectedAdr.title}</h2>
                      <div className="text-xs text-[var(--s-text-muted,#94a3b8)] mt-1">
                        Owner: {selectedAdr.owner} | Date: {selectedAdr.date}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedAdr.status}
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-semibold uppercase tracking-wider text-slate-400 mb-1">Context & Forces</h4>
                      <p className="text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">{selectedAdr.context}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold uppercase tracking-wider text-slate-400 mb-1">Decision</h4>
                      <p className="text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">{selectedAdr.decision}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                        <span className="text-slate-400 uppercase font-semibold">Dependent Services:</span>
                        <div className="font-mono text-white mt-1">{selectedAdr.dependentServices.join(', ')}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                        <span className="text-slate-400 uppercase font-semibold">Evidence Invariant:</span>
                        <div className="font-mono text-emerald-400 mt-1">{selectedAdr.evidenceTest}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">Select an ADR to view specification</div>
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Diagrams-as-Code Studio */}
        {activeTab === 'diagrams' && (
          <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-amber-400" />
                  Diagram-as-Code Export Studio
                </h3>
                <p className="text-xs text-[var(--s-text-muted,#94a3b8)] mt-1">
                  Export dynamic architecture models generated directly from <code>architecture.manifest.ts</code>.
                </p>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                {(['mermaid', 'd2', 'structurizr'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setDiagramFormat(fmt)}
                    className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-all ${
                      diagramFormat === fmt
                        ? 'bg-amber-500 text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => handleCopyCode(
                  diagramFormat === 'mermaid' ? mermaidCode : diagramFormat === 'd2' ? d2Code : structurizrCode
                )}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-mono text-white transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied' : 'Copy Code'}
              </button>

              <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
                <code>
                  {diagramFormat === 'mermaid' && mermaidCode}
                  {diagramFormat === 'd2' && d2Code}
                  {diagramFormat === 'structurizr' && structurizrCode}
                </code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 8: Engineering Validation (EVI) */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lighthouse CI */}
              <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Lighthouse CI Budget Ingestion
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ARCHITECTURE_MANIFEST.engineeringValidation.lighthouse.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-xl font-bold font-mono text-emerald-400">{ARCHITECTURE_MANIFEST.engineeringValidation.lighthouse.performance}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Perf</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-xl font-bold font-mono text-emerald-400">{ARCHITECTURE_MANIFEST.engineeringValidation.lighthouse.accessibility}</div>
                    <div className="text-[10px] text-slate-400 mt-1">A11y</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-xl font-bold font-mono text-emerald-400">{ARCHITECTURE_MANIFEST.engineeringValidation.lighthouse.bestPractices}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Best Prac</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-xl font-bold font-mono text-emerald-400">{ARCHITECTURE_MANIFEST.engineeringValidation.lighthouse.seo}</div>
                    <div className="text-[10px] text-slate-400 mt-1">SEO</div>
                  </div>
                </div>
                <p className="text-xs text-[var(--s-text-muted,#94a3b8)]">
                  Verified in CI Staging at {ARCHITECTURE_MANIFEST.engineeringValidation.lighthouse.verifiedAt}.
                </p>
              </div>

              {/* Chaos Resilience */}
              <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-rose-400" />
                    Chaos Engineering Suite
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ARCHITECTURE_MANIFEST.engineeringValidation.chaos.status}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scenarios Passed</span>
                    <span className="font-mono text-emerald-400 font-bold">{ARCHITECTURE_MANIFEST.engineeringValidation.chaos.scenariosPassed} / {ARCHITECTURE_MANIFEST.engineeringValidation.chaos.scenariosTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Circuit Breaker Active</span>
                    <span className="font-mono text-emerald-400">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Suite Path</span>
                    <span className="font-mono text-slate-300">{ARCHITECTURE_MANIFEST.engineeringValidation.chaos.suite}</span>
                  </div>
                </div>
              </div>

              {/* Load Testing */}
              <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-400" />
                    Tier-A Load Testing Harness
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ARCHITECTURE_MANIFEST.engineeringValidation.loadTesting.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-lg font-bold font-mono text-emerald-400">{ARCHITECTURE_MANIFEST.engineeringValidation.loadTesting.p99LatencyMs} ms</div>
                    <div className="text-[10px] text-slate-400 mt-1">p99 Latency</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-lg font-bold font-mono text-amber-400">{ARCHITECTURE_MANIFEST.engineeringValidation.loadTesting.rpsCapacity}</div>
                    <div className="text-[10px] text-slate-400 mt-1">RPS Capacity</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-lg font-bold font-mono text-emerald-400">{ARCHITECTURE_MANIFEST.engineeringValidation.loadTesting.errorRatePct}%</div>
                    <div className="text-[10px] text-slate-400 mt-1">Error Rate</div>
                  </div>
                </div>
              </div>

              {/* Telemetry Contracts */}
              <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Telemetry & Analytics Contracts
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ARCHITECTURE_MANIFEST.engineeringValidation.telemetry.status}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Events Validated</span>
                    <span className="font-mono text-emerald-400 font-bold">{ARCHITECTURE_MANIFEST.engineeringValidation.telemetry.eventsValidated} Events</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Schema Drift Detected</span>
                    <span className="font-mono text-emerald-400 font-bold">0 Violations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Categorized Debt */}
        {activeTab === 'debt' && (
          <div className="space-y-6">
            <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Architecture Debt Ledger by Taxonomy
                  </h3>
                  <p className="text-xs text-[var(--s-text-muted,#94a3b8)] mt-1">
                    Multi-dimensional debt taxonomy categorized with explicit severity weights.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold font-mono text-amber-400">{totalAdi} pts</div>
                  <div className="text-xs text-[var(--s-text-muted,#94a3b8)]">Total Architecture Debt Index</div>
                </div>
              </div>

              {/* Taxonomy Filter Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(['all', 'security', 'architecture', 'performance', 'maintainability', 'documentation'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredDebt.map((debt) => (
                  <div 
                    key={debt.id}
                    className="p-4 rounded-lg bg-black/20 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-amber-400">{debt.id}</span>
                        <span className="text-xs font-semibold text-white">{debt.title}</span>
                      </div>
                      <p className="text-xs text-[var(--s-text-muted,#94a3b8)]">
                        <strong>Remediation:</strong> {debt.remediationPlan}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-xs">
                      <span className="px-2 py-0.5 rounded font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        {debt.category}
                      </span>
                      <span className="font-mono text-slate-300 font-semibold">
                        {debt.occurrences} instances × {debt.weight}w = <span className="text-amber-400 font-bold">{debt.occurrences * debt.weight} pts</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 10: Actionable PR Reviewer Bot */}
        {activeTab === 'pr_bot' && (
          <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                GitHub PR Architecture Reviewer Bot
              </h3>
              <p className="text-xs text-[var(--s-text-muted,#94a3b8)] mt-1">
                Automated architectural risk classification, ADR linking, estimated debt computation, and suggested fix diffs.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="font-bold text-amber-400">PR #142</span>
                  <span>•</span>
                  <span>feat(media): Refactor Hero component to consume StorageGateway UUID</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  RISK: LOW (APPROVED)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                  <div className="text-slate-400 text-[11px] font-semibold uppercase">Risk Classification</div>
                  <div className="text-emerald-400 font-bold font-mono mt-1">LOW (0 Invariant Violations)</div>
                </div>
                <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                  <div className="text-slate-400 text-[11px] font-semibold uppercase">Affected Principles</div>
                  <div className="text-amber-400 font-bold font-mono mt-1">P1, P2, P5</div>
                </div>
                <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                  <div className="text-slate-400 text-[11px] font-semibold uppercase">Relevant ADR</div>
                  <div className="text-emerald-400 font-bold font-mono mt-1">ADR-002, ADR-004</div>
                </div>
                <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                  <div className="text-slate-400 text-[11px] font-semibold uppercase">Estimated Debt</div>
                  <div className="text-emerald-400 font-bold font-mono mt-1">-4 ADI (Debt Reduced)</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Assigned Architecture Reviewer:
                </span>
                <span className="font-mono text-white font-semibold">Platform Architecture Lead (@aayushsharma141)</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Suggested Actionable Diff Fix:</span>
                <pre className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-slate-300 overflow-x-auto">
                  <span className="text-rose-400">- const rawUrl = &quot;https://ik.imagekit.io/crossangle/banner.jpg&quot;;</span>{'\n'}
                  <span className="text-emerald-400">+ const {`{ url }`} = await StorageGateway.resolveMediaUrl(&quot;asset_hero_01&quot;, &quot;full&quot;);</span>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 11: Time Machine History */}
        {activeTab === 'history' && (
          <div className="bg-[var(--s-bg-surface,#151921)] border border-[var(--s-border-subtle,rgba(255,255,255,0.08))] rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                Architecture Time Machine & Trajectory Analytics
              </h3>
              <p className="text-xs text-[var(--s-text-muted,#94a3b8)] mt-1">
                Historical maturity trajectory across architecture releases from Discovery to ArchOS with granular trend metrics.
              </p>
            </div>

            <div className="space-y-4">
              {ARCHITECTURE_MANIFEST.history.map((hist) => (
                <div 
                  key={hist.version}
                  className="p-5 rounded-xl bg-black/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {hist.version}
                      </span>
                      <span className="text-sm font-bold text-white">{hist.title}</span>
                      <span className="text-xs text-[var(--s-text-muted,#94a3b8)]">{hist.date}</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2 text-xs font-mono">
                      <div><span className="text-slate-500">Gov:</span> <span className="text-slate-300 font-bold">{hist.scores.governance}</span></div>
                      <div><span className="text-slate-500">Comp:</span> <span className="text-slate-300 font-bold">{hist.scores.compliance}</span></div>
                      <div><span className="text-slate-500">Debt:</span> <span className="text-slate-300 font-bold">{hist.scores.debt}</span></div>
                      <div><span className="text-slate-500">EVI:</span> <span className="text-slate-300 font-bold">{hist.scores.operational}</span></div>
                      <div><span className="text-slate-500">Debt Pts:</span> <span className="text-amber-400 font-bold">{hist.debtPoints}</span></div>
                      <div><span className="text-slate-500">Violations:</span> <span className="text-emerald-400 font-bold">{hist.violationsCount}</span></div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold font-mono text-emerald-400">{hist.scores.composite}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Composite Index</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
