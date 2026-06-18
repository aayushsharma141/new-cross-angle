import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
// Mock Deno.serve before importing the module
const originalServe = Deno.serve;
// @ts-ignore: Mocking global Deno.serve
Deno.serve = () => {};

const { buildPrompt, scoreLabel } = await import("./index.ts");

Deno.test("scoreLabel should return correct labels based on thresholds", () => {
  assertEquals(scoreLabel("minimalism", 2), "Rich & Layered (2/10)");
  assertEquals(scoreLabel("warmth", 5), "Temperate (5/10)");
  assertEquals(scoreLabel("social", 8), "Open & Communal (8/10)");
  assertEquals(scoreLabel("structure", 10), "Architecturally Precise (10/10)");
  assertEquals(scoreLabel("novelty", 0), "Timeless & Classical (0/10)");
});

Deno.test("buildPrompt should handle empty signals gracefully", () => {
  const prompt = buildPrompt({});
  assertStringIncludes(prompt, "No specific signals provided");
  assertStringIncludes(prompt, "You are the world's most discerning interior design intelligence");
  assertStringIncludes(prompt, "Generate a JSON object with EXACTLY this structure");
});

Deno.test("buildPrompt should include aesthetic scores", () => {
  const prompt = buildPrompt({
    scores: {
      minimalism: 7,
      warmth: 4,
      social: 9,
      structure: 2,
      novelty: 5,
    },
  });
  assertStringIncludes(prompt, "Aesthetic dimension scores");
  assertStringIncludes(prompt, "Minimalism: Stripped & Edited");
  assertStringIncludes(prompt, "Warmth: Temperate");
  assertStringIncludes(prompt, "Social openness: Open & Communal");
  assertStringIncludes(prompt, "Structural rigour: Spontaneous & Fluid");
  assertStringIncludes(prompt, "Novelty appetite: Selective");
});

Deno.test("buildPrompt should incorporate selected image tags and labels", () => {
  const prompt = buildPrompt({
    selectedImageTags: [
      { minimalism: 3, structure: 2, novelty: 1 },
      { warmth: 3, social: 1, novelty: 2 },
    ],
    selectedImageLabels: ["Minimalist & Structured", "Warm & Inviting"],
  });
  assertStringIncludes(prompt, "Visual style profile (from 2 images they selected");
  assertStringIncludes(prompt, "Minimalism vs. Layered: leans layered (+3)");
  assertStringIncludes(prompt, "Specific visual themes they selected");
  assertStringIncludes(prompt, "Minimalist & Structured");
  assertStringIncludes(prompt, "Warm & Inviting");
});

Deno.test("buildPrompt should include textual inputs properly", () => {
  const prompt = buildPrompt({
    freeTextReflection: "I want a space that feels like a warm hug.",
    lightPreference: "Soft Candlelight",
    materialChoice: "Warm Timber",
    selectedAdjectives: ["Calm", "Organic"],
    lifestyleChoices: ["Slow Morning", "Analog Environment"],
    reflectionAnswers: [
      { question: "Where do you feel most at peace?", answer: "In the forest." }
    ]
  });
  
  assertStringIncludes(prompt, "I want a space that feels like a warm hug.");
  assertStringIncludes(prompt, "Soft Candlelight");
  assertStringIncludes(prompt, "Warm Timber");
  assertStringIncludes(prompt, "Calm, Organic");
  assertStringIncludes(prompt, "Slow Morning, Analog Environment");
  assertStringIncludes(prompt, "In the forest.");
});
