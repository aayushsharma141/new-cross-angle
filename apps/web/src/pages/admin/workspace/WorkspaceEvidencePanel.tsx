import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { StrategyBlock } from '@/addons/calculators/components/data/engines/conversation-strategy';
import { RiskCard } from '@/addons/calculators/components/data/engines/risk-cards';

interface WorkspaceEvidencePanelProps {
  lead: any;
  activeBlockId: string | null;
  strategyBlocks: StrategyBlock[];
  riskCards: RiskCard[];
}

export default function WorkspaceEvidencePanel({ lead, activeBlockId, strategyBlocks, riskCards }: WorkspaceEvidencePanelProps) {
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
      <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] h-full flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle className="flex items-center gap-2 text-[hsl(var(--admin-text))] text-base">
            <Search className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
            Evidence Chain
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[hsl(var(--admin-text))] whitespace-pre-wrap flex-1 overflow-y-auto">
          {evidence}
        </CardContent>
      </Card>
    </div>
  );
}
