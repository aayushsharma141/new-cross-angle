import React, { useEffect, useRef, useState, useCallback } from 'react';
import './BlueprintPage.css';
import { Link } from "react-router-dom";
import { docsRegistry, DocItem } from '../data/docsRegistry';
import { 
  Search, 
  FileText, 
  Settings, 
  ShieldCheck, 
  FileCheck, 
  ArrowRight, 
  Check, 
  Copy, 
  Cpu, 
  Sparkles, 
  BookOpen,
  ArrowLeft,
  Terminal,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Layers,
  Activity,
  Award,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Play,
  Database,
  RefreshCw,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function BlueprintPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'docs' | 'proposal'>('blueprint');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Interactive Timeline Journey states
  const [selectedDbTable, setSelectedDbTable] = useState<'profiles' | 'inquiries' | 'estimates' | 'projects'>('profiles');
  const [authRole, setAuthRole] = useState<'anonymous' | 'admin'>('anonymous');
  const [staggerSimActive, setStaggerSimActive] = useState(false);
  const [staggerStep, setStaggerStep] = useState(0);
  const [crmLeadStage, setCrmLeadStage] = useState<number>(0);
  const [auditProgress, setAuditProgress] = useState<'idle' | 'running' | 'done'>('idle');
  const [auditOutput, setAuditOutput] = useState<string[]>([]);
  
  // Folder expanded/collapsed state tracking
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'Core Standards & Specs': true,
    'Design History Logs': true,
    'Engineering Audits': true,
    'Guides & Manuals': true
  });

  // Auto-scroll to top on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Scroll progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollProgress(isNaN(progress) ? 0 : progress * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cmd/Ctrl+K focuses search bar in docs tab
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (activeTab !== 'docs') setActiveTab('docs');
        setTimeout(() => searchRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab]);

  // Handle stagger steps simulation
  useEffect(() => {
    if (staggerSimActive) {
      setStaggerStep(0);
      const t1 = setTimeout(() => setStaggerStep(1), 250);
      const t2 = setTimeout(() => setStaggerStep(2), 500);
      const t3 = setTimeout(() => setStaggerStep(3), 750);
      const t4 = setTimeout(() => setStaggerStep(4), 1000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      setStaggerStep(0);
    }
  }, [staggerSimActive]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Dynamic document link navigation interceptor
    const handleDocNavigation = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetId = customEvent.detail;
      const found = docsRegistry.find(d => d.id === targetId || d.id.includes(targetId) || targetId.includes(d.id));
      if (found) {
        setSelectedDocId(found.id);
        setActiveTab('docs');
        // Ensure parent folder is expanded
        if (found.category) {
          setExpandedFolders(prev => ({ ...prev, [found.category]: true }));
        }
        // Scroll workspace to view
        setTimeout(() => {
          document.getElementById('docs-workspace-title')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    window.addEventListener('navigate-doc', handleDocNavigation);

    // Ensure DOM is ready, then run scripts for cursors & particles
    const timer = setTimeout(() => {
      try {
        // ── CURSOR ────────────────────────────────────────────
        const cursor = document.getElementById('cursor') as HTMLElement;
        const ring = document.getElementById('cursor-ring') as HTMLElement;
        let mx = 0, my = 0, rx = 0, ry = 0;

        document.addEventListener('mousemove', e => {
          mx = e.clientX; my = e.clientY;
          if (cursor) {
            cursor.style.left = mx + 'px';
            cursor.style.top = my + 'px';
          }
        });

        function animRing() {
          rx += (mx - rx) * 0.12;
          ry += (my - ry) * 0.12;
          if (ring) {
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
          }
          requestAnimationFrame(animRing);
        }
        animRing();

        // ── REVEAL ON SCROLL ──────────────────────────────────
        const reveals = document.querySelectorAll('.reveal');
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('visible');
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(r => obs.observe(r));

        // ── PARTICLES ─────────────────────────────────────────
        const pc = document.getElementById('particles');
        if (pc) {
          pc.innerHTML = '';
          for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const x = Math.random() * 100;
            const dur = 6 + Math.random() * 12;
            const delay = Math.random() * 8;
            const drift = (Math.random() - 0.5) * 80;
            p.style.cssText = `left:${x}%;bottom:${Math.random() * 20}%;width:${1 + Math.random() * 2}px;height:${1 + Math.random() * 2}px;animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px`;
            pc.appendChild(p);
          }
        }

        // Add interactive hover scaling for custom cursor
        document.querySelectorAll('a, button, .pillar, .bento, .stack-cell, .comp-preview, .doc-row, .folder-header')
          .forEach(el => {
            el.addEventListener('mouseenter', () => {
              if (cursor && ring) {
                cursor.style.width = '6px';
                cursor.style.height = '6px';
                ring.style.width = '56px';
                ring.style.height = '56px';
                ring.style.borderColor = 'rgba(196, 18, 48, 0.8)';
              }
            });
            el.addEventListener('mouseleave', () => {
              if (cursor && ring) {
                cursor.style.width = '10px';
                cursor.style.height = '10px';
                ring.style.width = '36px';
                ring.style.height = '36px';
                ring.style.borderColor = 'rgba(196, 18, 48, 0.4)';
              }
            });
          });

      } catch (e) {
        console.error("Error executing blueprint scripts", e);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('navigate-doc', handleDocNavigation);
    };
  }, [activeTab]);

  const categories = ['All', 'Core Standards & Specs', 'Design History Logs', 'Engineering Audits', 'Guides & Manuals'];

  // Toggle folder open/collapse
  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Group files by category
  const getDocsByCategory = (catName: string) => {
    return docsRegistry.filter(doc => {
      const matchesCategory = doc.category === catName;
      const matchesSearch = searchQuery === '' || 
                            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  // Check if search query matches anything in a category
  const hasCategoryMatches = (catName: string) => {
    return getDocsByCategory(catName).length > 0;
  };

  const selectedDoc = docsRegistry.find(d => d.id === selectedDocId);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get specific icon for categories
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Core Standards & Specs':
        return <Cpu className="w-3.5 h-3.5 text-[#C41230]" />;
      case 'Design History Logs':
        return <Sparkles className="w-3.5 h-3.5 text-yellow-500" />;
      case 'Engineering Audits':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Guides & Manuals':
        return <BookOpen className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="blueprint-page-wrapper bg-[#040404] text-[#E0E0E0] min-h-screen" ref={containerRef}>
      {/*  CURSOR  */}
      <div id="cursor"></div>
      <div id="cursor-ring"></div>
      {/* Live scroll progress bar — replaces the JS-driven #progress div */}
      <div
        style={{ position: 'fixed', top: 0, left: 0, height: 2, width: `${scrollProgress}%`, background: 'linear-gradient(90deg,#C41230,#D1AF6E)', zIndex: 9997, transition: 'width 0.1s linear', boxShadow: '0 0 12px #C41230' }}
      />

      {/*  HEADER  */}
      <header id="header" className="scrolled border-b border-neutral-900 bg-[#040404]/90 backdrop-blur-md">
        <div className="logo-area">
          <div className="logo-mark" style={{ backgroundColor: '#D1AF6E' }}></div>
          <div className="logo-text">CrossAngle <span style={{ color: '#D1AF6E' }}>Archival</span></div>
        </div>
        <nav className="flex items-center gap-6">
          <button 
            type="button"
            onClick={() => { setActiveTab('blueprint'); setSelectedDocId(null); }}
            className={`text-xs tracking-widest uppercase py-2 border-b-2 transition-all cursor-pointer font-mono ${activeTab === 'blueprint' ? 'text-white border-[#C41230]' : 'text-neutral-500 border-transparent hover:text-neutral-200'}`}
          >
            System Blueprint
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`text-xs tracking-widest uppercase py-2 border-b-2 transition-all cursor-pointer font-mono ${activeTab === 'docs' ? 'text-white border-[#C41230]' : 'text-neutral-500 border-transparent hover:text-neutral-200'}`}
          >
            Documentation Workspace
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('proposal'); setSelectedDocId(null); }}
            className={`text-xs tracking-widest uppercase py-2 border-b-2 transition-all cursor-pointer font-mono ${activeTab === 'proposal' ? 'text-white border-[#C41230]' : 'text-neutral-500 border-transparent hover:text-neutral-200'}`}
          >
            Design Proposal
          </button>
          <Link to="/" className="text-xs tracking-widest uppercase text-neutral-400 hover:text-white transition-colors font-mono">Back to Site</Link>
        </nav>
      </header>

      {activeTab === 'blueprint' ? (
        <>
          {/*  ═══════════ COVER ═══════════  */}
          <section id="cover" className="relative border-b border-neutral-900">
            <div className="particles" id="particles"></div>
            <div className="cover-inner">
              <div className="cover-left">
                <div className="doc-meta">Interactive Architecture Dashboard — 2026</div>
                <div className="cover-subtitle">CrossAngle Luxury Design</div>
                <h1 className="cover-title">
                  System<br />
                  <em style={{ color: '#C41230' }}>Architectures</em><br />
                  & Specs
                </h1>
                <p className="cover-desc text-neutral-400">
                  A high-fidelity developer workspace detailing the implementation logs, 
                  design timelines, visual rules, and security audits governing the 
                  CrossAngle Interior luxury platform.
                </p>
                <div className="flex gap-4 mb-8">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('docs')}
                    className="px-6 py-3 bg-[#C41230] text-white font-medium text-xs tracking-wider uppercase hover:bg-red-700 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Open Document Portal <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <a 
                    href="#journey-timeline"
                    className="px-6 py-3 border border-neutral-800 hover:border-neutral-500 text-white font-medium text-xs tracking-wider uppercase transition-all text-center"
                  >
                    Explore Journey
                  </a>
                </div>
                <div className="cover-tags">
                  <span className="tag">33 Active Docs</span>
                  <span className="tag">Framer Motion v11</span>
                  <span className="tag">Tailwind Typography</span>
                  <span className="tag">Modular Addon API</span>
                  <span className="tag">Audit Verified</span>
                  <span className="tag">Responsive CRM</span>
                </div>
                {/* Mobile stat strip — visible only below lg */}
                <div className="lg:hidden grid grid-cols-2 gap-3 mt-8 pt-8 border-t border-neutral-900">
                  {[
                    { label: 'COMPILED FILES', value: String(docsRegistry.length), color: 'text-white' },
                    { label: 'SECURITY AUDIT', value: 'PASS', color: 'text-green-500' },
                    { label: 'UX METRICS', value: 'PREM', color: 'text-yellow-500' },
                    { label: 'ADDONS MOUNTED', value: '04', color: 'text-[#C41230]' },
                  ].map(s => (
                    <div key={s.label} className="bg-neutral-950/60 border border-neutral-900 rounded-lg p-4">
                      <p className="text-[9px] font-mono text-neutral-500 tracking-wider mb-1">{s.label}</p>
                      <p className={`font-serif text-3xl font-light ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cover-right bg-neutral-950/40 hidden lg:grid">
                <div className="stat-grid border-b border-neutral-900">
                  <div className="stat-cell border-r border-neutral-900">
                    <span className="text-[10px] text-neutral-500 font-mono tracking-wider">COMPILED FILES</span>
                    <div className="stat-num text-white mt-2">33</div>
                    <div className="stat-label">Specs, Logs, & Guides</div>
                  </div>
                  <div className="stat-cell">
                    <span className="text-[10px] text-neutral-500 font-mono tracking-wider">SECURITY AUDIT</span>
                    <div className="stat-num text-green-500 mt-2">PASS</div>
                    <div className="stat-label">OWASP Compliant</div>
                  </div>
                  <div className="stat-cell border-r border-neutral-900">
                    <span className="text-[10px] text-neutral-500 font-mono tracking-wider">UX METRICS</span>
                    <div className="stat-num text-yellow-500 mt-2">PREM</div>
                    <div className="stat-label">Luxury Micro-interactions</div>
                  </div>
                  <div className="stat-cell">
                    <span className="text-[10px] text-neutral-500 font-mono tracking-wider">ADDONS MOUNTED</span>
                    <div className="stat-num text-[#C41230] mt-2">04</div>
                    <div className="stat-label">Decoupled Engines</div>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="border border-neutral-900 bg-neutral-900/10 p-6 rounded-lg">
                    <h4 className="text-xs font-mono tracking-widest text-[#C41230] uppercase mb-4 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" /> Quick Documentation Index
                    </h4>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between text-neutral-400 hover:text-white cursor-pointer" onClick={() => { setActiveTab('docs'); setSelectedDocId('design_history_md'); }}>
                        <span>↳ DESIGN_HISTORY.md</span>
                        <span className="text-neutral-600">3.3 KB</span>
                      </div>
                      <div className="flex justify-between text-neutral-400 hover:text-white cursor-pointer" onClick={() => { setActiveTab('docs'); setSelectedDocId('crossangle_md'); }}>
                        <span>↳ CROSSANGLE.md (DB Schema)</span>
                        <span className="text-neutral-600">10.6 KB</span>
                      </div>
                      <div className="flex justify-between text-neutral-400 hover:text-white cursor-pointer" onClick={() => { setActiveTab('docs'); setSelectedDocId('prd_md'); }}>
                        <span>↳ UX Enhancement PRD</span>
                        <span className="text-neutral-600">3.0 KB</span>
                      </div>
                      <div className="flex justify-between text-neutral-400 hover:text-white cursor-pointer" onClick={() => { setActiveTab('docs'); setSelectedDocId('10_improvement_roadmap_md'); }}>
                        <span>↳ 10_Improvement_Roadmap.md</span>
                        <span className="text-neutral-600">14.8 KB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/*  ═══════════ ARCHITECTURAL TIMELINE — ALL PHASES EXPANDED ═══════════  */}
          <section id="journey-timeline" className="py-24 md:py-32 pt-32 md:pt-40 px-[4vw] max-w-[1600px] mx-auto border-b border-neutral-900">
            {/* Section header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C41230]/30 bg-[#C41230]/10 text-[#C41230] text-[10px] tracking-[0.2em] uppercase mb-8 font-mono shadow-[0_0_20px_rgba(196,18,48,0.15)] reveal">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C41230] animate-pulse"></span>
                Scratch to Live · Full Architecture
              </div>
              <h2 className="font-serif text-5xl md:text-7xl text-white tracking-tight leading-[1.1] mb-6 reveal">
                The ₹10 Lakh<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-400 to-[#C41230] italic font-light">
                  Architectural Timeline
                </span>
              </h2>
              <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed reveal">
                All five phases expanded — from database blueprinting to edge deployment and design system.
              </p>
            </div>

            {/* ── Vertical timeline — all phases rendered together ── */}
            <div className="relative">
              {/* Vertical connecting line — centered on 40px node (left-5 = 20px) */}
              <div className="absolute left-5 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#C41230]/60 via-neutral-800 to-transparent pointer-events-none" />

              <div className="space-y-0">

                {/* ─── PHASE 01: DATABASE & SECURITY ─── */}
                <div className="relative pl-12 md:pl-16 pb-16">
                  {/* Timeline node */}
                  <div className="absolute left-0 top-1 flex flex-col items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#C41230] border-4 border-[#040404] flex items-center justify-center shadow-[0_0_20px_rgba(196,18,48,0.5)] z-10">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Phase label bar */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] text-[#C41230] tracking-[0.25em] uppercase">Phase 01</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-mono text-neutral-400 tracking-wider">DB & RLS</span>
                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-mono text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Complete
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-1">Scratch Core</h3>
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-[0.15em] mb-3">Database Schema & Security System</p>
                  <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6 max-w-2xl">
                    Data security and access controls designed from scratch. Supabase Postgres Row-Level Security (RLS) policies protect all client lead details.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Table selector */}
                    <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 space-y-3">
                      <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-3">SELECT DATABASE TABLE</div>
                      {(['profiles', 'inquiries', 'estimates', 'projects'] as const).map(table => (
                        <button key={table} type="button" onClick={() => setSelectedDbTable(table)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-mono transition-all ${selectedDbTable === table ? "bg-[#C41230]/10 border-[#C41230]/30 text-white font-bold" : "bg-neutral-900/40 border-neutral-900 text-neutral-400 hover:text-neutral-200"}`}>
                          <span>↳ {table}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                      <div className="border border-neutral-900 bg-neutral-900/10 rounded-xl p-3 mt-2 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                          <span>SESSION ROLE</span>
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${authRole === 'admin' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{authRole.toUpperCase()}</span>
                        </div>
                        <button type="button" onClick={() => setAuthRole(prev => prev === 'anonymous' ? 'admin' : 'anonymous')}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-white font-mono uppercase tracking-wider rounded border border-neutral-800 transition-colors">
                          {authRole === 'anonymous' ? <Unlock className="w-3 h-3 text-green-400" /> : <Lock className="w-3 h-3 text-red-400" />}
                          {authRole === 'anonymous' ? 'Switch to Admin' : 'Switch to Public'}
                        </button>
                      </div>
                    </div>
                    {/* Schema detail */}
                    <div className="bg-black border border-neutral-900 rounded-2xl p-5 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-3 mb-3">
                        <span className="text-[#C41230] font-bold">TABLE: {selectedDbTable}</span>
                        <span className="text-[10px] text-neutral-500">RLS ENABLED</span>
                      </div>
                      <div className="space-y-3 text-left">
                        {selectedDbTable === 'profiles' && (<><div className="flex justify-between"><span className="text-neutral-300">id (uuid)</span><span className="text-neutral-500 text-[10px]">PRIMARY KEY</span></div><div className="flex justify-between"><span className="text-neutral-300">full_name (text)</span><span className="text-neutral-500 text-[10px]">PUBLIC ACCESS</span></div><div className="flex justify-between"><span className="text-neutral-300">role (text)</span><span className="text-neutral-500 text-[10px]">PUBLIC ACCESS</span></div></>)}
                        {selectedDbTable === 'inquiries' && (<><div className="flex justify-between"><span className="text-neutral-300">id (uuid)</span><span className="text-neutral-500 text-[10px]">PRIMARY KEY</span></div><div className="flex justify-between"><span className="text-neutral-300">name (text)</span><span className="text-neutral-500 text-[10px]">PUBLIC WRITE</span></div><div className="flex justify-between"><span className="text-neutral-300">email (text)</span>{authRole === 'admin' ? <span className="text-green-400 text-[10px] animate-pulse">aayush@crossangle.in</span> : <span className="text-red-500 text-[10px]">🔒 [Redacted]</span>}</div><div className="flex justify-between"><span className="text-neutral-300">phone (text)</span>{authRole === 'admin' ? <span className="text-green-400 text-[10px] animate-pulse">+91 99999 XXXXX</span> : <span className="text-red-500 text-[10px]">🔒 [Redacted]</span>}</div></>)}
                        {selectedDbTable === 'estimates' && (<><div className="flex justify-between"><span className="text-neutral-300">id (uuid)</span><span className="text-neutral-500 text-[10px]">PRIMARY KEY</span></div><div className="flex justify-between"><span className="text-neutral-300">session_id (uuid)</span><span className="text-neutral-500 text-[10px]">OWNER WRITE</span></div><div className="flex justify-between"><span className="text-neutral-300">estimated_cost (numeric)</span>{authRole === 'admin' ? <span className="text-green-400 text-[10px] animate-pulse">₹12,40,000</span> : <span className="text-red-500 text-[10px]">🔒 [Redacted]</span>}</div></>)}
                        {selectedDbTable === 'projects' && (<><div className="flex justify-between"><span className="text-neutral-300">id (uuid)</span><span className="text-neutral-500 text-[10px]">PRIMARY KEY</span></div><div className="flex justify-between"><span className="text-neutral-300">title (text)</span><span className="text-neutral-500 text-[10px]">PUBLIC VIEW</span></div><div className="flex justify-between"><span className="text-neutral-300">budget (numeric)</span>{authRole === 'admin' ? <span className="text-green-400 text-[10px] animate-pulse">₹45,00,000</span> : <span className="text-red-500 text-[10px]">🔒 [Redacted]</span>}</div></>)}
                      </div>
                      <div className="border-t border-neutral-900 pt-3 mt-4">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#C41230]" /> ACTIVE POLICY</div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">
                          {selectedDbTable === 'profiles' && "CREATE POLICY public_profile_select ON profiles FOR SELECT USING (true);"}
                          {selectedDbTable === 'inquiries' && "CREATE POLICY admin_inquiry_select ON inquiries FOR SELECT TO authenticated USING (auth.role() = 'authenticated_crm');"}
                          {selectedDbTable === 'estimates' && "CREATE POLICY estimate_owner_read ON estimates FOR ALL USING (auth.uid() = user_id);"}
                          {selectedDbTable === 'projects' && "CREATE POLICY public_projects_view ON projects FOR SELECT USING (true);"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── PHASE 02: PUBLIC PORTAL ─── */}
                <div className="relative pl-12 md:pl-16 pb-16">
                  <div className="absolute left-0 top-1 flex flex-col items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-900 border-4 border-[#040404] border-l-[#C41230] flex items-center justify-center shadow-[0_0_16px_rgba(196,18,48,0.3)] z-10">
                      <Sparkles className="w-4 h-4 text-[#C41230]" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] text-[#C41230] tracking-[0.25em] uppercase">Phase 02</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-mono text-neutral-400 tracking-wider">UX & Stagger</span>
                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-mono text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Complete
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-1">Public Face Portal</h3>
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-[0.15em] mb-3">Luxury UI Motion Engine</p>
                  <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6 max-w-2xl">
                    Framer Motion stagger-reveal layout guides the customer's eye. Spring transitions match human cognitive latency for premium micro-reveal animations.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="border border-neutral-900 bg-neutral-950 p-5 rounded-2xl flex flex-col gap-4">
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                        <span>STAGGER STAGE CONTROLLER</span>
                        <span>{staggerSimActive ? `STEP ${staggerStep}/4` : 'IDLE'}</span>
                      </div>
                      <div className="border border-neutral-900 rounded-xl p-4 space-y-3 bg-black/40 min-h-[140px] flex flex-col justify-center">
                        <div className={`flex justify-between items-center py-2 px-3 bg-neutral-900/80 border border-neutral-800 rounded-lg transition-all duration-500 ${staggerStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C41230]"></span>
                          <div className="flex gap-2"><span className="w-8 h-1 bg-neutral-800 rounded"></span><span className="w-8 h-1 bg-neutral-800 rounded"></span></div>
                        </div>
                        <div className="space-y-1.5">
                          <div className={`h-3.5 bg-white/90 rounded w-3/4 transition-all duration-500 ${staggerStep >= 2 ? 'opacity-100' : 'opacity-0 translate-y-3'}`}></div>
                          <div className={`h-3.5 bg-white/60 rounded w-1/2 transition-all duration-500 ${staggerStep >= 2 ? 'opacity-100' : 'opacity-0 translate-y-3'}`}></div>
                        </div>
                        <div className={`space-y-1 transition-all duration-500 ${staggerStep >= 3 ? 'opacity-100' : 'opacity-0 translate-y-3'}`}>
                          <div className="h-1.5 bg-neutral-800 rounded w-full"></div><div className="h-1.5 bg-neutral-800 rounded w-5/6"></div>
                        </div>
                        <div className={`h-6 bg-[#C41230] rounded w-24 transition-all duration-500 ${staggerStep >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}></div>
                      </div>
                      <button type="button" onClick={() => { setStaggerSimActive(false); setTimeout(() => setStaggerSimActive(true), 100); }}
                        className="w-full py-2 bg-[#C41230] hover:bg-red-700 text-xs text-white font-mono uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2">
                        <Play className="w-3.5 h-3.5" /> Trigger Entrance Stagger
                      </button>
                    </div>
                    <div className="bg-black border border-neutral-900 rounded-2xl p-5 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-neutral-500 uppercase tracking-widest text-[10px] mb-3"><Terminal className="w-4 h-4 text-[#C41230]" /> Motion Code</div>
                      <pre className="text-neutral-400 text-[10px] leading-relaxed overflow-x-auto whitespace-pre bg-[#020202]/70 p-3 rounded border border-neutral-900 text-left">{`const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, y: 0,
    transition: { type: "spring" }
  }
};`}</pre>
                      <div className="border-t border-neutral-900 pt-3 mt-3">
                        <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">Spring transitions at 250ms stagger match human cognitive latency for premium micro-reveal animations.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── PHASE 03: ADMIN CRM ─── */}
                <div className="relative pl-12 md:pl-16 pb-16">
                  <div className="absolute left-0 top-1 flex flex-col items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-900 border-4 border-[#040404] border-l-[#C41230] flex items-center justify-center shadow-[0_0_16px_rgba(196,18,48,0.3)] z-10">
                      <Cpu className="w-4 h-4 text-[#C41230]" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] text-[#C41230] tracking-[0.25em] uppercase">Phase 03</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-mono text-neutral-400 tracking-wider">CRM & Kanban</span>
                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-mono text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Complete
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-1">Admin CRM System</h3>
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-[0.15em] mb-3">Decoupled Data Pipelines</p>
                  <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6 max-w-2xl">
                    Decoupled sync architecture. When an estimate is generated on the public site, real-time WebSocket triggers instantly sync the lead card to the Admin CRM Kanban board.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="border border-neutral-900 bg-neutral-950 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                        <span>INTERACTIVE LEAD PIPELINE</span>
                        <span className="flex items-center gap-1 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span> Realtime</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {['Inbox','Call','Proposal','Signed'].map((step, idx) => (
                          <div key={step} className="flex flex-col gap-1">
                            <span className="text-[9px] font-mono text-neutral-600 text-center uppercase tracking-wider">{step}</span>
                            <div className="h-20 bg-neutral-900/50 rounded border border-neutral-900 p-1 flex flex-col justify-start">
                              {crmLeadStage === idx && (
                                <div className="bg-[#C41230]/20 border border-[#C41230]/40 rounded p-1 text-[9px] font-mono text-white animate-bounce">
                                  <div className="font-bold truncate">A. Sharma</div>
                                  <div className="text-[#C41230] font-bold">₹12.4L</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button type="button" disabled={crmLeadStage === 0} onClick={() => setCrmLeadStage(p => Math.max(0, p - 1))}
                          className="flex-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-neutral-400 font-mono rounded border border-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-colors">← Prev</button>
                        <button type="button" disabled={crmLeadStage === 3} onClick={() => setCrmLeadStage(p => Math.min(3, p + 1))}
                          className="flex-1 px-3 py-1.5 bg-[#C41230] hover:bg-red-700 text-[10px] text-white font-mono rounded transition-colors">Advance →</button>
                      </div>
                    </div>
                    <div className="bg-black border border-neutral-900 rounded-2xl p-5 font-mono text-xs flex flex-col gap-3">
                      <div className="flex items-center gap-1.5 text-neutral-500 uppercase tracking-widest text-[10px]"><RefreshCw className="w-3.5 h-3.5 text-[#C41230] animate-spin" style={{animationDuration:'4s'}} /> Realtime Event Stream</div>
                      <div className="bg-[#020202]/70 p-3 rounded border border-neutral-900 text-[10px] text-neutral-400 space-y-1.5 min-h-[100px] text-left">
                        <div className="text-neutral-600">-- postgres channels payload listener:</div>
                        <div>
                          {crmLeadStage === 0 && <span className="text-green-400 font-bold">INSERT → inquiries (status: 'inbox')</span>}
                          {crmLeadStage === 1 && <span className="text-[#C41230] font-bold">UPDATE → status = 'call'</span>}
                          {crmLeadStage === 2 && <span className="text-[#C41230] font-bold">UPDATE → status = 'proposal'</span>}
                          {crmLeadStage === 3 && <span className="text-green-400 font-bold">COMMIT → status = 'signed' ✓</span>}
                        </div>
                        <div className="text-neutral-600">{`updated_at: ${new Date().toISOString().split('T')[0]}`}</div>
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">WebSockets via Supabase Broadcast Channel — no polling. Instant updates across all admin tabs with minimum CPU use.</p>
                    </div>
                  </div>
                </div>

                {/* ─── PHASE 04: LIVE INFRASTRUCTURE ─── */}
                <div className="relative pl-12 md:pl-16 pb-16">
                  <div className="absolute left-0 top-1 flex flex-col items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-900 border-4 border-[#040404] border-l-yellow-500 flex items-center justify-center shadow-[0_0_16px_rgba(234,179,8,0.3)] z-10">
                      <Zap className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] text-[#C41230] tracking-[0.25em] uppercase">Phase 04</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-mono text-neutral-400 tracking-wider">Launch & Perf</span>
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] font-mono text-yellow-400 flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5" /> Live
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-1">Live Infrastructure</h3>
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-[0.15em] mb-3">Edge Deploy & Audit Loop</p>
                  <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6 max-w-2xl">
                    Code splitting, LCP asset preloading, and structured JSON-LD SEO schemas ensure instant global edge loading. Zero CLS for high Google rankings.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="border border-neutral-900 bg-neutral-950 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                        <span>LIGHTHOUSE AUDIT CONSOLE</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${auditProgress === 'running' ? 'bg-yellow-500/10 text-yellow-400' : auditProgress === 'done' ? 'bg-green-500/10 text-green-400' : 'bg-neutral-950 text-neutral-600'}`}>{auditProgress}</span>
                      </div>
                      <div className="h-28 bg-black border border-neutral-900 rounded p-2 font-mono text-[9px] overflow-y-auto space-y-1 text-left custom-panel-scroll">
                        {auditOutput.length === 0 ? <span className="text-neutral-500 italic">Console idle. Ready for audit simulation.</span> :
                          auditOutput.map((log, i) => <div key={i} className={log.includes('OK') || log.includes('Lighthouse score') || log.includes('Audit Completed') ? "text-green-400 font-bold" : "text-neutral-300"}>{log}</div>)}
                      </div>
                      <button type="button" disabled={auditProgress === 'running'} onClick={() => {
                        setAuditProgress('running'); setAuditOutput([]);
                        const logs = ["⚡ Connecting to edge server...","🔍 Validating CORS headers...","🌐 Resolving edge caching tables...","🏷️ Parsing Schema.org JSON-LD tags...","📊 CLS: 0.00","⚡ LCP: 1.1s","🛡️ OWASP Top 10 scan...","🎉 Audit Completed. Performance: 100 · SEO: 100!"];
                        logs.forEach((log, idx) => setTimeout(() => { setAuditOutput(prev => [...prev, log]); if (idx === logs.length - 1) setAuditProgress('done'); }, (idx + 1) * 350));
                      }} className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-xs text-white font-mono uppercase tracking-wider rounded border border-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-colors">
                        Run Infrastructure Audit Simulation
                      </button>
                    </div>
                    <div className="bg-black border border-neutral-900 rounded-2xl p-5 font-mono text-xs">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-3 text-left">VERIFIED METRICS</div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        {[
                          { label: 'Performance', val: '100%', active: auditProgress === 'done' },
                          { label: 'SEO', val: '100%', active: auditProgress === 'done' },
                          { label: 'LCP', val: '1.1s', active: auditProgress === 'done' },
                          { label: 'Layout Shift', val: '0.00', active: auditProgress === 'done' },
                        ].map(m => (
                          <div key={m.label} className="border border-neutral-900 bg-neutral-900/10 rounded-xl p-3">
                            <span className="text-[9px] text-neutral-500 uppercase tracking-wider block mb-1">{m.label}</span>
                            <span className={`text-xl font-bold font-serif ${m.active ? 'text-green-400' : 'text-neutral-700'}`}>{m.active ? m.val : '--'}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-relaxed font-sans mt-3">SSR + edge asset caching delivers immediate hydration without visual layout shifting.</p>
                    </div>
                  </div>
                </div>

                {/* ─── PHASE 05: DESIGN SYSTEM ─── */}
                <div className="relative pl-12 md:pl-16 pb-4">
                  <div className="absolute left-0 top-1 flex flex-col items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-900 border-4 border-[#040404] border-l-[#D1AF6E] flex items-center justify-center shadow-[0_0_16px_rgba(209,175,110,0.3)] z-10">
                      <Layers className="w-4 h-4 text-[#D1AF6E]" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] text-[#C41230] tracking-[0.25em] uppercase">Phase 05</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-mono text-neutral-400 tracking-wider">DS & Tokens</span>
                    <span className="px-2 py-0.5 bg-[#D1AF6E]/10 border border-[#D1AF6E]/20 rounded text-[9px] font-mono text-[#D1AF6E] flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5" /> Ongoing
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-1">Design System</h3>
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-[0.15em] mb-3">Typography, Color Tokens & Components</p>
                  <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6 max-w-2xl">
                    A cohesive design system ensures every pixel speaks the same visual language — from CSS custom properties to font scales and component tokens.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 space-y-3">
                      <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">COLOR TOKEN PALETTE</div>
                      {[
                        { token: '--site-crimson', hex: '#C41230', label: 'Primary Action' },
                        { token: '--site-gold', hex: '#D1AF6E', label: 'Accent / Luxury' },
                        { token: '--site-bg', hex: '#040404', label: 'Base Background' },
                        { token: '--site-bg-card', hex: '#0a0a0a', label: 'Card Surface' },
                        { token: '--site-border', hex: 'rgba(255,255,255,0.08)', label: 'Dividers' },
                        { token: '--site-text', hex: '#EDEAE6', label: 'Body Copy' },
                      ].map(c => (
                        <div key={c.token} className="flex items-center gap-3 font-mono text-xs">
                          <div className="w-6 h-6 rounded border border-neutral-800 flex-shrink-0" style={{ background: c.hex }} />
                          <span className="text-[#C41230] text-[10px] w-32 truncate">{c.token}</span>
                          <span className="text-neutral-500 text-[10px]">{c.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-black border border-neutral-900 rounded-2xl p-5 flex flex-col gap-4">
                      <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">TYPOGRAPHY SCALE</div>
                      <div className="space-y-2 border-b border-neutral-900 pb-4">
                        <div><p className="font-serif text-2xl text-white leading-none">Display Serif</p><span className="text-[9px] font-mono text-neutral-600">Cormorant Garamond — H1 / Display</span></div>
                        <div><p className="font-sans font-bold text-sm text-white uppercase tracking-[0.2em]">Syne Bold</p><span className="text-[9px] font-mono text-neutral-600">Syne 800 — Section Labels</span></div>
                        <div><p className="font-mono text-xs text-[#C41230]">DM Mono — Code & Kickers</p><span className="text-[9px] font-mono text-neutral-600">DM Mono — Metadata / Tags</span></div>
                        <div><p className="text-sm text-neutral-300">Inter — Body copy at 1rem / 1.75</p><span className="text-[9px] font-mono text-neutral-600">Inter — Paragraphs</span></div>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">COMPONENT TOKENS</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-[#C41230] text-white text-[10px] font-bold uppercase tracking-wider">Primary CTA</span>
                        <span className="px-3 py-1 border border-neutral-700 text-neutral-300 text-[10px] font-bold uppercase tracking-wider">Secondary</span>
                        <span className="px-2.5 py-0.5 rounded-full border border-[#D1AF6E]/30 text-[#D1AF6E] text-[9px] font-mono">Tag / Chip</span>
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono rounded">Status: Active</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

        </>
      ) : activeTab === 'proposal' ? (
        /* ═══════════ DESIGN PROPOSAL (V1 archive sections) ═══════════ */
        <div className="bg-[#080808]">
          {/* Side nav */}
          <nav id="sidenav">
            {[
              { label: 'Concept', id: 'p-concept' },
              { label: 'Tech Stack', id: 'p-techstack' },
              { label: 'Components', id: 'p-components' },
              { label: 'Animations', id: 'p-animations' },
              { label: 'Journey', id: 'p-journey' },
              { label: 'Responsive', id: 'p-responsive' },
            ].map(n => (
              <div key={n.id} className="snav-item" onClick={() => document.getElementById(n.id)?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="snav-label">{n.label}</span><span className="snav-dot"></span>
              </div>
            ))}
          </nav>

          {/* ── CONCEPT ── */}
          <section id="p-concept" className="px-[5vw] py-28 md:py-36 border-b border-neutral-900">
            <div className="max-w-[1400px] mx-auto">
              <div className="section-eyebrow reveal">01 — Overall Concept</div>
              <h2 className="section-title reveal reveal-delay-1">The <em>Immersive</em><br /><strong>Design Philosophy</strong></h2>
              <p className="section-intro reveal reveal-delay-2">Transforming the current flat, image-heavy layout into a living, breathing spatial experience. Every scroll triggers a new chapter of the brand story.</p>
              <div className="concept-grid mt-16">
                <div className="pillar-list">
                  {[
                    { n: '01', t: 'Cinematic Scroll Narrative', d: 'The page unfolds like a cinematic reel. GSAP ScrollTrigger paired with Lenis smooth scrolling makes each section reveal with precision-timed entrance effects. Scroll scrubbing drives 3D camera movements in Three.js scenes.' },
                    { n: '02', t: 'Living Typography System', d: 'Kinetic typography breathes life into headlines. Service titles morph between states via MorphSVG letter animations. Cormorant Garamond anchors luxury while Syne handles structural callouts.' },
                    { n: '03', t: 'Spatial 3D Environments', d: 'A React Three Fiber scene greets users in the hero — a real-time rendered interior room built with ambient lighting and soft shadows. Spline-authored 3D furniture pieces orbit the service cards.' },
                    { n: '04', t: 'Micro-Interaction Fabric', d: 'Every surface responds. Buttons ripple with Framer Motion spring physics. Form inputs animate floating labels via Popmotion. Hover states trigger Lottie icon morphs.' },
                    { n: '05', t: 'Material & Morphism Layers', d: 'Glassmorphism overlays float above photography for service cards. Claymorphism adds tactile warmth to process steps. Bento grid layouts organize the portfolio into asymmetric compositions.' },
                  ].map(p => (
                    <div key={p.n} className="pillar reveal">
                      <div className="pillar-num">{p.n}</div>
                      <div><div className="pillar-title">{p.t}</div><p className="pillar-desc">{p.d}</p></div>
                    </div>
                  ))}
                </div>
                <div className="concept-aside">
                  <div className="mood-card reveal">
                    <div className="mood-card-title">Color Palette</div>
                    <div className="palette-row">
                      {['#080808','#0F0F0F','#C41230','#D1AF6E','#BFA27A','#F0EDE8'].map(hex => (
                        <div key={hex} className="swatch" style={{ background: hex }} data-hex={hex} />
                      ))}
                    </div>
                    <div className="typo-preview">
                      <div className="typo-sample-serif">Aa — Cormorant</div>
                      <div className="typo-sample-sans">Bb — Syne Display</div>
                      <div className="typo-sample-mono">CC — DM Mono 0123</div>
                    </div>
                  </div>
                  <div className="mood-card reveal reveal-delay-2">
                    <div className="mood-card-title">Target Metrics</div>
                    <div className="flex flex-col gap-2.5 mt-2">
                      {[['Bounce Rate','<35%'],['Avg. Session','4+ min'],['Inquiry Rate','+220%'],['LCP Score','<1.8s']].map(([k,v]) => (
                        <div key={k}>
                          <div className="flex justify-between py-2 border-b border-neutral-900/60">
                            <span className="font-serif text-[var(--muted)] text-sm">{k}</span>
                            <span className="font-serif text-[var(--accent)] text-sm">{v}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── TECH STACK ── */}
          <section id="p-techstack" className="px-[5vw] py-28 md:py-36 border-b border-neutral-900">
            <div className="max-w-[1400px] mx-auto">
              <div className="section-eyebrow reveal">02 — Technology Stack</div>
              <h2 className="section-title reveal reveal-delay-1">Chosen <em>Technologies</em><br /><strong>& Rationale</strong></h2>
              <p className="section-intro reveal reveal-delay-2">Each library selected for a specific responsibility. The stack is layered to avoid conflicts, optimize bundle size, and deliver 60fps across all devices.</p>
              <div className="stack-grid reveal mt-16">
                {[
                  ['Animation Core','GSAP + ScrollTrigger','The orchestration engine. Timeline-based sequences for all major entrance/exit animations. ScrollTrigger pins sections for immersive scroll-scrubbed scenes.','Primary Engine'],
                  ['Animation Core','Framer Motion','React component animations with spring physics. Handles layout animations, shared element transitions, and gesture-driven interactions.','React Layer'],
                  ['SVG & Morphing','GSAP MorphSVG','Seamless path morphing for logo transformations, liquid transitions between service categories, and organic blob animations on section dividers.','GSAP Plugin'],
                  ['3D Rendering','Three.js + R3F','React Three Fiber wraps Three.js for declarative 3D scene construction. PBR materials and environment lighting render interior scenes in real time.','3D Engine'],
                  ['3D Authoring','Spline + Blender','3D furniture models authored in Blender, exported as GLTF, then interactive Spline scenes embedded for service card 3D previews with cursor-reactive lighting.','3D Content'],
                  ['Micro-Animations','Lottie','After Effects–authored icon animations for UI states and illustrative storytelling animations in the "How We Work" process section.','Icon Animation'],
                  ['Smooth Scroll','Lenis','Silky, inertia-driven scrolling with momentum and elastic boundaries. Synchronizes with GSAP ScrollTrigger for perfectly timed scroll-linked animations.','Scroll Enhancer'],
                  ['Physics & Utility','Anime.js + Popmotion','Anime.js powers staggered particle systems. Popmotion handles physics-based spring animations for cursor tracking and card tilt interactions.','Supplementary'],
                  ['Visual Patterns','Aceternity UI + Magic UI','Pre-built advanced components: spotlight effects, sparkles, beam animations, border gradients, and shimmer loaders.','Component Library'],
                ].map(([layer,name,desc,badge]) => (
                  <div key={name} className="stack-cell">
                    <div className="stack-layer">{layer}</div>
                    <div className="stack-name">{name}</div>
                    <p className="stack-desc">{desc}</p>
                    <span className="stack-badge">{badge}</span>
                  </div>
                ))}
              </div>
              <div className="divider"></div>
              <div className="perf-row">
                {[['90','Lighthouse Score','163','16','var(--accent)'],['60','Target FPS','163','32','var(--gold)'],['1.8','LCP (seconds)','163','41','var(--accent2)'],['95','CLS Prevention','163','8','var(--accent)']].map(([val,label,,offset,stroke]) => (
                  <div key={label} className="perf-card reveal">
                    <div className="perf-meter">
                      <svg width="60" height="60" viewBox="0 0 60 60">
                        <circle className="perf-bg" cx="30" cy="30" r="26" />
                        <circle className="perf-fill" cx="30" cy="30" r="26" strokeDashoffset={offset} style={{ stroke }} />
                      </svg>
                      <div className="perf-val">{val}</div>
                    </div>
                    <div className="perf-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── ANIMATIONS BENTO ── */}
          <section id="p-animations" className="px-[5vw] py-28 md:py-36 border-b border-neutral-900">
            <div className="max-w-[1400px] mx-auto">
              <div className="section-eyebrow reveal">03 — Animation & Interactivity Catalog</div>
              <h2 className="section-title reveal reveal-delay-1"><em>Motion</em> Design<br /><strong>Reference System</strong></h2>
              <p className="section-intro reveal reveal-delay-2">A living catalog of every animation pattern deployed across the interface, with interactive previews and implementation notes.</p>
              <div className="anim-bento reveal mt-16">
                <div className="bento b1"><div className="bento-title">Kinetic Typography</div><p className="bento-desc">Characters animate individually using GSAP SplitText. Each word becomes an independent timeline unit.</p><div className="bento-preview"><div className="kinetic-text">Design</div></div></div>
                <div className="bento b2"><div className="bento-title">MorphSVG Liquid Blob</div><p className="bento-desc">Border-radius keyframe morphing; production uses MorphSVG path data for organic transitions.</p><div className="bento-preview"><div className="morph-blob"></div></div></div>
                <div className="bento b3"><div className="bento-title">Liquid Ring Pulse</div><p className="bento-desc">Concentric ring pulse used as loading state and CTA emphasis. Popmotion drives amplitude.</p><div className="bento-preview"><div className="liquid-ring"></div></div></div>
                <div className="bento b4"><div className="bento-title">Glassmorphism Service Card</div><p className="bento-desc">Frosted glass overlay with top gradient highlight. backdrop-filter: blur() layered over photography. Framer Motion handles card expansion.</p><div className="bento-preview" style={{background:'linear-gradient(135deg,#1a0f0a,#0f0f0f)'}}><div className="glass-card"><div className="glass-title">Living Room Design</div><div className="glass-sub">Residential — Premium Tier</div></div></div></div>
                <div className="bento b5"><div className="bento-title">Claymorphism Process Step</div><p className="bento-desc">Tactile, puffy card for process steps. Multi-layer box-shadow creates depth. Hover triggers scale + shadow shift via Framer Motion spring.</p><div className="bento-preview"><div className="clay-card"><div className="clay-title">Step 01 — Discovery</div><div className="clay-sub">Understanding your vision and lifestyle needs</div></div></div></div>
                <div className="bento b6"><div className="bento-title">Parallax Depth Layers</div><p className="bento-desc">Three independent layers float at different scroll velocities using GSAP ScrollTrigger scrub values of 0.5, 1, and 2.</p><div className="bento-preview"><div className="parallax-layers"><div className="layer l1"></div><div className="layer l2"></div><div className="layer l3"></div></div></div></div>
                <div className="bento b7"><div className="bento-title">Scroll Scrub</div><p className="bento-desc">Scroll-linked progress bars and 3D camera paths timed to Lenis velocity.</p><div className="bento-preview" style={{flexDirection:'column',gap:'12px',padding:'16px',alignItems:'flex-start'}}><div className="scroll-scrub"><div className="scrub-label">Section Progress</div><div className="scrub-bar"><div className="scrub-fill"></div></div><div className="scrub-label">Camera Path</div><div className="scrub-bar"><div className="scrub-fill" style={{animationDelay:'0.5s'}}></div></div></div></div></div>
                <div className="bento b8"><div className="bento-title">Micro-interactions</div><p className="bento-desc">Hover fill reveal on buttons. Popmotion spring physics on cursor proximity.</p><div className="bento-preview" style={{padding:'16px'}}><div className="micro-btns"><button className="micro-btn"><span>Hover Me →</span></button><button className="micro-btn"><span>Explore Space</span></button></div></div></div>
                <div className="bento b9"><div className="bento-title">Three.js Cube</div><p className="bento-desc">Wireframe 3D geometry. Production uses PBR furniture models with ambient occlusion.</p><div className="bento-preview"><div className="three-demo">{[...Array(6)].map((_,i)=><div key={i} className="cube-face"/>)}</div></div></div>
                <div className="bento b10"><div className="bento-title">Spline / R3F Orb</div><p className="bento-desc">Physically-shaded orb. Cursor-reactive environment mapping via Spline.</p><div className="bento-preview" style={{background:'#050505',padding:'0',overflow:'hidden'}}><div className="spline-sim"><div className="spline-orb"></div></div></div></div>
              </div>
            </div>
          </section>

          {/* ── SCROLL JOURNEY ── */}
          <section id="p-journey" className="px-[5vw] py-28 md:py-36 border-b border-neutral-900">
            <div className="max-w-[1400px] mx-auto">
              <div className="section-eyebrow reveal">04 — Scroll Journey Map</div>
              <h2 className="section-title reveal reveal-delay-1">Page-by-Page<br /><em>Animation</em> <strong>Choreography</strong></h2>
              <p className="section-intro reveal reveal-delay-2">A precise breakdown of every scroll-triggered event, entrance effect, and interactive moment from top to bottom.</p>
              <div className="journey-steps mt-16">
                {[
                  ['Zone 01 — 0–100vh','Hero: Spatial Entry','Page loads with a black screen. R3F scene bootstraps with fade-in. The brand tagline performs a SplitText reveal stagger. Lenis scroll begins and the hero text parallaxes at 0.4x speed.',['R3F Scene Mount','GSAP SplitText','Framer AnimatePresence','Lenis Init','Anime.js Particles']],
                  ['Zone 02 — 100–220vh','Services: Bento Cascade','ScrollTrigger fires at 80% viewport. Bento cards cascade in with staggered Y-translation. Each card\'s Spline 3D preview lazy-loads as it enters. GSAP Flip expands card to modal state.',['ScrollTrigger','Framer Stagger','GSAP Flip','Spline Lazy Load','MorphSVG Divider']],
                  ['Zone 03 — 220–380vh (Pinned)','Process: Scroll-Scrubbed Storytelling','Section pinned for 160vh. GSAP timeline scrubs progress — each step activates at 33%, 66%, and 100%. Lottie animation plays frame-by-frame synced to scroll position.',['GSAP ScrollTrigger Pin','Scroll Scrubbing','Lottie Frame Sync','SVGator Draw-On','R3F Isometric']],
                  ['Zone 04 — 380–500vh','Portfolio: 3D Gallery Walk','Project cards float in Three.js depth-parallax. Mouse movement triggers Popmotion spring perspective shifts. Card click triggers shared element transition via Framer Motion layout ID.',['Three.js Parallax','Popmotion Spring','PlayCanvas GLTF','Aceternity Tracing Beam','Framer Layout ID']],
                  ['Zone 05 — 500–560vh','Excellence Stats: Counter Emphasis','Statistics animate with GSAP countUp on ScrollTrigger enter. Framer Motion whileInView with spring easing for scale emphasis. Magic UI Shimmer on tagline.',['GSAP CountUp','Framer whileInView','Magic UI Shimmer','GSAP Stagger']],
                  ['Zone 06 — 560vh+','CTA + Footer: Liquid Close','CTA section with full-screen MorphSVG liquid blob background in crimson. Headline uses Kinetic Typography scramble. Consultation form floats with Claymorphism treatment.',['MorphSVG Background','Anime.js Scramble','Claymorphism Form','GSAP Curtain']],
                ].map(([num,title,desc,techs]) => (
                  <div key={num as string} className="j-step reveal">
                    <div className="j-step-num">{num}</div>
                    <div className="j-step-title">{title}</div>
                    <p className="j-step-desc">{desc}</p>
                    <div className="j-tech-list">{(techs as string[]).map(t=><span key={t} className="j-tech">{t}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── RESPONSIVE ── */}
          <section id="p-responsive" className="px-[5vw] py-28 md:py-36 border-b border-neutral-900">
            <div className="max-w-[1400px] mx-auto">
              <div className="section-eyebrow reveal">05 — Responsive Design</div>
              <h2 className="section-title reveal reveal-delay-1"><strong>Adaptive</strong> Layout<br /><em>Strategy</em></h2>
              <p className="section-intro reveal reveal-delay-2">All animation systems degrade gracefully. Mobile devices receive optimized 2D fallbacks. Reduced Motion preferences are fully respected.</p>
              <div className="resp-devices reveal mt-16">
                {[
                  ['Desktop — 1440px','Full Experience','3D + All Animations','4px'],
                  ['Tablet — 768px','Adaptive','CSS 3D + Reduced GSAP','12px'],
                  ['Mobile — 375px','Optimized','Framer Motion + Video','20px'],
                ].map(([size,label,sub,radius]) => (
                  <div key={size} className="device">
                    <div className="device-frame" style={{borderRadius:radius,width:size.includes('Mobile')?'50%':size.includes('Tablet')?'65%':'100%',margin:'0 auto'}}>
                      <div style={{background:'var(--surface2)',padding:'8px',borderBottom:'1px solid var(--border)',textAlign:'center'}}><div style={{fontFamily:"'DM Mono',monospace",fontSize:'7px',color:'var(--muted)'}}>{size}</div></div>
                      <div className="device-screen">
                        <div className="screen-bar accent"></div>
                        <div className="screen-block"></div>
                        <div className="screen-bar short"></div>
                        <div className="screen-block" style={{height:'24px',background:'var(--accent)',opacity:0.6}}></div>
                      </div>
                    </div>
                    <div className="device-label">{label}</div>
                    <div className="device-size">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="divider"></div>
              <div className="stack-grid reveal" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                {[
                  ['prefers-reduced-motion','Motion Accessibility','All GSAP and Framer Motion animations check the OS reduce-motion media query. 3D scenes fall back to static renders.','WCAG 2.1 AA'],
                  ['GPU Detection','Tier-Based 3D','Three.js uses performance tier detection to adjust shadow quality and geometry complexity. Low-tier devices skip WebGL.','Three.js Detect'],
                  ['Network & Bundle','Code Splitting','Animation libraries are dynamically imported only when their target section enters the viewport. 3D assets use Draco compression.','Dynamic Import'],
                ].map(([layer,name,desc,badge]) => (
                  <div key={name} className="stack-cell">
                    <div className="stack-layer">{layer}</div>
                    <div className="stack-name">{name}</div>
                    <p className="stack-desc">{desc}</p>
                    <span className="stack-badge">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PROPOSAL FOOTER ── */}
          <section id="footer" style={{padding:'80px 5vw',borderTop:'1px solid var(--border)'}}>
            <div className="footer-inner max-w-[1400px] mx-auto">
              <div>
                <h2 className="footer-cta reveal">Ready to Build<br /><em>Something Remarkable?</em></h2>
                <div className="footer-btns reveal reveal-delay-2">
                  <button className="btn-primary" onClick={() => setActiveTab('blueprint')}>View Architecture</button>
                  <button className="btn-secondary" onClick={() => setActiveTab('docs')}>Open Docs Workspace</button>
                </div>
              </div>
              <div className="footer-meta reveal">
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'24px',fontWeight:300,marginBottom:'8px'}}>CrossAngle <span style={{color:'var(--accent)'}}>Interior</span></div>
                  <div className="footer-credit">Design Proposal — V1</div>
                  <div className="footer-project">Prepared February 2026</div>
                  <div style={{marginTop:'16px',fontFamily:"'Cormorant Garamond',serif",fontSize:'14px',color:'var(--dim)',fontStyle:'italic'}}>"Every space tells a story.<br />We write it with motion."</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="pt-20 pb-16 px-4 md:px-10 lg:px-14 bg-[#040404] min-h-screen" id="docs-workspace">
          <div className="max-w-[1600px] w-full mx-auto">
            <div id="docs-workspace-title" className="mb-8 border-b border-neutral-900 pb-6 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#C41230] uppercase tracking-widest mb-3">
                <BookOpen className="w-3.5 h-3.5" /> Project Truth Engine
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">Documentation Workspace</h1>
                  <p className="text-xs text-neutral-400 font-mono mt-1">Compiled {docsRegistry.length} active project specifications, audit reports, and layout logs.</p>
                </div>
                <div className="relative w-full md:w-72 flex-shrink-0">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search docs… (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-900 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C41230] transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Workspace Explorer Grid */}
            <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-5 items-start`}>
              
              {/* Left Explorer Sidebar */}
              {isSidebarOpen && (
                <div className="lg:col-span-4 xl:col-span-3 bg-neutral-950/60 border border-neutral-900 rounded-xl p-4 lg:sticky lg:top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto font-mono custom-panel-scroll">
                  <div className="text-[10px] uppercase text-neutral-500 tracking-widest mb-4 border-b border-neutral-900 pb-2 flex justify-between items-center">
                    <span>WORKSPACE DIRECTORY</span>
                    <span>{docsRegistry.length} FILES</span>
                  </div>
                
                <div className="space-y-4">
                  {categories.filter(c => c !== 'All').map(catName => {
                    const files = getDocsByCategory(catName);
                    const isExpanded = expandedFolders[catName];
                    const hasMatches = hasCategoryMatches(catName);

                    // Skip categories with no matches during search
                    if (searchQuery !== '' && !hasMatches) return null;

                    return (
                      <div key={catName} className="space-y-1">
                        {/* Folder Header */}
                        <div 
                          onClick={() => toggleFolder(catName)}
                          className="folder-header flex items-center justify-between py-1 px-1.5 rounded hover:bg-neutral-900/40 cursor-pointer text-xs text-neutral-300 font-bold transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-neutral-500" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />}
                            {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-[#C41230]" /> : <Folder className="w-3.5 h-3.5 text-[#C41230]" />}
                            <span className="truncate">{catName}</span>
                          </div>
                          <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded font-mono">
                            {files.length}
                          </span>
                        </div>

                        {/* Folder Contents */}
                        {isExpanded && (
                          <div className="pl-4 space-y-0.5 border-l border-neutral-900 ml-3 mt-1">
                            {files.map((doc, idx) => {
                              const isSelected = doc.id === selectedDocId;
                              const isLast = idx === files.length - 1;
                              return (
                                <div
                                  key={doc.id}
                                  onClick={() => setSelectedDocId(doc.id)}
                                  className={`doc-row flex items-center justify-between py-1.5 px-2 rounded cursor-pointer transition-all border ${
                                    isSelected 
                                      ? 'bg-[#C41230]/10 border-[#C41230]/30 text-white font-semibold' 
                                      : 'border-transparent text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-neutral-600 font-normal">
                                      {isLast ? '└─' : '├─'}
                                    </span>
                                    {getCategoryIcon(catName)}
                                    <span className="text-[11px] truncate">{doc.filename}</span>
                                  </div>
                                  <span className="text-[8px] text-neutral-600 font-mono ml-2 shrink-0">{doc.size}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Right Reader Workspace */}
              <div className={isSidebarOpen ? "lg:col-span-8 xl:col-span-9" : "w-full"}>
                {selectedDoc ? (
                  <div className="terminal-window overflow-hidden">
                    
                    {/* Terminal Window Header Bar */}
                    <div className="terminal-header flex items-center justify-between p-3.5 font-mono text-xs">
                      {/* Left Dots */}
                      <div className="flex items-center gap-1.5">
                        <span className="terminal-dot dot-red"></span>
                        <span className="terminal-dot dot-yellow"></span>
                        <span className="terminal-dot dot-green"></span>
                        <button 
                          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                          className="text-neutral-500 hover:text-[#C41230] transition-colors ml-4 flex items-center gap-1 cursor-pointer"
                          title={isSidebarOpen ? "Expand Reading Space" : "Show Explorer"}
                        >
                          {isSidebarOpen ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                          <span className="text-[10px] uppercase tracking-widest hidden sm:inline font-bold">
                            {isSidebarOpen ? "Expand" : "Collapse"}
                          </span>
                        </button>
                      </div>
                      
                      {/* Middle Path */}
                      <div className="hidden md:flex items-center gap-1 text-[11px] text-neutral-500">
                        <span>~/{selectedDoc.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}/</span>
                        <span className="text-neutral-300 font-bold">{selectedDoc.filename}</span>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-500 text-[10px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 font-mono">
                          {selectedDoc.size}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedDoc.content, 'doc-body')}
                          className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-800 transition-colors text-[10px] cursor-pointer"
                        >
                          {copiedId === 'doc-body' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          {copiedId === 'doc-body' ? 'Copied' : 'Copy Raw'}
                        </button>
                      </div>
                    </div>

                    {/* RENDERED MARKDOWN DOCUMENT VIEWPORT */}
                    <div className="px-6 py-10 md:py-16 max-h-[85vh] overflow-y-auto custom-panel-scroll select-text bg-[#040404]/80 flex justify-center">
                      <div className="prose prose-invert w-full max-w-[720px]">
                        {parseMarkdownToReact(selectedDoc.content)}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Enhanced Welcome Dashboard view when no document is selected */
                  <div className="space-y-6">
                    {/* Executive System Health Scorecard */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      
                      <div className="scorecard-metric p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">LCP Latency</span>
                          <Activity className="w-3.5 h-3.5 text-[#C41230]" />
                        </div>
                        <div className="text-2xl font-bold font-serif text-white flex items-baseline gap-1">
                          99 <span className="text-xs text-neutral-500">/100</span>
                        </div>
                        <p className="text-[9px] text-neutral-500 font-mono mt-1">Lighthouse Speed Target</p>
                      </div>

                      <div className="scorecard-metric p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">OWASP SEC</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold font-serif text-white flex items-baseline gap-1">
                          PASS <span className="text-[9px] text-emerald-500 animate-pulse font-mono font-bold">100%</span>
                        </div>
                        <p className="text-[9px] text-neutral-500 font-mono mt-1">Strict RLS & JWT Auth</p>
                      </div>

                      <div className="scorecard-metric p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">SEO Engineering</span>
                          <Award className="w-3.5 h-3.5 text-yellow-500" />
                        </div>
                        <div className="text-2xl font-bold font-serif text-white">
                          100 <span className="text-xs text-neutral-500">Score</span>
                        </div>
                        <p className="text-[9px] text-neutral-500 font-mono mt-1">Structured Schema LD</p>
                      </div>

                      <div className="scorecard-metric p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">UX Tiering</span>
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        </div>
                        <div className="text-2xl font-bold font-serif text-white">
                          Elite
                        </div>
                        <p className="text-[9px] text-neutral-500 font-mono mt-1">UHNW Luxury Standard</p>
                      </div>

                    </div>

                    {/* Repository Tree Blueprint Map */}
                    <div className="border border-neutral-900 rounded-lg p-6 bg-neutral-950/40">
                      <h3 className="text-sm font-serif text-white mb-4 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#C41230]" /> CrossAngle Monorepo Structure
                      </h3>
                      <div className="font-mono text-xs text-neutral-400 space-y-2 border-l border-neutral-900 pl-4 ml-1">
                        <div>
                          <span className="text-neutral-500">📁 apps/web/</span>
                          <span className="text-neutral-600 ml-2">— Frontend + Admin dashboards (Vite, React, Tailwind)</span>
                        </div>
                        <div className="pl-4 text-neutral-500">
                          <div>├─ 📁 src/addons/ <span className="text-neutral-600">— Cost Estimator & Style discovery wizard</span></div>
                          <div>├─ 📁 src/pages/ <span className="text-neutral-600">— Public pages & admin crm layouts</span></div>
                          <div>└─ 📁 src/components/ <span className="text-neutral-600">— Shared component assets & branding</span></div>
                        </div>
                        <div>
                          <span className="text-neutral-500">📁 supabase/</span>
                          <span className="text-neutral-600 ml-2">— DB schemas, RLS roles, trigger scripts & functions</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">📁 design-history/</span>
                          <span className="text-neutral-600 ml-2">— Visual checkpoint records and layout logs</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">📁 audit-reports/</span>
                          <span className="text-neutral-600 ml-2">— Codebase assessments, security audits & roadmap logs</span>
                        </div>
                      </div>
                    </div>

                    {/* Documentation Onboarding Guide */}
                    <div className="border border-neutral-900 rounded-lg p-6 bg-neutral-950/20 text-center flex flex-col items-center justify-center min-h-[220px]">
                      <h3 className="text-base font-serif text-white mb-2">Browse the Knowledge Base</h3>
                      <p className="text-xs text-neutral-400 font-sans max-w-md mb-6 leading-relaxed">
                        Click on any document category inside the directory tree sidebar (e.g. Design History Logs) and select a file to view detailed specifications, code diffs, and verification metrics.
                      </p>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedDocId('design_history_md');
                            setExpandedFolders(prev => ({ ...prev, 'Core Standards & Specs': true }));
                          }}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded font-mono text-xs cursor-pointer transition-colors"
                        >
                          View Design Tracker
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedDocId('10_improvement_roadmap_md');
                            setExpandedFolders(prev => ({ ...prev, 'Engineering Audits': true }));
                          }}
                          className="px-4 py-2 bg-[#C41230]/15 hover:bg-[#C41230]/25 border border-[#C41230]/30 hover:border-[#C41230]/50 text-white rounded font-mono text-xs cursor-pointer transition-colors"
                        >
                          Open Improvement Roadmap
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      )}

      {/*  ═══════════ FOOTER ═══════════  */}
      <footer className="blueprint-footer border-t border-neutral-900" style={{ padding: '60px 40px', backgroundColor: '#040404', textAlign: 'center', marginTop: '120px' }}>
        <div className="footer-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', opacity: 0.5 }}>
          <div className="footer-logo text-white" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px' }}>CrossAngle Archival</div>
          <div className="footer-links text-neutral-400" style={{ display: 'flex', gap: '24px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>
            <span>Project Workspace</span>
            <span>Compiled Version 2.2</span>
            <span>2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Custom simple parser to render Markdown syntax inside React beautifully
function parseMarkdownToReact(content: string) {
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const currentCode = codeLines.join('\n');
        elements.push(
          <CodeBlock 
            key={`code-${i}`} 
            code={currentCode} 
            language={codeLang || 'code'} 
          />
        );
        codeLines = [];
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith('|')) {
      inTable = true;
      if (line.includes('---')) continue; // Skip the divider line |---|---|
      
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      inTable = false;
      elements.push(
        <div key={`table-${i}`} className="my-6 overflow-x-auto rounded border border-neutral-900">
          <table className="min-w-full divide-y divide-neutral-900 text-left text-xs font-mono text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 font-semibold uppercase">
              <tr>
                {tableHeaders.map((h, idx) => (
                  <th key={idx} className="px-4 py-3 border-r border-neutral-900 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 bg-neutral-950/20">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-neutral-900/10 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 border-r border-neutral-900 last:border-0 whitespace-pre-wrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-3xl font-serif font-bold text-white mt-8 mb-4 border-b border-neutral-950 pb-3 tracking-tight">
          {parseInline(line.substring(2))}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-serif font-semibold text-neutral-100 mt-8 mb-4 tracking-wide pb-1 border-b border-neutral-950">
          {parseInline(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-serif font-medium text-neutral-200 mt-6 mb-3">
          {parseInline(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-mono text-[#C41230] mt-4 mb-2 uppercase tracking-wider">
          {parseInline(line.substring(5))}
        </h4>
      );
    }
    // Lists
    else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-6 my-2 text-neutral-400 space-y-1 text-sm">
          <li>{parseInline(line.trim().substring(2))}</li>
        </ul>
      );
    }
    // Numbers list
    else if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <ol key={`ol-${i}`} className="list-decimal pl-6 my-2 text-neutral-400 space-y-1 text-sm">
            <li value={parseInt(match[1])}>{parseInline(match[2])}</li>
          </ol>
        );
      }
    }
    // Horizontal rule
    else if (line.trim() === '---') {
      elements.push(<hr key={`hr-${i}`} className="my-8 border-neutral-950" />);
    }
    // Blockquote
    else if (line.trim().startsWith('>')) {
      elements.push(
        <blockquote key={`bq-${i}`} className="border-l-2 border-[#C41230] pl-4 my-4 italic text-neutral-400 text-sm">
          {parseInline(line.trim().substring(1).trim())}
        </blockquote>
      );
    }
    // Regular paragraph
    else if (line.trim() !== '') {
      elements.push(
        <p key={`p-${i}`} className="my-3 text-neutral-400 leading-relaxed text-sm">
          {parseInline(line)}
        </p>
      );
    } else {
      elements.push(<div key={`space-${i}`} className="h-2" />);
    }
  }

  return elements;
}

// Inline Markdown parsing (bold, code tags, links)
function parseInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^([^*]*)\*\*([^*]+)\*\*(.*)$/);
    const codeMatch = remaining.match(/^([^`]*)`([^`]+)`(.*)$/);
    const linkMatch = remaining.match(/^([^[]*)\[([^\]]+)\]\(([^)]+)\)(.*)$/);

    // Find the closest match index
    let closestIndex = Infinity;
    let type = '';
    let matchObj: RegExpMatchArray | null = null;

    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < closestIndex) {
      closestIndex = boldMatch[1].length;
      type = 'bold';
      matchObj = boldMatch;
    }
    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < closestIndex) {
      closestIndex = codeMatch[1].length;
      type = 'code';
      matchObj = codeMatch;
    }
    if (linkMatch && linkMatch.index !== undefined && linkMatch.index < closestIndex) {
      closestIndex = linkMatch[1].length;
      type = 'link';
      matchObj = linkMatch;
    }

    if (!matchObj || closestIndex === Infinity) {
      tokens.push(remaining);
      break;
    }

    const prefix = matchObj[1];
    if (prefix) {
      tokens.push(prefix);
    }

    if (type === 'bold') {
      tokens.push(<strong key={keyIdx++} className="font-bold text-white">{matchObj[2]}</strong>);
      remaining = matchObj[3];
    } else if (type === 'code') {
      tokens.push(<code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-xs text-[#C41230]">{matchObj[2]}</code>);
      remaining = matchObj[3];
    } else if (type === 'link') {
      const url: string = matchObj[3];
      const isFileLink = url.startsWith('file://');
      
      if (isFileLink) {
        // Intercept local file:// links to let user click them and load them in workspace
        const targetFilename = url.split('/').pop() || '';
        tokens.push(
          <button 
            key={keyIdx++} 
            type="button"
            onClick={() => {
              const fileId = targetFilename.toLowerCase().replace(/[^a-z0-9]/g, '_');
              const ev = new CustomEvent('navigate-doc', { detail: fileId });
              window.dispatchEvent(ev);
            }}
            className="text-[#C41230] hover:underline transition-all font-mono text-xs font-semibold cursor-pointer inline flex-wrap text-left bg-transparent border-0 p-0"
          >
            {matchObj[2]} <ExternalLink className="w-2.5 h-2.5 inline ml-0.5 opacity-60" />
          </button>
        );
      } else {
        tokens.push(
          <a 
            key={keyIdx++} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#C41230] hover:underline transition-all font-semibold inline"
          >
            {matchObj[2]} <ExternalLink className="w-2.5 h-2.5 inline ml-0.5 opacity-60" />
          </a>
        );
      }
      remaining = matchObj[4];
    }
  }

  return tokens;
}

// Sub-component to copy & format code block
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded border border-neutral-900 overflow-hidden bg-neutral-950 font-mono text-xs leading-relaxed">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900 bg-neutral-950 text-[10px] text-neutral-500">
        <span>{language.toUpperCase()}</span>
        <button 
          type="button"
          onClick={handleCopy}
          className="text-neutral-500 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[#a8ff60] bg-[#020202]/70">
        <code>{code}</code>
      </pre>
    </div>
  );
}
