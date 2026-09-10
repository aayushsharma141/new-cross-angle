import { LeadIntelligenceInput } from './types';

export interface RiskCard {
  id: string;
  headline: string;
  why: string;
  earlySignals: string[];
  recommendedResponse: string;
  confidence: 'High' | 'Medium' | 'Low';
  successIndicator: string;
  impactScore: number; // Used internally for sorting
}

export function generateRiskCards(lead: LeadIntelligenceInput): RiskCard[] {
  const cards: RiskCard[] = [];

  if (!lead.discovery_signals) {
    return cards;
  }

  const signals = lead.discovery_signals;
  const archetype = lead.discovery_archetype;

  // Risk 1: Budget Misalignment
  if (signals.budget && signals.budget < 50000 && archetype === 'warm_modernist') {
    cards.push({
      id: 'risk-budget',
      headline: 'High Taste, Low Budget Mismatch',
      why: 'Warm Modernist aesthetic typically requires custom millwork and premium natural materials, which may exceed their stated budget.',
      earlySignals: ['Asking for price breakdowns early', 'Referencing high-end Pinterest images'],
      recommendedResponse: 'Define what elements are non-negotiable for their vision and offer phased execution.',
      confidence: 'High',
      successIndicator: 'Client agrees to prioritize hero spaces or phase the project over time.',
      impactScore: 90,
    });
  } else if (signals.budget && signals.budget < 30000) {
    cards.push({
      id: 'risk-budget-low',
      headline: 'Constrained Budget',
      why: 'The stated budget is significantly lower than average full-scale renovations.',
      earlySignals: ['Focusing on cost over design', 'Asking for discounts'],
      recommendedResponse: 'Be transparent about typical costs per square foot in their area. Pivot to a high-impact "hero room" strategy.',
      confidence: 'High',
      successIndicator: 'Client aligns on a reduced scope that fits the budget safely.',
      impactScore: 80,
    });
  }

  // Risk 2: Timeline Pressure
  if (signals.timeline === 'ASAP' || signals.timeline === '1-3 months') {
    cards.push({
      id: 'risk-timeline',
      headline: 'Aggressive Timeline Expectations',
      why: 'The client expects completion in a window that may not allow for custom procurement or permits.',
      earlySignals: ['Pressing for a start date', 'Mentioning upcoming life events (wedding, baby)'],
      recommendedResponse: 'Walk through a realistic critical path timeline. Highlight dependencies like custom furniture lead times.',
      confidence: 'High',
      successIndicator: 'Client accepts a realistic, buffered project schedule.',
      impactScore: 85,
    });
  }

  // Risk 3: Decision Paralysis (Family/Stakeholders)
  if (signals.lifestyle?.family || signals.decision_makers > 1) {
    cards.push({
      id: 'risk-stakeholders',
      headline: 'Multi-Stakeholder Alignment',
      why: 'Multiple decision makers often lead to conflicting aesthetic preferences or prolonged revision cycles.',
      earlySignals: ['"I need to check with my partner"', 'Bringing extended family to meetings'],
      recommendedResponse: 'Establish a clear decision-making framework early. Require all stakeholders at major presentations.',
      confidence: 'Medium',
      successIndicator: 'Both/all partners sign off on the initial mood board.',
      impactScore: 70,
    });
  }
  
  // Risk 4: Scope Creep
  if (signals.priorities?.heroRooms?.length > 3) {
    cards.push({
      id: 'risk-scope',
      headline: 'High Risk of Scope Creep',
      why: 'Client has indicated many priority rooms but may not have the budget or timeline to execute all simultaneously.',
      earlySignals: ['Adding rooms during consultation', '"While we are at it" statements'],
      recommendedResponse: 'Anchor discussions back to the primary Hero Space. Document any out-of-scope requests meticulously.',
      confidence: 'Medium',
      successIndicator: 'Scope is strictly defined in the proposal with clear boundaries.',
      impactScore: 75,
    });
  }

  // Sort by impact score descending and take top 3
  cards.sort((a, b) => b.impactScore - a.impactScore);
  
  // Clean up impactScore before returning if we want to be strictly to interface, 
  // but it's fine to leave it. We return max 3.
  return cards.slice(0, 3).map(card => {
    const { impactScore, ...rest } = card;
    return { ...rest, impactScore }; 
  });
}
