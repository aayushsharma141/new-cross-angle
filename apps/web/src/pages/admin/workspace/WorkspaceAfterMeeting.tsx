import { useState } from 'react';
import { Surface } from "@/components/primitives/foundation";
import { Button } from '@/components/ui/primitives/button';
import { Textarea } from "@/components/primitives/interactive";
import { ClipboardList, Save } from 'lucide-react';
import { useCreateDecisionEvent } from '@/services/decision-events';

interface WorkspaceAfterMeetingProps {
  leadId: string;
  sessionId: string;
  onSessionComplete?: () => void;
}

export default function WorkspaceAfterMeeting({ leadId, sessionId, onSessionComplete }: WorkspaceAfterMeetingProps) {
  const { mutate: createEvent, isPending } = useCreateDecisionEvent();
  
  const [objections, setObjections] = useState('');
  const [decisions, setDecisions] = useState('');
  const [followUps, setFollowUps] = useState('');
  const [outcome, setOutcome] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setErrorMsg(null);
    createEvent({
      lead_id: leadId,
      session_id: sessionId,
      event_type: 'Meeting',
      payload: {
        type: 'meeting_debrief',
        objectionsRaised: objections,
        clientDecisions: decisions,
        followUpActions: followUps.split('\n').map(s => s.trim()).filter(Boolean),
        meetingOutcome: outcome,
        designerNotes: notes,
        timestamp: new Date().toISOString()
      }
    }, {
      onSuccess: () => {
        setSaved(true);
        if (onSessionComplete) {
          onSessionComplete();
        }
        setTimeout(() => setSaved(false), 3000);
      },
      onError: (err: Error) => {
        setErrorMsg(err.message || 'Failed to submit debrief. Please try again.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-[var(--s-accent-primary)]" />
        <h2 className="text-xl font-bold text-[var(--s-text-primary)]">Meeting Debrief</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Surface variant="primary" radius="lg" border shadow="sm" className="bg-[var(--s-surface-raised)] border-[var(--s-border-subtle)]">
          <div className="p-6 pt-0 p-4 flex flex-col gap-4">
            
            <div className="flex flex-col gap-2">
              <label htmlFor="outcome" className="text-sm font-bold text-[var(--s-text-primary)]">Meeting Outcome / Status</label>
              <select 
                id="outcome"
                title="Meeting Outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--s-border-subtle)] bg-transparent px-3 py-2 text-sm text-[var(--s-text-primary)] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Pending" className="bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)]">Pending</option>
                <option value="Progressing" className="bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)]">Progressing to Proposal</option>
                <option value="Re-Evaluation" className="bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)]">Needs Re-Evaluation</option>
                <option value="Lost" className="bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)]">Lost / Not a fit</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="objections" className="text-sm font-bold text-[var(--s-text-primary)]">Actual Objections Raised</label>
              <Textarea 
                id="objections"
                placeholder="What objections did the client actually raise compared to what we predicted?" 
                value={objections}
                onChange={(e) => setObjections(e.target.value)}
                className="resize-none bg-[var(--s-canvas-primary)] border-[var(--s-border-subtle)] text-[var(--s-text-primary)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="decisions" className="text-sm font-bold text-[var(--s-text-primary)]">Client Decisions</label>
              <Textarea 
                id="decisions"
                placeholder="What did the client agree to or decide during the meeting?" 
                value={decisions}
                onChange={(e) => setDecisions(e.target.value)}
                className="resize-none bg-[var(--s-canvas-primary)] border-[var(--s-border-subtle)] text-[var(--s-text-primary)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="followUps" className="text-sm font-bold text-[var(--s-text-primary)]">Follow-up Actions</label>
              <Textarea 
                id="followUps"
                placeholder="List follow-up actions (one per line)�" 
                value={followUps}
                onChange={(e) => setFollowUps(e.target.value)}
                className="resize-none bg-[var(--s-canvas-primary)] border-[var(--s-border-subtle)] text-[var(--s-text-primary)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="notes" className="text-sm font-bold text-[var(--s-text-primary)]">Designer Private Notes</label>
              <Textarea 
                id="notes"
                placeholder="Any other observations or private notes for institutional learning�" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none bg-[var(--s-canvas-primary)] border-[var(--s-border-subtle)] text-[var(--s-text-primary)]"
              />
            </div>

          </div>
        </Surface>

        <div className="flex justify-end gap-2 items-center">
          {errorMsg && <span className="text-red-500 text-sm mr-2">{errorMsg}</span>}
          {saved && <span className="text-green-500 text-sm flex items-center mr-2">Saved to Decision Timeline!</span>}
          <Button type="submit" disabled={isPending} className="gap-2">
            <Save className="w-4 h-4" />
            {isPending ? 'Saving...' : 'Submit Debrief'}
          </Button>
        </div>
      </form>
    </div>
  );
}


