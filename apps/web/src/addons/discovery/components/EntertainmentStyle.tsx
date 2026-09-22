import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarHeart, CalendarClock } from 'lucide-react';
import type { UserSignals } from '@/types/discovery';

interface Props {
  onComplete: (data: Pick<UserSignals, 'hostingFrequency'>) => void;
}

export default function EntertainmentStyle({ onComplete }: Props) {
  const [hostingFrequency, setHostingFrequency] = useState<UserSignals['hostingFrequency']>();

  const hostingFrequencies = [
    { id: 'Weekly', icon: CalendarDays, desc: 'Constant flow of friends and family' },
    { id: 'Monthly', icon: CalendarHeart, desc: 'Occasional dinners or get-togethers' },
    { id: 'Rarely', icon: CalendarClock, desc: 'Home is a private sanctuary' }
  ] as const;

  return (
    <div className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full flex flex-col items-center text-center"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#1a1a1a] mb-3 tracking-tight">
            How do we host?
          </h2>
          <p className="text-sm md:text-base text-[#5a5a5a] mb-10 leading-relaxed font-light max-w-lg">
            Determines the balance between private sanctuaries and public gathering spaces.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl px-2">
            {hostingFrequencies.map((freq) => {
              const Icon = freq.icon;
              const isSelected = hostingFrequency === freq.id;
              return (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => {
                    setHostingFrequency(freq.id);
                    setTimeout(() => onComplete({ hostingFrequency: freq.id }), 500);
                  }}
                  className={`
                    flex flex-col items-center text-center gap-3.5 p-6 rounded-2xl border transition-all duration-300 w-full hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none
                    ${isSelected 
                      ? 'border-[#70593a] bg-[#70593a]/5 text-[#1a1a1a] shadow-[0_0_15px_rgba(112,89,58,0.08)]' 
                      : 'border-[#e8e4dd] bg-white/70 text-[#2a2a2a] hover:bg-white hover:border-[#70593a]/30'
                    }
                  `}
                >
                  <Icon className={`w-8 h-8 mb-1 transition-colors ${isSelected ? 'text-[#70593a]' : 'text-[#70593a]/65'}`} />
                  <span className="font-serif text-lg font-medium text-[#1a1a1a]">{freq.id}</span>
                  <span className="text-xs text-[#5a5a5a] leading-relaxed font-light">{freq.desc}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
