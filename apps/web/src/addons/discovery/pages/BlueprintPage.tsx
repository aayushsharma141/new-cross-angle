import React, { useEffect, useRef, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'blueprint' | 'docs'>('blueprint');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Interactive Timeline Journey states
  const [currentPhase, setCurrentPhase] = useState<number>(0);
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
      <div id="progress"></div>

      {/*  HEADER  */}
      <header id="header" className="scrolled border-b border-neutral-900 bg-[#040404]/90 backdrop-blur-md">
        <div className="logo-area">
          <div className="logo-mark" style={{ backgroundColor: '#C41230' }}></div>
          <div className="logo-text">CrossAngle <span style={{ color: '#C41230' }}>Archival</span></div>
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
              </div>
              <div className="cover-right bg-neutral-950/40">
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

          {/*  ═══════════ STAGE-BY-STAGE CHRONOLOGICAL TIMELINE: SCRATCH TO LIVE ═══════════  */}
          <section id="journey-timeline" className="py-24 md:py-32 px-[4vw] max-w-[1600px] mx-auto border-b border-neutral-900">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C41230]/30 bg-[#C41230]/10 text-[#C41230] text-[10px] tracking-[0.2em] uppercase mb-8 font-mono shadow-[0_0_20px_rgba(196,18,48,0.15)] reveal">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C41230] animate-pulse"></span>
                Scratch to Live Interactive Journey
              </div>
              <h2 className="font-serif text-5xl md:text-7xl text-white tracking-tight leading-[1.1] mb-6 reveal">
                The ₹10 Lakh<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-400 to-[#C41230] italic font-light">
                  Architectural Timeline
                </span>
              </h2>
              <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed reveal">
                An interactive walk-through of the system lifecycle, tracing both Public Website & Admin CRM layers from database blueprinting to high-performance edge deployment.
              </p>
            </div>

            {/* DUAL COLUMN INTERACTIVE TIMELINE DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: PHASE SELECTOR CONTROLLER */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-3 z-10">
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-4 border-b border-neutral-900 pb-2">
                  TIMELINE JOURNEY CONTROLLERS
                </div>
                
                {[
                  {
                    num: "01",
                    title: "Scratch Core",
                    subtitle: "Database & Security System",
                    badge: "DB & RLS"
                  },
                  {
                    num: "02",
                    title: "Public Face Portal",
                    subtitle: "Luxury UI Motion Engine",
                    badge: "UX & Stagger"
                  },
                  {
                    num: "03",
                    title: "Admin CRM System",
                    subtitle: "Decoupled Data Pipelines",
                    badge: "CRM & Kanban"
                  },
                  {
                    num: "04",
                    title: "Live Infrastructure",
                    subtitle: "Edge Deploy & Audit Loop",
                    badge: "Launch & Perf"
                  }
                ].map((phase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPhase(idx)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                      currentPhase === idx
                        ? "bg-neutral-950 border-[#C41230]/40 shadow-[0_0_25px_rgba(196,18,48,0.08)]"
                        : "bg-neutral-950/20 border-neutral-900 hover:border-neutral-800"
                    }`}
                  >
                    {currentPhase === idx && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C41230]"></div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-mono text-xs ${currentPhase === idx ? "text-[#C41230]" : "text-neutral-600"}`}>
                        PHASE {phase.num}
                      </span>
                      <span className="text-[8px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 font-mono text-neutral-400">
                        {phase.badge}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg text-white mb-1">{phase.title}</h4>
                    <p className="text-xs text-neutral-500 font-light">{phase.subtitle}</p>
                  </button>
                ))}
              </div>

              {/* RIGHT COLUMN: INTERACTIVE VISUAL DISPLAY PANELS */}
              <div className="lg:col-span-8 bg-neutral-950 border border-neutral-900 rounded-[32px] p-6 md:p-10 min-h-[580px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#C41230]/10 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none"></div>

                {/* PHASE 01: DATABASE AND SECURITY */}
                {currentPhase === 0 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <div className="flex items-center gap-2 text-[#C41230] font-mono text-xs uppercase tracking-wider mb-2">
                        <Database className="w-4 h-4" /> Core Security Blueprint
                      </div>
                      <h3 className="font-serif text-3xl text-white">Database Schema & RLS Policy Vault</h3>
                      <p className="text-neutral-400 text-xs md:text-sm font-light mt-2 leading-relaxed">
                        To build a luxury experience worth ₹10 Lakhs, data security and access controls must be designed from scratch. We enforce strict database validation using Supabase Postgres Row-Level Security (RLS) policies to keep client lead details protected.
                      </p>
                    </div>

                    {/* INTERACTIVE SCHEMA WORKSPACE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Left: Schema Selector */}
                      <div className="space-y-3">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">
                          SELECT DATABASE TABLE
                        </div>
                        {['profiles', 'inquiries', 'estimates', 'projects'].map((table: 'profiles' | 'inquiries' | 'estimates' | 'projects') => (
                          <button
                            key={table}
                            type="button"
                            onClick={() => setSelectedDbTable(table)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-mono transition-all ${
                              selectedDbTable === table
                                ? "bg-[#C41230]/10 border-[#C41230]/30 text-white font-bold"
                                : "bg-neutral-900/40 border-neutral-900 text-neutral-400 hover:text-neutral-200"
                            }`}
                          >
                            <span>↳ {table}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ))}
                        
                        <div className="border border-neutral-900 bg-neutral-900/10 rounded-xl p-4 mt-4 space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                            <span>CURRENT SESSION ROLE</span>
                            <span className={`px-2 py-0.5 rounded font-bold ${authRole === 'admin' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                              {authRole.toUpperCase()} ROLE
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAuthRole(prev => prev === 'anonymous' ? 'admin' : 'anonymous')}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-white font-mono uppercase tracking-wider rounded border border-neutral-800 transition-colors"
                          >
                            {authRole === 'anonymous' ? <Unlock className="w-3 h-3 text-green-400" /> : <Lock className="w-3 h-3 text-red-400" />}
                            {authRole === 'anonymous' ? 'Switch to Authenticated Admin' : 'Switch to Anonymous Public'}
                          </button>
                        </div>
                      </div>

                      {/* Right: Table Schema Details */}
                      <div className="bg-black border border-neutral-900 rounded-2xl p-5 font-mono text-xs flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-3 mb-3">
                            <span className="text-[#C41230] font-bold">TABLE: {selectedDbTable}</span>
                            <span className="text-[10px] text-neutral-500">RLS ENABLED</span>
                          </div>
                          
                          <div className="space-y-3 font-mono text-xs text-left">
                            {selectedDbTable === 'profiles' && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">id (uuid)</span>
                                  <span className="text-neutral-500 text-[10px]">PRIMARY KEY</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">full_name (text)</span>
                                  <span className="text-neutral-500 text-[10px]">PUBLIC ACCESS</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">role (text)</span>
                                  <span className="text-neutral-500 text-[10px]">PUBLIC ACCESS</span>
                                </div>
                              </>
                            )}

                            {selectedDbTable === 'inquiries' && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">id (uuid)</span>
                                  <span className="text-neutral-500 text-[10px]">PRIMARY KEY</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">name (text)</span>
                                  <span className="text-neutral-500 text-[10px]">PUBLIC WRITE</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">email (text)</span>
                                  {authRole === 'admin' ? (
                                    <span className="text-green-400 text-[10px] animate-pulse">aayush@crossangle.in</span>
                                  ) : (
                                    <span className="text-red-500 text-[10px] flex items-center gap-1">🔒 [Redacted]</span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">phone (text)</span>
                                  {authRole === 'admin' ? (
                                    <span className="text-green-400 text-[10px] animate-pulse">+91 99999 XXXXX</span>
                                  ) : (
                                    <span className="text-red-500 text-[10px] flex items-center gap-1">🔒 [Redacted]</span>
                                  )}
                                </div>
                              </>
                            )}

                            {selectedDbTable === 'estimates' && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">id (uuid)</span>
                                  <span className="text-neutral-500 text-[10px]">PRIMARY KEY</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">session_id (uuid)</span>
                                  <span className="text-neutral-500 text-[10px]">OWNER WRITE</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">estimated_cost (numeric)</span>
                                  {authRole === 'admin' ? (
                                    <span className="text-green-400 text-[10px] animate-pulse">₹12,40,000</span>
                                  ) : (
                                    <span className="text-red-500 text-[10px] flex items-center gap-1">🔒 [Redacted]</span>
                                  )}
                                </div>
                              </>
                            )}

                            {selectedDbTable === 'projects' && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">id (uuid)</span>
                                  <span className="text-neutral-500 text-[10px]">PRIMARY KEY</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">title (text)</span>
                                  <span className="text-neutral-500 text-[10px]">PUBLIC VIEW</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-300">budget (numeric)</span>
                                  {authRole === 'admin' ? (
                                    <span className="text-green-400 text-[10px] animate-pulse">₹45,00,000</span>
                                  ) : (
                                    <span className="text-red-500 text-[10px] flex items-center gap-1">🔒 [Redacted]</span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-neutral-900 pt-4 mt-6 text-left">
                          <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#C41230]" /> ACTIVE SECURITY POLICY
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-relaxed font-sans font-light">
                            {selectedDbTable === 'profiles' && "CREATE POLICY public_profile_select ON profiles FOR SELECT USING (true);"}
                            {selectedDbTable === 'inquiries' && "CREATE POLICY admin_inquiry_select ON inquiries FOR SELECT TO authenticated USING (auth.role() = 'authenticated_crm');"}
                            {selectedDbTable === 'estimates' && "CREATE POLICY estimate_owner_read ON estimates FOR ALL USING (auth.uid() = user_id);"}
                            {selectedDbTable === 'projects' && "CREATE POLICY public_projects_view ON projects FOR SELECT USING (true);"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PHASE 02: PUBLIC PORTAL BRANDING */}
                {currentPhase === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <div className="flex items-center gap-2 text-[#C41230] font-mono text-xs uppercase tracking-wider mb-2">
                        <Sparkles className="w-4 h-4" /> Editorial Front-End
                      </div>
                      <h3 className="font-serif text-3xl text-white">Luxury Staggered Landing & Motion Portal</h3>
                      <p className="text-neutral-400 text-xs md:text-sm font-light mt-2 leading-relaxed">
                        Visual flow is optimized for engagement. Using Framer Motion, layout blocks stagger-reveal on mount to guide the customer's eye, preventing overwhelming text blocks and layout shifts.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Left: Stagger Preview Simulator */}
                      <div className="border border-neutral-900 bg-neutral-950 p-6 rounded-2xl flex flex-col justify-between min-h-[280px]">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                            <span>STAGGER STAGE CONTROLLER</span>
                            <span>{staggerSimActive ? `STEP ${staggerStep}/4` : 'IDLE'}</span>
                          </div>
                          
                          <div className="border border-neutral-900 rounded-xl p-4 space-y-4 bg-black/40 min-h-[160px] flex flex-col justify-center">
                            {/* Navbar Mockup */}
                            <div className={`flex justify-between items-center py-2 px-3 bg-neutral-900/80 border border-neutral-800 rounded-lg transition-all duration-500 ${staggerStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C41230]"></span>
                              <div className="flex gap-2">
                                <span className="w-8 h-1 bg-neutral-800 rounded"></span>
                                <span className="w-8 h-1 bg-neutral-800 rounded"></span>
                              </div>
                            </div>
                            
                            {/* Hero Headline Mockup */}
                            <div className="space-y-2">
                              <div className={`h-4 bg-white/90 rounded w-3/4 transition-all duration-500 text-left ${staggerStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}></div>
                              <div className={`h-4 bg-white/90 rounded w-1/2 transition-all duration-500 text-left ${staggerStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}></div>
                            </div>

                            {/* Description Mockup */}
                            <div className={`space-y-1.5 transition-all duration-500 text-left ${staggerStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                              <div className="h-1.5 bg-neutral-800 rounded w-full"></div>
                              <div className="h-1.5 bg-neutral-800 rounded w-5/6"></div>
                            </div>

                            {/* CTA Mockup */}
                            <div className={`h-7 bg-[#C41230] rounded-lg w-28 transition-all duration-500 ${staggerStep >= 4 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-90'}`}></div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setStaggerSimActive(false);
                            setTimeout(() => setStaggerSimActive(true), 100);
                          }}
                          className="w-full py-2.5 bg-[#C41230] hover:bg-red-700 text-xs text-white font-mono uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                          <Play className="w-3.5 h-3.5" /> Trigger Entrance Stagger
                        </button>
                      </div>

                      {/* Right: Code specifications */}
                      <div className="bg-black border border-neutral-900 rounded-2xl p-5 font-mono text-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-neutral-500 uppercase tracking-widest text-[10px] mb-3">
                            <Terminal className="w-4 h-4 text-[#C41230]" /> Motion Rationale Code
                          </div>
                          
                          <pre className="text-neutral-400 text-[10px] leading-relaxed overflow-x-auto whitespace-pre bg-[#020202]/70 p-4 rounded border border-neutral-900 text-left">
{`const container = {
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
    opacity: 1, 
    y: 0,
    transition: { type: "spring" }
  }
};`}
                          </pre>
                        </div>

                        <div className="border-t border-neutral-900 pt-4 mt-6 text-left">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5 block">MOTION RATIONALE</span>
                          <p className="text-[10px] text-neutral-400 leading-relaxed font-sans font-light">
                            By utilizing spring transitions (`type: "spring"`), components settle into place with organic responsiveness. Setting the stagger step threshold to 250ms matches human cognitive latency for premium micro-reveal animations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PHASE 03: ADMIN CRM AND COST ESTIMATOR */}
                {currentPhase === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <div className="flex items-center gap-2 text-[#C41230] font-mono text-xs uppercase tracking-wider mb-2">
                        <Cpu className="w-4 h-4" /> Decoupled Addon Apps
                      </div>
                      <h3 className="font-serif text-3xl text-white">Dynamic Admin CRM Sync Engine</h3>
                      <p className="text-neutral-400 text-xs md:text-sm font-light mt-2 leading-relaxed">
                        The internal CRM system operates on a decoupled data sync architecture. When an estimate is generated by the user on the public site, real-time trigger pipelines instantly sync the lead card to the Admin CRM dashboard.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Left: Kanban Board Simulator */}
                      <div className="border border-neutral-900 bg-neutral-950 p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                          <span>INTERACTIVE LEAD PIPELINE</span>
                          <span className="flex items-center gap-1 text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span> Realtime Active
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          {['Inbox', 'Call', 'Proposal', 'Signed'].map((step, idx) => (
                            <div key={step} className="flex flex-col gap-2">
                              <span className="text-[9px] font-mono text-neutral-600 text-center uppercase tracking-wider">{step}</span>
                              <div className="h-28 bg-neutral-900/50 rounded-lg border border-neutral-900 p-1 flex flex-col justify-start">
                                {crmLeadStage === idx && (
                                  <div className="bg-[#C41230]/20 border border-[#C41230]/40 rounded p-1.5 text-[9px] font-mono text-white animate-bounce shadow-md">
                                    <div className="font-bold truncate">Aayush Sharma</div>
                                    <div className="text-[#C41230] font-bold mt-0.5 text-left">₹12.4L</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 justify-between mt-2">
                          <button
                            type="button"
                            disabled={crmLeadStage === 0}
                            onClick={() => setCrmLeadStage(prev => Math.max(0, prev - 1))}
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-neutral-400 hover:text-white font-mono rounded border border-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                          >
                            ← Previous Status
                          </button>
                          <button
                            type="button"
                            disabled={crmLeadStage === 3}
                            onClick={() => setCrmLeadStage(prev => Math.min(3, prev + 1))}
                            className="px-3 py-1.5 bg-[#C41230] hover:bg-red-700 text-[10px] text-white font-mono rounded transition-colors"
                          >
                            Advance Status →
                          </button>
                        </div>
                      </div>

                      {/* Right: Postgres real-time event monitor */}
                      <div className="bg-black border border-neutral-900 rounded-2xl p-5 font-mono text-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-neutral-500 uppercase tracking-widest text-[10px] mb-3">
                            <RefreshCw className="w-3.5 h-3.5 text-[#C41230] animate-spin" style={{ animationDuration: '4s' }} /> Realtime Event Stream
                          </div>
                          
                          <div className="bg-[#020202]/70 p-4 rounded border border-neutral-900 text-[10px] text-neutral-400 space-y-2 min-h-[120px] flex flex-col justify-center text-left">
                            <div className="text-neutral-600 font-normal">-- postgres channels payload listener:</div>
                            <div className="text-neutral-300">
                              {crmLeadStage === 0 && (
                                <span className="text-green-400 font-bold">INSERT ➔ inquiries (status: 'inbox', client: 'Aayush Sharma')</span>
                              )}
                              {crmLeadStage === 1 && (
                                <span className="text-[#C41230] font-bold">UPDATE ➔ inquiries SET status = 'call' WHERE name = 'Aayush Sharma'</span>
                              )}
                              {crmLeadStage === 2 && (
                                <span className="text-[#C41230] font-bold">UPDATE ➔ inquiries SET status = 'proposal' WHERE name = 'Aayush Sharma'</span>
                              )}
                              {crmLeadStage === 3 && (
                                <span className="text-green-400 font-bold">COMMIT ➔ status = 'signed' (Lead Converted Successfully!)</span>
                              )}
                            </div>
                            <div className="text-neutral-600 font-normal">
                              {`row updated_at: ${new Date().toISOString()}`}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-neutral-900 pt-4 mt-6 text-left">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5 block">SYNC ARCHITECTURE</span>
                          <p className="text-[10px] text-neutral-400 leading-relaxed font-sans font-light">
                            Realtime sync operations leverage WebSockets (Supabase Broadcast Channel) instead of aggressive database polling. This maintains minimum CPU utilization and delivers instant updates across admin tabs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PHASE 04: INFRASTRUCTURE LAUNCH */}
                {currentPhase === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <div className="flex items-center gap-2 text-[#C41230] font-mono text-xs uppercase tracking-wider mb-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> FAANG Edge Deploy
                      </div>
                      <h3 className="font-serif text-3xl text-white">Lighthouse Performance & Production Launch</h3>
                      <p className="text-neutral-400 text-xs md:text-sm font-light mt-2 leading-relaxed">
                        To earn ₹10 Lakhs in premium value, the app must load instantly on global edge CDNs. We optimize code splitting, preload LCP assets, and embed structured JSON-LD SEO schemas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Left: Interactive Lighthouse Terminal */}
                      <div className="border border-neutral-900 bg-neutral-950 p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                          <span>LIGHTHOUSE AUDIT CONSOLE</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${auditProgress === 'running' ? 'bg-yellow-500/10 text-yellow-400' : auditProgress === 'done' ? 'bg-green-500/10 text-green-400' : 'bg-neutral-950 text-neutral-600'}`}>
                            {auditProgress}
                          </span>
                        </div>

                        <div className="h-32 bg-black border border-neutral-900 rounded-lg p-3 font-mono text-[9px] overflow-y-auto space-y-1 text-left custom-panel-scroll">
                          {auditOutput.length === 0 ? (
                            <span className="text-neutral-500 italic">Console idle. Ready for audit simulation.</span>
                          ) : (
                            auditOutput.map((log, i) => (
                              <div key={i} className={log.includes('OK') || log.includes('Lighthouse score') ? "text-green-400 font-bold" : "text-neutral-300"}>
                                {log}
                              </div>
                            ))
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={auditProgress === 'running'}
                          onClick={() => {
                            setAuditProgress('running');
                            setAuditOutput([]);
                            const logs = [
                              "⚡ Initializing Edge connection to host server...",
                              "🔍 Validating CORS headers & security protocols...",
                              "🌐 Resolving edge caching routing tables...",
                              "🏷️ Parsing Schema.org JSON-LD structural data tags...",
                              "📊 Measuring Cumulative Layout Shift (CLS): 0.00",
                              "⚡ Preloading Largest Contentful Paint (LCP) assets... LCP: 1.1s",
                              "🛡️ Scanning endpoints for OWASP Top 10 vulnerabilities...",
                              "🎉 Audit Completed. Performance: 100/100, SEO: 100/100!"
                            ];
                            logs.forEach((log, idx) => {
                              setTimeout(() => {
                                setAuditOutput(prev => [...prev, log]);
                                if (idx === logs.length - 1) {
                                  setAuditProgress('done');
                                }
                              }, (idx + 1) * 350);
                            });
                          }}
                          className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-xs text-white font-mono uppercase tracking-wider rounded border border-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                        >
                          Run Infrastructure Audit Simulation
                        </button>
                      </div>

                      {/* Right: Circle Metrics Display */}
                      <div className="bg-black border border-neutral-900 rounded-2xl p-5 font-mono text-xs flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-4 text-left">
                            VERIFIED METRICS SCORES
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="border border-neutral-900 bg-neutral-900/10 rounded-xl p-3.5">
                              <span className="text-[9px] text-neutral-500 uppercase tracking-wider block mb-1">Performance</span>
                              <span className={`text-2xl font-bold font-serif ${auditProgress === 'done' ? 'text-green-400 animate-pulse' : 'text-neutral-700'}`}>
                                {auditProgress === 'done' ? '100%' : '--'}
                              </span>
                            </div>
                            <div className="border border-neutral-900 bg-neutral-900/10 rounded-xl p-3.5">
                              <span className="text-[9px] text-neutral-500 uppercase tracking-wider block mb-1">SEO Tagging</span>
                              <span className={`text-2xl font-bold font-serif ${auditProgress === 'done' ? 'text-green-400' : 'text-neutral-700'}`}>
                                {auditProgress === 'done' ? '100%' : '--'}
                              </span>
                            </div>
                            <div className="border border-neutral-900 bg-neutral-900/10 rounded-xl p-3.5">
                              <span className="text-[9px] text-neutral-500 uppercase tracking-wider block mb-1">LCP Latency</span>
                              <span className={`text-lg font-bold ${auditProgress === 'done' ? 'text-green-400' : 'text-neutral-700'}`}>
                                {auditProgress === 'done' ? '1.1s' : '--'}
                              </span>
                            </div>
                            <div className="border border-neutral-900 bg-neutral-900/10 rounded-xl p-3.5">
                              <span className="text-[9px] text-neutral-500 uppercase tracking-wider block mb-1">Layout Shift</span>
                              <span className={`text-lg font-bold ${auditProgress === 'done' ? 'text-green-400' : 'text-neutral-700'}`}>
                                {auditProgress === 'done' ? '0.00' : '--'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-neutral-900 pt-4 mt-6 text-left">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5 block">INFRASTRUCTURE HIGHLIGHTS</span>
                          <p className="text-[10px] text-neutral-400 leading-relaxed font-sans font-light">
                            Server-side pre-rendering (SSR) paired with edge asset caching delivers immediate hydration without visual layout shifting. Zero-CLS ensures high Google SEO rankings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      ) : (
        /*  ═══════════ DOCUMENTATION HUB ═══════════  */
        <section className="pt-28 pb-16 px-4 md:px-12 bg-[#040404] min-h-screen" id="docs-workspace">
          <div className="max-w-[1600px] w-full mx-auto">
            <div id="docs-workspace-title" className="mb-8 border-b border-neutral-900 pb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-[#C41230] uppercase tracking-widest mb-2">
                <BookOpen className="w-3.5 h-3.5" /> Project Truth Engine
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Documentation Workspace</h1>
                  <p className="text-xs text-neutral-400 font-mono mt-1">Compiled 33 active project specifications, audit reports, and layout logs.</p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search docs or code snippets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-900 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C41230] transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Workspace Explorer Grid */}
            <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6 items-start`}>
              
              {/* Left Explorer Sidebar (VS-Code File Tree) */}
              {isSidebarOpen && (
                <div className="lg:col-span-4 bg-neutral-950/60 border border-neutral-900 rounded-lg p-4 max-h-[720px] overflow-y-auto font-mono custom-panel-scroll">
                <div className="text-[10px] uppercase text-neutral-500 tracking-widest mb-4 border-b border-neutral-900 pb-2 flex justify-between items-center">
                  <span>WORKSPACE DIRECTORY</span>
                  <span>33 FILES</span>
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

              {/* Right Reader Workspace (Terminal Mockup) */}
              <div className={isSidebarOpen ? "lg:col-span-8" : "w-full"}>
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
