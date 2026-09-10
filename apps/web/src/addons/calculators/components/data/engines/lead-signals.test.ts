import { describe, it, expect } from 'vitest';
import { toDiscoverySignals } from './lead-signals';
import { generateRiskCards } from './risk-cards';
import { generateConversationStrategy } from './conversation-strategy';
import { generateDesignerBrief } from './brief-generator';
import type { LeadIntelligenceInput } from './types';
import { buildDiscoveryHandoff } from '../discovery-handoff';

/**
 * A lead as submit-estimate actually stores it: the DiscoveryHandoff flattened
 * across discovery_* columns. This is the shape the engines never handled.
 */
const storedLead = {
  name: 'Priya Nair',
  property_type: 'apartment',
  discovery_archetype: 'warm_modernist',
  alcs_execution_path: 'smart_renovation',
  alcs_confidence: 92,
  discovery_lifestyle: {
    familyType: 'Nuclear',
    members: 3,
    children: 1,
    workFromHome: true,
    hostingFreq: 'Often',
    cookingRole: 'Daily Ritual',
    petsPresent: true,
  },
  discovery_priorities: {
    mustHave: ['kitchen', 'living', 'master-bed', 'study'],
    niceToHave: ['balcony'],
    emotionalWeights: { 'calm-retreat': 0.8 },
  },
  discovery_sensory: {
    lighting: 'natural',
    colors: ['warm-neutral'],
    textures: ['organic', 'linen'],
    luxuryResolvedAs: 'invest-in-materials',
  },
  budget_value_inr: 25000,
  timeline: 'ASAP',
} as unknown as LeadIntelligenceInput;

describe('toDiscoverySignals', () => {
  it('returns null when the lead never went through Discovery', () => {
    const bare = { name: 'Walk-in', property_type: null } as unknown as LeadIntelligenceInput;
    expect(toDiscoverySignals(bare)).toBeNull();
  });

  it('projects the flattened discovery_* columns into engine signals', () => {
    const signals = toDiscoverySignals(storedLead);

    expect(signals).not.toBeNull();
    expect(signals?.lifestyle).toEqual({ wfh: true, hosting: true, family: true, pets: true });
    expect(signals?.priorities?.heroRooms).toEqual(['kitchen', 'living', 'master-bed', 'study']);
    expect(signals?.sensory?.lighting).toBe('natural');
    expect(signals?.sensory?.textures).toBe('organic');
    expect(signals?.luxuryResolvedAs).toBe('invest-in-materials');
    expect(signals?.decision_makers).toBe(3);
    expect(signals?.budget).toBe(25000);
    expect(signals?.timeline).toBe('ASAP');
  });

  it('maps the handoff lighting vocabulary onto the engine vocabulary', () => {
    const withLighting = (lighting: string) =>
      toDiscoverySignals({
        ...storedLead,
        discovery_sensory: { lighting, textures: [] },
      } as unknown as LeadIntelligenceInput)?.sensory?.lighting;

    expect(withLighting('warm')).toBe('ambient');
    expect(withLighting('dramatic')).toBe('statement');
    expect(withLighting('natural')).toBe('natural');
    // `cool` has no engine equivalent; left unmapped so engines use their default.
    expect(withLighting('cool')).toBeUndefined();
  });

  it('treats an occasional host and a single occupant as neither', () => {
    const signals = toDiscoverySignals({
      ...storedLead,
      discovery_lifestyle: {
        familyType: 'Single',
        members: 1,
        children: 0,
        workFromHome: false,
        hostingFreq: 'Rarely',
        petsPresent: false,
      },
    } as unknown as LeadIntelligenceInput);

    expect(signals?.lifestyle).toEqual({ wfh: false, hosting: false, family: false, pets: false });
    expect(signals?.decision_makers).toBe(1);
  });

  it('prefers an explicit discovery_signals blob when one is supplied', () => {
    const explicit = { luxuryResolvedAs: 'invest-in-tech' };
    const signals = toDiscoverySignals({
      ...storedLead,
      discovery_signals: explicit,
    } as unknown as LeadIntelligenceInput);

    expect(signals).toBe(explicit);
  });
});

