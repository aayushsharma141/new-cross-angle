import { computeAIRecommendation } from "../../../apps/web/src/addons/calculators/components/data/engines/ai-recommendation";
import { DiscoveryHandoff, PropertyFitTier } from "../../../apps/web/src/addons/calculators/components/data/discovery-handoff";

type EngineContext = Parameters<typeof computeAIRecommendation>[0];

const BASE_HANDOFF: DiscoveryHandoff = {
  userId: "anon-test",
  timestamp: new Date().toISOString(),
  emotionalGoal: "Comfortable Living",
  archetype: "The Warm Modernist",
  archetypeConfidence: 0.9,
  lifestyle: {
    familyType: "Nuclear",
    members: 2,
    children: 0,
    workFromHome: false,
    hostingFreq: "Sometimes",
    cookingRole: "Occasional",
    petsPresent: false,
  },
  property: {
    type: "apartment",
    areaSqFt: 1500,
    floors: 1,
    ageYears: 5,
    scope: "renovation",
    city: "Delhi",
    cityTier: "metro",
  },
  priorities: {
    mustHave: ["Living Room", "Kitchen", "Master Bedroom"],
    niceToHave: ["Guest Room"],
    emotionalWeights: {
      "Living Room": 0.5,
      "Kitchen": 0.5,
      "Master Bedroom": 0.5
    }
  },
  sensory: {
    lighting: "warm",
    colors: ["beige"],
    textures: ["matte"],
    luxuryResolvedAs: "balanced",
  },
  budget: 5000000,
  confidence: { emotionalGoal: 0.8, budget: 0.8, rooms: 0.8, overall: 0.8 },
  contradictions: [],
  acceptedCompromises: []
};

const BASE_CONTEXT: EngineContext = {
  handoff: BASE_HANDOFF,
  propertySuitability: { score: 75, tier: "good" },
  density: {
    level: "moderate",
    score: 50,
    dimensions: { occupancy: 50, activity: 50, storage: 50, noise: 50, maintenance: 50 },
    narrative: "",
    warnings: []
  },
  conflicts: { conflicts: [], overallAlignment: 80, narrative: "" },
  investment: {
    budgetArchetype: "balanced",
    archetypeNarrative: "",
    highImpactZones: ["Living Room", "Kitchen"],
    lowImpactZones: ["Guest Room"],
    investmentDensity: 3333,
    cityBenchmark: { low: 2000, median: 3000, high: 4000 },
    benchmarkPosition: "at"
  },
  simulation: {
    positives: [],
    frictions: [],
    futureRisks: [],
    livabilityScore: 80
  },
  existingProperty: {
    hasExistingProperty: true,
    recommendedPath: "strategic_renovation",
    pathRationale: "",
    renovationToRebuildRatio: 0.3,
    structuralConstraints: [],
    layoutFlexibility: "moderate"
  }
};

// --- FIXTURES ---

const USER_A = JSON.parse(JSON.stringify(BASE_CONTEXT)) as EngineContext;
USER_A.handoff.sensory = { lighting: "natural", luxuryResolvedAs: "invest-in-materials", textures: ["organic", "textural"], colors: [] };
USER_A.handoff.lifestyle.workFromHome = true;
USER_A.handoff.emotionalGoal = "Peace and Calm";
USER_A.propertySuitability.score = 90;
USER_A.conflicts.overallAlignment = 90;
USER_A.investment.benchmarkPosition = "premium"; // Ensure full_premium

const USER_B = JSON.parse(JSON.stringify(BASE_CONTEXT)) as EngineContext;
USER_B.handoff.sensory = { lighting: "dramatic", luxuryResolvedAs: "invest-in-tech", textures: ["minimal", "sleek"], colors: [] };
USER_B.handoff.lifestyle.hostingFreq = "Always";
USER_B.handoff.priorities.mustHave = ["Living Room", "Entertainment"];
USER_B.handoff.priorities.emotionalWeights = { "Living Room": 0.9, "Entertainment": 0.8, "Dining": 0.5 };
USER_B.investment.benchmarkPosition = "below";

