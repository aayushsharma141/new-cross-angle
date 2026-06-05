import React, { useEffect, useRef } from 'react';
import './BlueprintPage.css';
import { Link } from "react-router-dom";

export default function BlueprintPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Ensure DOM is ready, then run scripts
    const timer = setTimeout(() => {
      try {

        // ── CURSOR ────────────────────────────────────────────
        const cursor = document.getElementById('cursor') as HTMLElement;
        const ring = document.getElementById('cursor-ring') as HTMLElement;
        let mx = 0, my = 0, rx = 0, ry = 0;

        document.addEventListener('mousemove', e => {
          mx = e.clientX; my = e.clientY;
          cursor.style.left = mx + 'px';
          cursor.style.top = my + 'px';
        });

        function animRing() {
          rx += (mx - rx) * 0.12;
          ry += (my - ry) * 0.12;
          ring.style.left = rx + 'px';
          ring.style.top = ry + 'px';
          requestAnimationFrame(animRing);
        }
        animRing();

        document.querySelectorAll('a, button, .pillar, .bento, .stack-cell, .comp-preview, .j-step')
          .forEach(el => {
            el.addEventListener('mouseenter', () => {
              cursor.style.width = '6px';
              cursor.style.height = '6px';
              ring.style.width = '56px';
              ring.style.height = '56px';
              ring.style.borderColor = 'rgba(227, 83, 54,0.8)';
            });
            el.addEventListener('mouseleave', () => {
              cursor.style.width = '10px';
              cursor.style.height = '10px';
              ring.style.width = '36px';
              ring.style.height = '36px';
              ring.style.borderColor = 'rgba(227, 83, 54,0.5)';
            });
          });

        // ── SCROLL PROGRESS ───────────────────────────────────
        const prog = document.getElementById('progress') as HTMLElement;
        const header = document.getElementById('header') as HTMLElement;
        const sections = document.querySelectorAll('section[id]');
        const navItems = document.querySelectorAll('.snav-item');

        window.addEventListener('scroll', () => {
          const max = document.body.scrollHeight - window.innerHeight;
          prog.style.width = (window.scrollY / max * 100) + '%';
          header.classList.toggle('scrolled', window.scrollY > 60);

          // Active nav
          sections.forEach((s, i) => {
            const el = s as HTMLElement;
            const top = el.offsetTop - 200;
            const bot = top + el.offsetHeight;
            if (window.scrollY >= top && window.scrollY < bot) {
              navItems.forEach(n => n.classList.remove('active'));
              if (navItems[i]) navItems[i].classList.add('active');
            }
          });
        });

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

        // ── BENTO TILT ───────────────────────────────────────
        document.querySelectorAll('.bento').forEach((card) => {
          const htmlCard = card as HTMLElement;
          htmlCard.addEventListener('mousemove', (e: MouseEvent) => {
            const r = htmlCard.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            htmlCard.style.transform = `perspective(600px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-3px)`;
          });
          htmlCard.addEventListener('mouseleave', () => {
            htmlCard.style.transform = '';
          });
        });

        // ── PERF METER ANIMATION ──────────────────────────────
        const meterObs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.querySelectorAll('.perf-fill').forEach((c) => {
                const htmlC = c as HTMLElement;
                const offset = htmlC.getAttribute('stroke-dashoffset') || '0';
                htmlC.style.strokeDashoffset = '163';
                setTimeout(() => { htmlC.style.strokeDashoffset = offset; }, 200);
              });
            }
          });
        }, { threshold: 0.5 });
        document.querySelectorAll('.perf-row').forEach(r => meterObs.observe(r));


      } catch (e) {
        console.error("Error executing blueprint scripts", e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="blueprint-page-wrapper bg-[#040404] text-[#E0E0E0] min-h-screen" ref={containerRef}>



      <BlueprintHeader />
      <BlueprintRadar />
      <BlueprintMoodboard />
      <BlueprintInsights />
    </div>
  );
}


