import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/primitives/card';
import { CheckCircle2, User, Clock, DollarSign } from 'lucide-react';

export default function WorkspaceCockpit({ lead }: { lead: any }) {
  const archetype = lead.discovery_archetype || 'Unknown';
  const signals = lead.discovery_signals || {};

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--admin-text))]">{lead.name}</CardTitle>
          <div className="text-sm text-[hsl(var(--admin-text-muted))]">{lead.email}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--admin-text))]">
            <User className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
            <span className="font-semibold capitalize">{archetype.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--admin-text))]">
            <DollarSign className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
            <span>{signals.budget ? `$${signals.budget.toLocaleString()}` : 'No Budget Set'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--admin-text))]">
            <Clock className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
            <span>{signals.timeline || 'No Timeline'}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--admin-text))] text-base">Meeting Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['Review Executive Summary', 'Align on Risk Factors', 'Confirm Key Preferences', 'Discuss Phasing Strategy'].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--admin-text))]">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-gray-500" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