const USER_C = JSON.parse(JSON.stringify(BASE_CONTEXT)) as EngineContext;
USER_C.investment.benchmarkPosition = "below";
USER_C.investment.budgetArchetype = "conservative";
USER_C.handoff.sensory.luxuryResolvedAs = "invest-in-materials"; // Sensory tries to push premium

const USER_D = JSON.parse(JSON.stringify(BASE_CONTEXT)) as EngineContext;
USER_D.handoff.sensory = { lighting: "dramatic", luxuryResolvedAs: "invest-in-materials", textures: ["layered"], colors: [] };

const USER_E = JSON.parse(JSON.stringify(BASE_CONTEXT)) as EngineContext;
USER_E.handoff.sensory.luxuryResolvedAs = "invest-in-tech";

const USER_F = JSON.parse(JSON.stringify(BASE_CONTEXT)) as EngineContext;
USER_F.handoff.lifestyle.familyType = "Joint";
USER_F.handoff.lifestyle.children = 2;

// --- TESTS ---
let fails = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    fails++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("--- TEST 1: Sensory Isolation ---");
const resBase = computeAIRecommendation(BASE_CONTEXT);
const resD = computeAIRecommendation(USER_D);
assert(resBase.executionPath !== resD.executionPath || resBase.strategyLabel !== resD.strategyLabel || resBase.evidence.length !== resD.evidence.length, "Changing sensory variables alters recommendation or evidence");

console.log("--- TEST 2: Social Priority Isolation ---");
const resB = computeAIRecommendation(USER_B);
console.log("USER B Path:", resB.executionPath);
console.log("USER B Evidence:", resB.evidence);
const hasSocialFocus = resB.evidence.some(e => e.signal === "High social hosting priority");
assert(hasSocialFocus, "Social priority (hosting = Always, high weights) correctly applies socialFocus scoring");

console.log("--- TEST 3: Budget Dominance ---");
const resC = computeAIRecommendation(USER_C);
assert(resC.executionPath !== "full_premium", "Budget constraint correctly disqualifies full premium execution");
// Verify cap on sensory
const totalSensoryC = resC.evidence.filter(e => e.source === "sensory").reduce((sum, e) => sum + e.scoreImpact, 0);
assert(totalSensoryC <= 25, "Sensory bonus is strictly capped at +25");

console.log("--- TEST 4: Property Dominance ---");
const poorProperty = JSON.parse(JSON.stringify(USER_D)) as EngineContext;
poorProperty.propertySuitability.score = 30;
poorProperty.propertySuitability.tier = "poor";
poorProperty.existingProperty.renovationToRebuildRatio = 0.8;
const resPoor = computeAIRecommendation(poorProperty);
assert(resPoor.executionPath !== "full_premium", "Luxury sensory profile does NOT force Full Premium on a poor property (Rebuild or other path wins)");

console.log("--- TEST 5: Recommendation Stability ---");
const run1 = JSON.stringify(computeAIRecommendation(USER_A));
let isStable = true;
for (let i = 0; i < 100; i++) {
  if (JSON.stringify(computeAIRecommendation(USER_A)) !== run1) isStable = false;
}
assert(isStable, "100 consecutive runs produce identical output (no hidden randomness)");

console.log("--- TEST 6: Explainability Contract ---");
const resA = computeAIRecommendation(USER_A);
const reasoning = resA.reasoning.toLowerCase();
let hasTrace = false;
if (resA.evidence.some(e => e.signal.toLowerCase().includes("natural light")) && reasoning.includes("natural light")) hasTrace = true;
if (resA.evidence.some(e => e.signal.toLowerCase().includes("material")) && reasoning.includes("material")) hasTrace = true;
assert(hasTrace, "Reasoning explicitly traces back to dominant sensory evidence");

if (fails > 0) {
  console.error(`\nCompleted with ${fails} failures.`);
  process.exit(1);
} else {
  console.log(`\nAll behavioral invariants passed.`);
}
