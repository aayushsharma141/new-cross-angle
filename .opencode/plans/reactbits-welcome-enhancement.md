# ReactBits WelcomeScreen Enhancement Plan

## Goal
Integrate all available ReactBits components into WelcomeScreen.tsx to elevate animations, interactivity, and visual polish.

## Changes to Make

### 1. Update Imports (WelcomeScreen.tsx lines 11-13)

**Replace:**
```tsx
import SoftAurora from "@/components/ReactBits/SoftAurora";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import ShimmerButton from "@/components/magicui/shimmer-button";
```

**With:**
```tsx
import SoftAurora from "@/components/ReactBits/SoftAurora";
import CountUp from "@/components/ReactBits/CountUp";
import SplitText from "@/components/ReactBits/SplitText";
import BlurText from "@/components/ReactBits/BlurText";
import ShinyText from "@/components/ReactBits/ShinyText";
import { SpotlightCard, IridescenceGlow } from "@/components/ReactBits";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import ShimmerButton from "@/components/magicui/shimmer-button";
```

---

### 2. Replace Badge with ShinyText (lines 277-282)

**Replace:**
```tsx
<div className="mb-4">
  <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#70593a] bg-[#70593a]/10 px-4 py-1.5 rounded-full font-bold shadow-sm">
    {lang === "hi" ? "Aesthetic Discovery Engine" : "Aesthetic Discovery Engine"}
  </span>
</div>
```

**With:**
```tsx
<div className="mb-4">
  <div className="inline-block bg-[#70593a]/10 px-4 py-1.5 rounded-full shadow-sm">
    <ShinyText
      text={lang === "hi" ? "Aesthetic Discovery Engine" : "Aesthetic Discovery Engine"}
      className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#70593a] font-bold"
      color="#70593a"
      shineColor="#c9a96e"
      speed={4}
      spread={60}
    />
  </div>
</div>
```

---

### 3. Replace Subtitle Paragraph with BlurText (lines 310-316)

**Replace:**
```tsx
<p className="text-sm md:text-base text-[#5a5a5a] max-w-2xl leading-relaxed mb-6 font-light">
  {lang === "hi" ? (
    "Hum aapke emotional needs, lifestyle patterns aur space reality ko map karte hain — fir use cost estimation aur space layout blueprint me badalte hain."
  ) : (
    "We map your emotional needs, lifestyle patterns, and spatial reality — then translate that into a feasibility analysis and investment blueprint."
  )}
</p>
```

**With:**
```tsx
<BlurText
  text={lang === "hi"
    ? "Hum aapke emotional needs, lifestyle patterns aur space reality ko map karte hain — fir use cost estimation aur space layout blueprint me badalte hain."
    : "We map your emotional needs, lifestyle patterns, and spatial reality — then translate that into a feasibility analysis and investment blueprint."
  }
  className="text-sm md:text-base text-[#5a5a5a] max-w-2xl leading-relaxed mb-6 font-light"
  delay={80}
  animateBy="words"
  direction="top"
  duration={0.4}
/>
```

---

### 4. Replace Social Proof Count with CountUp (line 359)

**Replace:**
```tsx
<strong className="text-[#1a1a1a]">{quizCount.toLocaleString()}+</strong>
```

**With:**
```tsx
<strong className="text-[#1a1a1a]">
  <CountUp to={quizCount} duration={2.5} separator="," />+
</strong>
```

---

### 5. Replace Stats Boxes Data with CountUp (lines 364-400)

