import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, Utensils, Bath, Monitor, Coffee, Briefcase, Plus, AlertTriangle, ArrowRight, Heart, ChevronDown } from 'lucide-react';
import type { UserSignals, RoomEmotionalWeight } from '@/types/discovery';

interface Props {
  signals: UserSignals;
  onComplete: (data: {
    roomPriorities: Record<string, 'Must-Have' | 'Nice-to-Have'>;
    roomEmotionalWeights?: Record<string, RoomEmotionalWeight>;
    roomConflictResolution?: 'Multi-use' | 'Reduce Density';
  }) => void;
}

const ROOM_OPTIONS = [
  { id: 'Master Bedroom', icon: Bed, avgSize: 200 },
  { id: 'Living Room', icon: Coffee, avgSize: 250 },
  { id: 'Kitchen', icon: Utensils, avgSize: 150 },
  { id: 'Guest Room', icon: Bed, avgSize: 150 },
  { id: 'Home Office', icon: Briefcase, avgSize: 100 },
  { id: 'Entertainment Room', icon: Monitor, avgSize: 200 },
  { id: 'Master Bath', icon: Bath, avgSize: 80 },
  { id: 'Kids Room', icon: Plus, avgSize: 150 },
];

const EMOTIONAL_WEIGHT_OPTIONS: { id: RoomEmotionalWeight; label: string; desc: string }[] = [
  { id: 'emotional-restoration', label: 'My sanctuary', desc: 'Where I decompress and restore energy' },
  { id: 'social-identity', label: 'Social expression', desc: 'Where I show who I am to others' },
  { id: 'family-necessity', label: 'Family need', desc: 'A practical necessity for the household' },
  { id: 'daily-utility', label: 'Everyday use', desc: 'Functional — used daily, not emotionally charged' },
  { id: 'cultural-value', label: 'Cultural importance', desc: 'Traditional or family expectation' },
  { id: 'aspiration', label: 'Future aspiration', desc: 'Not essential now, but meaningful to have' },
];

