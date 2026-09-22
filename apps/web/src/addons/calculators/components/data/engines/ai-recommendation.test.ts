import { describe, it, expect } from 'vitest';
import { runALCSPipeline } from './orchestrator';
import type { DiscoveryHandoff } from '../discovery-handoff';

// Base mock for DiscoveryHandoff
function buildHandoff(overrides: Partial<DiscoveryHandoff> = {}): DiscoveryHandoff {
  const base: DiscoveryHandoff = {
    userId: 'test-user',
    timestamp: new Date().toISOString(),
    emotionalGoal: 'Comfortable Living',
    archetype: 'The Pragmatist',
    archetypeConfidence: 0.8,
    lifestyle: {
      familyType: 'Nuclear',
      members: 4,
      children: 2,
      workFromHome: false,
      hostingFreq: 'Sometimes',
      cookingRole: 'Occasional',
      petsPresent: false,
    },
    property: {
      type: 'apartment',
      areaSqFt: 1200,
      floors: 1,
      ageYears: 5,
      scope: 'renovation',
      city: 'Delhi',
      cityTier: 'metro',
    },
    priorities: {
      mustHave: ['Living Room', 'Kitchen'],
      niceToHave: ['Balcony'],
      emotionalWeights: { 'Living Room': 0.8, 'Kitchen': 0.7 },
    },
    sensory: {
      lighting: 'natural',
      colors: [],
      textures: [],
      luxuryResolvedAs: 'balanced',
    },
    budget: 1500000,
    confidence: { emotionalGoal: 0.8, budget: 0.8, rooms: 0.8, overall: 0.8 },
    contradictions: [],
    acceptedCompromises: [],
  };

  return { ...base, ...overrides };
}