**Replace the entire stats section:**
```tsx
              {/* ── Section 2: Single Row Stats Boxes (Readability Optimized) ── */}
              <div className="w-full max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {[
                    {
                      stat: "73%",
                      label: lang === "hi"
                        ? "log naye ghar me shift hone ke baad design mistakes ko regret karte hain."
                        : "of homeowners regret design decisions after moving in."
                    },
                    {
                      stat: "₹2.4L",
                      label: lang === "hi"
                        ? "ki average cost aati hai move-in hone ke baad design mistakes ko theek karne me."
                        : "average cost of correcting spatial misalignments post-occupancy."
                    },
                    {
                      stat: "7 min",
                      label: lang === "hi"
                        ? "ki quiet discovery aapko mahino ki space design confusion se bacha sakti hai."
                        : "of quiet introspection prevents months of expensive revision cycles."
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-6 md:p-8 bg-white border border-[#e8e4dd]/80 rounded-2xl shadow-sm hover:shadow-md hover:border-[#70593a]/30 transition-all duration-300 text-left group flex flex-col justify-between"
                    >
                      <h3 className="text-4xl md:text-5xl font-serif italic text-[#70593a] mb-3 group-hover:scale-105 origin-left transition-transform duration-300">
                        {item.stat}
                      </h3>
                      <p className="text-xs md:text-sm text-[#3a3a3a] leading-relaxed font-semibold">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
```

**With:**
```tsx
              {/* ── Section 2: Single Row Stats Boxes (Readability Optimized) ── */}
              <div className="w-full max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {[
                    { num: 73, suffix: "%", prefix: "", label: lang === "hi" ? "log naye ghar me shift hone ke baad design mistakes ko regret karte hain." : "of homeowners regret design decisions after moving in." },
                    { num: 2.4, suffix: "L", prefix: "₹", label: lang === "hi" ? "ki average cost aati hai move-in hone ke baad design mistakes ko theek karne me." : "average cost of correcting spatial misalignments post-occupancy." },
                    { num: 7, suffix: " min", prefix: "", label: lang === "hi" ? "ki quiet discovery aapko mahino ki space design confusion se bacha sakti hai." : "of quiet introspection prevents months of expensive revision cycles." }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-6 md:p-8 bg-white border border-[#e8e4dd]/80 rounded-2xl shadow-sm hover:shadow-md hover:border-[#70593a]/30 transition-all duration-300 text-left group flex flex-col justify-between"
                    >
                      <h3 className="text-4xl md:text-5xl font-serif italic text-[#70593a] mb-3 group-hover:scale-105 origin-left transition-transform duration-300">
                        {item.prefix}<CountUp to={item.num} duration={2.5} />{item.suffix}
                      </h3>
                      <p className="text-xs md:text-sm text-[#3a3a3a] leading-relaxed font-semibold">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
```

---

### 6. Add IridescenceGlow behind How It Works (around line 403)

**After the opening div class of the How It Works section (line 403), add the IridescenceGlow as the first child:**
```tsx
              {/* ── Section 2: AnimatedBeam How It Works ── */}
              <div className="w-full max-w-5xl mt-24 flex flex-col items-center justify-center py-16 relative overflow-hidden rounded-3xl bg-[#faf8f5]/40 border border-[#e8e4dd]/60">
                {/* IridescenceGlow ambient glow */}
                <IridescenceGlow className="absolute inset-0 opacity-[0.12]" duration={30} />
```

---

### 7. Replace "Five inputs. One precise profile." with SplitText (lines 418-420)

**Replace:**
```tsx
                  <h2 className="font-serif text-3xl md:text-5xl font-normal text-[#1a1a1a] max-w-xl leading-tight">
                    {lang === "hi" ? "Five inputs. One precise profile." : "Five inputs. One precise profile."}
                  </h2>
```

**With:**
```tsx
                  <SplitText
                    text={lang === "hi" ? "Five inputs. One precise profile." : "Five inputs. One precise profile."}
                    className="font-serif text-3xl md:text-5xl font-normal text-[#1a1a1a] max-w-xl leading-tight"
                    delay={60}
                    duration={0.5}
                    threshold={0.3}
                  />
```

---

### 8. Replace "What Style Might You Be?" with SplitText (lines 496-498)

**Replace:**
```tsx
                  <h2 className="font-serif text-3xl md:text-5xl font-normal text-[#1a1a1a]">
                    {lang === "hi" ? "What Style Might You Be?" : "What Style Might You Be?"}
                  </h2>
```

