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
    whileTap={{ scale: 0.99 }}
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06 }}
    className="group relative w-full text-left focus:outline-none"
  >
    <div className={`
      relative flex items-center gap-4 px-4 py-4 transition-all duration-300
      border-b border-white/[0.05]
      ${isActive
        ? "bg-white/[0.04]"
        : "hover:bg-white/[0.025]"
      }
    `}>
      {/* Left accent bar */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-400 origin-center"
          />
        )}
      </AnimatePresence>

      {/* Option number */}
      <span className={`text-[9px] font-mono tabular-nums shrink-0 transition-colors duration-300 ${isActive ? "text-amber-400/80" : "text-white/20 group-hover:text-white/35"
        }`}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Label */}
      <span className={`text-sm font-light leading-snug transition-colors duration-300 ${isActive ? "text-white" : "text-white/50 group-hover:text-white/75"
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
            className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400"
          />
        )}
      </AnimatePresence>
    </div>
  </motion.button>
);

export default ChipOption;
