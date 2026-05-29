import { motion, AnimatePresence } from "framer-motion";

interface ChipOptionProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  index?: number;
}

const ChipOption = ({ label, isActive, onClick, index = 0 }: ChipOptionProps) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.995 }}
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06 }}
    className="group relative w-full text-left rounded-md focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none transition-all"
  >
    <div className={`
      relative flex items-center gap-5 px-6 py-[22px] transition-all duration-300
      border-b border-[#1a1a1a]/10
      ${isActive
        ? "bg-[#8b6f47]/[0.04] shadow-[inset_4px_0_0_#8b6f47,inset_0_0_20px_rgba(139,111,71,0.06)]"
        : "hover:bg-[#1a1a1a]/[0.04]"
      }
    `}>
      {/* Left accent bar (rendered via CSS or scaleY animation) */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#8b6f47] origin-center"
          />
        )}
      </AnimatePresence>

      {/* Option number */}
      <span className={`text-[12px] xl:text-[13px] font-mono font-bold tracking-wider tabular-nums shrink-0 transition-colors duration-300 ${isActive ? "text-[#8b6f47]" : "text-[#1a1a1a]/60 group-hover:text-[#1a1a1a]/80"
        }`}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Label */}
      <span className={`text-base xl:text-lg leading-snug transition-colors duration-300 ${isActive ? "text-[#1a1a1a] font-bold" : "text-[#1a1a1a]/90 font-medium group-hover:text-[#1a1a1a]"
        }`}>
        {label}
      </span>

      {/* Selected dot indicator — right side */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="ml-auto shrink-0 w-2.5 h-2.5 rounded-full bg-[#8b6f47]"
          />
        )}
      </AnimatePresence>
    </div>
  </motion.button>
);

export default ChipOption;