**With:**
```tsx
                  <SplitText
                    text={lang === "hi" ? "What Style Might You Be?" : "What Style Might You Be?"}
                    className="font-serif text-3xl md:text-5xl font-normal text-[#1a1a1a]"
                    delay={60}
                    duration={0.5}
                    threshold={0.3}
                  />
```

---

### 9. Wrap Archetype Cards with SpotlightCard (lines 503-541)

**Replace the entire grid div contents (from `<div className="grid ...">` to the closing `</div>` before `{/* Spatial DNA */}`):**
```tsx
                {/* Archetype Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
                  {archetypes.map((arch) => (
                    <div
                      key={arch.name}
                      className="relative bg-white border border-[#e8e4dd] p-7 rounded-2xl flex flex-col justify-between min-h-[220px] transition-all duration-500 shadow-sm hover:shadow-lg hover:border-[#70593a]/30 group overflow-hidden"
                    >
                      {/* Sub-hover ambient pastel glow */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, ${arch.palette[0]}, ${arch.palette[1]})`
                        }}
                      />
                      {/* Top thin line archetype identity gradient */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 opacity-60 group-hover:opacity-100"
                        style={{
                          background: `linear-gradient(90deg, ${arch.palette[0]}, ${arch.palette[1]})`
                        }}
                      />

                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#70593a]/70 font-bold">
                          {arch.tag}
                        </span>
                        <h3 className="font-serif text-xl text-[#1a1a1a] leading-snug group-hover:translate-x-0.5 transition-transform duration-300">
                          {arch.name}
                        </h3>
                        <p className="text-xs md:text-sm text-[#5a5a5a] leading-relaxed font-light">
                          {arch.desc}
                        </p>
                      </div>

                      {/* Micro interaction bullet on hover */}
                      <div className="mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[10px] font-mono uppercase tracking-widest text-[#70593a] font-bold">
                        <span>Details</span>
                        <ArrowRight size={10} className="translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
```

**With:**
```tsx
                {/* Archetype Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
                  {archetypes.map((arch) => (
                    <SpotlightCard
                      key={arch.name}
                      className="relative bg-white border border-[#e8e4dd] p-7 rounded-2xl flex flex-col justify-between min-h-[220px] transition-all duration-500 shadow-sm hover:shadow-lg hover:border-[#70593a]/30 group overflow-hidden"
                      spotlightColor={arch.palette[0]}
                    >
                      {/* Sub-hover ambient pastel glow */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, ${arch.palette[0]}, ${arch.palette[1]})`
                        }}
                      />
                      {/* Top thin line archetype identity gradient */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 opacity-60 group-hover:opacity-100"
                        style={{
                          background: `linear-gradient(90deg, ${arch.palette[0]}, ${arch.palette[1]})`
                        }}
                      />

                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#70593a]/70 font-bold">
                          {arch.tag}
                        </span>
                        <h3 className="font-serif text-xl text-[#1a1a1a] leading-snug group-hover:translate-x-0.5 transition-transform duration-300">
                          {arch.name}
                        </h3>
                        <p className="text-xs md:text-sm text-[#5a5a5a] leading-relaxed font-light">
                          {arch.desc}
                        </p>
                      </div>

                      {/* Micro interaction bullet on hover */}
                      <div className="mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[10px] font-mono uppercase tracking-widest text-[#70593a] font-bold">
                        <span>Details</span>
                        <ArrowRight size={10} className="translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
```

---

## Verification Steps

After all edits:
```bash
cd apps/web
npx eslint src/addons/discovery/components/WelcomeScreen.tsx
npx tsc --noEmit
npx vite
```

Then visually check:
- SoftAurora background renders
- ShinyText badge has subtle shimmer sweep
- BlurText reveals subtitle with blur-to-sharp animation on scroll
- CountUp numbers animate on scroll (73%, ₹2.4L, 7 min, 1,420+)
- SplitText reveals headings word-by-word
- IridescenceGlow is visible behind How It Works section
- SpotlightCard shows mouse spotlight on archetype cards
- All step transitions (0, 1, 2) still work
