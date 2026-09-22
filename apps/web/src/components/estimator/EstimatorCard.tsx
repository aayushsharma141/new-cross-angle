import React from 'react';
import SpotlightCard from '../ReactBits/SpotlightCard';

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
      className="group w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8b6f47] rounded-3xl cursor-pointer"
      aria-label={`Select ${title} estimation path`}
    >
      <SpotlightCard
        className="flex flex-col items-center justify-center gap-4 w-full h-full p-8 text-center bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl hover:bg-white/85 hover:border-kiro-accent/30 hover:shadow-[0_16px_50px_rgba(139,111,71,0.15)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group-hover:scale-[1.01]"
        spotlightColor="rgba(139, 111, 71, 0.2)"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-kiro-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="p-5 rounded-full bg-white border border-[#1a1a1a]/5 shadow-sm group-hover:scale-110 group-hover:border-kiro-accent/30 group-hover:shadow-[0_0_20px_rgba(139,111,71,0.12)] transition-all duration-500 relative z-10">
          {icon}
        </div>
        <h3 className="text-xl md:text-2xl font-serif tracking-wide text-[#1a1a1a] group-hover:text-kiro-accent transition-colors duration-500 relative z-10">{title}</h3>
        <p className="text-sm text-[#5a5a5a] leading-relaxed max-w-[200px] group-hover:text-[#4a4a4a] transition-colors duration-500 relative z-10">
          {description}
        </p>
      </SpotlightCard>
    </button>
  );
};

export default EstimatorCard;
