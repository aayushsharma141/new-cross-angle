import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import FocusLock from 'react-focus-lock';

interface AboutVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

const AboutVideoModal = ({ 
  isOpen, 
  onClose, 
  videoUrl = "https://www.youtube.com/embed/gJMCIaI7nKg" 
}: AboutVideoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <FocusLock>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="About Cross Angle Interior Video"
            onClick={onClose}
          >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`${videoUrl}?autoplay=1`}
              title="Cross Angle Interior Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </motion.button>
          </motion.div>
        </FocusLock>
      )}
    </AnimatePresence>
  );
};

export default AboutVideoModal;
