import { useWorkspaceCommitments, WorkspaceCommitmentRevision } from '@/services/workspace-commitments';
import { Surface } from "@/components/primitives/foundation";
import { History, GitCommit, GitBranch, Lock, Brain, FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { computeWorkspaceDQI } from '@/services/learning-metrics';

export function WorkspaceDecisionTimeline({ leadId }: { leadId: string }) {
  const { data: revisions = [], isLoading } = useWorkspaceCommitments(leadId);

  if (isLoading) return <div className="text-sm text-[var(--s-text-muted)]">Loading decision ledger...</div>;
  if (revisions.length === 0) return (
    <div className="mt-12 pt-8 border-t border-[var(--s-border-subtle)]">
      <h2 className="text-xl font-bold text-[var(--s-text-primary)] mb-6 flex items-center gap-2">
        <History className="w-5 h-5 text-purple-400" />
        Decision Ledger
      </h2>
      <p className="text-sm text-[var(--s-text-muted)]">No commitments recorded yet.</p>
    </div>
  );

  // Group by commitment_id
  const commitments = revisions.reduce((acc, rev) => {
    if (!acc[rev.commitment_id]) acc[rev.commitment_id] = [];
    acc[rev.commitment_id].push(rev);
    return acc;
  }, {} as Record<string, WorkspaceCommitmentRevision[]>);

  return (
    <div className="mt-12 pt-8 border-t border-[var(--s-border-subtle)]">
      <h2 className="text-xl font-bold text-[var(--s-text-primary)] mb-6 flex items-center gap-2">
        <History className="w-5 h-5 text-purple-400" />
        Decision Ledger
      </h2>

      <div className="flex flex-col gap-10">
        {Object.entries(commitments).map(([commitmentId, revs], index) => {
          // Sort chronologically
          const sortedRevs = [...revs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          return (
            <div key={commitmentId} className="flex flex-col gap-4 relative">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--s-text-muted)]">
                <div className="h-px flex-1 bg-[hsl(var(--admin-border))]"></div>
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-blue-400" />
                  Commitment Thread {index + 1}
                </div>
                <div className="h-px flex-1 bg-[hsl(var(--admin-border))]"></div>
              </div>

              <div className="relative pl-6 ml-2 border-l-2 border-[var(--s-border-subtle)] flex flex-col gap-6">
                {sortedRevs.map((rev, revIdx) => {
                  const isLocked = rev.is_locked;
                  
                  // In a real scenario, these would be pulled from the revision's analytics payload
                  const dqi = isLocked ? computeWorkspaceDQI({
                    evidenceAvailable: 10,
                    evidenceUsed: 4,
                    confidenceScore: 85,
                    explainabilityScore: 70
                  }) : null;
                  
                  return (
                    <div key={rev.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-4 bg-[var(--s-canvas-primary)] rounded-full p-1 border-2 border-[var(--s-border-subtle)]">
                        {isLocked ? (
                          <Lock className="w-3 h-3 text-green-500" />
                        ) : (
                          <GitCommit className="w-3 h-3 text-[var(--s-text-muted)]" />
                        )}
                      </div>
                      
                      <Surface variant="primary" radius="lg" border shadow="sm" className={`bg-[var(--s-surface-raised)] border-[var(--s-border-subtle)] ${isLocked ? 'ring-1 ring-green-500/30' : ''}`}>
                        <div className="p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${isLocked ? 'text-green-400' : 'text-blue-400'}`}>
                                {isLocked ? 'Locked Commitment' : `Revision ${revIdx + 1}`}
                              </span>
                              {rev.divergence_score !== null && (
                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-mono">
                                  Divergence: {rev.divergence_score}%
                                </span>
                              )}
                              {dqi !== null && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    DQI: {dqi.value} ({dqi.stage})
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                                    dqi.confidence === 'HIGH' ? 'bg-green-500/20 text-green-400' :
                                    dqi.confidence === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    Confidence: {dqi.confidence}
                                  </span>
                                  <span className="text-xs font-mono text-[var(--s-text-muted)]">
                                    v{dqi.version}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-mono text-[var(--s-text-muted)]">
                              {format(new Date(rev.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          
                          <p className="text-sm text-[var(--s-text-primary)]">
                            {rev.narrative_brief || "No brief generated."}
                          </p>
                          
                          {/* Snapshots Summary */}
                          <div className="grid grid-cols-2 gap-4 mt-2 pt-3 border-t border-[var(--s-border-subtle)]">
                            <div>
                              <span className="text-xs font-bold text-[var(--s-text-muted)] block mb-1 flex items-center gap-1">
                                <Brain className="w-3 h-3" /> Decision Genome
                              </span>
                              <div className="text-xs text-[var(--s-text-primary)] bg-black/10 p-2 rounded max-h-24 overflow-hidden text-ellipsis">
                                {Object.keys(rev.decision_genome || {}).length} nodes defined
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[var(--s-text-muted)] block mb-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Project Snapshot
                              </span>
                              <div className="text-xs text-[var(--s-text-primary)] bg-black/10 p-2 rounded max-h-24 overflow-hidden text-ellipsis">
                                {Object.keys(rev.project_snapshot || {}).length} parameters captured
                              </div>
                            </div>
                          </div>
                          
                          {isLocked && (
                            <div className="mt-2 text-xs font-semibold text-green-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Learning Model Ready
                            </div>
                          )}
                        </div>
                      </Surface>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


