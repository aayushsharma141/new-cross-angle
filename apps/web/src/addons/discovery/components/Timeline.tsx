import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import type { UserSignals } from '@/types/discovery';

interface TimelineProps {
  onComplete: (data: Pick<UserSignals, 'possessionStatus'>) => void;
}

export default function Timeline({ onComplete }: TimelineProps) {
  const [possessionStatus, setPossessionStatus] = useState<UserSignals['possessionStatus']>();

  const statuses = [
    { id: 'Ready to Move', icon: CheckCircle2, desc: 'I already have the keys' },
    { id: 'Under Construction', icon: Clock, desc: 'Awaiting handover from builder' },
    { id: 'Living There Currently', icon: Calendar, desc: 'Planning to renovate while living here or moving temporarily' }
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
            When does the project begin?
          </h2>
          <p className="text-sm md:text-base text-[#5a5a5a] mb-10 leading-relaxed font-light">
            This affects our material choices and delivery timelines.
          </p>
          
          <div className="grid grid-cols-1 gap-5 w-full max-w-md px-2">
            {statuses.map((status) => {
              const Icon = status.icon;
              const isSelected = possessionStatus === status.id;
              return (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => {
                    setPossessionStatus(status.id);
                    setTimeout(() => onComplete({ possessionStatus: status.id }), 500);
                  }}
                  className={`
                    flex items-center text-left gap-5 p-6 rounded-2xl border transition-all duration-300 w-full hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none
                    ${isSelected 
                      ? 'border-[#70593a] bg-[#70593a]/5 text-[#1a1a1a] shadow-[0_0_15px_rgba(112,89,58,0.08)]' 
                      : 'border-[#e8e4dd] bg-white/70 text-[#2a2a2a] hover:bg-white hover:border-[#70593a]/30'
                    }
                  `}
                >
                  <Icon className={`w-8 h-8 flex-shrink-0 transition-colors ${isSelected ? 'text-[#70593a]' : 'text-[#70593a]/65'}`} />
                  <div>
                    <div className="font-serif text-lg font-medium text-[#1a1a1a] mb-1">{status.id}</div>
                    <div className="text-xs text-[#5a5a5a] leading-relaxed font-light">{status.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
