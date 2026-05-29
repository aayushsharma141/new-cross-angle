import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users, Dog, Home as HomeIcon, ChefHat, Timer, Wine, CalendarDays, CalendarHeart, CalendarClock } from 'lucide-react';
import type { UserSignals } from '@/types/discovery';

interface Props {
  onComplete: (data: Pick<UserSignals, 'familyStructure' | 'cookingRole' | 'hostingFrequency'>) => void;
}

export default function LifestyleReflection({ onComplete }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [familyStructure, setFamilyStructure] = useState<UserSignals['familyStructure']>();
  const [cookingRole, setCookingRole] = useState<UserSignals['cookingRole']>();
  const [hostingFrequency, setHostingFrequency] = useState<UserSignals['hostingFrequency']>();

  const familyTypes = [
    { id: 'Nuclear', icon: Users, desc: 'Immediate family only' },
    { id: 'Joint', icon: HomeIcon, desc: 'Multi-generational living' },
    { id: 'Pets', icon: Dog, desc: 'Furry companions dictate the space' },
    { id: 'Elderly', icon: Users, desc: 'Requires accessible, low-friction design' }
  ] as const;

  const cookingRoles = [
    { id: 'Daily Ritual', icon: ChefHat, desc: 'Heavy cooking, multiple meals a day' },
    { id: 'Quick Utility', icon: Timer, desc: 'Fast prep, minimal mess' },
    { id: 'Hosting', icon: Wine, desc: 'Open kitchen, conversational cooking' }
  ] as const;

  const hostingFrequencies = [
    { id: 'Weekly', icon: CalendarDays, desc: 'Constant flow of friends and family' },
    { id: 'Monthly', icon: CalendarHeart, desc: 'Occasional dinners or get-togethers' },
    { id: 'Rarely', icon: CalendarClock, desc: 'Home is a private sanctuary' }
  ] as const;

  const handleNext = () => {
    if (step === 2) {
      onComplete({ familyStructure, cookingRole, hostingFrequency });
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
          {/* STEP 0: Family Structure */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#1a1a1a] mb-3 tracking-tight">
                Who lives here?
              </h2>
              <p className="text-sm md:text-base text-[#5a5a5a] mb-10 leading-relaxed font-light">
                This dictates material durability and safety requirements.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl px-2">
                {familyTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = familyStructure === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setFamilyStructure(type.id);
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

          {/* STEP 1: Cooking Role */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#1a1a1a] mb-3 tracking-tight">
                What is the role of the kitchen?
              </h2>
              <p className="text-sm md:text-base text-[#5a5a5a] mb-10 leading-relaxed font-light">
                We use this to prevent layout conflicts (e.g. open kitchens with heavy cooking).
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl px-2">
                {cookingRoles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = cookingRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setCookingRole(role.id);
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
                      <span className="font-serif text-lg font-medium text-[#1a1a1a]">{role.id}</span>
                      <span className="text-xs text-[#5a5a5a] leading-relaxed font-light">{role.desc}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Hosting Frequency */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#1a1a1a] mb-3 tracking-tight">
                How often do you host?
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
                        setTimeout(() => onComplete({ familyStructure, cookingRole, hostingFrequency: freq.id }), 500);
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
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
