import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Zap, Users } from 'lucide-react';
import type { UserSignals } from '@/types/discovery';

interface Props {
  onComplete: (data: Pick<UserSignals, 'morningRoutine'>) => void;
}

export default function MorningRoutine({ onComplete }: Props) {
  const [morningRoutine, setMorningRoutine] = useState<UserSignals['morningRoutine']>();

  const routines = [
    { id: 'Slow & Peaceful', icon: Coffee, desc: 'Quiet mornings, coffee, reading, zero rush' },
    { id: 'Early & Active', icon: Zap, desc: 'Workouts, quick prep, highly structured' },
    { id: 'Chaotic Family Rush', icon: Users, desc: 'Getting kids ready, multiple things happening at once' }
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
            How does the day start?
          </h2>
          <p className="text-sm md:text-base text-[#5a5a5a] mb-10 leading-relaxed font-light">
            This dictates bathroom flow, kitchen layout, and morning natural light needs.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl px-2">
            {routines.map((routine) => {
              const Icon = routine.icon;
              const isSelected = morningRoutine === routine.id;
              return (
                <button
                  key={routine.id}
                  type="button"
                  onClick={() => {
                    setMorningRoutine(routine.id);
                    setTimeout(() => onComplete({ morningRoutine: routine.id }), 500);
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
                  <span className="font-serif text-lg font-medium text-[#1a1a1a]">{routine.id}</span>
                  <span className="text-xs text-[#5a5a5a] leading-relaxed font-light">{routine.desc}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
