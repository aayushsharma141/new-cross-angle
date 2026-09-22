import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, LayoutTemplate, Layers, PaintRoller, Hammer, Home as HomeIcon, MapPin } from 'lucide-react';
import type { UserSignals } from '@/types/discovery';

interface PhysicalSpaceProps {
  onComplete: (data: Pick<UserSignals, 'propertyType' | 'carpetArea' | 'projectScope'>) => void;
}

export default function PhysicalSpace({ onComplete }: PhysicalSpaceProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [propertyType, setPropertyType] = useState<UserSignals['propertyType']>();
  const [carpetArea, setCarpetArea] = useState<number>(1200);
  const [projectScope, setProjectScope] = useState<UserSignals['projectScope']>();

  const propertyTypes = [
    { id: 'Apartment', icon: Building2, desc: 'Shared structure, limited exterior changes' },
    { id: 'Villa', icon: Home, desc: 'Independent house, full control' },
    { id: 'Independent Floor', icon: Layers, desc: 'Single floor in a multi-story building' },
    { id: 'Studio', icon: LayoutTemplate, desc: 'Compact, open-plan living' }
  ] as const;

  const scopes = [
    { id: 'Cosmetic Renovation', icon: PaintRoller, desc: 'Surface updates, furniture, paint, no structural changes' },
    { id: 'Full Structural Renovation', icon: Hammer, desc: 'Moving walls, plumbing, complete overhaul' },
    { id: 'Bare Shell', icon: MapPin, desc: 'Raw space, building from the ground up inside' },
    { id: 'New Build', icon: HomeIcon, desc: 'Constructing the entire structure from scratch' }
  ] as const;

  const handleNext = () => {
    if (step === 2) {
      onComplete({ propertyType, carpetArea, projectScope });
    } else {
      setStep(s => (s + 1) as 1 | 2);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        
        {/* Progress indicators at the top */}
        <div className="mb-10 flex gap-2.5">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${
                step >= i ? 'w-8 bg-[#70593a]' : 'w-4 bg-[#e8e4dd]'
              }`} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#1a1a1a] mb-3 tracking-tight">
                What type of space are we looking at?
              </h2>
              <p className="text-sm md:text-base text-[#5a5a5a] mb-10 leading-relaxed font-light">
                This helps us understand your structural boundaries.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl px-2">
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = propertyType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setPropertyType(type.id);
                        setTimeout(handleNext, 400);
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
                      <span className="font-serif text-lg font-medium text-[#1a1a1a]">{type.id}</span>
                      <span className="text-xs text-[#5a5a5a] leading-relaxed font-light">{type.desc}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#1a1a1a] mb-3 tracking-tight">
                Roughly, what is the carpet area?
              </h2>
              <p className="text-sm md:text-base text-[#5a5a5a] mb-12 leading-relaxed font-light">
                We use this to calculate spatial density and functional limits.
              </p>
              
              <div className="w-full max-w-xl flex flex-col items-center gap-8 px-4">
                <div className="text-5xl md:text-6xl font-light text-[#1a1a1a] flex items-baseline gap-2 font-serif">
                  {carpetArea} <span className="text-xl md:text-2xl text-[#70593a]/60 font-sans font-medium">sqft</span>
                </div>
                
                <input 
                  type="range" 
                  min="300" 
                  max="5000" 
                  step="50"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(parseInt(e.target.value))}
                  aria-label="Carpet area in square feet"
                  className="w-full accent-[#70593a] h-2 bg-[#e8e4dd] rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex justify-between w-full text-[10px] font-mono font-bold tracking-widest text-[#70593a]/60 px-1.5 uppercase">
                  <span>Compact</span>
                  <span>Expansive</span>
                </div>

                <button 
                  type="button"
                  onClick={handleNext}
                  className="mt-10 px-10 py-4 bg-[#70593a] text-white hover:bg-[#8b6f47] font-semibold text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#1a1a1a] mb-3 tracking-tight">
                What level of transformation are you planning?
              </h2>
              <p className="text-sm md:text-base text-[#5a5a5a] mb-10 leading-relaxed font-light max-w-lg">
                This forms the "Hard Lock" for our suggestions. We won't suggest knocking down walls if you only want cosmetic changes.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl px-2">
                {scopes.map((scope) => {
                  const Icon = scope.icon;
                  const isSelected = projectScope === scope.id;
                  return (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => {
                        setProjectScope(scope.id);
                        setTimeout(() => onComplete({ propertyType, carpetArea, projectScope: scope.id }), 500);
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
                      <span className="font-serif text-lg font-medium text-[#1a1a1a]">{scope.id}</span>
                      <span className="text-xs text-[#5a5a5a] leading-relaxed font-light">{scope.desc}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
