import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface ChipOptionProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ChipOption = ({ label, isActive, onClick }: ChipOptionProps) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    layout
    className={`
      relative px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
      ${isActive
        ? "bg-primary text-primary-foreground border-primary shadow-md"
        : "bg-secondary/50 text-foreground border-border hover:border-foreground/30 hover:bg-secondary"
      }
    `}
  >
    <span className="flex items-center gap-1.5">
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 16, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Check size={14} />
          </motion.span>
        )}
      </AnimatePresence>
      {label}
    </span>
  </motion.button>
);

export default ChipOption;
