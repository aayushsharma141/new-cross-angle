import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/primitives/card';
import { Button } from '@/components/ui/primitives/button';
import { Input } from '@/components/ui/primitives/input';
import { Textarea } from '@/components/ui/primitives/textarea';
import { Brain, ShieldAlert, Check, X, Edit2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCreateDecisionEvent } from '@/services/decision-events';
import { StrategyBlock } from '@/addons/calculators/components/data/engines/conversation-strategy';
import { RiskCard } from '@/addons/calculators/components/data/engines/risk-cards';

interface WorkspaceDuringMeetingProps {
  leadId: string;
  sessionId: string;
  strategyBlocks: StrategyBlock[];
  riskCards: RiskCard[];
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
}

export default function WorkspaceDuringMeeting({
  leadId,
  sessionId,
  strategyBlocks,
  riskCards,
  activeBlockId,
  setActiveBlockId
}: WorkspaceDuringMeetingProps) {
  const { mutate: createEvent, isPending } = useCreateDecisionEvent();
  const [activeReasonInput, setActiveReasonInput] = useState<{ id: string, decision: 'Accept'|'Modify'|'Reject' } | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [liveNotes, setLiveNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDecision = (id: string, decision: 'Accept'|'Modify'|'Reject') => {
    setActiveReasonInput({ id, decision });
    setReasonText('');
    setErrorMsg(null);
  };

  const submitDecision = (id: string, textContext: string) => {
    if (!activeReasonInput || isPending) return;
    
    const strategy = strategyBlocks.find(b => b.id === id);
    const risk = riskCards.find(r => r.id === id);
    const recommendationSnapshot = strategy || risk;

    setErrorMsg(null);

    createEvent({
      lead_id: leadId,
      session_id: sessionId,
      event_type: 'Meeting',
      payload: {
        type: 'recommendation_decision',
        recommendationId: id,
        originalContext: textContext,
        decision: activeReasonInput.decision,
        reason: reasonText,
        timestamp: new Date().toISOString(),
        recommendationSnapshot,
        engineVersion: '1.0' // Placeholder for engine version tracking
      }
    }, {
      onSuccess: () => {
        setActiveReasonInput(null);
        setReasonText('');
        setErrorMsg(null);
      },
      onError: (err: Error) => {
        setErrorMsg(err.message || 'Failed to save decision. Please try again.');
      }
    });
  };

  const renderActionButtons = (id: string, textContext: string) => {
    if (activeReasonInput?.id === id) {
      return (
        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[hsl(var(--admin-border))]">
          <Input 
            placeholder={`Reason for ${activeReasonInput.decision.toLowerCase()}ing... (optional)`}
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            disabled={isPending}
            className="bg-[hsl(var(--admin-background))] text-sm h-8"
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitDecision(id, textContext);
            }}
          />
          {errorMsg && (
            <div className="text-xs text-red-500 font-semibold">{errorMsg}</div>
          )}
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={isPending} onClick={() => { setActiveReasonInput(null); setErrorMsg(null); }}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs" disabled={isPending} onClick={() => submitDecision(id, textContext)}>
              {isPending ? 'Saving...' : 'Save Decision'}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[hsl(var(--admin-border))]">
        <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1 border-green-500/30 text-green-500 hover:bg-green-500/10" onClick={(e) => { e.stopPropagation(); handleDecision(id, 'Accept'); }}>
          <Check className="w-3 h-3" /> Accept
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10" onClick={(e) => { e.stopPropagation(); handleDecision(id, 'Modify'); }}>
          <Edit2 className="w-3 h-3" /> Modify
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1 border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); handleDecision(id, 'Reject'); }}>
          <X className="w-3 h-3" /> Reject
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 h-48">
        <div className="flex-1 flex flex-col gap-2">
          <h2 className="text-sm font-bold text-[hsl(var(--admin-text))] flex items-center gap-2">Live Notes</h2>
          <Textarea 
            placeholder="Capture live meeting notes here…" 
            className="flex-1 resize-none bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
            value={liveNotes}
            onChange={(e) => setLiveNotes(e.target.value)}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-[hsl(var(--admin-text))] mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          Active Strategies
        </h2>
        <div className="flex flex-col gap-3">
          {strategyBlocks.map(block => (
            <Card 
              key={block.id} 
              className={`cursor-pointer transition-colors border ${activeBlockId === block.id ? 'border-blue-500 bg-blue-500/10' : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] hover:border-[hsl(var(--admin-primary))]/50'}`}
              onClick={() => setActiveBlockId(block.id)}
            >
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-blue-400 tracking-wider">{block.type}</span>
                </div>
                <p className="text-sm text-[hsl(var(--admin-text))] font-medium">{block.content}</p>
                {renderActionButtons(block.id, block.content)}
              </CardContent>
            </Card>
          ))}
          {strategyBlocks.length === 0 && (
            <div className="text-sm text-[hsl(var(--admin-text-muted))]">No active strategies available.</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-[hsl(var(--admin-text))] mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          Active Risks
        </h2>
        <div className="flex flex-col gap-3">
          {riskCards.map(card => (
            <Card 
              key={card.id} 
              className={`cursor-pointer transition-colors border ${activeBlockId === card.id ? 'border-red-500 bg-red-500/10' : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] hover:border-red-500/50'}`}
              onClick={() => setActiveBlockId(card.id)}
            >
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {card.headline}
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--admin-text))]">{card.recommendedResponse}</p>
                <div className="pt-2 border-t border-[hsl(var(--admin-border))] flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Success: {card.successIndicator}
                </div>
                {renderActionButtons(card.id, card.recommendedResponse)}
              </CardContent>
            </Card>
          ))}
          {riskCards.length === 0 && (
            <div className="text-sm text-[hsl(var(--admin-text-muted))]">No active risks detected.</div>
          )}
        </div>
      </div>
    </div>
  );
}
