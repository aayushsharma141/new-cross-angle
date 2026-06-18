import { useState } from "react";
import { motion } from "framer-motion";
import { AestheticScores } from "@/types/discovery";

interface AdjectiveSelectionProps {
  sessionId: string | null;
  onComplete: (partial: Partial<AestheticScores>, adjectives: string[], freeText: string) => void;
}

const DESIGN_LANGUAGES = [
  { name: "Modern Indian", desc: "Contemporary with Indian warmth" },
  { name: "Contemporary", desc: "Clean, current, timeless" },
  { name: "Minimal", desc: "Less is more, breathing space" },
  { name: "Luxury Modern", desc: "Premium materials, statement pieces" },
  { name: "Warm Earthy", desc: "Natural tones, organic textures" },
  { name: "Japandi", desc: "Japanese minimalism + Scandinavian warmth" },
  { name: "Industrial", desc: "Raw materials, urban edge" },
  { name: "Traditional Indian", desc: "Heritage, carved wood, rich colors" },
  { name: "Hotel Luxury", desc: "Polished, curated, impressive" },
  { name: "Modern Royal", desc: "Grand but not old-fashioned" },
];

const COLOR_MOODS = [
  { name: "Warm beige", color: "#d6c9b3" },
  { name: "White minimal", color: "#f4f4f2", border: true },
  { name: "Dark moody", color: "#2a2a2a" },
  { name: "Earthy clay", color: "#b05e3b" },
  { name: "Wood-heavy", color: "#8c7023" },
  { name: "Black luxury", color: "#101010" },
  { name: "Neutral luxury", color: "#c8bead" },
  { name: "Bold colors", color: "#8a1a41" },
  { name: "Pastel calm", color: "#c3d8cd" },
];

const DISLIKE_COLORS = ["White", "Black", "Beige", "Grey", "Pink", "Yellow", "Red", "Blue"];

const AdjectiveSelection = ({ onComplete }: AdjectiveSelectionProps) => {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(style)) return prev.filter(s => s !== style);
      if (prev.length >= 3) return prev;
      return [...prev, style];
    });
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const toggleDislike = (color: string) => {
    setSelectedDislikes(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handleSubmit = () => {
    const combined = [...selectedStyles, ...selectedMoods];
    // Dummy scores for now to satisfy the pipeline
    onComplete({ structure: 1, warmth: 1 }, combined, selectedDislikes.join(", "));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col w-full px-8 py-12 max-w-4xl mx-auto overflow-y-auto"
    >
      <div className="flex-1 w-full space-y-12">
        {/* Design Language Section */}
        <div className="w-full">
          <p className="text-xs font-bold tracking-[0.15em] text-[#5a5a5a] uppercase mb-4">STYLE DIRECTION</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-2 font-serif">
            Which design language feels closest?
          </h2>
          <p className="text-[#5a5a5a] mb-8 text-base">
            Pick up to 3. Most homes are hybrids.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3" role="group" aria-label="Design language selection (pick up to 3)">
            {DESIGN_LANGUAGES.map((style) => (
              <button
                type="button"
                key={style.name}
                onClick={() => toggleStyle(style.name)}
                {...{"aria-pressed": selectedStyles.includes(style.name)}}
                className={`flex flex-col items-center justify-center text-center p-4 rounded-3xl border focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none transition-all duration-200 active:scale-[0.97] ${
                  selectedStyles.includes(style.name)
                    ? "bg-[#faf8f5] border-[#1a1a1a] shadow-sm"
                    : "bg-white border-[#e8e4dd] hover:border-[#1a1a1a]/40"
                }`}
              >
                <span className="text-[#1a1a1a] font-medium text-[15px] mb-1">{style.name}</span>
                <span className="text-[#5a5a5a] text-xs">{style.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[#5a5a5a] mb-8">{selectedStyles.length}/3 selected</p>
        </div>

        <hr className="border-t border-[#e8e4dd] w-full" />

        {/* Color Moods Section */}
        <div className="w-full">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Color moods that feel liveable</h3>
          <div className="flex flex-wrap gap-3 mb-10">
            {COLOR_MOODS.map((mood) => (
              <button
                key={mood.name}
                onClick={() => toggleMood(mood.name)}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-full border focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none transition-all duration-200 text-sm font-medium ${
                  selectedMoods.includes(mood.name)
                    ? "bg-[#faf8f5] border-[#1a1a1a] text-[#1a1a1a] shadow-sm"
                    : "bg-white border-[#e8e4dd] text-[#1a1a1a] hover:border-[#1a1a1a]/40"
                }`}
              >
                <span 
                  className={`w-3.5 h-3.5 rounded-full ${mood.border ? 'border border-[#e8e4dd]' : ''}`} 
                  style={{ backgroundColor: mood.color }} 
                />
                {mood.name}
              </button>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Colors you dislike</h3>
          <div className="flex flex-wrap gap-3 mb-12">
            {DISLIKE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => toggleDislike(color)}
                className={`px-5 py-2.5 rounded-full border focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none transition-all duration-200 text-sm font-medium ${
                  selectedDislikes.includes(color)
                    ? "bg-[#faf8f5] border-[#1a1a1a] text-[#1a1a1a] shadow-sm"
                    : "bg-white border-[#e8e4dd] text-[#1a1a1a] hover:border-[#1a1a1a]/40"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl flex items-center justify-between mt-auto pt-8 pb-12">
        <button className="px-12 py-4 rounded-xl border border-[#e8e4dd] bg-white text-[#1a1a1a] font-medium hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-colors">
          &larr; Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedStyles.length === 0}
          className={`px-12 py-4 rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 ${
            selectedStyles.length > 0
              ? "bg-[#354f40] text-white hover:bg-[#2a4033] shadow-md"
              : "bg-[#e8e4dd] text-[#a0a0a0] cursor-not-allowed"
          }`}
        >
          Continue &rarr;
        </button>
      </div>
    </motion.div>
  );
};

export default AdjectiveSelection;