describe('ALCS Recommendation Engine Calibration', () => {
  const results: string[] = [];

  const personas = [
    {
      name: 'P1: Luxury Villa, unlimited budget, material-first',
      handoff: buildHandoff({
        budget: 15000000,
        property: { type: 'villa', areaSqFt: 4000, floors: 2, ageYears: 2, scope: 'renovation', city: 'Delhi', cityTier: 'metro' },
        sensory: { luxuryResolvedAs: 'invest-in-materials', lighting: 'dramatic', colors: [], textures: ['layered', 'organic'] },
        lifestyle: { familyType: 'Nuclear', members: 4, children: 2, workFromHome: true, hostingFreq: 'Always', cookingRole: 'Daily Ritual', petsPresent: false },
      }),
      expected: 'full_premium',
    },
    {
      name: 'P2: Existing apartment, moderate budget, smart-home focused',
      handoff: buildHandoff({
        budget: 2500000,
        property: { type: 'apartment', areaSqFt: 1500, floors: 1, ageYears: 8, scope: 'renovation', city: 'Mumbai', cityTier: 'metro' },
        sensory: { luxuryResolvedAs: 'invest-in-tech', lighting: 'warm', colors: [], textures: ['minimal'] },
      }),
      expected: 'smart_renovation',
    },
    {
      name: 'P3: Young family, phased budget, growing home',
      handoff: buildHandoff({
        budget: 800000,
        property: { type: 'apartment', areaSqFt: 1200, floors: 1, ageYears: 2, scope: 'renovation', city: 'Pune', cityTier: 'tier1' },
        sensory: { luxuryResolvedAs: 'invest-in-space', lighting: 'natural', colors: [], textures: [] },
        lifestyle: { familyType: 'Nuclear', members: 3, children: 1, workFromHome: true, hostingFreq: 'Rarely', cookingRole: 'Daily Ritual', petsPresent: false },
      }),
      expected: 'phased_evolution',
    },
    {
      name: 'P4: New construction, signature architecture (Hero Space focus)',
      handoff: buildHandoff({
        budget: 3000000, // Not enough for full premium at 3000 sqft, so hero space
        property: { type: 'turnkey', areaSqFt: 3000, floors: 2, ageYears: 0, scope: 'new_build', city: 'Bangalore', cityTier: 'metro' },
        priorities: { mustHave: ['Living Room', 'Dining Room'], niceToHave: [], emotionalWeights: { 'Living Room': 1.0, 'Dining Room': 0.9 } },
        sensory: { luxuryResolvedAs: 'invest-in-materials', lighting: 'dramatic', colors: [], textures: ['organic'] },
        lifestyle: { familyType: 'Nuclear', members: 4, children: 2, workFromHome: false, hostingFreq: 'Always', cookingRole: 'Occasional', petsPresent: false },
      }),
      expected: 'hero_space',
    },
    // Contradiction: Luxury language, but very low budget + urgent timeline -> Should NOT be full premium
    {
      name: 'P5: Contradiction - Luxury desires but low budget',
      handoff: buildHandoff({
        budget: 500000,
        property: { type: 'apartment', areaSqFt: 1800, floors: 1, ageYears: 5, scope: 'renovation', city: 'Delhi', cityTier: 'metro' },
        sensory: { luxuryResolvedAs: 'invest-in-materials', lighting: 'dramatic', colors: [], textures: ['organic', 'layered'] },
      }),
      expected: 'hero_space', // or phased, depending on the math, but definitely NOT full_premium
    },
    // Contradiction: High budget but minimal intervention desired
    {
      name: 'P6: Contradiction - High budget, minimal changes',
      handoff: buildHandoff({
        budget: 10000000,
        property: { type: 'apartment', areaSqFt: 1500, floors: 1, ageYears: 2, scope: 'renovation', city: 'Delhi', cityTier: 'metro' },
        sensory: { luxuryResolvedAs: 'balanced', lighting: 'natural', colors: [], textures: ['minimal'] },
        lifestyle: { familyType: 'Couple', members: 2, children: 0, workFromHome: false, hostingFreq: 'Rarely', cookingRole: 'Occasional', petsPresent: false },
        priorities: { mustHave: ['Living Room'], niceToHave: [], emotionalWeights: { 'Living Room': 0.5 } }
      }),
      expected: 'smart_renovation',
    },
    // Adding 14 more to hit ~20 personas
    {
      name: 'P7: High budget, big old villa -> Rebuild or Full Premium',
      handoff: buildHandoff({
        budget: 20000000,
        property: { type: 'villa', areaSqFt: 5000, floors: 2, ageYears: 45, scope: 'renovation', city: 'Delhi', cityTier: 'metro' },
      }),
      expected: 'rebuild_recommendation',
    },
    {
      name: 'P8: DINKs, tech heavy, moderate area',
      handoff: buildHandoff({
        budget: 3500000,
        property: { type: 'apartment', areaSqFt: 1200, floors: 1, ageYears: 3, scope: 'renovation', city: 'Mumbai', cityTier: 'metro' },
        sensory: { luxuryResolvedAs: 'invest-in-tech', lighting: 'cool', colors: [], textures: ['minimal'] },
        lifestyle: { familyType: 'Couple', members: 2, children: 0, workFromHome: true, hostingFreq: 'Often', cookingRole: 'Occasional', petsPresent: false }
      }),
      expected: 'smart_renovation',
    },
    {
      name: 'P9: Large joint family, low per sqft budget',
      handoff: buildHandoff({
        budget: 2500000,
        property: { type: 'villa', areaSqFt: 3500, floors: 2, ageYears: 15, scope: 'renovation', city: 'Jaipur', cityTier: 'tier2' },
        lifestyle: { familyType: 'Joint', members: 8, children: 3, workFromHome: false, hostingFreq: 'Often', cookingRole: 'Daily Ritual', petsPresent: true }
      }),
      expected: 'phased_evolution',
    },
    {
      name: 'P10: Standard apartment upgrade',
      handoff: buildHandoff({
        budget: 1800000,
        property: { type: 'apartment', areaSqFt: 1000, floors: 1, ageYears: 10, scope: 'renovation', city: 'Pune', cityTier: 'tier1' },
      }),
      expected: 'smart_renovation',
    },
    {
      name: 'P11: Studio apartment, high budget per sqft',
      handoff: buildHandoff({
        budget: 1500000,
        property: { type: 'apartment', areaSqFt: 500, floors: 1, ageYears: 2, scope: 'renovation', city: 'Bangalore', cityTier: 'metro' },
        sensory: { luxuryResolvedAs: 'invest-in-materials', lighting: 'dramatic', colors: [], textures: ['layered'] }
      }),
      expected: 'full_premium',
    },
    {
      name: 'P12: Entertainer’s paradise on a strict budget',
      handoff: buildHandoff({
        budget: 1200000,
        property: { type: 'apartment', areaSqFt: 1500, floors: 1, ageYears: 5, scope: 'renovation', city: 'Delhi', cityTier: 'metro' },
        priorities: { mustHave: ['Living Room', 'Dining Room'], niceToHave: [], emotionalWeights: { 'Living Room': 1.0, 'Dining Room': 1.0, 'Kitchen': 0.1, 'Bedroom': 0.1 } },
        lifestyle: { familyType: 'Single', members: 1, children: 0, workFromHome: false, hostingFreq: 'Always', cookingRole: 'Occasional', petsPresent: false }
      }),
      expected: 'hero_space',
    },
    {
      name: 'P13: Older couple, comfort and tech',
      handoff: buildHandoff({
        budget: 2000000,
        property: { type: 'apartment', areaSqFt: 1300, floors: 1, ageYears: 12, scope: 'renovation', city: 'Chennai', cityTier: 'metro' },
        sensory: { luxuryResolvedAs: 'invest-in-tech', lighting: 'warm', colors: [], textures: [] },
        lifestyle: { familyType: 'Couple', members: 2, children: 0, workFromHome: false, hostingFreq: 'Sometimes', cookingRole: 'Daily Ritual', petsPresent: false }
      }),
      expected: 'smart_renovation',
    },
    {
      name: 'P14: Huge space, tiny budget',
      handoff: buildHandoff({
        budget: 1000000,
        property: { type: 'independent_floor', areaSqFt: 4000, floors: 1, ageYears: 5, scope: 'renovation', city: 'Hyderabad', cityTier: 'metro' },
      }),
      expected: 'phased_evolution',
    },
    {
      name: 'P15: Premium Turnkey Builder Floor',
      handoff: buildHandoff({
        budget: 6000000,
        property: { type: 'turnkey', areaSqFt: 2000, floors: 1, ageYears: 0, scope: 'new_build', city: 'Gurgaon', cityTier: 'metro' },
        sensory: { luxuryResolvedAs: 'invest-in-materials', lighting: 'dramatic', colors: [], textures: ['organic'] }
      }),
      expected: 'full_premium',
    },
    {
      name: 'P16: Low budget, single room focus',
      handoff: buildHandoff({
        budget: 800000,
        property: { type: 'apartment', areaSqFt: 1200, floors: 1, ageYears: 7, scope: 'renovation', city: 'Noida', cityTier: 'metro' },
        priorities: { mustHave: ['Kitchen'], niceToHave: [], emotionalWeights: { 'Kitchen': 1.0, 'Living Room': 0.1 } }
      }),
      expected: 'hero_space',
    },
    {
      name: 'P17: Aging villa, structural issues, moderate budget',
      handoff: buildHandoff({
        budget: 4000000,
        property: { type: 'villa', areaSqFt: 3000, floors: 2, ageYears: 35, scope: 'renovation', city: 'Kolkata', cityTier: 'metro' },
      }),
      expected: 'rebuild_recommendation',
    },
    {
      name: 'P18: Growing family, space optimization needed',
      handoff: buildHandoff({
        budget: 1500000,
        property: { type: 'apartment', areaSqFt: 1100, floors: 1, ageYears: 5, scope: 'renovation', city: 'Pune', cityTier: 'tier1' },
        sensory: { luxuryResolvedAs: 'invest-in-space', lighting: 'natural', colors: [], textures: [] },
        lifestyle: { familyType: 'Nuclear', members: 5, children: 3, workFromHome: true, hostingFreq: 'Rarely', cookingRole: 'Daily Ritual', petsPresent: false }
      }),
      expected: 'phased_evolution',
    },
    {
      name: 'P19: Material luxury in a small footprint',
      handoff: buildHandoff({
        budget: 2000000,
        property: { type: 'apartment', areaSqFt: 800, floors: 1, ageYears: 2, scope: 'renovation', city: 'Mumbai', cityTier: 'metro' },
        sensory: { luxuryResolvedAs: 'invest-in-materials', lighting: 'warm', colors: [], textures: ['layered'] }
      }),
      expected: 'full_premium',
    },
    {
      name: 'P20: Barebones budget',
      handoff: buildHandoff({
        budget: 300000,
        property: { type: 'apartment', areaSqFt: 1000, floors: 1, ageYears: 5, scope: 'renovation', city: 'Delhi', cityTier: 'metro' },
      }),
      expected: 'phased_evolution',
    }
  ];

  for (const p of personas) {
    it(`should resolve correctly for ${p.name}`, () => {
      const { blueprint, engines } = runALCSPipeline({ handoff: p.handoff });
      const rec = blueprint.recommendation.executionPath;
      
      // Store result for distribution checking
      results.push(rec);

      // We allow hero_space or phased_evolution for P5 as both resolve the contradiction
      if (p.name === 'P5: Contradiction - Luxury desires but low budget') {
        expect(['hero_space', 'phased_evolution']).toContain(rec);
      } else {
        expect(rec).toBe(p.expected);
      }
      
      // Confidence should be >= 0 and <= 100
      expect(engines.recommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(engines.recommendation.confidence).toBeLessThanOrEqual(100);

      // Evidence ledger must exist
      expect(engines.recommendation.evidence.length).toBeGreaterThan(0);
    });
  }

  it('should pass quantitative distribution gates', () => {
    const counts: Record<string, number> = {
      full_premium: 0,
      hero_space: 0,
      smart_renovation: 0,
      phased_evolution: 0,
      rebuild_recommendation: 0
    };

    results.forEach(r => counts[r] = (counts[r] || 0) + 1);

    const total = results.length;
    const distribution = {
      full_premium: counts['full_premium'] / total,
      hero_space: counts['hero_space'] / total,
      smart_renovation: counts['smart_renovation'] / total,
      phased_evolution: counts['phased_evolution'] / total,
    };

    console.log('--- Distribution Results ---');
    console.log(`Full Premium: ${(distribution.full_premium * 100).toFixed(1)}%`);
    console.log(`Hero Space: ${(distribution.hero_space * 100).toFixed(1)}%`);
    console.log(`Smart Renovation: ${(distribution.smart_renovation * 100).toFixed(1)}%`);
    console.log(`Phased Evolution: ${(distribution.phased_evolution * 100).toFixed(1)}%`);
    console.log(`Rebuild: ${(counts['rebuild_recommendation'] / total * 100).toFixed(1)}%`);
    console.log('----------------------------');

    // No single recommendation > 50%
    Object.values(distribution).forEach(val => {
      expect(val).toBeLessThanOrEqual(0.50);
    });

    // Ensure all 4 core paths appear at least 10%
    Object.values(distribution).forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0.10);
    });
  });
});
