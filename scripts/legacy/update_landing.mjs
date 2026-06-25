import fs from 'fs';

const filePath = 'apps/web/src/addons/discovery/components/DiscoveryLanding.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove ARCHETYPE_SCORES
content = content.replace(/const ARCHETYPE_SCORES: Record<string, \{ calm: number; warmth: number; social: number; depth: number; structure: number \}> = \{[\s\S]*?\};\n\n/, '');

// 2. Replace Panels with Unified Components
const panelsRegex = /\/\* ─── Methodology Panel ───────────────────────────────────── \*\/[\s\S]*?(?=\/\* ─── Intent Overlay ──────────────────────────────────────── \*\/)/;

const newPanels = `/* ─── Shared Tab Shell ────────────────────────────────────── */
function TabShell({
  main,
  insight,
  stats,
}: {
  main: React.ReactNode;
  insight: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col h-full gap-6">
      {/* Zone 1: Main Feature — takes all remaining space */}
      <div className="flex-1 min-h-0 bg-white border border-[#e8e4dd] rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
        {main}
      </div>

      {/* Zone 2: Insight — 1 line of serif italic copy */}
      <p className="font-serif text-sm text-[#5a5a5a] italic font-light leading-relaxed px-1">
        {insight}
      </p>

      {/* Zone 3: Supporting Data — 3–4 horizontal pills */}
      <div className="flex items-center gap-6 pt-4 border-t border-[#e8e4dd]/60 px-1 overflow-x-auto scrollbar-hide">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5 shrink-0">
            <span className="text-[18px] font-serif font-light text-[#1a1a1a]">
              {s.value}
            </span>
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#70593a]/60">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Unified Methodology Tab ─────────────────────────────── */
function UnifiedMethodologyTab({ lang }: { lang: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const n1 = useRef<HTMLDivElement>(null);
  const n2 = useRef<HTMLDivElement>(null);
  const n3 = useRef<HTMLDivElement>(null);
  const n4 = useRef<HTMLDivElement>(null);
  const n5 = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [archIdx, setArchIdx] = useState(0);

  useEffect(() => {
    if (!hovering) return;
    const interval = setInterval(() => setArchIdx((i) => (i + 1) % ARCHETYPE_PREVIEWS.length), 2500);
    return () => clearInterval(interval);
  }, [hovering]);

  const activePreview = ARCHETYPE_PREVIEWS[archIdx];

  const mainFeature = (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#faf8f5]/50 relative" ref={containerRef}>
      <div className="flex w-full max-w-[400px] items-center justify-between z-10 relative h-[300px]">
        {/* Left Inputs */}
        <div className="flex flex-col justify-between h-full py-4">
          {[
            { ref: n1, icon: Sun },
            { ref: n2, icon: Layers },
            { ref: n3, icon: Leaf },
            { ref: n4, icon: Lamp },
            { ref: n5, icon: BookOpen }
          ].map((item, i) => (
            <div key={i} ref={item.ref} className="w-10 h-10 rounded-full bg-white border border-[#e8e4dd] flex items-center justify-center shadow-sm z-10">
              <item.icon size={16} className="text-[#70593a]" />
            </div>
          ))}
        </div>

        {/* Center Engine */}
        <div ref={centerRef} className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8b6f47] to-[#c9a96e] p-[1px] shadow-lg z-10 flex items-center justify-center shadow-[#c9a96e]/20">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              <Compass size={24} className="text-[#70593a]" />
            </motion.div>
          </div>
        </div>

        {/* Right Output */}
        <div
          ref={outputRef}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="w-24 h-24 rounded-2xl bg-white border border-[#c9a96e]/30 shadow-sm z-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-md transition-all group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#c9a96e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Fingerprint size={24} className="text-[#c9a96e] group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-mono tracking-widest uppercase text-[#70593a] font-bold text-center px-2">
            {hovering ? activePreview.name : "Profile"}
          </span>
        </div>
      </div>

      <AnimatedBeam containerRef={containerRef} fromRef={n1} toRef={centerRef} gradientStartColor="#e8e4dd" gradientStopColor="#c9a96e" />
      <AnimatedBeam containerRef={containerRef} fromRef={n2} toRef={centerRef} gradientStartColor="#e8e4dd" gradientStopColor="#c9a96e" />
      <AnimatedBeam containerRef={containerRef} fromRef={n3} toRef={centerRef} gradientStartColor="#e8e4dd" gradientStopColor="#c9a96e" />
      <AnimatedBeam containerRef={containerRef} fromRef={n4} toRef={centerRef} gradientStartColor="#e8e4dd" gradientStopColor="#c9a96e" />
      <AnimatedBeam containerRef={containerRef} fromRef={n5} toRef={centerRef} gradientStartColor="#e8e4dd" gradientStopColor="#c9a96e" />
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={outputRef} gradientStartColor="#c9a96e" gradientStopColor="#8b6f47" />
    </div>
  );

  return (
    <TabShell
      main={mainFeature}
      insight={lang === "hi" ? "Aapke lifestyle patterns, preferences aur aadat ek precise design profile banate hain." : "Your lifestyle patterns, material preferences, light sensitivity, and spatial habits translate into one precise design profile."}
      stats={[
        { label: "Inputs", value: "5" },
        { label: "Profile", value: "1" },
        { label: "Minutes", value: "7" }
      ]}
    />
  );
}

/* ─── Unified Archetypes Tab ──────────────────────────────── */
function UnifiedArchetypesTab() {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handlePrev = () => setSelectedIdx((i) => (i === 0 ? ARCHETYPE_PREVIEWS.length - 1 : i - 1));
  const handleNext = () => setSelectedIdx((i) => (i === ARCHETYPE_PREVIEWS.length - 1 ? 0 : i + 1));

  const activePreview = ARCHETYPE_PREVIEWS[selectedIdx];
  const activeCore = archetypes.find(a => a.name === activePreview.name);

  const mainFeature = (
    <div className="w-full h-full flex flex-col justify-center items-center relative p-8 md:p-12">
      {/* Navigation */}
      <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-[#5a5a5a] hover:text-[#1a1a1a] bg-[#faf8f5] hover:bg-[#e8e4dd] rounded-full transition-colors z-20">
        <ChevronLeft size={20} />
      </button>
      <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#5a5a5a] hover:text-[#1a1a1a] bg-[#faf8f5] hover:bg-[#e8e4dd] rounded-full transition-colors z-20">
        <ChevronRight size={20} />
      </button>

      {/* Content */}
      <div className="max-w-md w-full flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <span className="px-3 py-1 bg-[#c9a96e]/10 text-[#c9a96e] text-[9px] font-mono tracking-[0.25em] uppercase font-bold rounded-sm mb-6">
              {activePreview.tag}
            </span>
            
            <h3 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] mb-6">
              {activePreview.name}
            </h3>

            {/* Simulated 3-word summary */}
            <div className="flex items-center gap-3 text-sm font-light text-[#5a5a5a] mb-8">
              <span>Restrained</span>
              <span className="w-1 h-1 rounded-full bg-[#c9a96e]"></span>
              <span>Intentional</span>
              <span className="w-1 h-1 rounded-full bg-[#c9a96e]"></span>
              <span>Collected</span>
            </div>

            {/* Palette */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {activePreview.palette.map((color, idx) => (
                <div key={idx} className="group relative">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                  />
                </div>
              ))}
            </div>
            <span className="text-[9px] font-mono tracking-widest text-[#70593a]/70 uppercase">Core Palette</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <TabShell
      main={mainFeature}
      insight={activeCore?.tagline || activePreview.summary}
      stats={[
        { label: "Material Focus", value: "Stone & Linen" },
        { label: "Style", value: activePreview.tag },
        { label: "Lifestyle Fit", value: "87%" }
      ]}
    />
  );
}

/* ─── Unified Deliverables Tab ────────────────────────────── */
function UnifiedDeliverablesTab() {
  const mainFeature = (
    <div className="w-full h-full p-8 md:p-12 flex flex-col justify-center">
      <div className="mb-8">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#70593a] font-bold block mb-2">
          Your Discovery Blueprint
        </span>
        <h3 className="font-serif text-2xl text-[#1a1a1a]">Comprehensive Output</h3>
      </div>

      <div className="space-y-4">
        {DELIVERABLES.map((d, i) => {
          const Icon = d.icon;
          return (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-6 h-6 rounded-full border border-[#e8e4dd] flex items-center justify-center bg-[#faf8f5] group-hover:border-[#c9a96e] transition-colors">
                <Icon size={12} className={d.color} />
              </div>
              <span className="font-serif text-[17px] text-[#1a1a1a] group-hover:text-[#70593a] transition-colors">{d.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <TabShell
      main={mainFeature}
      insight="A professional roadmap for making confident, irreversible design decisions."
      stats={[
        { label: "Deliverables", value: "6" },
        { label: "Output", value: "Personalized" },
        { label: "Format", value: "Downloadable" }
      ]}
    />
  );
}

`;
content = content.replace(panelsRegex, newPanels);