export default function RoomPriority({ signals, onComplete }: Props) {
  const [priorities, setPriorities] = useState<Record<string, 'Must-Have' | 'Nice-to-Have'>>({});
  const [emotionalWeights, setEmotionalWeights] = useState<Record<string, RoomEmotionalWeight>>({});
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [conflictMode, setConflictMode] = useState<boolean>(false);
  const [resolution, setResolution] = useState<'Multi-use' | 'Reduce Density'>();

  const propertyArea = signals.carpetArea || 1000;

  const toggleRoom = (id: string) => {
    setPriorities(prev => {
      const curr = prev[id];
      if (!curr) return { ...prev, [id]: 'Must-Have' };
      if (curr === 'Must-Have') return { ...prev, [id]: 'Nice-to-Have' };
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const setWeight = (room: string, weight: RoomEmotionalWeight) => {
    setEmotionalWeights(prev => ({ ...prev, [room]: weight }));
    setExpandedRoom(null);
  };

  const handleNext = () => {
    // Conflict engine
    let requiredArea = 0;
    Object.entries(priorities).forEach(([room, priority]) => {
      if (priority === 'Must-Have') {
        const roomDef = ROOM_OPTIONS.find(r => r.id === room);
        if (roomDef) requiredArea += roomDef.avgSize;
      }
    });
    requiredArea = requiredArea * 1.3; // 30% circulation buffer

    if (requiredArea > propertyArea && !conflictMode) {
      setConflictMode(true);
    } else {
      onComplete({
        roomPriorities: priorities,
        roomEmotionalWeights: emotionalWeights,
        roomConflictResolution: resolution,
      });
    }
  };

  // ── Conflict Mode ──────────────────────────────────────────────────────
  if (conflictMode) {
    return (
      <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white border border-[#e8e4dd] p-8 rounded-3xl text-center shadow-lg"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#70593a]/10 flex items-center justify-center text-[#70593a]">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
          <h2 className="font-serif text-3xl font-light text-[#1a1a1a] mb-4">Spatial Conflict Detected</h2>
          <p className="text-[#5a5a5a] mb-8 leading-relaxed max-w-lg mx-auto">
            Your "Must-Have" rooms require more space than your stated {propertyArea} sq ft.
            How should we adapt the design?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setResolution('Multi-use')}
              className={`p-6 border rounded-2xl text-left transition-all focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none ${
                resolution === 'Multi-use'
                  ? 'border-[#70593a] bg-[#70593a]/5 text-[#1a1a1a]'
                  : 'border-[#e8e4dd] bg-white text-[#1a1a1a] hover:border-[#1a1a1a]/30'
              }`}
            >
              <h3 className="font-medium mb-2">Create Multi-use Spaces</h3>
              <p className="text-sm text-[#5a5a5a]">e.g. Guest room doubles as home office.</p>
            </button>
            <button
              type="button"
              onClick={() => setResolution('Reduce Density')}
              className={`p-6 border rounded-2xl text-left transition-all focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none ${
                resolution === 'Reduce Density'
                  ? 'border-[#70593a] bg-[#70593a]/5 text-[#1a1a1a]'
                  : 'border-[#e8e4dd] bg-white text-[#1a1a1a] hover:border-[#1a1a1a]/30'
              }`}
            >
              <h3 className="font-medium mb-2">Reduce Spatial Density</h3>
              <p className="text-sm text-[#5a5a5a]">Remove a 'must-have' to keep spaces open and breathable.</p>
            </button>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!resolution}
            className="mt-10 px-8 py-3 bg-[#70593a] text-white font-medium rounded-full disabled:opacity-50 disabled:bg-[#e8e4dd] disabled:text-[#a0a0a0] hover:bg-[#5e4b31] transition-all inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none"
          >
            Confirm Adaptation
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Main Room Allocation ────────────────────────────────────────────────
  const mustHaveRooms = Object.entries(priorities).filter(([, p]) => p === 'Must-Have').map(([r]) => r);

  return (
    <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-start px-4 pt-8 pb-16">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-5xl font-light text-[#1a1a1a] mb-3 text-center"
        >
          Space Allocation
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[#5a5a5a] mb-2 text-center max-w-xl text-sm font-light"
        >
          Tap once for <strong className="text-[#1a1a1a] font-medium">Must-Have</strong>. Tap twice for <strong className="text-[#1a1a1a] font-medium">Nice-to-Have</strong>.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[#8b6f47] mb-10 text-center max-w-xl text-xs flex items-center gap-1.5 justify-center font-medium"
        >
          <Heart className="w-3 h-3 fill-current" />
          For Must-Haves, we'll ask <em>why</em> it matters — this shapes negotiation intelligence
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
          {ROOM_OPTIONS.map(room => {
            const Icon = room.icon;
            const state = priorities[room.id];
            const weight = emotionalWeights[room.id];
            const isMustHave = state === 'Must-Have';

            return (
              <div key={room.id} className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => toggleRoom(room.id)}
                  className={`
                    relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none
                    ${!state && 'border-[#e8e4dd] bg-white text-[#1a1a1a] hover:bg-[#faf8f5] hover:border-[#1a1a1a]/30'}
                    ${isMustHave && 'border-[#70593a] bg-[#70593a]/10 text-[#1a1a1a] font-semibold'}
                    ${state === 'Nice-to-Have' && 'border-blue-300 bg-blue-50/50 text-[#1a1a1a]'}
                  `}
                >
                  <Icon className={`w-7 h-7 mb-2.5 ${isMustHave ? 'text-[#70593a]' : state === 'Nice-to-Have' ? 'text-blue-500' : 'text-[#8c8c8c]'}`} />
                  <span className="font-medium text-xs text-center leading-tight">{room.id}</span>
                  {state && (
                    <span className={`text-[9px] mt-2 uppercase tracking-wider font-bold ${isMustHave ? 'text-[#70593a]' : 'text-blue-600'}`}>
                      {state}
                    </span>
                  )}
                </button>

                {/* Emotional Weight Selector for Must-Haves */}
                <AnimatePresence>
                  {isMustHave && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#70593a]/5 border border-[#70593a]/20 text-[10px] text-[#70593a] hover:border-[#70593a]/40 transition-colors focus-visible:ring-1 focus-visible:ring-[#8b6f47] focus-visible:outline-none"
                      >
                        <span className="truncate">{weight ? EMOTIONAL_WEIGHT_OPTIONS.find(o => o.id === weight)?.label : 'Why does this matter?'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform shrink-0 ${expandedRoom === room.id ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedRoom === room.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="mt-1 bg-white border border-[#e8e4dd] rounded-xl overflow-hidden z-50 relative shadow-xl max-h-48 overflow-y-auto"
                          >
                            {EMOTIONAL_WEIGHT_OPTIONS.map(opt => (
                              <button
                                type="button"
                                key={opt.id}
                                onClick={() => setWeight(room.id, opt.id)}
                                className="w-full text-left px-3 py-2 hover:bg-[#faf8f5] transition-colors border-b border-[#e8e4dd]/50 last:border-0 focus-visible:bg-[#faf8f5] focus-visible:outline-none"
                              >
                                <span className="text-[#1a1a1a] text-[11px] font-medium block">{opt.label}</span>
                                <span className="text-[#5a5a5a] text-[9px]">{opt.desc}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Negotiation intelligence preview */}
        <AnimatePresence>
          {mustHaveRooms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 w-full max-w-2xl p-5 rounded-2xl border border-[#70593a]/15 bg-[#faf8f5] shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8b6f47] mb-3 font-mono font-bold">
                Negotiation Intelligence
              </p>
              <div className="flex flex-wrap gap-2">
                {mustHaveRooms.map(r => {
                  const w = emotionalWeights[r];
                  const wLabel = EMOTIONAL_WEIGHT_OPTIONS.find(o => o.id === w)?.label;
                  return (
                    <span key={r} className="px-3 py-1 text-[10px] rounded-full border border-[#70593a]/25 bg-white text-[#1a1a1a] font-medium">
                      {r}{wLabel ? ` · ${wLabel}` : ''}
                    </span>
                  );
                })}
              </div>
              <p className="text-[#5a5a5a] text-[10px] mt-3 font-light">
                Emotional weights guide what is negotiable if space forces a trade-off.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleNext}
          disabled={Object.keys(priorities).length === 0}
          className="mt-10 px-8 py-3 bg-[#70593a] text-white font-medium rounded-full disabled:opacity-50 disabled:bg-[#e8e4dd] disabled:text-[#a0a0a0] hover:bg-[#5e4b31] transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none"
        >
          Finalize Priorities
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
