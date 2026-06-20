import React, { useEffect, useRef } from 'react';
import './BlueprintPage.css';

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
        <div className="snav-item active" role="button" tabIndex={0} onClick={() => scrollTo({ top: 0, behavior: 'smooth' })} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); } }}>
          <span className="snav-label">Cover</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" role="button" tabIndex={0} onClick={() => document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' })} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' }); } }}>
          <span className="snav-label">Concept</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" role="button" tabIndex={0} onClick={() => document.getElementById('techstack')?.scrollIntoView({ behavior: 'smooth' })} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('techstack')?.scrollIntoView({ behavior: 'smooth' }); } }}>
          <span className="snav-label">Tech Stack</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" role="button" tabIndex={0} onClick={() => document.getElementById('components')?.scrollIntoView({ behavior: 'smooth' })} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('components')?.scrollIntoView({ behavior: 'smooth' }); } }}>
          <span className="snav-label">Components</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" role="button" tabIndex={0} onClick={() => document.getElementById('animations')?.scrollIntoView({ behavior: 'smooth' })} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('animations')?.scrollIntoView({ behavior: 'smooth' }); } }}>
          <span className="snav-label">Animations</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" role="button" tabIndex={0} onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' }); } }}>
          <span className="snav-label">Journey</span><span className="snav-dot"></span>
        </div>
        <div className="snav-item" role="button" tabIndex={0} onClick={() => document.getElementById('responsive')?.scrollIntoView({ behavior: 'smooth' })} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('responsive')?.scrollIntoView({ behavior: 'smooth' }); } }}>
          <span className="snav-label">Responsive</span><span className="snav-dot"></span>
        </div>
      </nav>

      {/*  HEADER  */}
      <header id="header">
        <div className="logo-area">
          <div className="logo-mark"></div>
          <div className="logo-text">Crossangle <span>Interior</span></div>
        </div>
        <nav>
          <a href="#concept">Concept</a>
          <a href="#techstack">Tech Stack</a>
          <a href="#components">Components</a>
          <a href="#animations">Animations</a>
          <a href="#journey">Journey</a>
        </nav>
        <button className="cta-btn">View Proposal</button>
      </header>

      {/*  ═══════════ COVER ═══════════  */}
      <section id="cover">
        <div className="particles" id="particles"></div>
        <div className="cover-inner">
          <div className="cover-left">
            <div className="doc-meta">UI/UX Design Proposal — 2026</div>
            <div className="cover-subtitle">Crossangle Interior</div>
            <h1 className="cover-title">
              Redesigned<br />
              <em>with Motion</em><br />
              in Mind
            </h1>
            <p className="cover-desc">
              A comprehensive redesign proposal leveraging the most advanced animation
              technologies to create an immersive interior design experience that converts
              visitors into clients through storytelling, depth, and sensory delight.
            </p>
            <div className="cover-tags">
              <span className="tag">GSAP</span>
              <span className="tag">Three.js</span>
              <span className="tag">Framer Motion</span>
              <span className="tag">ScrollTrigger</span>
              <span className="tag">R3F</span>
              <span className="tag">Lenis</span>
              <span className="tag">Lottie</span>
              <span className="tag">MorphSVG</span>
              <span className="tag">Anime.js</span>
              <span className="tag">Spline</span>
              <span className="tag">Bento Grid</span>
              <span className="tag">Glassmorphism</span>
              <span className="tag">Claymorphism</span>
              <span className="tag">Parallax</span>
              <span className="tag">Kinetic Type</span>
              <span className="tag">Scrollytelling</span>
            </div>
          </div>
          <div className="cover-right">
            <div className="stat-grid">
              <div className="stat-cell">
                <div className="stat-num">06<span className="stat-unit">+</span></div>
                <div className="stat-label">Animation Libraries</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">28<span className="stat-unit">+</span></div>
                <div className="stat-label">Techniques Used</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">3<span className="stat-unit">D</span></div>
                <div className="stat-label">Rendering Layer</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">60<span className="stat-unit">fps</span></div>
                <div className="stat-label">Target Frame Rate</div>
              </div>
            </div>
            <div className="cover-bottom">
              <span className="version-badge">Version 1.0 — Feb 2026</span>
              <span className="version-badge">Confidential Design Brief</span>
            </div>
          </div>
        </div>
      </section>

      {/*  ═══════════ CONCEPT ═══════════  */}
      <section id="concept">
        <div className="section-eyebrow reveal">01 — Overall Concept</div>
        <h2 className="section-title reveal reveal-delay-1">The <em>Immersive</em><br /><strong>Design Philosophy</strong></h2>
        <p className="section-intro reveal reveal-delay-2">
          Transforming the current flat, image-heavy layout into a living, breathing spatial experience.
          Every scroll triggers a new chapter of the brand story — architectural, editorial, and deeply emotive.
        </p>

        <div className="concept-grid">
          <div className="pillar-list">
            <div className="pillar reveal">
              <div className="pillar-num">01</div>
              <div>
                <div className="pillar-title">Cinematic Scroll Narrative</div>
                <p className="pillar-desc">
                  The page unfolds like a cinematic reel. Using GSAP ScrollTrigger paired with Lenis smooth scrolling,
                  each section reveals itself with precision-timed entrance effects. Scroll scrubbing drives
                  3D camera movements in Three.js scenes, making visitors feel they're walking through the spaces.
                </p>
              </div>
            </div>
            <div className="pillar reveal reveal-delay-1">
              <div className="pillar-num">02</div>
              <div>
                <div className="pillar-title">Living Typography System</div>
                <p className="pillar-desc">
                  Kinetic typography breathes life into headlines. Service titles morph between states via MorphSVG
                  letter animations. Cormorant Garamond serif anchors the luxury aesthetic while Syne bold
                  handles structural callouts. Text particles scatter and reform on hover using Anime.js staggering.
                </p>
              </div>
            </div>
            <div className="pillar reveal reveal-delay-2">
              <div className="pillar-num">03</div>
              <div>
                <div className="pillar-title">Spatial 3D Environments</div>
                <p className="pillar-desc">
                  A React Three Fiber scene greets users in the hero — a real-time rendered interior room fragment
                  built with ambient lighting and soft shadows. Spline-authored 3D furniture pieces orbit the
                  service cards, giving spatial context to each design category. Babylon.js handles heavy model loading.
                </p>
              </div>
            </div>
            <div className="pillar reveal reveal-delay-3">
              <div className="pillar-num">04</div>
              <div>
                <div className="pillar-title">Micro-Interaction Fabric</div>
                <p className="pillar-desc">
                  Every surface responds. Buttons ripple with Framer Motion spring physics. Form inputs animate
                  floating labels via Popmotion. Hover states trigger Lottie icon morphs. The cursor itself transforms
                  contextually — expanding, contracting, and color-shifting based on interactive zones.
                </p>
              </div>
            </div>
            <div className="pillar reveal reveal-delay-4">
              <div className="pillar-num">05</div>
              <div>
                <div className="pillar-title">Material & Morphism Layers</div>
                <p className="pillar-desc">
                  Glassmorphism overlays float above photography for service cards. Claymorphism adds tactile warmth
                  to process steps. Bento grid layouts organize the portfolio into asymmetric, dynamic compositions.
                  Liquid SVG morphing transitions between design categories using MorphSVG.
                </p>
              </div>
            </div>
          </div>

          <div className="concept-aside">
            <div className="mood-card reveal">
              <div className="mood-card-title">Color Palette</div>
              <div className="palette-row">
                <div className="swatch" style={{ "background": "#080808" }} data-hex="#080808"></div>
                <div className="swatch" style={{ "background": "#0F0F0F" }} data-hex="#0F0F0F"></div>
                <div className="swatch" style={{ "background": "#C8412A" }} data-hex="#C8412A"></div>
                <div className="swatch" style={{ "background": "#E8956D" }} data-hex="#E8956D"></div>
                <div className="swatch" style={{ "background": "#BFA27A" }} data-hex="#BFA27A"></div>
                <div className="swatch" style={{ "background": "#F0EDE8" }} data-hex="#F0EDE8"></div>
              </div>
              <div className="typo-preview">
                <div className="typo-sample-serif">Aa — Cormorant</div>
                <div className="typo-sample-sans">Bb — Syne Display</div>
                <div className="typo-sample-mono">CC — DM Mono 0123</div>
              </div>
            </div>
            <div className="mood-card reveal reveal-delay-2">
              <div className="mood-card-title">Design Direction</div>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "12px", "marginTop": "8px" }}>
                <div style={{ "display": "flex", "justifyContent": "space-between", "alignItems": "center" }}>
                  <span style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "letterSpacing": "0.12em", "color": "var(--muted)", "textTransform": "uppercase" }}>Minimal ←→ Maximal</span>
                </div>
                <div style={{ "height": "3px", "background": "var(--dim)", "borderRadius": "2px", "position": "relative" }}>
                  <div style={{ "position": "absolute", "left": "35%", "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--accent)", "top": "50%", "transform": "translateY(-50%)", "boxShadow": "0 0 8px var(--accent)" }}></div>
                </div>
                <div style={{ "display": "flex", "justifyContent": "space-between", "alignItems": "center" }}>
                  <span style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "letterSpacing": "0.12em", "color": "var(--muted)", "textTransform": "uppercase" }}>Static ←→ Kinetic</span>
                </div>
                <div style={{ "height": "3px", "background": "var(--dim)", "borderRadius": "2px", "position": "relative" }}>
                  <div style={{ "position": "absolute", "left": "70%", "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--gold)", "top": "50%", "transform": "translateY(-50%)", "boxShadow": "0 0 8px var(--gold)" }}></div>
                </div>
                <div style={{ "display": "flex", "justifyContent": "space-between", "alignItems": "center" }}>
                  <span style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "letterSpacing": "0.12em", "color": "var(--muted)", "textTransform": "uppercase" }}>Flat ←→ Spatial</span>
                </div>
                <div style={{ "height": "3px", "background": "var(--dim)", "borderRadius": "2px", "position": "relative" }}>
                  <div style={{ "position": "absolute", "left": "75%", "width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--accent2)", "top": "50%", "transform": "translateY(-50%)", "boxShadow": "0 0 8px var(--accent2)" }}></div>
                </div>
              </div>
            </div>
            <div className="mood-card reveal reveal-delay-3">
              <div className="mood-card-title">Target Metrics</div>
              <div style={{ "display": "flex", "flexDirection": "column", "gap": "10px", "marginTop": "8px" }}>
                <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                  <span style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "16px", "color": "var(--muted)" }}>Bounce Rate</span>
                  <span style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "16px", "color": "var(--accent)" }}>&lt;35%</span>
                </div>
                <div style={{ "height": "1px", "background": "var(--border)" }}></div>
                <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                  <span style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "16px", "color": "var(--muted)" }}>Avg. Session</span>
                  <span style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "16px", "color": "var(--accent)" }}>4+ min</span>
                </div>
                <div style={{ "height": "1px", "background": "var(--border)" }}></div>
                <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                  <span style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "16px", "color": "var(--muted)" }}>Inquiry Rate</span>
                  <span style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "16px", "color": "var(--accent)" }}>+220%</span>
                </div>
                <div style={{ "height": "1px", "background": "var(--border)" }}></div>
                <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                  <span style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "16px", "color": "var(--muted)" }}>LCP Score</span>
                  <span style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "16px", "color": "var(--accent)" }}>&lt;1.8s</span>
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
        <div className="section-eyebrow reveal">02 — Technology Stack</div>
        <h2 className="section-title reveal reveal-delay-1">Chosen <em>Technologies</em><br /><strong>& Rationale</strong></h2>
        <p className="section-intro reveal reveal-delay-2">
          Each library was selected for a specific responsibility within the animation system.
          The stack is layered to avoid conflicts, optimize bundle size, and deliver 60fps across all devices.
        </p>

        <div className="stack-grid reveal">
          <div className="stack-cell">
            <div className="stack-layer">Animation Core</div>
            <div className="stack-name">GSAP + ScrollTrigger</div>
            <p className="stack-desc">The orchestration engine. Timeline-based sequences for all major entrance/exit animations. ScrollTrigger pins sections for immersive scroll-scrubbed scenes.</p>
            <span className="stack-badge">Primary Engine</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Animation Core</div>
            <div className="stack-name">Framer Motion</div>
            <p className="stack-desc">React component animations with spring physics. Handles layout animations (Flip API equivalent), shared element transitions, and gesture-driven interactions.</p>
            <span className="stack-badge">React Layer</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">SVG & Morphing</div>
            <div className="stack-name">GSAP MorphSVG</div>
            <p className="stack-desc">Seamless path morphing for logo transformations, liquid transitions between service categories, and organic blob animations on section dividers.</p>
            <span className="stack-badge">GSAP Plugin</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">3D Rendering</div>
            <div className="stack-name">Three.js + R3F</div>
            <p className="stack-desc">React Three Fiber wraps Three.js for declarative 3D scene construction. Ambient occlusion, PBR materials, and environment lighting render interior scenes in real time.</p>
            <span className="stack-badge">3D Engine</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">3D Authoring</div>
            <div className="stack-name">Spline + Blender</div>
            <p className="stack-desc">3D furniture models authored in Blender, exported as GLTF, then interactive Spline scenes embedded for service card 3D previews with cursor-reactive lighting.</p>
            <span className="stack-badge">3D Content</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Micro-Animations</div>
            <div className="stack-name">Lottie</div>
            <p className="stack-desc">After Effects–authored icon animations for UI states (loading, success, empty), and illustrative storytelling animations in the "How We Work" process section.</p>
            <span className="stack-badge">Icon Animation</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Smooth Scroll</div>
            <div className="stack-name">Lenis</div>
            <p className="stack-desc">Silky, inertia-driven scrolling with momentum and elastic boundaries. Synchronizes with GSAP ScrollTrigger for perfectly timed scroll-linked animations.</p>
            <span className="stack-badge">Scroll Enhancer</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Physics & Utility</div>
            <div className="stack-name">Anime.js + Popmotion</div>
            <p className="stack-desc">Anime.js powers staggered particle systems and SVG draw-on animations. Popmotion handles physics-based spring animations for cursor tracking and card tilt interactions.</p>
            <span className="stack-badge">Supplementary</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Visual Patterns</div>
            <div className="stack-name">Aceternity UI + Magic UI</div>
            <p className="stack-desc">Pre-built advanced components: spotlight effects, sparkles, beam animations, border gradients, and shimmer loaders — accelerating development of premium visual details.</p>
            <span className="stack-badge">Component Library</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="section-eyebrow reveal">Performance Targets</div>
        <div className="perf-row">
          <div className="perf-card reveal">
            <div className="perf-meter">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle className="perf-bg" cx="30" cy="30" r="26" strokeDasharray="163" stroke-dashoffset="0" />
                <circle className="perf-fill" cx="30" cy="30" r="26" stroke-dashoffset="16" />
              </svg>
              <div className="perf-val">90</div>
            </div>
            <div className="perf-label">Lighthouse Score</div>
          </div>
          <div className="perf-card reveal reveal-delay-1">
            <div className="perf-meter">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle className="perf-bg" cx="30" cy="30" r="26" strokeDasharray="163" stroke-dashoffset="0" />
                <circle className="perf-fill" cx="30" cy="30" r="26" stroke-dashoffset="32" style={{ "stroke": "var(--gold)" }} />
              </svg>
              <div className="perf-val">60</div>
            </div>
            <div className="perf-label">Target FPS</div>
          </div>
          <div className="perf-card reveal reveal-delay-2">
            <div className="perf-meter">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle className="perf-bg" cx="30" cy="30" r="26" strokeDasharray="163" stroke-dashoffset="0" />
                <circle className="perf-fill" cx="30" cy="30" r="26" stroke-dashoffset="41" style={{ "stroke": "var(--accent2)" }} />
              </svg>
              <div className="perf-val">1.8</div>
            </div>
            <div className="perf-label">LCP (seconds)</div>
          </div>
          <div className="perf-card reveal reveal-delay-3">
            <div className="perf-meter">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle className="perf-bg" cx="30" cy="30" r="26" strokeDasharray="163" stroke-dashoffset="0" />
                <circle className="perf-fill" cx="30" cy="30" r="26" stroke-dashoffset="8" />
              </svg>
              <div className="perf-val">95</div>
            </div>
            <div className="perf-label">CLS Prevention</div>
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
        <div className="section-eyebrow reveal">03 — UI Components</div>
        <h2 className="section-title reveal reveal-delay-1">Interface <strong>Component</strong><br /><em>Architecture</em></h2>
        <p className="section-intro reveal reveal-delay-2">
          Each component is conceived as an animated entity — not merely a visual element,
          but a choreographed performer within the larger page narrative.
        </p>

        <div className="comp-layout">

          <div className="comp-row reveal">
            <div className="comp-preview">
              <div className="comp-preview-label">Hero Section</div>
              <div style={{ "width": "85%", "textAlign": "center" }}>
                <div style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "letterSpacing": "0.2em", "color": "var(--accent)", "marginBottom": "12px", "textTransform": "uppercase" }}>Interior Excellence</div>
                <div style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "28px", "lineHeight": "1.1", "marginBottom": "8px" }}>You Dream It.<br /><em style={{ "color": "var(--accent)" }}>We Design</em> It.</div>
                <div style={{ "display": "flex", "gap": "8px", "justifyContent": "center", "marginTop": "20px" }}>
                  <div style={{ "padding": "8px 20px", "background": "var(--accent)", "fontFamily": "'Syne',sans-serif", "fontSize": "9px", "fontWeight": "700", "letterSpacing": "0.1em", "textTransform": "uppercase" }}>Explore Now</div>
                  <div style={{ "padding": "8px 20px", "border": "1px solid var(--border)", "fontFamily": "'Syne',sans-serif", "fontSize": "9px", "fontWeight": "700", "letterSpacing": "0.1em", "textTransform": "uppercase", "color": "var(--muted)" }}>View Work</div>
                </div>
              </div>
            </div>
            <div className="comp-info">
              <div className="comp-name"><strong>Hero</strong> Section</div>
              <p className="comp-desc">
                A full-viewport hero with a React Three Fiber scene as background. Text staggered via Framer Motion
                on mount. The headline uses a Kinetic Typography reveal — characters animate from blur to sharp
                using GSAP stagger. The background 3D scene responds to cursor via Popmotion spring tracking.
                Lenis ensures buttery smooth scroll-away transition.
              </p>
              <div className="comp-techs">
                <span className="comp-tech">R3F / Three.js</span>
                <span className="comp-tech">Framer Motion</span>
                <span className="comp-tech">GSAP Stagger</span>
                <span className="comp-tech">Lenis</span>
                <span className="comp-tech">Popmotion</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="comp-row reverse reveal">
            <div className="comp-preview">
              <div className="comp-preview-label">Service Cards — Bento Grid</div>
              <div style={{ "display": "grid", "gridTemplateColumns": "repeat(3,1fr)", "gap": "8px", "width": "85%" }}>
                <div style={{ "gridColumn": "span 2", "background": "var(--surface2)", "border": "1px solid var(--border)", "padding": "16px", "borderRadius": "2px", "position": "relative", "overflow": "hidden" }}>
                  <div style={{ "position": "absolute", "inset": "0", "background": "linear-gradient(135deg,rgba(227, 83, 54,0.06),transparent)" }}></div>
                  <div style={{ "fontSize": "8px", "color": "var(--accent)", "fontFamily": "'DM Mono',monospace", "letterSpacing": "0.15em", "textTransform": "uppercase", "marginBottom": "6px" }}>Living Room</div>
                  <div style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "14px" }}>Residential Design</div>
                  <div style={{ "marginTop": "8px", "height": "32px", "background": "linear-gradient(135deg,var(--dim),var(--surface))", "borderRadius": "2px" }}></div>
                </div>
                <div style={{ "background": "var(--surface2)", "border": "1px solid var(--border)", "padding": "16px", "borderRadius": "2px" }}>
                  <div style={{ "fontSize": "8px", "color": "var(--gold)", "fontFamily": "'DM Mono',monospace", "letterSpacing": "0.15em", "textTransform": "uppercase", "marginBottom": "6px" }}>Office</div>
                  <div style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "12px" }}>Commercial</div>
                </div>
                <div style={{ "background": "var(--surface2)", "border": "1px solid var(--border)", "padding": "16px", "borderRadius": "2px" }}>
                  <div style={{ "fontSize": "8px", "color": "var(--muted)", "fontFamily": "'DM Mono',monospace", "letterSpacing": "0.15em", "textTransform": "uppercase", "marginBottom": "6px" }}>Kitchen</div>
                  <div style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "12px" }}>Modular</div>
                </div>
                <div style={{ "gridColumn": "span 2", "background": "var(--accent)", "padding": "16px", "borderRadius": "2px" }}>
                  <div style={{ "fontSize": "8px", "color": "rgba(255,255,255,0.7)", "fontFamily": "'DM Mono',monospace", "letterSpacing": "0.15em", "textTransform": "uppercase", "marginBottom": "4px" }}>Featured</div>
                  <div style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "14px", "color": "#fff" }}>Specialized Execution</div>
                </div>
              </div>
            </div>
            <div className="comp-info">
              <div className="comp-name"><strong>Bento</strong> Service Grid</div>
              <p className="comp-desc">
                Service cards arranged in an asymmetric Bento Grid layout. Each card has a Spline 3D element
                embedded that animates on hover. GSAP Flip transitions between "browse" and "focused" states
                when a card is selected. Glassmorphism overlay appears on hover using backdrop-filter.
                Cards stagger-reveal using ScrollTrigger.
              </p>
              <div className="comp-techs">
                <span className="comp-tech">Bento Grid</span>
                <span className="comp-tech">GSAP Flip</span>
                <span className="comp-tech">Spline Embed</span>
                <span className="comp-tech">Glassmorphism</span>
                <span className="comp-tech">ScrollTrigger</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="comp-row reveal">
            <div className="comp-preview">
              <div className="comp-preview-label">Process — Scrollytelling</div>
              <div style={{ "width": "80%", "display": "flex", "flexDirection": "column", "gap": "0" }}>
                <div style={{ "display": "flex", "gap": "20px", "alignItems": "flex-start" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "alignItems": "center" }}>
                    <div style={{ "width": "28px", "height": "28px", "borderRadius": "50%", "background": "var(--accent)", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "fontWeight": "700", "flexShrink": "0" }}>01</div>
                    <div style={{ "width": "1px", "height": "40px", "background": "linear-gradient(var(--accent),var(--dim))" }}></div>
                  </div>
                  <div style={{ "paddingTop": "4px" }}>
                    <div style={{ "fontSize": "12px", "fontWeight": "700", "marginBottom": "4px", "letterSpacing": "0.05em" }}>Discovery</div>
                    <div style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "12px", "color": "var(--muted)" }}>Deep client consultation, site survey, moodboards</div>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "20px", "alignItems": "flex-start" }}>
                  <div style={{ "display": "flex", "flexDirection": "column", "alignItems": "center" }}>
                    <div style={{ "width": "28px", "height": "28px", "borderRadius": "50%", "border": "1px solid var(--border)", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "color": "var(--muted)", "flexShrink": "0" }}>02</div>
                    <div style={{ "width": "1px", "height": "40px", "background": "var(--dim)" }}></div>
                  </div>
                  <div style={{ "paddingTop": "4px" }}>
                    <div style={{ "fontSize": "12px", "fontWeight": "700", "marginBottom": "4px", "letterSpacing": "0.05em", "color": "var(--muted)" }}>Concept</div>
                    <div style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "12px", "color": "var(--dim)" }}>Spatial planning, material palettes, 3D visualization</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="comp-info">
              <div className="comp-name"><strong>Process</strong> Scrollytelling</div>
              <p className="comp-desc">
                The "How We Work" section becomes a pinned Scrollytelling experience. Each process step activates
                as the user scrolls, with Lottie illustrations drawing on as the section enters.
                GSAP timeline scrubs progress indicators. The step connector morphs via MorphSVG from dashed
                to solid as it completes. A 3D isometric view renders the design stage in R3F.
              </p>
              <div className="comp-techs">
                <span className="comp-tech">Scrollytelling</span>
                <span className="comp-tech">GSAP Pin</span>
                <span className="comp-tech">Lottie</span>
                <span className="comp-tech">MorphSVG</span>
                <span className="comp-tech">R3F Isometric</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="comp-row reverse reveal">
            <div className="comp-preview">
              <div className="comp-preview-label">Portfolio Gallery — 3D</div>
              <div className="r3f-placeholder">
                <div className="orbit">
                  <div className="orbit-inner"></div>
                </div>
                <div style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "8px", "letterSpacing": "0.15em", "color": "var(--muted)", "textTransform": "uppercase" }}>R3F / Three.js Gallery</div>
              </div>
            </div>
            <div className="comp-info">
              <div className="comp-name"><strong>Portfolio</strong> 3D Gallery</div>
              <p className="comp-desc">
                Projects presented as floating 3D cards in a depth-layered Three.js scene. Cards pivot with
                perspective tracking as cursor moves across. Clicking a card triggers a GSAP Flip animation
                expanding it to full-screen with React Three Fiber transition. PlayCanvas handles complex
                multi-model scene management for the portfolio walk-through.
              </p>
              <div className="comp-techs">
                <span className="comp-tech">Three.js</span>
                <span className="comp-tech">GSAP Flip</span>
                <span className="comp-tech">PlayCanvas</span>
                <span className="comp-tech">Framer Motion</span>
                <span className="comp-tech">Parallax</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="comp-row reveal">
            <div className="comp-preview">
              <div className="comp-preview-label">CTA — Liquid Morphing</div>
              <div style={{ "width": "85%", "textAlign": "center", "position": "relative" }}>
                <div className="morph-blob" style={{ "margin": "0 auto 16px" }}></div>
                <div style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "22px", "marginBottom": "8px" }}>Ready to Transform<br />Your Space?</div>
                <div style={{ "padding": "10px 28px", "background": "var(--accent)", "display": "inline-block", "fontFamily": "'Syne',sans-serif", "fontSize": "9px", "fontWeight": "700", "letterSpacing": "0.15em", "textTransform": "uppercase" }}>Book Consultation</div>
              </div>
            </div>
            <div className="comp-info">
              <div className="comp-name"><strong>CTA</strong> Liquid Section</div>
              <p className="comp-desc">
                The conversion section uses a full-bleed liquid morph background via MorphSVG path animation —
                organic blobs that pulse with the brand's red. The consultation form floats over with a
                Claymorphism treatment. Button hover triggers a liquid fill via CSS clip-path animation +
                Framer Motion spring. Magic UI spotlight adds atmospheric depth.
              </p>
              <div className="comp-techs">
                <span className="comp-tech">MorphSVG Liquid</span>
                <span className="comp-tech">Claymorphism</span>
                <span className="comp-tech">Magic UI Spotlight</span>
                <span className="comp-tech">Framer Motion</span>
                <span className="comp-tech">CSS Clip-Path</span>
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
      {/*  ═══════════ ANIMATIONS ═══════════  */}
      <section id="animations">
        <div className="section-eyebrow reveal">04 — Animation & Interactivity Catalog</div>
        <h2 className="section-title reveal reveal-delay-1"><em>Motion</em> Design<br /><strong>Reference System</strong></h2>
        <p className="section-intro reveal reveal-delay-2">
          A living catalog of every animation pattern deployed across the interface,
          with interactive previews and implementation notes.
        </p>

        <div className="anim-bento reveal">

          <div className="bento b1">
            <div className="bento-title">Kinetic Typography</div>
            <p className="bento-desc">Characters animate individually using GSAP SplitText. Each word becomes an independent timeline unit.</p>
            <div className="bento-preview">
              <div className="kinetic-text">Design</div>
            </div>
          </div>

          <div className="bento b2">
            <div className="bento-title">MorphSVG Liquid Blob</div>
            <p className="bento-desc">Border-radius keyframe morphing as a CSS approximation; production uses MorphSVG path data.</p>
            <div className="bento-preview">
              <div className="morph-blob"></div>
            </div>
          </div>

          <div className="bento b3">
            <div className="bento-title">Liquid Ring Pulse</div>
            <p className="bento-desc">Concentric ring pulse used as loading state and CTA emphasis. Popmotion drives amplitude.</p>
            <div className="bento-preview">
              <div className="liquid-ring"></div>
            </div>
          </div>

          <div className="bento b4">
            <div className="bento-title">Glassmorphism Service Card</div>
            <p className="bento-desc">Frosted glass overlay with top gradient highlight. backdrop-filter: blur() layered over photography. Inner border adds refraction depth. Framer Motion layout animation handles card expansion.</p>
            <div className="bento-preview" style={{ "background": "linear-gradient(135deg,#1a0f0a,#0f0f0f)" }}>
              <div className="glass-card">
                <div className="glass-title">Living Room Design</div>
                <div className="glass-sub">Residential — Premium Tier</div>
              </div>
            </div>
          </div>

          <div className="bento b5">
            <div className="bento-title">Claymorphism Process Step</div>
            <p className="bento-desc">Tactile, puffy card treatment for the process steps. Multi-layer box-shadow creates depth illusion. Hover triggers scale + shadow shift via Framer Motion spring.</p>
            <div className="bento-preview">
              <div className="clay-card">
                <div className="clay-title">Step 01 — Discovery</div>
                <div className="clay-sub">Understanding your vision and lifestyle needs</div>
              </div>
            </div>
          </div>

          <div className="bento b6">
            <div className="bento-title">Parallax Depth Layers</div>
            <p className="bento-desc">Three independent layers float at different scroll velocities using GSAP ScrollTrigger scrub values of 0.5, 1, and 2. Creates a natural depth perception on photography.</p>
            <div className="bento-preview">
              <div className="parallax-layers">
                <div className="layer l1"></div>
                <div className="layer l2"></div>
                <div className="layer l3"></div>
              </div>
            </div>
          </div>

          <div className="bento b7">
            <div className="bento-title">Scroll Scrub</div>
            <p className="bento-desc">Scroll-linked progress bars and 3D camera paths timed to Lenis velocity.</p>
            <div className="bento-preview" style={{ "flexDirection": "column", "gap": "12px", "padding": "16px", "alignItems": "flex-start" }}>
              <div className="scroll-scrub">
                <div className="scrub-label">Section Progress</div>
                <div className="scrub-bar"><div className="scrub-fill"></div></div>
                <div className="scrub-label">Camera Path</div>
                <div className="scrub-bar"><div className="scrub-fill" style={{ "animationDelay": "0.5s" }}></div></div>
              </div>
            </div>
          </div>

          <div className="bento b8">
            <div className="bento-title">Micro-interactions</div>
            <p className="bento-desc">Hover fill reveal on buttons. Popmotion spring physics on cursor proximity.</p>
            <div className="bento-preview" style={{ "padding": "16px" }}>
              <div className="micro-btns">
                <button className="micro-btn"><span>Hover Me →</span></button>
                <button className="micro-btn"><span>Explore Space</span></button>
              </div>
            </div>
          </div>

          <div className="bento b9">
            <div className="bento-title">Three.js Cube</div>
            <p className="bento-desc">Wireframe 3D geometry. Production uses PBR furniture models.</p>
            <div className="bento-preview">
              <div className="three-demo">
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
              </div>
            </div>
          </div>

          <div className="bento b10">
            <div className="bento-title">Spline / R3F Orb</div>
            <p className="bento-desc">Physically-shaded orb. Cursor-reactive environment mapping via Spline.</p>
            <div className="bento-preview" style={{ "background": "#050505", "padding": "0", "overflow": "hidden" }}>
              <div className="spline-sim">
                <div className="spline-orb"></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/*  ═══════════ SCROLL JOURNEY ═══════════  */}
      <section id="journey">
        <div className="section-eyebrow reveal">05 — Scroll Journey Map</div>
        <h2 className="section-title reveal reveal-delay-1">Page-by-Page<br /><em>Animation</em> <strong>Choreography</strong></h2>
        <p className="section-intro reveal reveal-delay-2">
          A precise breakdown of every scroll-triggered event, entrance effect,
          and interactive moment the visitor encounters from top to bottom.
        </p>

        <div className="journey-steps">
          <div className="j-step reveal">
            <div className="j-step-num">Zone 01 — Viewport 0–100vh</div>
            <div className="j-step-title">Hero: Spatial Entry</div>
            <p className="j-step-desc">
              Page loads with a black screen. R3F scene bootstraps with fade-in (Framer Motion AnimatePresence).
              The brand tagline performs a SplitText reveal stagger (40ms per character, ease: "power3.out").
              Subtle cursor particles appear via Anime.js. The Lenis scroll begins, and the hero text
              parallaxes at 0.4x scroll speed. A floating prompt arrows pulses via Lottie.
            </p>
            <div className="j-tech-list">
              <span className="j-tech">R3F Scene Mount</span>
              <span className="j-tech">GSAP SplitText</span>
              <span className="j-tech">Framer AnimatePresence</span>
              <span className="j-tech">Lenis Init</span>
              <span className="j-tech">Anime.js Particles</span>
              <span className="j-tech">Lottie Scroll Hint</span>
            </div>
          </div>

          <div className="j-step reveal">
            <div className="j-step-num">Zone 02 — Viewport 100–220vh</div>
            <div className="j-step-title">Services: Bento Cascade</div>
            <p className="j-step-desc">
              ScrollTrigger fires at 80% viewport. Bento cards cascade in with staggered Y-translation
              (Framer Motion staggerChildren: 0.12s). Each card's Spline 3D preview lazy-loads as it
              enters the viewport. On hover, GSAP Flip captures card position and expands it to modal state.
              MorphSVG section divider morphs from angular to organic as the section fully enters.
            </p>
            <div className="j-tech-list">
              <span className="j-tech">ScrollTrigger</span>
              <span className="j-tech">Framer Stagger</span>
              <span className="j-tech">GSAP Flip</span>
              <span className="j-tech">Spline Lazy Load</span>
              <span className="j-tech">MorphSVG Divider</span>
            </div>
          </div>

          <div className="j-step reveal">
            <div className="j-step-num">Zone 03 — Viewport 220–380vh (Pinned)</div>
            <div className="j-step-title">Process: Scroll-Scrubbed Storytelling</div>
            <p className="j-step-desc">
              The section is pinned for 160vh of scroll. A GSAP timeline scrubs progress — each step
              activates at 33%, 66%, and 100%. Lottie animation plays frame-by-frame synced to scroll
              position. The connector line draws via SVGator stroke-dashoffset animation. An R3F isometric
              3D scene shows each design phase as the user scrolls. Zdog vector illustration rotates.
            </p>
            <div className="j-tech-list">
              <span className="j-tech">GSAP ScrollTrigger Pin</span>
              <span className="j-tech">Scroll Scrubbing</span>
              <span className="j-tech">Lottie Frame Sync</span>
              <span className="j-tech">SVGator Draw-On</span>
              <span className="j-tech">Zdog Illustration</span>
              <span className="j-tech">R3F Isometric</span>
            </div>
          </div>

          <div className="j-step reveal">
            <div className="j-step-num">Zone 04 — Viewport 380–500vh</div>
            <div className="j-step-title">Portfolio: 3D Gallery Walk</div>
            <p className="j-step-desc">
              Project cards float in a Three.js depth-parallax arrangement. Mouse movement triggers
              Popmotion spring-based perspective shifts across the entire grid. PlayCanvas manages the
              loaded GLTF room models displayed per project. Aceternity UI's "Tracing Beam" effect
              connects project categories vertically. Card click triggers shared element transition via
              Framer Motion layout ID system.
            </p>
            <div className="j-tech-list">
              <span className="j-tech">Three.js Parallax</span>
              <span className="j-tech">Popmotion Spring</span>
              <span className="j-tech">PlayCanvas GLTF</span>
              <span className="j-tech">Aceternity Tracing Beam</span>
              <span className="j-tech">Framer Layout ID</span>
            </div>
          </div>

          <div className="j-step reveal">
            <div className="j-step-num">Zone 05 — Viewport 500–560vh</div>
            <div className="j-step-title">Excellence Stats: Counter Emphasis</div>
            <p className="j-step-desc">
              Statistics section animates with GSAP countUp on ScrollTrigger enter. Stats use
              Framer Motion whileInView with spring easing for scale emphasis. Background uses
              Magic UI "Shimmer" effect on the tagline. Team member cards reveal with GSAP stagger
              from left. Cursor transforms to a magnifier state using CSS variable changes.
            </p>
            <div className="j-tech-list">
              <span className="j-tech">GSAP CountUp</span>
              <span className="j-tech">Framer whileInView</span>
              <span className="j-tech">Magic UI Shimmer</span>
              <span className="j-tech">GSAP Stagger</span>
            </div>
          </div>

          <div className="j-step reveal">
            <div className="j-step-num">Zone 06 — Viewport 560vh+</div>
            <div className="j-step-title">CTA + Footer: Liquid Close</div>
            <p className="j-step-desc">
              The CTA section features a full-screen MorphSVG liquid blob background in crimson.
              Headline uses a Kinetic Typography scramble effect (Anime.js). The consultation form
              floats with Claymorphism treatment and Framer Motion AnimatePresence for field validation states.
              Footer reveals with a perspective-tilt curtain effect via GSAP. Social icons animate via Lottie on hover.
            </p>
            <div className="j-tech-list">
              <span className="j-tech">MorphSVG Background</span>
              <span className="j-tech">Anime.js Scramble</span>
              <span className="j-tech">Claymorphism Form</span>
              <span className="j-tech">GSAP Curtain</span>
              <span className="j-tech">Lottie Social Icons</span>
            </div>
          </div>
        </div>
      </section>

      {/*  ═══════════ RESPONSIVE ═══════════  */}
      <section id="responsive">
        <div className="section-eyebrow reveal">06 — Responsive Design</div>
        <h2 className="section-title reveal reveal-delay-1"><strong>Adaptive</strong> Layout<br /><em>Strategy</em></h2>
        <p className="section-intro reveal reveal-delay-2">
          All animation systems degrade gracefully. Mobile devices receive optimized 2D fallbacks.
          The 3D scenes switch to pre-rendered video loops. Reduced Motion preferences are fully respected.
        </p>

        <div className="resp-devices reveal">
          <div className="device">
            <div className="device-frame" style={{ "borderRadius": "4px" }}>
              <div style={{ "background": "var(--surface2)", "padding": "8px 12px", "borderBottom": "1px solid var(--border)", "display": "flex", "justifyContent": "space-between", "alignItems": "center" }}>
                <div style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "7px", "color": "var(--muted)" }}>Desktop — 1440px</div>
                <div style={{ "display": "flex", "gap": "4px" }}><div style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": "#ff5f57" }}></div><div style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": "#febc2e" }}></div><div style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": "#28c840" }}></div></div>
              </div>
              <div className="device-screen">
                <div className="screen-bar accent"></div>
                <div className="screen-grid-3">
                  <div className="screen-tile"></div>
                  <div className="screen-tile"></div>
                  <div className="screen-tile"></div>
                </div>
                <div className="screen-block"></div>
                <div className="screen-grid-3">
                  <div className="screen-tile" style={{ "height": "28px" }}></div>
                  <div className="screen-tile" style={{ "height": "28px" }}></div>
                  <div className="screen-tile" style={{ "height": "28px" }}></div>
                </div>
                <div className="screen-bar short"></div>
                <div className="screen-block" style={{ "height": "32px", "background": "var(--accent)", "opacity": "0.6" }}></div>
              </div>
            </div>
            <div className="device-label">Full Experience</div>
            <div className="device-size">3D + All Animations</div>
          </div>

          <div className="device">
            <div className="device-frame" style={{ "borderRadius": "12px", "width": "65%", "margin": "0 auto" }}>
              <div style={{ "background": "var(--surface2)", "padding": "8px", "borderBottom": "1px solid var(--border)", "textAlign": "center" }}>
                <div style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "7px", "color": "var(--muted)" }}>Tablet — 768px</div>
              </div>
              <div className="device-screen" style={{ "padding": "12px" }}>
                <div className="screen-bar accent" style={{ "width": "70%" }}></div>
                <div className="screen-grid-2">
                  <div className="screen-tile" style={{ "height": "40px" }}></div>
                  <div className="screen-tile" style={{ "height": "40px" }}></div>
                </div>
                <div className="screen-block" style={{ "height": "36px" }}></div>
                <div className="screen-bar short" style={{ "width": "50%" }}></div>
                <div className="screen-block" style={{ "height": "24px", "background": "var(--accent)", "opacity": "0.6" }}></div>
              </div>
            </div>
            <div className="device-label">Adaptive</div>
            <div className="device-size">CSS 3D + Reduced GSAP</div>
          </div>

          <div className="device">
            <div className="device-frame" style={{ "borderRadius": "20px", "width": "50%", "margin": "0 auto" }}>
              <div style={{ "background": "var(--surface2)", "padding": "6px", "borderBottom": "1px solid var(--border)", "textAlign": "center" }}>
                <div style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "6px", "color": "var(--muted)" }}>Mobile — 375px</div>
              </div>
              <div className="device-screen" style={{ "padding": "10px" }}>
                <div className="screen-bar accent" style={{ "width": "55%" }}></div>
                <div className="screen-block" style={{ "height": "48px" }}></div>
                <div className="screen-block" style={{ "height": "32px" }}></div>
                <div className="screen-bar" style={{ "width": "40%", "height": "6px" }}></div>
                <div className="screen-block" style={{ "height": "22px", "background": "var(--accent)", "opacity": "0.6" }}></div>
              </div>
            </div>
            <div className="device-label">Optimized</div>
            <div className="device-size">Framer Motion + Video</div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="stack-grid reveal" style={{ "gridTemplateColumns": "repeat(3,1fr)" }}>
          <div className="stack-cell">
            <div className="stack-layer">prefers-reduced-motion</div>
            <div className="stack-name">Motion Accessibility</div>
            <p className="stack-desc">All GSAP and Framer Motion animations check the OS reduce-motion media query. 3D scenes fall back to static renders. ScrollTrigger scrubs are replaced with fade-ins.</p>
            <span className="stack-badge">WCAG 2.1 AA</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">GPU Detection</div>
            <div className="stack-name">Tier-Based 3D</div>
            <p className="stack-desc">Three.js uses a performance tier detection (low/medium/high) to adjust shadow quality, geometry complexity, and draw calls. Low-tier devices skip WebGL entirely.</p>
            <span className="stack-badge">Three.js Detect</span>
          </div>
          <div className="stack-cell">
            <div className="stack-layer">Network & Bundle</div>
            <div className="stack-name">Code Splitting</div>
            <p className="stack-desc">Animation libraries are dynamically imported only when their target section enters the viewport. 3D assets use Draco compression and progressive loading. Core FCP is animation-free.</p>
            <span className="stack-badge">Dynamic Import</span>
          </div>
        </div>
      </section>

      {/*  ═══════════ FOOTER ═══════════  */}
      <section id="footer">
        <div className="footer-inner">
          <div>
            <h2 className="footer-cta reveal">
              Ready to Build<br />
              <em>Something Remarkable?</em>
            </h2>
            <div className="footer-btns reveal reveal-delay-2">
              <button className="btn-primary">Start the Project</button>
              <button className="btn-secondary">View Live Demo</button>
            </div>
            <div style={{ "marginTop": "40px", "paddingTop": "32px", "borderTop": "1px solid var(--border)" }}>
              <div style={{ "fontFamily": "'DM Mono',monospace", "fontSize": "9px", "letterSpacing": "0.15em", "textTransform": "uppercase", "color": "var(--dim)" }}>
                This proposal covers: GSAP · ScrollTrigger · Flip · MorphSVG · Framer Motion · Lenis ·
                Lottie · SVGator · Anime.js · Popmotion · Three.js · R3F · Spline · Zdog · Babylon.js ·
                PlayCanvas · Blender · Scrollytelling · Parallax · Kinetic Typography · Micro-interactions ·
                Morphing · Liquid Motion · Glassmorphism · Claymorphism · Bento Grid · Magic UI · Aceternity UI
              </div>
            </div>
          </div>
          <div className="footer-meta reveal">
            <div style={{ "textAlign": "right" }}>
              <div className="logo-text" style={{ "fontFamily": "'Cormorant Garamond',serif", "fontSize": "24px", "fontWeight": "300", "marginBottom": "8px" }}>
                Crossangle <span style={{ "color": "var(--accent)" }}>Interior</span>
              </div>
              <div className="footer-credit">UI/UX Design Proposal</div>
              <div className="footer-project">Prepared February 2026</div>
              <div style={{ "marginTop": "24px", "width": "200px", "height": "1px", "background": "linear-gradient(90deg,transparent,var(--accent))", "marginLeft": "auto" }}></div>
              <div style={{ "marginTop": "16px", "fontFamily": "'Cormorant Garamond',serif", "fontSize": "14px", "color": "var(--dim)", "fontStyle": "italic" }}>
                "Every space tells a story.<br />We write it with motion."
              </div>
            </div>
          </div>
        </div>
      </section>




    </>
  );
}
