import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, Save } from 'lucide-react';
import { useCreateDecisionEvent } from '@/services/decision-events';

interface WorkspaceAfterMeetingProps {
  leadId: string;
}

export default function WorkspaceAfterMeeting({ leadId }: WorkspaceAfterMeetingProps) {
  const { mutate: createEvent, isPending } = useCreateDecisionEvent();
  
  const [objections, setObjections] = useState('');
  const [decisions, setDecisions] = useState('');
  const [followUps, setFollowUps] = useState('');
  const [outcome, setOutcome] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent({
      lead_id: leadId,
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
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-[hsl(var(--admin-primary))]" />
        <h2 className="text-xl font-bold text-[hsl(var(--admin-text))]">Meeting Debrief</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
          <CardContent className="p-4 flex flex-col gap-4">
            
            <div className="flex flex-col gap-2">
              <label htmlFor="outcome" className="text-sm font-bold text-[hsl(var(--admin-text))]">Meeting Outcome / Status</label>
              <select 
                id="outcome"
                title="Meeting Outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-[hsl(var(--admin-border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--admin-text))] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Pending" className="bg-[hsl(var(--admin-background))] text-[hsl(var(--admin-text))]">Pending</option>
                <option value="Progressing" className="bg-[hsl(var(--admin-background))] text-[hsl(var(--admin-text))]">Progressing to Proposal</option>
                <option value="Re-Evaluation" className="bg-[hsl(var(--admin-background))] text-[hsl(var(--admin-text))]">Needs Re-Evaluation</option>
                <option value="Lost" className="bg-[hsl(var(--admin-background))] text-[hsl(var(--admin-text))]">Lost / Not a fit</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="objections" className="text-sm font-bold text-[hsl(var(--admin-text))]">Actual Objections Raised</label>
              <Textarea 
                id="objections"
                placeholder="What objections did the client actually raise compared to what we predicted?" 
                value={objections}
                onChange={(e) => setObjections(e.target.value)}
                className="resize-none bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="decisions" className="text-sm font-bold text-[hsl(var(--admin-text))]">Client Decisions</label>
              <Textarea 
                id="decisions"
                placeholder="What did the client agree to or decide during the meeting?" 
                value={decisions}
                onChange={(e) => setDecisions(e.target.value)}
                className="resize-none bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="followUps" className="text-sm font-bold text-[hsl(var(--admin-text))]">Follow-up Actions</label>
              <Textarea 
                id="followUps"
                placeholder="List follow-up actions (one per line)..." 
                value={followUps}
                onChange={(e) => setFollowUps(e.target.value)}
                className="resize-none bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="notes" className="text-sm font-bold text-[hsl(var(--admin-text))]">Designer Private Notes</label>
              <Textarea 
                id="notes"
                placeholder="Any other observations or private notes for institutional learning..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
              />
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
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
