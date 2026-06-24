import { Lead } from '../../../../../repositories/interfaces/LeadRepository';
import { AIRecommendationResult } from './types';

export type StrategyBlockType = 'hook' | 'order' | 'explore' | 'avoid' | 'visual';

export interface StrategyBlock {
  id: string;
  type: StrategyBlockType;
  content: string;
  confidence: 'High' | 'Medium' | 'Low';
  evidence: string;
}

export function generateConversationStrategy(leadRaw: Lead): StrategyBlock[] {
  const lead = leadRaw as any;
  const blocks: StrategyBlock[] = [];
  
  if (!lead.discovery_archetype || !lead.discovery_signals) {
    return blocks;
  }
  
  const archetype = lead.discovery_archetype;
  const signals = lead.discovery_signals;
  const result: AIRecommendationResult | undefined = lead.estimator_data?.result;
  const path = lead.alcs_execution_path || result?.executionPath || 'Unknown';
  
  // 1. Hook
  if (path === 'full_premium') {
    blocks.push({
      id: 'hook-1',
      type: 'hook',
      content: `"I see you want to completely transform your space. Let's talk about the vision for your primary spaces and the incredible materials we can source."`,
      confidence: 'High',
      evidence: `ALCS Engine recommended path: ${path}`,
    });
  } else if (path === 'smart_renovation') {
    blocks.push({
      id: 'hook-1',
      type: 'hook',
      content: `"We can achieve a beautiful result by focusing our efforts smartly. What's the one thing that bothers you most about the current space?"`,
      confidence: 'High',
      evidence: `ALCS Engine recommended path: ${path}`,
    });
  } else if (path === 'hero_space') {
    blocks.push({
      id: 'hook-1',
      type: 'hook',
      content: `"Let's focus your budget on making your primary living area absolutely perfect."`,
      confidence: 'High',
      evidence: `ALCS Engine recommended path: ${path}`,
    });
  } else if (path === 'phased_evolution') {
    blocks.push({
      id: 'hook-1',
      type: 'hook',
      content: `"We can design a master plan today, and execute it in stages as it suits you."`,
      confidence: 'High',
      evidence: `ALCS Engine recommended path: ${path}`,
    });
  } else {
    blocks.push({
      id: 'hook-1',
      type: 'hook',
      content: `"Welcome! Let's explore how we can best bring your vision to life today."`,
      confidence: 'Medium',
      evidence: `Default hook due to unknown or generic path`,
    });
  }
  
  // 2. Order
  if (signals.budget && signals.budget > 100000) {
    blocks.push({
      id: 'order-1',
      type: 'order',
      content: `Start with high-level design vision and materials, address budget constraints last.`,
      confidence: 'High',
      evidence: `Premium budget indicated (>100k)`,
    });
  } else {
    blocks.push({
      id: 'order-1',
      type: 'order',
      content: `Address budget and scope constraints early, then move into design possibilities.`,
      confidence: 'High',
      evidence: `Standard budget indicated`,
    });
  }
  
  // 3. Explore
  if (archetype === 'warm_modernist') {
    blocks.push({
      id: 'explore-1',
      type: 'explore',
      content: `Explore organic textures (wood, linen) and how natural light flows through the space.`,
      confidence: 'High',
      evidence: `Archetype: warm_modernist`,
    });
  } else if (archetype === 'classic_revivalist') {
    blocks.push({
      id: 'explore-1',
      type: 'explore',
      content: `Explore heritage details, moldings, and classic layouts.`,
      confidence: 'High',
      evidence: `Archetype: classic_revivalist`,
    });
  } else {
    blocks.push({
      id: 'explore-1',
      type: 'explore',
      content: `Explore what aspects of their current home they want to change the most.`,
      confidence: 'Medium',
      evidence: `Generic exploration prompt`,
    });
  }
  
  // 4. Avoid
  if (archetype === 'warm_modernist') {
    blocks.push({
      id: 'avoid-1',
      type: 'avoid',
      content: `Avoid overly sterile, cold, or clinical modernism examples.`,
      confidence: 'High',
      evidence: `Archetype: warm_modernist typically rejects cold spaces`,
    });
  } else if (archetype === 'classic_revivalist') {
    blocks.push({
      id: 'avoid-1',
      type: 'avoid',
      content: `Avoid trendy modern inserts unless explicitly requested.`,
      confidence: 'High',
      evidence: `Archetype: classic_revivalist typically prefers timeless elements`,
    });
  }
  
  if (signals.luxuryResolvedAs === 'invest-in-space') {
    blocks.push({
      id: 'avoid-2',
      type: 'avoid',
      content: `Avoid focusing too much on small ornamental details; keep focus on flow and footprint.`,
      confidence: 'High',
      evidence: `Luxury mode: invest-in-space`,
    });
  } else if (signals.luxuryResolvedAs === 'invest-in-tech') {
    blocks.push({
      id: 'avoid-2',
      type: 'avoid',
      content: `Avoid suggesting manual controls or purely traditional utility setups.`,
      confidence: 'High',
      evidence: `Luxury mode: invest-in-tech`,
    });
  }
  
  // 5. Visual
  blocks.push({
    id: 'visual-1',
    type: 'visual',
    content: `Show 2-3 portfolio examples highlighting ${signals.sensory?.lighting || 'balanced'} lighting and ${signals.sensory?.textures || 'standard'} textures.`,
    confidence: 'High',
    evidence: `Based on sensory preferences from discovery signals`,
  });

  return blocks;
}
