import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Brain, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import { Card, CardContent } from '@/components/ui/primitives/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/primitives/tabs';

import WorkspaceCockpit from './WorkspaceCockpit';
import WorkspaceEvidencePanel from './WorkspaceEvidencePanel';
import WorkspaceDuringMeeting from './WorkspaceDuringMeeting';
import WorkspaceAfterMeeting from './WorkspaceAfterMeeting';
import { WorkspaceDecisionTimeline } from './WorkspaceDecisionTimeline';
import { generateConversationStrategy } from '@/addons/calculators/components/data/engines/conversation-strategy';
import { generateRiskCards } from '@/addons/calculators/components/data/engines/risk-cards';

export default function AdminLeadWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [meetingState, setMeetingState] = useState<'before' | 'during' | 'after'>('before');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  const [sessionId, setSessionId] = useState(() => {
    const key = `active_session_${id}`;
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(key, sid);
    }
    return sid;
  });

  const handleSessionComplete = () => {
    const key = `active_session_${id}`;
    localStorage.removeItem(key);
    setSessionId(crypto.randomUUID());
  };

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead-workspace', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const strategyBlocks = useMemo(() => lead ? generateConversationStrategy(lead as any) : [], [lead]);
  const riskCards = useMemo(() => lead ? generateRiskCards(lead as any) : [], [lead]);

  if (isLoading) {
    return <div className="p-8 text-[hsl(var(--admin-text-muted))]">Loading workspace…</div>;
  }

  if (!lead) {
    return <div className="p-8 text-red-500">Lead not found.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--admin-background))] -mx-4 -mt-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--admin-border))] shrink-0 bg-[hsl(var(--admin-background))]">
        <div className="flex items-center gap-4">
          <Link to="/admin/crm/leads">
            <Button variant="ghost" size="icon" className="text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[hsl(var(--admin-text))] flex items-center gap-2">
            <Brain className="w-5 h-5 text-[hsl(var(--admin-primary))]" />
            Project Intelligence Workspace
          </h1>
        </div>
        
        <Tabs value={meetingState} onValueChange={(v) => setMeetingState(v as any)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3 bg-[hsl(var(--admin-card))]">
            <TabsTrigger value="before" className="data-[state=active]:bg-[hsl(var(--admin-primary))] data-[state=active]:text-white">Before Meeting</TabsTrigger>
            <TabsTrigger value="during" className="data-[state=active]:bg-[hsl(var(--admin-primary))] data-[state=active]:text-white">During</TabsTrigger>
            <TabsTrigger value="after" className="data-[state=active]:bg-[hsl(var(--admin-primary))] data-[state=active]:text-white">After</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 3-Pane Layout */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Rail - 20% */}
        <div className="w-[20%] overflow-y-auto pr-2 custom-scrollbar">
          <WorkspaceCockpit lead={lead} />
        </div>

        {/* Center Panel - 55% */}
        <div className="w-[55%] overflow-y-auto px-4 custom-scrollbar flex flex-col gap-6 pb-24">
          {meetingState === 'before' && (
            <>
              {/* Executive Summary */}
              <div>
                <h2 className="text-lg font-bold text-[hsl(var(--admin-text))] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[hsl(var(--admin-primary))]" />
                  Executive Summary
                </h2>
                <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                  <CardContent className="p-4 text-sm text-[hsl(var(--admin-text))] whitespace-pre-wrap leading-relaxed">
                    Based on the discovery signals, {lead.name} exhibits traits of a {(lead as any).discovery_archetype?.replace('_', ' ') || 'standard'} client.
                    Their priority is achieving a functional and aesthetic space within their constraints.
                  </CardContent>
                </Card>
              </div>

              {/* Conversation Strategy */}
              <div>
                <h2 className="text-lg font-bold text-[hsl(var(--admin-text))] mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  Conversation Strategy
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
                          <span className="text-xs text-[hsl(var(--admin-text-muted))]">Confidence: {block.confidence}</span>
                        </div>
                        <p className="text-sm text-[hsl(var(--admin-text))] font-medium">{block.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {strategyBlocks.length === 0 && (
                    <div className="text-sm text-[hsl(var(--admin-text-muted))]">No strategy data available.</div>
                  )}
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h2 className="text-lg font-bold text-[hsl(var(--admin-text))] mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  Risk Assessment
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
                          <span className="text-xs text-[hsl(var(--admin-text-muted))]">Confidence: {card.confidence}</span>
                        </div>
                        <p className="text-sm text-[hsl(var(--admin-text))]">{card.recommendedResponse}</p>
                        <div className="pt-2 mt-2 border-t border-[hsl(var(--admin-border))] flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Success: {card.successIndicator}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {riskCards.length === 0 && (
                    <div className="text-sm text-[hsl(var(--admin-text-muted))]">No high risks detected.</div>
                  )}
                </div>
              </div>
              
              <WorkspaceDecisionTimeline leadId={lead.id} />
            </>
          )}

          {meetingState === 'during' && (
            <WorkspaceDuringMeeting 
              leadId={lead.id}
              sessionId={sessionId}
              strategyBlocks={strategyBlocks}
              riskCards={riskCards}
              activeBlockId={activeBlockId}
              setActiveBlockId={setActiveBlockId}
            />
          )}

          {meetingState === 'after' && (
            <WorkspaceAfterMeeting leadId={lead.id} sessionId={sessionId} onSessionComplete={handleSessionComplete} />
          )}
        </div>

        {/* Right Rail - 25% */}
        <div className="w-[25%] overflow-y-auto pl-2 custom-scrollbar">
          <WorkspaceEvidencePanel _lead={lead} activeBlockId={activeBlockId} strategyBlocks={strategyBlocks} riskCards={riskCards} />
        </div>
      </div>
    </div>
  );
}
