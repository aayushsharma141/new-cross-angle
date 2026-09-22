import { Surface, Stack, Text } from "@/components/primitives/foundation";
import { Search } from 'lucide-react';
import { StrategyBlock } from '@/addons/calculators/components/data/engines/conversation-strategy';
import { RiskCard } from '@/addons/calculators/components/data/engines/risk-cards';

interface WorkspaceEvidencePanelProps {
  _lead: any;
  activeBlockId: string | null;
  strategyBlocks: StrategyBlock[];
  riskCards: RiskCard[];
}

export default function WorkspaceEvidencePanel({ _lead, activeBlockId, strategyBlocks, riskCards }: WorkspaceEvidencePanelProps) {
  let evidence = "Select a strategy or risk block to view its underlying evidence chain and data sources.";
  
  if (activeBlockId) {
    const strategy = strategyBlocks.find(b => b.id === activeBlockId);
    if (strategy) {
      evidence = `Confidence: ${strategy.confidence}\nEvidence:\n${strategy.evidence}`;
    } else {
      const risk = riskCards.find(r => r.id === activeBlockId);
      if (risk) {
        evidence = `Confidence: ${risk.confidence}\n\nWhy:\n${risk.why}\n\nEarly Signals:\n- ${risk.earlySignals.join('\n- ')}`;
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <Surface variant="primary" radius="lg" border shadow="sm" className="bg-[var(--s-surface-raised)] border-[var(--s-border-subtle)] h-full flex flex-col">
        <Stack gap="sm" className="p-6 shrink-0">
          <Text as="h3" variant="h3" className="leading-none flex items-center gap-2 text-[var(--s-text-primary)] text-base">
            <Search className="w-4 h-4 text-[var(--s-accent-primary)]" />
            Evidence Chain
          </Text>
        </Stack>
        <div className="p-6 pt-0 text-sm text-[var(--s-text-primary)] whitespace-pre-wrap flex-1 overflow-y-auto">
          {evidence}
        </div>
      </Surface>
    </div>
  );
}


