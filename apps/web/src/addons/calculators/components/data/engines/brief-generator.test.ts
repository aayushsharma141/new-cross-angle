import { describe, it, expect } from 'vitest';
import { generateDesignerBrief } from './brief-generator';
import { LeadIntelligenceInput } from './types';

describe('Designer Brief Generator', () => {
  it('should return null if no discovery data exists', () => {
    const lead = { name: 'John Doe' } as LeadIntelligenceInput;
    expect(generateDesignerBrief(lead)).toBeNull();
  });

  it('should generate a brief with lifestyle, sensory, and strategy signals', () => {
    const lead = {
      discovery_archetype: 'warm_modernist',
      property_type: 'apartment',
      alcs_execution_path: 'smart_renovation',
      discovery_signals: {
        lifestyle: {
          wfh: true,
          hosting: true,
          family: false,
          pets: true
        },
        priorities: {
          heroRooms: ['kitchen', 'living'],
          emotionalWeights: { 'calm-retreat': 10 }
        },
        sensory: {
          lighting: 'natural',
          textures: 'organic'
        },
        luxuryResolvedAs: 'invest-in-materials'
      }
    };

    const brief = generateDesignerBrief(lead as unknown as LeadIntelligenceInput);
    expect(brief).toBeDefined();
    expect(brief?.identity.archetype).toBe('warm_modernist');
    expect(brief?.lifestyle.summary).toContain('Works from home');
    expect(brief?.lifestyle.summary).toContain('Has pets');
    expect(brief?.sensory.lighting).toContain('natural light');
    expect(brief?.sensory.textures).toContain('Organic');
    expect(brief?.strategy.recommendedPath).toBe('smart_renovation');
    expect(brief?.strategy.watchOuts).toContain("Avoid overly sterile or clinical modernism. Emphasize warmth and organic elements.");
  });
});
