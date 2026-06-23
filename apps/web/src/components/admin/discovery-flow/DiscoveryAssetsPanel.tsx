import { useFlowConfig } from '@/hooks/useFlowConfig';
import { DiscoveryMediaSlot } from './DiscoveryMediaSlot';
import { toEntityId } from '@/lib/discovery-utils';
import { Loader2 } from 'lucide-react';

interface ArchetypeItem {
  name: string;
}

export function DiscoveryAssetsPanel() {
  const { data: archetypes, isLoading } = useFlowConfig<ArchetypeItem[]>('discovery_archetypes');

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" />
      </div>
    );
  }

  // Create 18 visual slots
  const visualSlots = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-lg font-semibold text-[hsl(var(--admin-text))] mb-4">
          Visual Prompts (1-18)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visualSlots.map((num) => (
            <DiscoveryMediaSlot
              key={`visual-${num}`}
              label={`Visual Prompt ${num}`}
              entityType="discovery_visual"
              entityId={`visual-${num}`}
              role="visual"
              description="Used in the Visual Instinct quiz phase"
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[hsl(var(--admin-text))] mb-4">
          Archetype Results
        </h3>
        {(!archetypes || archetypes.length === 0) ? (
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">
            No archetypes configured yet. Add them in the Archetypes tab first.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archetypes.map((arch) => {
              const entityId = toEntityId(arch.name);
              return (
                <div key={entityId} className="space-y-4 border border-[hsl(var(--admin-border))]/50 p-4 rounded-xl bg-[hsl(var(--admin-surface))]/30">
                  <h4 className="text-base font-medium text-[hsl(var(--admin-text))] border-b border-[hsl(var(--admin-border))]/50 pb-2">
                    {arch.name}
                  </h4>
                  <div className="space-y-4">
                    <DiscoveryMediaSlot
                      label="Hero Image"
                      entityType="archetype"
                      entityId={entityId}
                      role="hero"
                    />
                    <DiscoveryMediaSlot
                      label="Moodboard"
                      entityType="archetype"
                      entityId={entityId}
                      role="moodboard"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
