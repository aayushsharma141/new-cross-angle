import { Surface, Stack, Text } from "@/components/primitives/foundation";
import { CheckCircle2, User, Clock, DollarSign } from 'lucide-react';

export default function WorkspaceCockpit({ lead }: { lead: any }) {
  const archetype = lead.discovery_archetype || 'Unknown';
  const signals = lead.discovery_signals || {};

  return (
    <div className="flex flex-col gap-4">
      <Surface variant="primary" radius="lg" border shadow="sm" className="bg-[var(--s-surface-raised)] border-[var(--s-border-subtle)]">
        <Stack gap="sm" className="p-6">
          <Text as="h3" variant="h3" className="leading-none text-[var(--s-text-primary)]">{lead.name}</Text>
          <div className="text-sm text-[var(--s-text-muted)]">{lead.email}</div>
        </Stack>
        <div className="p-6 pt-0 space-y-4">
          <div className="flex items-center gap-2 text-sm text-[var(--s-text-primary)]">
            <User className="w-4 h-4 text-[var(--s-accent-primary)]" />
            <span className="font-semibold capitalize">{archetype.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--s-text-primary)]">
            <DollarSign className="w-4 h-4 text-[var(--s-accent-primary)]" />
            <span>{signals.budget ? `$${signals.budget.toLocaleString()}` : 'No Budget Set'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--s-text-primary)]">
            <Clock className="w-4 h-4 text-[var(--s-accent-primary)]" />
            <span>{signals.timeline || 'No Timeline'}</span>
          </div>
        </div>
      </Surface>

      <Surface variant="primary" radius="lg" border shadow="sm" className="bg-[var(--s-surface-raised)] border-[var(--s-border-subtle)]">
        <Stack gap="sm" className="p-6">
          <Text as="h3" variant="h3" className="leading-none text-[var(--s-text-primary)] text-base">Meeting Checklist</Text>
        </Stack>
        <div className="p-6 pt-0 space-y-2">
          {['Review Executive Summary', 'Align on Risk Factors', 'Confirm Key Preferences', 'Discuss Phasing Strategy'].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-[var(--s-text-primary)]">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-gray-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}


