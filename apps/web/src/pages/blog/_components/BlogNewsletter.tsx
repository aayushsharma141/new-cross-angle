import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";
import { useNewsletter } from "../_hooks/useNewsletter";
import { CRIMSON, GOLD } from "../_utils/blogUtils";

export function BlogNewsletter() {
  const {
    email,
    setEmail,
    isSubmitting,
    isDone,
    honeypot,
    setHoneypot,
    handleNewsletter,
  } = useNewsletter();

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C6A15B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      <div className="container mx-auto px-4 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Content & Form */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full" style={{ background: "#161616", border: "1px solid #2a2a2a" }}>
              <Mail className="w-3.5 h-3.5" style={{ color: CRIMSON }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: CRIMSON }}>Newsletter</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">Design Decoded</h2>
            <p className="text-[14px] mb-8 text-white/50 leading-relaxed max-w-md mx-auto lg:mx-0">
              Join 5,000+ industry professionals receiving monthly design insights, trends, and case studies directly from our studio.
            </p>

            {isDone ? (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-6 border-l-2 pl-6" style={{ borderColor: CRIMSON }}>
                <p className="text-xl font-serif text-white">Welcome aboard! ✨</p>
                <p className="text-[13px] text-white/50 mt-2">Your first edition is on its way.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                <label className="sr-only" htmlFor="newsletter-email">Email address</label>
                <div aria-hidden="true" className="absolute left-[-9999px]">
                  <label htmlFor="newsletter-website">Website</label>
                  <input id="newsletter-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
                </div>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your professional email"
                  className="flex-1 px-5 py-3.5 rounded-full text-[13px] border focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all"
                  style={{ background: "#111", borderColor: "#2a2a2a", color: "#fff" }}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 text-[13px] font-semibold rounded-full whitespace-nowrap transition-all hover:scale-[1.02]"
                  style={{ background: CRIMSON, color: "#fff" }}
                >
                  {isSubmitting ? "Subscribing…" : "Subscribe"}
                </Button>
              </form>
            )}
            <div className="text-[10px] mt-4 text-white/25 flex items-center justify-center lg:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#333] inline-block" /> We respect your privacy. Unsubscribe anytime.
            </div>
          </div>

          {/* Right Column: Free-Floating Design Intelligence Hub */}
          <div className="hidden lg:flex justify-center items-center relative h-[380px] w-full" style={{ perspective: "1200px" }}>
            
            {/* Massive Ambient Glow bleeding into the whole section */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-15 pointer-events-none z-0"
              style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }}
              animate={{ 
                scale: [1, 1.1, 1, 1.1, 1],
                opacity: [0.15, 0.25, 0.15, 0.25, 0.15]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Central Open Design Journal (3D Spline style) */}
            <motion.div
              className="relative z-10 w-60 h-44 flex shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              style={{ rotateX: 20, rotateZ: -12, transformStyle: "preserve-3d" }}
              animate={{ rotateZ: [-12, -8, -12], y: [-8, 8, -8] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Left Page */}
              <div className="w-1/2 h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-l-lg p-4 relative overflow-hidden flex flex-col gap-2" style={{ transformOrigin: "right", transform: "rotateY(-8deg)" }}>
                <div className="w-10 h-1.5 bg-white/30 rounded" />
                <div className="w-20 h-1 bg-white/10 rounded" />
                <div className="w-14 h-1 bg-white/10 rounded" />
                <div className="w-16 h-1 bg-white/10 rounded" />
                
                <div className="mt-auto w-full h-16 bg-white/5 rounded border border-white/5 p-1.5 flex gap-1.5">
                  <div className="w-1/3 h-full bg-white/10 rounded-sm" />
                  <div className="w-1/3 h-full bg-white/10 rounded-sm" />
                </div>
              </div>
              
              {/* Right Page */}
              <div className="w-1/2 h-full bg-gradient-to-bl from-[#1f1f1f] to-[#0a0a0a] border border-white/10 border-l-0 rounded-r-lg p-4 relative flex flex-col items-center justify-center" style={{ transformOrigin: "left", transform: "rotateY(8deg)" }}>
                 <motion.div 
                    className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-black/50 shadow-inner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 >
                   <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20" />
                 </motion.div>
                 <div className="absolute bottom-4 right-4 w-12 h-1 bg-white/10 rounded" />
              </div>
              
              {/* Glowing spine */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent -translate-x-1/2 shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
            </motion.div>

            {/* Orbiting Elements (Magic UI Floating Cards style) */}
            
            {/* 1. Trend Card */}
            <motion.div
              className="absolute z-20 w-28 h-36 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex flex-col shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
              style={{ top: "8%", left: "-2%" }}
              animate={{ y: [0, -15, 0], rotate: [8, 4, 8] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0 }}
            >
              <p className="text-[9px] text-white/50 font-mono tracking-wider mb-2">TREND 2026</p>
              <div className="flex-1 rounded bg-white/5 border border-white/5 relative overflow-hidden mb-2 flex items-end p-1.5 gap-1.5">
                <motion.div className="w-full bg-white/20 rounded-sm" animate={{ height: ["40%", "70%", "40%"] }} transition={{ duration: 4, repeat: Infinity }} />
                <motion.div className="w-full rounded-sm" style={{ background: CRIMSON }} animate={{ height: ["20%", "50%", "20%"] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />
                <motion.div className="w-full bg-white/40 rounded-sm" animate={{ height: ["60%", "90%", "60%"] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} />
              </div>
              <div className="w-12 h-1 bg-white/20 rounded mx-auto" />
            </motion.div>

            {/* 2. Material Sample (Brass) */}
            <motion.div
              className="absolute z-20 w-24 h-28 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 flex flex-col shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
              style={{ bottom: "8%", right: "2%" }}
              animate={{ y: [0, 12, 0], rotate: [-12, -6, -12], scale: [1.05, 1, 1.05] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex-1 rounded-lg mb-2 relative overflow-hidden border border-white/10 shadow-inner" style={{ background: GOLD }}>
                 <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent w-[200%]"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1, ease: "easeInOut" }}
                 />
              </div>
              <p className="text-[8px] text-white/50 font-mono tracking-wider text-center">BRASS / 04</p>
            </motion.div>

            {/* 3. Case Study Image */}
            <motion.div
              className="absolute z-0 w-36 h-24 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
              style={{ top: "25%", right: "-8%" }}
              animate={{ y: [0, -10, 0], rotate: [-6, -3, -6], scale: [0.9, 0.95, 0.9] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
              <MediaSlot assetKey="blog_newsletter_bg" fallbackUrl="/images/projects/discovery/lifestyle-4.jpg" alt="" className="w-full h-full rounded-lg object-cover" />
            </motion.div>

            {/* Floating Particles in 3D Space */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/40 blur-[1px]"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%` 
                }}
                animate={{ 
                  y: [0, -150], 
                  opacity: [0, 1, 0],
                  x: Math.random() * 80 - 40,
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{ 
                  duration: 6 + Math.random() * 5, 
                  repeat: Infinity, 
                  delay: Math.random() * 4,
                  ease: "linear"
                }}
              />
            ))}

          </div>

        </div>
      </div>
    </section>
  );
}
