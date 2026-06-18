import { motion } from "framer-motion";
import { useState } from "react";
import { AestheticScores } from "@/types/discovery";

interface Props {
  onComplete: (scores: Partial<AestheticScores>, materialName?: string) => void;
}

const ALL_MATERIALS = [
  "Marble", "Granite", "Veneer", "Laminate", "Fluted panels",
  "Stone texture", "Concrete look", "Matte finish", "Gloss finish",
  "Brass accents", "Glass partitions", "Wooden textures"
];

const STORAGE_OPTIONS = [
  "Hidden storage", "Loft storage", "Shoe storage",
  "Seasonal storage", "Kids storage", "Crockery display",
  "Wardrobe max", "Utility hidden", "Suitcases", "Festival items",
  "Cleaning supplies", "Bulk groceries", "Linen storage",
  "Hobby storage"
];

const MaterialResonance = ({ onComplete }: Props) => {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [storageSlider, setStorageSlider] = useState<number>(5);

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  const toggleStorage = (item: string) => {
    setSelectedStorage(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleContinue = () => {
    // We send a combined string to satisfy the current types without breaking the pipeline
    onComplete(
      { structure: selectedMaterials.length, minimalism: storageSlider > 7 ? 2 : 0 },
      selectedMaterials.join(", ")
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col w-full px-8 py-12 max-w-4xl mx-auto overflow-y-auto"
    >
      <div className="flex-1 w-full space-y-16">
        {/* Materials Section */}
        <div className="w-full">
          <p className="text-xs font-bold tracking-[0.15em] text-[#5a5a5a] uppercase mb-4">MATERIALS</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-2 font-serif">
            Which materials are you naturally drawn to?
          </h2>
          <p className="text-[#5a5a5a] mb-8 text-base">
            Pick all that appeal. Your designer will balance them.
          </p>

          <div className="flex flex-wrap gap-3" role="group" aria-label="Material selection">
            {ALL_MATERIALS.map((mat) => (
              <button
                type="button"
                key={mat}
                onClick={() => toggleMaterial(mat)}
                aria-pressed={selectedMaterials.includes(mat)}
                className={`px-5 py-2.5 rounded-full border focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none transition-all duration-200 text-sm font-medium active:scale-[0.95] ${
                  selectedMaterials.includes(mat)
                    ? "bg-[#70593a]/5 border-[#70593a] text-[#1a1a1a] shadow-sm"
                    : "bg-white border-[#e8e4dd] text-[#1a1a1a] hover:border-[#1a1a1a]/40"
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-t border-[#e8e4dd] w-full" />

        {/* Storage Section */}
        <div className="w-full">
          <p className="text-xs font-bold tracking-[0.15em] text-[#5a5a5a] uppercase mb-4">STORAGE INTELLIGENCE</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-8 font-serif">
            Where do you need storage to disappear?
          </h2>

          <div className="flex flex-wrap gap-3 mb-12" role="group" aria-label="Storage needs selection">
            {STORAGE_OPTIONS.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => toggleStorage(item)}
                aria-pressed={selectedStorage.includes(item)}
                className={`px-5 py-2.5 rounded-full border focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none transition-all duration-200 text-sm font-medium active:scale-[0.95] ${
                  selectedStorage.includes(item)
                    ? "bg-[#70593a]/5 border-[#70593a] text-[#1a1a1a] shadow-sm"
                    : "bg-white border-[#e8e4dd] text-[#1a1a1a] hover:border-[#1a1a1a]/40"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="w-full max-w-2xl mb-16">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#1a1a1a] font-semibold">Visible display vs hidden storage</span>
              <span className="text-[#1a1a1a] font-bold">{storageSlider}/10</span>
            </div>
            
            <div className="relative w-full">
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-2 bg-[#70593a] rounded-l-full pointer-events-none z-0"
                style={{ width: `${(storageSlider / 10) * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="10"
                aria-label="Visible display vs hidden storage"
                value={storageSlider}
                onChange={(e) => setStorageSlider(Number(e.target.value))}
                className="w-full h-2 bg-[#e8e4dd] rounded-full appearance-none cursor-pointer relative z-10
                  focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2 focus-visible:outline-none
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#70593a] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-[#70593a] [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white
                  [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab bg-transparent"
              />
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-[#5a5a5a]">
              <span>Display beautiful things</span>
              <span>Hide everything</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl flex items-center justify-between mt-auto pt-8">
        <button 
          type="button"
          className="px-12 py-4 rounded-xl border border-[#e8e4dd] bg-white text-[#1a1a1a] font-medium hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-colors"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={selectedMaterials.length === 0 && selectedStorage.length === 0}
          className={`px-12 py-4 rounded-xl font-semibold focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 ${
            selectedMaterials.length > 0 || selectedStorage.length > 0
              ? "bg-[#70593a] text-white hover:bg-[#5e4b31] shadow-md cursor-pointer"
              : "bg-[#e8e4dd] text-[#a0a0a0] cursor-not-allowed"
          }`}
        >
          Continue &rarr;
        </button>
      </div>
    </motion.div>
  );
};

export default MaterialResonance;

