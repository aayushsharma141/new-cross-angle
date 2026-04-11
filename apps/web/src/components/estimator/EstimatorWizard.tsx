import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface EstimatorWizardProps {
  category: string;
  onBack: () => void;
}

const EstimatorWizard: React.FC<EstimatorWizardProps> = ({ category, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto rounded-xl p-8 lg:p-12 glass border border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--site-crimson)] to-[#870E20]" />
      
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-semibold tracking-widest uppercase text-[var(--site-text-muted)] hover:text-white transition-colors group mb-10"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to paths
      </button>

      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-serif mb-4">
          <span className="text-crimson-italic capitalize">{category}</span> Estimation
        </h2>
        <p className="text-[var(--site-text-muted)] max-w-2xl mx-auto leading-relaxed">
          The estimation engine is currently being finalized. Soon, you will be able to calculate precise costs for your {category.toLowerCase()} projects by answering a few quick questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
        {[
          { step: 1, title: 'Scope Selection' },
          { step: 2, title: 'Material Choices' },
          { step: 3, title: 'Immediate Quote' }
        ].map(({ step, title }) => (
          <div key={step} className="p-6 rounded-lg bg-black/40 border border-white/5 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full border border-[var(--site-crimson-30)] flex items-center justify-center text-[var(--site-crimson)] font-serif text-xl mb-4">
              {step}
            </div>
            <h4 className="font-semibold tracking-wide text-[var(--site-text)]">{title}</h4>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center text-sm text-[var(--site-text-muted)] flex items-center justify-center gap-2 font-mono">
        <CheckCircle2 size={16} className="text-[var(--site-crimson)]" /> System calibration in progress
      </div>
    </motion.div>
  );
};

export default EstimatorWizard;