function BlueprintHeader() {
  return (
    <>
      {/*  CURSOR  */}
      <div id="cursor"></div>
      <div id="cursor-ring"></div>
      <div id="progress"></div>

      {/*  SIDE NAV  */}
      <nav id="sidenav">
        <div className="snav-item active" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="snav-label">Cover</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" onClick={() => document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="snav-label">The Journey</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" onClick={() => document.getElementById('techstack')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="snav-label">Architecture</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" onClick={() => document.getElementById('components')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="snav-label">Showcase</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" onClick={() => document.getElementById('animations')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="snav-label">UX Details</span><span className="snav-dot"></span>
        </div>
      </nav>

      {/*  HEADER  */}
      <header id="header">
        <div className="logo-area">
          <div className="logo-mark"></div>
          <div className="logo-text">CrossAngle <span>Engineering</span></div>
        </div>
        <nav>
          <a href="#concept">Journey</a>
          <a href="#techstack">Architecture</a>
          <a href="#components">Showcase</a>
          <a href="#animations">UX Details</a>
          <Link to="/">Back to Site</Link>
        </nav>
        <Link to="/" className="cta-btn text-center block" style={{ textDecoration: 'none' }}>View Live Site</Link>
      </header>

      {/*  ═══════════ COVER ═══════════  */}
      <section id="cover">
        <div className="particles" id="particles"></div>
        <div className="cover-inner">
          <div className="cover-left">
            <div className="doc-meta">Live Portfolio Record — 2026</div>
            <div className="cover-subtitle">CrossAngle Interior</div>
            <h1 className="cover-title">
              Built<br />
              <em>from Scratch</em><br />
              to Scale
            </h1>
            <p className="cover-desc">
              A comprehensive documentation of our engineering journey. 
              This blueprint details the actual tech stack, custom interactive modules, 
              and design architecture that powers the live CrossAngle platform.
            </p>
            <div className="cover-tags">
              <span className="tag">React</span>
              <span className="tag">Tailwind CSS</span>
              <span className="tag">Framer Motion</span>
              <span className="tag">Vite</span>
              <span className="tag">Modular Addons</span>
              <span className="tag">Bento UI</span>
              <span className="tag">Supabase</span>
              <span className="tag">TypeScript</span>
              <span className="tag">Accessibility (a11y)</span>
              <span className="tag">Performance Optimized</span>
            </div>
          </div>
          <div className="cover-right">
            <div className="stat-grid">
              <div className="stat-cell">
                <div className="stat-num">04<span className="stat-unit">+</span></div>
                <div className="stat-label">Custom Addons</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">50<span className="stat-unit">+</span></div>
                <div className="stat-label">UI Components</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">99<span className="stat-unit">/100</span></div>
                <div className="stat-label">Lighthouse Target</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">100<span className="stat-unit">%</span></div>
                <div className="stat-label">Responsive</div>
              </div>
            </div>
            <div className="cover-bottom">
              <span className="version-badge">Live Version — 2026</span>
              <span className="version-badge">Engineering Documentation</span>
            </div>
          </div>
        </div>
      </section>

      {/*  ═══════════ THE JOURNEY ═══════════  */}
      <section id="concept">
        <div className="section-eyebrow reveal">01 — Project Evolution</div>
        <h2 className="section-title reveal reveal-delay-1">The <em>Scratch-to-Live</em><br /><strong>Journey</strong></h2>
        <p className="section-intro reveal reveal-delay-2">
          What started as a conceptual mockup evolved into a modular, highly interactive web application. 
          We focused on unifying the brand language, building scalable "Addons", and refining the user experience.
        </p>

        <div className="concept-grid">
          <div className="pillar-list">
            <div className="pillar reveal">
              <div className="pillar-num">01</div>
              <div>
                <div className="pillar-title">Unified Brand Identity</div>
                <p className="pillar-desc">
                  We standardized the logo and navigation layout across all touchpoints—from the public-facing pages to the Admin CRM and Discovery Wizards. This created a cohesive, premium feel globally.
                </p>
              </div>
            </div>
            <div className="pillar reveal reveal-delay-1">
              <div className="pillar-num">02</div>
              <div>
                <div className="pillar-title">Modular Addon Architecture</div>
                <p className="pillar-desc">
                  Instead of bloating the core app, complex features like the "Aesthetic Discovery Engine" and "Cost Estimator" were built as isolated addons. This decoupled architecture ensures maintainability.
                </p>
              </div>
            </div>
            <div className="pillar reveal reveal-delay-2">
              <div className="pillar-num">03</div>
              <div>
                <div className="pillar-title">Performance & Polish</div>
                <p className="pillar-desc">
                  We implemented custom skeleton loaders for seamless data fetching transitions, hoisted social bars to prevent layout clipping, and refined the CRM panel to eliminate nested scrollbars.
                </p>
              </div>
            </div>
            <div className="pillar reveal reveal-delay-3">
              <div className="pillar-num">04</div>
              <div>
                <div className="pillar-title">Accessibility & Global Reach</div>
                <p className="pillar-desc">
                  Integrated a high-contrast EN / HINGLISH language toggle with proper aria-pressed states, ensuring the premium interior design experience is accessible to a broader demographic.
                </p>
              </div>
            </div>
          </div>

          <div className="concept-aside">
            <div className="mood-card reveal">
              <div className="mood-card-title">Live Color Palette</div>
              <div className="palette-row">
                <div className="swatch" style={{ "background": "#000000" }} data-hex="#000000"></div>
                <div className="swatch" style={{ "background": "#C41230" }} data-hex="#C41230"></div>
                <div className="swatch" style={{ "background": "#ffffff" }} data-hex="#FFFFFF"></div>
                <div className="swatch" style={{ "background": "#1A1A1A" }} data-hex="#1A1A1A"></div>
                <div className="swatch" style={{ "background": "rgba(255,255,255,0.05)" }} data-hex="GLASS"></div>
              </div>
              <div className="typo-preview">
                <div className="typo-sample-serif" style={{ fontFamily: 'Playfair Display, serif' }}>Aa — Playfair</div>
                <div className="typo-sample-sans" style={{ fontFamily: 'Inter, sans-serif' }}>Bb — Inter</div>
                <div className="typo-sample-mono" style={{ fontFamily: 'Space Mono, monospace' }}>CC — Space Mono</div>
              </div>
            </div>
            <div className="mood-card reveal reveal-delay-2">
              <div className="mood-card-title">Design Philosophy</div>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "marginTop": "8px" }}>
                <div style={{ "display": "flex", "justifyContent": "space-between", "alignItems": "center" }}>
                  <span style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "letterSpacing": "0.12em", "color": "var(--muted)", "textTransform": "uppercase" }}>Complex Form ←→ Guided Wizard</span>
                </div>
                <div style={{ "height": "3px", "background": "var(--dim)", "borderRadius": "2px", "position": "relative" }}>
                  <div style={{ "position": "absolute", "left": "85%", "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--accent)", "top": "50%", "transform": "translateY(-50%)", "boxShadow": "0 0 8px var(--accent)" }}></div>
                </div>
                <div style={{ "display": "flex", "justifyContent": "space-between", "alignItems": "center" }}>
                  <span style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "letterSpacing": "0.12em", "color": "var(--muted)", "textTransform": "uppercase" }}>Static Layouts ←→ Fluid Motion</span>
                </div>
                <div style={{ "height": "3px", "background": "var(--dim)", "borderRadius": "2px", "position": "relative" }}>
                  <div style={{ "position": "absolute", "left": "70%", "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--gold)", "top": "50%", "transform": "translateY(-50%)", "boxShadow": "0 0 8px var(--gold)" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BlueprintRadar() {
  return (
    <>
      {/*  ═══════════ TECH STACK ═══════════  */}
      <section id="techstack">
        <div className="section-eyebrow reveal">02 — Architecture</div>
        <h2 className="section-title reveal reveal-delay-1">Live <em>Technology</em><br /><strong>Stack & Tools</strong></h2>
        <p className="section-intro reveal reveal-delay-2">
          We moved away from purely theoretical animation libraries to a robust, production-ready stack optimized for speed, developer experience, and maintainability.
        </p>

        <div className="stack-grid reveal">
          <div className="stack-cell">
            <div className="stack-layer">Core Framework</div>
            <div className="stack-name">React + Vite</div>
            <p className="stack-desc">The foundation of the application. Vite provides lightning-fast HMR and optimized builds, while React powers the component-based architecture.</p>
            <span className="stack-badge">Production Engine</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Styling System</div>
            <div className="stack-name">Tailwind CSS</div>
            <p className="stack-desc">Utility-first CSS framework allowing for rapid prototyping and consistent design token application across all modules and addons.</p>
            <span className="stack-badge">Design System</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Animation Layer</div>
            <div className="stack-name">Framer Motion</div>
            <p className="stack-desc">Replaced GSAP for complex UI transitions. Handles spring physics, layout animations, exit transitions, and scroll-linked reveal effects efficiently within React.</p>
            <span className="stack-badge">Motion Engine</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Routing</div>
            <div className="stack-name">React Router DOM</div>
            <p className="stack-desc">Handles seamless client-side navigation with code-splitting for performance. Integrates with AnimatePresence for smooth page transitions.</p>
            <span className="stack-badge">Navigation</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Icons & Assets</div>
            <div className="stack-name">Lucide React</div>
            <p className="stack-desc">A clean, consistent icon library that perfectly matches the premium, minimalist aesthetic of the interior design brand.</p>
            <span className="stack-badge">Visuals</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">State Management</div>
            <div className="stack-name">React Context API</div>
            <p className="stack-desc">Lightweight global state handling for the Style Discovery engine and Language translation toggles without relying on heavy external libraries.</p>
            <span className="stack-badge">Data Flow</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="section-eyebrow reveal">Key Implementations</div>
        <div className="perf-row">
          <div className="perf-card reveal">
            <div className="perf-meter">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle className="perf-bg" cx="30" cy="30" r="26" strokeDasharray="163" stroke-dashoffset="0" />
                <circle className="perf-fill" cx="30" cy="30" r="26" stroke-dashoffset="16" />
              </svg>
              <div className="perf-val">A11y</div>
            </div>
            <div className="perf-label">Accessible Language Pill</div>
          </div>
          <div className="perf-card reveal reveal-delay-1">
            <div className="perf-meter">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle className="perf-bg" cx="30" cy="30" r="26" strokeDasharray="163" stroke-dashoffset="0" />
                <circle className="perf-fill" cx="30" cy="30" r="26" stroke-dashoffset="32" style={{ "stroke": "var(--gold)" }} />
              </svg>
              <div className="perf-val">UI</div>
            </div>
            <div className="perf-label">Skeleton Loaders</div>
          </div>
          <div className="perf-card reveal reveal-delay-2">
            <div className="perf-meter">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle className="perf-bg" cx="30" cy="30" r="26" strokeDasharray="163" stroke-dashoffset="0" />
                <circle className="perf-fill" cx="30" cy="30" r="26" stroke-dashoffset="41" style={{ "stroke": "var(--accent2)" }} />
              </svg>
              <div className="perf-val">Z-99</div>
            </div>
            <div className="perf-label">Social Bar Hoisting</div>
          </div>
          <div className="perf-card reveal reveal-delay-3">
            <div className="perf-meter">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle className="perf-bg" cx="30" cy="30" r="26" strokeDasharray="163" stroke-dashoffset="0" />
                <circle className="perf-fill" cx="30" cy="30" r="26" stroke-dashoffset="8" />
              </svg>
              <div className="perf-val">CRM</div>
            </div>
            <div className="perf-label">Admin Layout Cleanup</div>
          </div>
        </div>
      </section>
    </>
  );
}

function BlueprintMoodboard() {
  return (
    <>
      {/*  ═══════════ COMPONENTS ═══════════  */}
      <section id="components">
        <div className="section-eyebrow reveal">03 — Feature Showcase</div>
        <h2 className="section-title reveal reveal-delay-1">Live <strong>Component</strong><br /><em>Architecture</em></h2>
        <p className="section-intro reveal reveal-delay-2">
          Showcasing the actual interactive modules and layouts designed and integrated into the live application environment.
        </p>

        <div className="comp-layout">

          <div className="comp-row reveal">
            <div className="comp-preview">
              <div className="comp-preview-label">Module: Discovery Engine</div>
              <div style={{ "width": "85%", "textAlign": "center" }}>
                <div style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "letterSpacing": "0.2em", "color": "var(--accent)", "marginBottom": "12px", "textTransform": "uppercase" }}>Aesthetic Wizard</div>
                <div style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "24px", "lineHeight": "1.2", "marginBottom": "8px" }}>Find Your Design DNA</div>
                <div style={{ "display": "flex", "gap": "8px", "justifyContent": "center", "marginTop": "20px" }}>
                  <div style={{ "padding": "8px 20px", "background": "var(--accent)", "fontFamily": "'Syne',sans-serif", "fontSize": "9px", "fontWeight": "700", "letterSpacing": "0.1em", "textTransform": "uppercase", "color": "#000" }}>Start Quiz</div>
                </div>
              </div>
            </div>
            <div className="comp-info">
              <div className="comp-name"><strong>Aesthetic Discovery</strong> Engine</div>
              <p className="comp-desc">
                A multi-step interactive wizard that guides users through a highly visual questionnaire. 
                Features include dynamic background transitions based on selected answers, progressive state preservation, 
                and a personalized "Design DNA" results generation. Built as a standalone addon to keep the core codebase clean.
              </p>
              <div className="comp-techs">
                <span className="comp-tech">React Context</span>
                <span className="comp-tech">Framer Motion</span>
                <span className="comp-tech">Modular Addon</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="comp-row reverse reveal">
            <div className="comp-preview">
              <div className="comp-preview-label">Global Layout: Unified Footer</div>
              <div style={{ "width": "90%", "background": "#000", "padding": "20px", "border": "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ "display": "flex", "justifyContent": "space-between", "alignItems": "flex-start", "marginBottom": "30px" }}>
                   <div style={{ "fontSize": "20px", "fontFamily": "'Cormorant Garamond',serif" }}>Stop collecting<br/><span style={{ color: "#C41230", fontStyle: "italic"}}>Pinterest boards.</span></div>
                   <div style={{ "padding": "6px 14px", "background": "#C41230", "borderRadius": "999px", "fontSize": "8px", "textTransform": "uppercase" }}>Get Estimate →</div>
                </div>
                <div style={{ "fontSize": "32px", "opacity": "0.1", "textAlign": "center", "fontFamily": "'Cormorant Garamond',serif", "letterSpacing": "0.1em" }}>CROSSANGLE</div>
              </div>
            </div>
            <div className="comp-info">
              <div className="comp-name"><strong>Redesigned</strong> Footer</div>
              <p className="comp-desc">
                The global footer was completely overhauled to feature a bold, cinematic typography layout. 
                It includes a pointed-arrow red CTA pill, a giant semi-transparent "CROSSANGLE" watermark that anchors the page, 
                and a creatively structured bottom copyright bar separated by crimson diamond bullets.
              </p>
              <div className="comp-techs">
                <span className="comp-tech">Tailwind Grids</span>
                <span className="comp-tech">Responsive Typography</span>
                <span className="comp-tech">Hover States</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="comp-row reveal">
            <div className="comp-preview">
              <div className="comp-preview-label">CRM: Admin Leads Panel</div>
              <div style={{ "width": "80%", "border": "1px solid var(--border)", "background": "var(--surface2)", "padding": "12px", "borderRadius": "4px" }}>
                <div style={{ "display": "flex", "justifyContent": "space-between", "borderBottom": "1px solid var(--border)", "paddingBottom": "8px", "marginBottom": "8px" }}>
                  <span style={{ "fontSize": "10px", "color": "var(--muted)" }}>Leads Dashboard</span>
                  <span style={{ "fontSize": "10px", "color": "var(--accent)" }}>Export CSV</span>
                </div>
                <div style={{ "height": "8px", "background": "var(--dim)", "marginBottom": "4px", "width": "100%", "borderRadius": "2px" }}></div>
                <div style={{ "height": "8px", "background": "var(--dim)", "marginBottom": "4px", "width": "80%", "borderRadius": "2px" }}></div>
                <div style={{ "height": "8px", "background": "var(--dim)", "width": "60%", "borderRadius": "2px" }}></div>
              </div>
            </div>
            <div className="comp-info">
              <div className="comp-name"><strong>Admin CRM</strong> Layout Cleanup</div>
              <p className="comp-desc">
                Refined the internal admin experience by cleaning up duplicate headers and organizing action buttons via React Portals. 
                Resolved scrolling issues by eliminating nested vertical scrollbars within the `AdminTabSlider`, resulting in a premium backend tool.
              </p>
              <div className="comp-techs">
                <span className="comp-tech">React Portals</span>
                <span className="comp-tech">Tailwind Layouts</span>
                <span className="comp-tech">Admin UX</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

function BlueprintInsights() {
  return (
    <>
      {/*  ═══════════ UX DETAILS ═══════════  */}
      <section id="animations">
        <div className="section-eyebrow reveal">04 — Performance & UX</div>
        <h2 className="section-title reveal reveal-delay-1"><em>UX & Polish</em><br /><strong>Reference System</strong></h2>
        <p className="section-intro reveal reveal-delay-2">
          A look at the subtle details, loading states, and accessibility improvements that elevate the application from a prototype to a production-grade product.
        </p>

        <div className="anim-bento reveal">

          <div className="bento b1">
            <div className="bento-title">Skeleton Loading States</div>
            <p className="bento-desc">Custom animated placeholders that map exactly to the layout of upcoming content, preventing layout shift and reducing perceived loading times.</p>
            <div className="bento-preview" style={{ "flexDirection": "column", "gap": "8px", "padding": "20px" }}>
               <div style={{ "width": "100%", "height": "12px", "background": "rgba(255,255,255,0.1)", "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", "borderRadius": "4px" }}></div>
               <div style={{ "width": "70%", "height": "12px", "background": "rgba(255,255,255,0.1)", "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", "borderRadius": "4px" }}></div>
            </div>
          </div>

          <div className="bento b2">
            <div className="bento-title">Language Toggle (EN/HI)</div>
            <p className="bento-desc">A high-contrast pill toggle integrated into the navigation. It instantly swaps translation contexts globally while maintaining strict accessibility standards (aria-pressed).</p>
            <div className="bento-preview">
               <div style={{ "padding": "4px 8px", "border": "1px solid var(--accent)", "borderRadius": "16px", "fontSize": "10px", "display": "flex", "gap": "8px" }}>
                 <span style={{ "color": "var(--accent)" }}>EN</span>
                 <span style={{ "color": "var(--muted)" }}>HI</span>
               </div>
            </div>
          </div>

          <div className="bento b3">
            <div className="bento-title">Social Bar Hoisting</div>
            <p className="bento-desc">The floating social links were hoisted out of local stacking contexts and given a global Z-index (99), solving clipping issues with relative-positioned elements like the footer.</p>
            <div className="bento-preview" style={{ "position": "relative", "width": "100%", "height": "100%" }}>
               <div style={{ "position": "absolute", "right": "20px", "bottom": "20px", "display": "flex", "flexDirection": "column", "gap": "8px" }}>
                 <div style={{ "width": "20px", "height": "20px", "background": "var(--accent)", "borderRadius": "50%" }}></div>
                 <div style={{ "width": "20px", "height": "20px", "background": "var(--accent)", "borderRadius": "50%" }}></div>
               </div>
            </div>
          </div>

          <div className="bento b4">
            <div className="bento-title">Unified Branding</div>
            <p className="bento-desc">Implemented a standardized `AnimatedLogo` component with fixed dimensions and transition states, ensuring visual consistency across every distinct module and page.</p>
            <div className="bento-preview">
              <div style={{ "fontFamily": "'Cormorant Garamond', serif", "fontSize": "18px", "fontWeight": "bold" }}>CROSSANGLE</div>
            </div>
          </div>

        </div>
      </section>

      {/*  ═══════════ FOOTER ═══════════  */}
      <footer className="blueprint-footer" style={{ padding: '60px 40px', borderTop: '1px solid var(--border)', textAlign: 'center', marginTop: '120px' }}>
        <div className="footer-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', opacity: 0.5 }}>
          <div className="footer-logo" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px' }}>CrossAngle Interior</div>
          <div className="footer-links" style={{ display: 'flex', gap: '24px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>
            <span>Engineering Documentation</span>
            <span>Version 2.0 (Live Implementation)</span>
            <span>2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}