// 3. Remove MobileMethodology Component
const mobileSectionsRegex = /\/\* ─── Mobile Sections ─────────────────────────────────────── \*\/[\s\S]*?(?=\/\* ─── Main Component ──────────────────────────────────────── \*\/)/;
content = content.replace(mobileSectionsRegex, '');

// 4. Update Desktop Render Block
const desktopRenderRegex = /<AnimatePresence mode="wait">[\s\S]*?<\/AnimatePresence>/;
const newDesktopRender = `<AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeTab === "methodology" && <UnifiedMethodologyTab lang={lang} />}
                {activeTab === "archetypes" && <UnifiedArchetypesTab />}
                {activeTab === "deliverables" && <UnifiedDeliverablesTab />}
              </motion.div>
            </AnimatePresence>`;
content = content.replace(desktopRenderRegex, newDesktopRender);

// 5. Update Mobile Sections
const mobileRenderRegex = /\{\/\* Mobile Methodology \*\/\}[\s\S]*?\{\/\* Mobile Final CTA \*\/\}/;
const newMobileRender = `{/* Mobile Methodology */}
        <section className="px-6 py-12 border-t border-[#e8e4dd]/60 min-h-[70vh]">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#70593a] block mb-4 font-bold">Methodology</span>
          <UnifiedMethodologyTab lang={lang} />
        </section>

        {/* Mobile Archetypes */}
        <section className="px-6 py-12 border-t border-[#e8e4dd]/60 min-h-[70vh]">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#70593a] block mb-4 font-bold">Archetypes</span>
          <UnifiedArchetypesTab />
        </section>

        {/* Mobile Deliverables */}
        <section className="px-6 py-12 border-t border-[#e8e4dd]/60 min-h-[70vh]">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#70593a] block mb-4 font-bold">Deliverables</span>
          <UnifiedDeliverablesTab />
        </section>

        {/* Mobile Final CTA */}`;
content = content.replace(mobileRenderRegex, newMobileRender);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update complete.');