describe('workspace panels populate from a stored lead', () => {
  it('produces risk cards where it previously returned none', () => {
    const cards = generateRiskCards(storedLead);
    expect(cards.length).toBeGreaterThan(0);
    // Four occupants-with-children and >3 hero rooms both raise known risks.
    // The engine ranks by impact score and caps the result at three.
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.id)).toEqual(
      expect.arrayContaining(["risk-budget", "risk-timeline"]),
    );
  });

  it('produces conversation strategy blocks', () => {
    const blocks = generateConversationStrategy(storedLead);
    expect(blocks.length).toBeGreaterThan(0);
  });

  it('produces a designer brief', () => {
    const brief = generateDesignerBrief(storedLead);
    expect(brief).not.toBeNull();
    expect(brief?.identity.archetype).toBe('warm_modernist');
    expect(brief?.lifestyle.summary).toContain('Works from home');
    expect(brief?.lifestyle.summary).toContain('Has pets');
    expect(brief?.sensory.lighting).toContain('natural light');
  });
});

describe('quiz -> lead columns -> engine signals', () => {
  it('a quiz-only lead carries everything the panels need', () => {
    // What the Discovery quiz holds when the user reaches the lead gate.
    const userSignals = {
      emotionalGoal: 'A calm, grounded home',
      familyStructure: 'Nuclear',
      householdSize: 4,
      childCount: 2,
      workFromHome: 'Yes',
      hostingFrequency: 'Often',
      hasPets: true,
      lightingPreference: 'natural',
      luxuryResolution: 'invest-in-materials',
      roomPriorities: { kitchen: 'Must-Have', living: 'Must-Have', study: 'Nice-to-Have' },
      selectedAdjectives: ['organic', 'warm', 'layered'],
      budgetValue: 25000,
      colorPalette: ['warm-neutral'],
    } as unknown as Parameters<typeof buildDiscoveryHandoff>[0];

    const handoff = buildDiscoveryHandoff(userSignals, 'warm_modernist');

    // Exactly the columns submit-workspace-commitment now writes onto the lead.
    const lead = {
      name: 'Quiz Only',
      property_type: 'apartment',
      discovery_archetype: handoff.archetype,
      discovery_lifestyle: handoff.lifestyle,
      discovery_priorities: handoff.priorities,
      discovery_sensory: handoff.sensory,
      alcs_execution_path: null,
      alcs_confidence: null,
      budget_value_inr: handoff.budget,
    } as unknown as LeadIntelligenceInput;

    const signals = toDiscoverySignals(lead);
    expect(signals?.lifestyle).toEqual({ wfh: true, hosting: true, family: true, pets: true });
    expect(signals?.decision_makers).toBe(4);
    expect(signals?.priorities?.heroRooms).toEqual(['kitchen', 'living']);
    expect(signals?.sensory?.lighting).toBe('natural');
    expect(signals?.luxuryResolvedAs).toBe('invest-in-materials');

    // The panels that previously rendered nothing for this lead.
    expect(generateRiskCards(lead).length).toBeGreaterThan(0);
    expect(generateConversationStrategy(lead).length).toBeGreaterThan(0);
    expect(generateDesignerBrief(lead)).not.toBeNull();
  });

  it('defaults hosting to false and lighting to ambient when the quiz stayed neutral', () => {
    const handoff = buildDiscoveryHandoff(
      { selectedAdjectives: [] } as unknown as Parameters<typeof buildDiscoveryHandoff>[0],
      'quiet_minimalist',
    );
    const signals = toDiscoverySignals({
      name: 'Neutral',
      property_type: null,
      discovery_archetype: handoff.archetype,
      discovery_lifestyle: handoff.lifestyle,
      discovery_priorities: handoff.priorities,
      discovery_sensory: handoff.sensory,
    } as unknown as LeadIntelligenceInput);

    // buildDiscoveryHandoff defaults hostingFreq to "Sometimes" and lighting to "warm".
    expect(signals?.lifestyle?.hosting).toBe(false);
    expect(signals?.sensory?.lighting).toBe('ambient');
  });
});
