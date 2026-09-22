import { AIRecommendationResult, LeadIntelligenceInput } from './types';
import { toDiscoverySignals } from './lead-signals';

export interface DesignerBrief {
  identity: {
    name: string;
    archetype: string;
    confidence: number;
    propertyType: string;
  };
  lifestyle: {
    summary: string[];
    priorityRooms: string[];
  };
  sensory: {
    lighting: string;
    textures: string;
    luxuryMode: string;
  };
  strategy: {
    recommendedPath: string;
    conversationStarters: string[];
    watchOuts: string[];
  };
}

export function generateDesignerBrief(lead: LeadIntelligenceInput): DesignerBrief | null {
  const signals = toDiscoverySignals(lead);
  if (!lead.discovery_archetype || !signals) {
    return null;
  }

  const result: AIRecommendationResult | undefined = lead.estimator_data?.result;
  const confidence = lead.alcs_confidence || 80;

  // 1. Lifestyle
  const lifestyleSummary: string[] = [];
  if (signals.lifestyle?.wfh) lifestyleSummary.push('Works from home');
  if (signals.lifestyle?.hosting) lifestyleSummary.push('Loves hosting/entertaining');
  if (signals.lifestyle?.family) lifestyleSummary.push('Family-focused household');
  if (signals.lifestyle?.pets) lifestyleSummary.push('Has pets');

  // 2. Spatial Intent
  const priorityRooms = signals.priorities?.heroRooms || [];

  // 3. Sensory
  let lighting = 'Standard/Balanced';
  if (signals.sensory?.lighting === 'natural') lighting = 'Prefers abundant natural light';
  if (signals.sensory?.lighting === 'ambient') lighting = 'Prefers layered, moody, ambient lighting';
  if (signals.sensory?.lighting === 'statement') lighting = 'Prefers bold statement lighting fixtures';

  let textures = 'Balanced';
  if (signals.sensory?.textures === 'organic') textures = 'Organic, natural materials (wood, stone, linen)';
  if (signals.sensory?.textures === 'sleek') textures = 'Sleek, modern materials (glass, metal, gloss)';
  if (signals.sensory?.textures === 'plush') textures = 'Plush, comfortable, soft materials';

  let luxuryMode = 'Balanced';
  if (signals.luxuryResolvedAs === 'invest-in-materials') luxuryMode = 'Restrained (Quality materials over flashy statements)';
  if (signals.luxuryResolvedAs === 'invest-in-space') luxuryMode = 'Spatial (Values openness, footprint, and flow)';
  if (signals.luxuryResolvedAs === 'invest-in-tech') luxuryMode = 'Tech-forward (Smart home, integrated systems)';

  // 4. Strategy
  const conversationStarters: string[] = [];
  const watchOuts: string[] = [];

  const path = lead.alcs_execution_path || result?.executionPath || 'Unknown';
  
  // Basic strategy rules
  if (path === 'full_premium') {
    conversationStarters.push(`"I see you want to completely transform your ${lead.property_type || 'property'}. Let's talk about the vision for your primary spaces."`);
    conversationStarters.push(`"Given your preference for ${luxuryMode.split(' ')[0].toLowerCase()} luxury, we can source some incredible materials."`);
    watchOuts.push("Ensure their timeline allows for a full premium renovation.");
  } else if (path === 'smart_renovation') {
    conversationStarters.push(`"We can achieve a beautiful result by focusing our efforts smartly. What's the one thing that bothers you most about the current space?"`);
    watchOuts.push("They want high impact without full structural tear-downs. Keep scope contained.");
  } else if (path === 'hero_space') {
    conversationStarters.push(`"Let's focus your budget on making the ${priorityRooms[0] || 'primary living area'} absolutely perfect."`);
    watchOuts.push("Budget is likely constrained relative to their taste. Do not spread the budget too thin.");
  } else if (path === 'phased_evolution') {
    conversationStarters.push(`"We can design a master plan today, and execute it in stages as it suits you."`);
    watchOuts.push("They are likely living in the property or pacing their capital. Discuss timeline and disruption.");
  }

  // Archetype specific
  if (lead.discovery_archetype === 'warm_modernist') {
    watchOuts.push("Avoid overly sterile or clinical modernism. Emphasize warmth and organic elements.");
  } else if (lead.discovery_archetype === 'classic_revivalist') {
    watchOuts.push("Respect heritage details. Avoid trendy modern inserts unless explicitly requested.");
  }

  return {
    identity: {
      name: lead.name || 'Unknown Lead',
      archetype: lead.discovery_archetype,
      confidence: confidence,
      propertyType: lead.property_type || 'Unknown Property',
    },
    lifestyle: {
      summary: lifestyleSummary.length > 0 ? lifestyleSummary : ['Standard lifestyle'],
      priorityRooms: priorityRooms,
    },
    sensory: {
      lighting,
      textures,
      luxuryMode,
    },
    strategy: {
      recommendedPath: path,
      conversationStarters,
      watchOuts,
    }
  };
}
