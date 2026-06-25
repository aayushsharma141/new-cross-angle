import { useDecisionEvents } from '@/services/decision-events';
import { Card, CardContent } from '@/components/ui/card';
import { History, Brain, ShieldAlert, CheckCircle2, MessageSquare, ListTodo, XCircle, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export function WorkspaceDecisionTimeline({ leadId }: { leadId: string }) {
  const { data: events = [], isLoading } = useDecisionEvents(leadId);

  if (isLoading) return <div className="text-sm text-[hsl(var(--admin-text-muted))]">Loading timeline...</div>;
  if (events.length === 0) return null;

  // Group by session_id
  const sessions = events.reduce((acc, event) => {
    const sid = event.session_id || 'un-sessioned';
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  return (
    <div className="mt-12 pt-8 border-t border-[hsl(var(--admin-border))]">
      <h2 className="text-xl font-bold text-[hsl(var(--admin-text))] mb-6 flex items-center gap-2">
        <History className="w-5 h-5 text-purple-400" />
        Intelligence Timeline
      </h2>

      <div className="flex flex-col gap-8">
        {Object.entries(sessions).map(([sessionId, sessionEvents]) => {
          // Sort events chronologically
          const sortedEvents = [...sessionEvents].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());
          
          return (
            <div key={sessionId} className="flex flex-col gap-4 relative">
              <div className="flex items-center gap-2 text-xs font-mono text-[hsl(var(--admin-text-muted))]">
                <div className="h-px flex-1 bg-[hsl(var(--admin-border))]"></div>
                Session: {sessionId === 'un-sessioned' ? 'Unknown' : sessionId.split('-')[0]} 
                <span className="text-[10px]">({format(new Date(sortedEvents[0].occurred_at), 'MMM d, h:mm a')})</span>
                <div className="h-px flex-1 bg-[hsl(var(--admin-border))]"></div>
              </div>

              {sortedEvents.map(event => {
                if (event.payload.type === 'recommendation_decision') {
                  const p = event.payload;
                  const snapshot = p.recommendationSnapshot || {};
                  const isStrategy = !!snapshot.content;
                  
                  return (
                    <Card key={event.id} className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] ml-4 border-l-4 border-l-blue-500">
                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1">
                            {isStrategy ? <Brain className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3 text-red-400" />}
                            {isStrategy ? snapshot.type || 'Strategy' : 'Risk'}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-black/20">
                            {p.decision === 'Accept' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                            {p.decision === 'Modify' && <Edit2 className="w-3 h-3 text-yellow-500" />}
                            {p.decision === 'Reject' && <XCircle className="w-3 h-3 text-red-500" />}
                            <span className={
                              p.decision === 'Accept' ? 'text-green-500' :
                              p.decision === 'Modify' ? 'text-yellow-500' : 'text-red-500'
                            }>{p.decision}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-[hsl(var(--admin-text))] italic border-l-2 border-[hsl(var(--admin-border))] pl-2 ml-1">
                          "{snapshot.content || snapshot.recommendedResponse || p.originalContext}"
                        </p>
                        
                        {p.reason && (
                          <div className="mt-2 text-sm text-[hsl(var(--admin-text-muted))] bg-black/10 p-2 rounded">
                            <strong className="text-[hsl(var(--admin-text))]">Reason:</strong> {p.reason}
                          </div>
                        )}
                        
                        {/* Evidence Replay */}
                        {(snapshot.evidence || snapshot.why) && (
                          <div className="mt-1 text-xs text-[hsl(var(--admin-text-muted))]">
                            <strong className="text-[hsl(var(--admin-text))]">Evidence:</strong> {snapshot.evidence || snapshot.why}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                }

                if (event.payload.type === 'meeting_debrief') {
                  const p = event.payload;
                  return (
                    <Card key={event.id} className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] ml-4 border-l-4 border-l-purple-500">
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-purple-400" />
                          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))]">Meeting Debrief</h3>
                          <span className="ml-auto text-xs font-mono text-[hsl(var(--admin-text-muted))]">
                            {format(new Date(event.occurred_at), 'h:mm a')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <span className="text-xs font-bold text-[hsl(var(--admin-text-muted))] block mb-1">Outcome</span>
                            <span className="text-sm font-medium text-[hsl(var(--admin-text))]">{p.outcome || 'Pending'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[hsl(var(--admin-text-muted))] block mb-1">Client Decisions</span>
                            <span className="text-sm text-[hsl(var(--admin-text))]">{p.decisions || 'None recorded'}</span>
                          </div>
                        </div>

                        {p.objections && (
                          <div>
                            <span className="text-xs font-bold text-[hsl(var(--admin-text-muted))] block mb-1">Actual Objections</span>
                            <p className="text-sm text-[hsl(var(--admin-text))] italic">{p.objections}</p>
                          </div>
                        )}

                        {p.followUps && (
                          <div>
                            <span className="text-xs font-bold text-[hsl(var(--admin-text-muted))] block mb-1 flex items-center gap-1">
                              <ListTodo className="w-3 h-3" />
                              Follow-ups
                            </span>
                            <p className="text-sm text-[hsl(var(--admin-text))] bg-black/10 p-2 rounded">{p.followUps}</p>
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  );
                }

                return null;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
