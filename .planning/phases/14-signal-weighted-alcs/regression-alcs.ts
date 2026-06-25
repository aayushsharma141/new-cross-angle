import fs from "fs";
import path from "path";
import { computeAIRecommendation } from "../../../apps/web/src/addons/calculators/components/data/engines/ai-recommendation";
import { DiscoveryHandoff } from "../../../apps/web/src/addons/calculators/components/data/discovery-handoff";

type EngineContext = Parameters<typeof computeAIRecommendation>[0];

const FIXTURES_DIR = path.join(".planning/phases/14-signal-weighted-alcs", "fixtures");
if (!fs.existsSync(FIXTURES_DIR)) fs.mkdirSync(FIXTURES_DIR, { recursive: true });

const BASE_HANDOFF: DiscoveryHandoff = {
  userId: "anon-test",
  timestamp: new Date().toISOString(),
  emotionalGoal: "Comfortable Living",
  archetype: "The Warm Modernist",
  archetypeConfidence: 0.9,
  lifestyle: { familyType: "Nuclear", members: 2, children: 0, workFromHome: false, hostingFreq: "Sometimes", cookingRole: "Occasional", petsPresent: false },
  property: { type: "apartment", areaSqFt: 1500, floors: 1, ageYears: 5, scope: "renovation", city: "Delhi", cityTier: "metro" },
  priorities: { mustHave: ["Living Room", "Kitchen"], niceToHave: [], emotionalWeights: { "Living Room": 0.5, "Kitchen": 0.5 } },
  sensory: { lighting: "warm", colors: [], textures: [], luxuryResolvedAs: "balanced" },
  budget: 5000000,
  confidence: { emotionalGoal: 0.8, budget: 0.8, rooms: 0.8, overall: 0.8 },
  contradictions: [],
  acceptedCompromises: []
};

const BASE_CONTEXT: EngineContext = {
  handoff: BASE_HANDOFF,
  propertySuitability: { score: 75, tier: "good" },
  density: { level: "moderate", score: 50, dimensions: { occupancy: 50, activity: 50, storage: 50, noise: 50, maintenance: 50 }, narrative: "", warnings: [] },
  conflicts: { conflicts: [], overallAlignment: 80, narrative: "" },
  investment: { budgetArchetype: "balanced", archetypeNarrative: "", highImpactZones: ["Living Room"], lowImpactZones: [], investmentDensity: 3333, cityBenchmark: { low: 2000, median: 3000, high: 4000 }, benchmarkPosition: "at" },
  simulation: { positives: [], frictions: [], futureRisks: [], livabilityScore: 80 },
  existingProperty: { hasExistingProperty: true, recommendedPath: "strategic_renovation", pathRationale: "", renovationToRebuildRatio: 0.3, structuralConstraints: [], layoutFlexibility: "moderate" }
};

const users: Record<string, EngineContext> = {
  "user-a": (() => { const u = JSON.parse(JSON.stringify(BASE_CONTEXT)); u.handoff.sensory = { lighting: "natural", luxuryResolvedAs: "invest-in-materials", textures: ["organic"], colors: [] }; u.handoff.lifestyle.workFromHome = true; return u; })(),
  "user-b": (() => { const u = JSON.parse(JSON.stringify(BASE_CONTEXT)); u.handoff.sensory = { lighting: "dramatic", luxuryResolvedAs: "invest-in-tech", textures: ["sleek"], colors: [] }; u.handoff.lifestyle.hostingFreq = "Always"; u.handoff.priorities.emotionalWeights = { "Living Room": 0.9 }; return u; })(),
  "user-c": (() => { const u = JSON.parse(JSON.stringify(BASE_CONTEXT)); u.investment.benchmarkPosition = "below"; u.handoff.sensory.luxuryResolvedAs = "invest-in-materials"; return u; })(),
};

const isUpdateMode = process.argv.includes("--update");
let fails = 0;

for (const [name, context] of Object.entries(users)) {
  const result = computeAIRecommendation(context);
  // remove dynamic timestamp if any
  const cleanResult = JSON.parse(JSON.stringify(result));
  
  const goldenPath = path.join(FIXTURES_DIR, `golden-${name}.json`);
  const validationPath = path.join(".planning/phases/14-signal-weighted-alcs", "validation");
  if (!fs.existsSync(validationPath)) fs.mkdirSync(validationPath, { recursive: true });
  
  fs.writeFileSync(path.join(validationPath, `latest-${name}.json`), JSON.stringify({ input: context, result: cleanResult }, null, 2));

  if (isUpdateMode || !fs.existsSync(goldenPath)) {
    fs.writeFileSync(goldenPath, JSON.stringify(cleanResult, null, 2));
    console.log(`Updated golden fixture for ${name}`);
  } else {
    const golden = JSON.parse(fs.readFileSync(goldenPath, "utf-8"));
    const diff = JSON.stringify(golden) !== JSON.stringify(cleanResult);
    if (diff) {
      console.error(`❌ Regression detected in ${name}! Output no longer matches golden fixture.`);
      fails++;
    } else {
      console.log(`✅ ${name} matches golden fixture.`);
    }
  }
}

if (fails > 0) {
  console.error(`\nRegression suite failed. Run with --update to approve new behavior.`);
  process.exit(1);
} else {
  console.log(`\nAll regression checks passed.`);
}
