import React from 'react';

interface EstimatorCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const EstimatorCard: React.FC<EstimatorCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="estimator-card flex flex-col items-center justify-center gap-4 w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--site-crimson)]"
      aria-label={`Select ${title} estimation path`}
    >
      <div className="p-4 rounded-full bg-black/40 border border-white/10 mb-2">
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-serif tracking-wide">{title}</h3>
      <p className="text-sm text-[var(--site-text-muted)] leading-relaxed max-w-[200px] text-center">
        {description}
      </p>
    </button>
  );
};

export default EstimatorCard;
