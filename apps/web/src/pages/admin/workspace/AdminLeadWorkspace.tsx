import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Brain, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import { Surface } from "@/components/primitives/foundation";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/primitives/tabs';
import { useAnalytics } from '@/analytics/AnalyticsProvider';
import { recordLearningEvent } from '@/analytics/track';
import { useCreateCommitmentRevision } from '@/services/workspace-commitments';

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
  const [isLocking, setIsLocking] = useState(false);
  
  const [sessionId, setSessionId] = useState(() => {
    const key = `active_session_${id}`;
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(key, sid);
    }
    return sid;
  });

  const { mutateAsync: createCommitmentRevision } = useCreateCommitmentRevision();

  const handleSessionComplete = () => {
    const key = `active_session_${id}`;
    localStorage.removeItem(key);
    setSessionId(crypto.randomUUID());
  };

  const analytics = useAnalytics();
  const hasTrackedOpen = useRef(false);
  const roomEntryTime = useRef(Date.now());
  const sessionStartTime = useRef(Date.now());
  
  const handleRoomChange = (v: string) => {
    const newState = v as 'before' | 'during' | 'after';
    if (lead && newState !== meetingState) {
      const now = Date.now();
      const timeSpent = now - roomEntryTime.current;
      analytics.track("workspace.room.left", { leadId: lead.id, room: meetingState, timeSpentMs: timeSpent });
      analytics.track("workspace.room.entered", { leadId: lead.id, room: newState });
      roomEntryTime.current = now;
    }
    setMeetingState(newState);
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

  const strategyBlocks = useMemo(() => lead ? generateConversationStrategy(lead) : [], [lead]);
  const riskCards = useMemo(() => lead ? generateRiskCards(lead) : [], [lead]);

  useEffect(() => {
    if (lead && !hasTrackedOpen.current) {
      hasTrackedOpen.current = true;
      analytics.track("workspace.opened", { leadId: lead.id });
      analytics.track("workspace.room.entered", { leadId: lead.id, room: meetingState });
      roomEntryTime.current = Date.now();
      sessionStartTime.current = Date.now();
    }
  }, [lead, analytics, meetingState]);

  const handleLockCommitment = async () => {
    if (!lead || isLocking) return;
    setIsLocking(true);
    
    const timeToDecisionMs = Date.now() - sessionStartTime.current;
    
    try {
      // 1. Create the revision in Postgres
      const revision = await createCommitmentRevision({
        lead_id: lead.id,
        session_id: sessionId,
        is_locked: true,
        decision_genome: { nodes: 12, strategy: "Generated" }, // Placeholder for actual genome
        project_snapshot: { budget: 15000, constraints: "Tight" }, // Placeholder for actual snapshot
        narrative_brief: "Locked decision for " + lead.name,
        workspace_state: { room: meetingState },
      });

      // 2. Track the analytics event
      recordLearningEvent(analytics, "workspace.commitment.locked", {
        leadId: lead.id,
        commitmentId: revision.commitment_id,
        revisionId: revision.id,
        timeToDecisionMs: timeToDecisionMs,
        genomeVersion: revision.genome_version || "1.0",
        workspaceVersion: "1.0",
        activeRoom: meetingState,
        selectedEvidence: ["Market Comparable 1", "Past Project A"], // Mocked
        selectedConstraints: ["Budget", "Timeline"], // Mocked
        selectedPriorities: ["Aesthetics"], // Mocked
        designerConfidence: 85, // Mocked 
        confidenceDrivers: ["Evidence", "Client Constraints"], // Mocked
        evidenceAvailable: 10,
        evidenceViewed: 4,
        evidenceUsed: 2,
        dqiAlgorithmVersion: "1.0",
        dqiStage: "provisional",
        dqiConfidence: "MEDIUM" // Default for now
      });
      
    } catch (err) {
      console.error("Failed to lock commitment", err);
    } finally {
      setIsLocking(false);
    }
  };

  const _handleUnlockCommitment = async (commitmentId: string, revisionId: string) => {
    if (!lead) return;
    analytics.track("workspace.commitment.unlocked", { leadId: lead.id, commitmentId, revisionId });
    // In real implementation: update DB record
  };

  const _handleArchiveCommitment = async (commitmentId: string) => {
    if (!lead) return;
    analytics.track("workspace.commitment.archived", { leadId: lead.id, commitmentId });
    // In real implementation: update DB record
  };

  if (isLoading) {
    return <div className="p-8 text-[var(--s-text-muted)]">Loading workspace...</div>;
  }

  if (!lead) {
    return <div className="p-8 text-red-500">Lead not found.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)] -mx-4 -mt-4" data-environment="workspace">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--s-border-subtle)] shrink-0 bg-[var(--s-canvas-primary)]">
        <div className="flex items-center gap-4">
          <Link to="/admin/crm/leads">
            <Button variant="ghost" size="icon" className="text-[var(--s-text-muted)] hover:text-[var(--s-text-primary)]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[var(--s-text-primary)] flex items-center gap-2">
            <Brain className="w-5 h-5 text-[var(--s-accent-primary)]" />
            Project Intelligence Workspace
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs value={meetingState} onValueChange={handleRoomChange} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3 bg-[var(--s-surface-raised)] border border-[var(--s-border-subtle)]">
              <TabsTrigger value="before" className="data-[state=active]:bg-[var(--s-accent-primary)] data-[state=active]:text-white">Before Meeting</TabsTrigger>
              <TabsTrigger value="during" className="data-[state=active]:bg-[var(--s-accent-primary)] data-[state=active]:text-white">During</TabsTrigger>
              <TabsTrigger value="after" className="data-[state=active]:bg-[var(--s-accent-primary)] data-[state=active]:text-white">After</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            onClick={handleLockCommitment} 
            disabled={isLocking}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Lock className="w-4 h-4" />
            {isLocking ? "Locking..." : "Lock Commitment"}
          </Button>
        </div>
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
                <h2 className="text-lg font-bold text-[var(--s-text-primary)] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--s-accent-primary)]" />
                  Executive Summary
                </h2>
                <Surface variant="primary" radius="lg" border shadow="sm" className="bg-[var(--s-surface-raised)] border-[var(--s-border-subtle)]">
                  <div className="p-6 pt-0 p-4 text-sm text-[var(--s-text-primary)] whitespace-pre-wrap leading-relaxed">
                    Based on the discovery signals, {lead.name} exhibits traits of a {lead.discovery_archetype?.replace('_', ' ') || 'standard'} client.
                    Their priority is achieving a functional and aesthetic space within their constraints.
                  </div>
                </Surface>
              </div>

              {/* Conversation Strategy */}
              <div>
                <h2 className="text-lg font-bold text-[var(--s-text-primary)] mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  Conversation Strategy
                </h2>
                <div className="flex flex-col gap-3">
                  {strategyBlocks.map(block => (
                    <Surface variant="primary" radius="lg" border shadow="sm" 
                      key={block.id} 
                      className={`cursor-pointer transition-colors border ${activeBlockId === block.id ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--s-border-subtle)] bg-[var(--s-surface-raised)] hover:border-[var(--s-accent-primary)]'}`}
                      onClick={() => setActiveBlockId(block.id)}
                    >
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase text-blue-400 tracking-wider">{block.type}</span>
                          <span className="text-xs text-[var(--s-text-muted)]">Confidence: {block.confidence}</span>
                        </div>
                        <p className="text-sm text-[var(--s-text-primary)] font-medium">{block.content}</p>
                      </div>
                    </Surface>
                  ))}
                  {strategyBlocks.length === 0 && (
                    <div className="text-sm text-[var(--s-text-muted)]">No strategy data available.</div>
                  )}
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h2 className="text-lg font-bold text-[var(--s-text-primary)] mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  Risk Assessment
                </h2>
                <div className="flex flex-col gap-3">
                  {riskCards.map(card => (
                    <Surface variant="primary" radius="lg" border shadow="sm" 
                      key={card.id} 
                      className={`cursor-pointer transition-colors border ${activeBlockId === card.id ? 'border-red-500 bg-red-500/10' : 'border-[var(--s-border-subtle)] bg-[var(--s-surface-raised)] hover:border-red-500/50'}`}
                      onClick={() => setActiveBlockId(card.id)}
                    >
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {card.headline}
                          </span>
                          <span className="text-xs text-[var(--s-text-muted)]">Confidence: {card.confidence}</span>
                        </div>
                        <p className="text-sm text-[var(--s-text-primary)]">{card.recommendedResponse}</p>
                        <div className="pt-2 mt-2 border-t border-[var(--s-border-subtle)] flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Success: {card.successIndicator}
                        </div>
                      </div>
                    </Surface>
                  ))}
                  {riskCards.length === 0 && (
                    <div className="text-sm text-[var(--s-text-muted)]">No high risks detected.</div>
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


