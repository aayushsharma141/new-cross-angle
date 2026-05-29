import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AestheticScores {
  minimalism: number;
  warmth: number;
  social: number;
  structure: number;
  novelty: number;
}

interface UserSignals {
  reflectionAnswers?: { question: string; answer: string }[];
  lifestyleChoices?: string[];
  selectedImageIds?: number[];
  selectedAdjectives?: string[];
  freeTextReflection?: string;
  sliderValues?: { label: string; value: number }[];
  materialChoice?: string;
  lightPreference?: string;
  scores?: AestheticScores;
}

interface AIAestheticResult {
  identityName: string;
  tagline: string;
  narrative: string;
  traits: string[];
  materialBias: string;
  confidence: number;
  sensoryMap: {
    light: string;
    material: string;
    layout: string;
    energy: string;
  };
  designStrategy: {
    lighting: string;
    materials: string;
    colorPalette: string;
    layout: string;
    atmosphere: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const signals: UserSignals = body?.signals ?? {};

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const prompt = buildPrompt(signals);

    const orRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://crossangle.com", // Optional, for OpenRouter rankings
          "X-Title": "Cross Angle Interior", // Optional, for OpenRouter rankings
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.88,
          max_tokens: 2000,
        }),
      },
    );

    if (!orRes.ok) {
      const errText = await orRes.text();
      console.error("OpenRouter API error:", orRes.status, errText);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const orData = await orRes.json();
    const rawText =
      orData?.choices?.[0]?.message?.content ?? "";

    let result: AIAestheticResult;
    try {
      result = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse Gemini JSON:", rawText.slice(0, 300));
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate required fields
    if (!result.identityName || !result.tagline || !result.narrative) {
      console.error("Incomplete AI response:", JSON.stringify(result).slice(0, 200));
      return new Response(
        JSON.stringify({ error: "Incomplete AI response" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Ensure defaults for optional fields
    const finalResult: AIAestheticResult = {
      identityName: result.identityName,
      tagline: result.tagline,
      narrative: result.narrative,
      traits: result.traits ?? [],
      materialBias: result.materialBias ?? "",
      confidence: result.confidence ?? 0.8,
      sensoryMap: result.sensoryMap ?? {
        light: "Soft Diffusion",
        material: "Natural Grain",
        layout: "Balanced Flow",
        energy: "Quiet Focus",
      },
      designStrategy: result.designStrategy ?? {
        lighting: "Layer indirect lighting for warmth and depth.",
        materials: "Prioritise honest materials that age beautifully.",
        colorPalette: "Neutral tones with natural accents.",
        layout: "Balance open flow with intimate pockets.",
        atmosphere: "Calm, composed, and quietly intentional.",
      },
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

function scoreLabel(key: string, val: number): string {
  const labels: Record<string, [string, string, string]> = {
    minimalism: ["Rich & Layered", "Balanced", "Stripped & Edited"],
    warmth: ["Cool & Precise", "Temperate", "Warm & Inviting"],
    social: ["Private & Intimate", "Mixed", "Open & Communal"],
    structure: ["Spontaneous & Fluid", "Moderate", "Architecturally Precise"],
    novelty: ["Timeless & Classical", "Selective", "Experimental & Avant-Garde"],
  };
  const thresholds = labels[key];
  if (!thresholds) return `${val}/10`;
  if (val <= 3) return `${thresholds[0]} (${val}/10)`;
  if (val <= 6) return `${thresholds[1]} (${val}/10)`;
  return `${thresholds[2]} (${val}/10)`;
}

function buildPrompt(signals: UserSignals): string {
  const parts: string[] = [];

  // Scores — the most reliable signal
  if (signals.scores) {
    const s = signals.scores;
    parts.push(
      `Aesthetic dimension scores (each 0-10):
  - Minimalism: ${scoreLabel("minimalism", s.minimalism)}
  - Warmth: ${scoreLabel("warmth", s.warmth)}
  - Social openness: ${scoreLabel("social", s.social)}
  - Structural rigour: ${scoreLabel("structure", s.structure)}
  - Novelty appetite: ${scoreLabel("novelty", s.novelty)}`,
    );
  }

  // Adjectives the user chose
  if (signals.selectedAdjectives?.length) {
    parts.push(
      `Words they chose to describe their ideal space: ${signals.selectedAdjectives.join(", ")}`,
    );
  }

  // Light preference
  if (signals.lightPreference) {
    parts.push(`Their preferred light quality: "${signals.lightPreference}"`);
  }

  // Material choice
  if (signals.materialChoice) {
    parts.push(
      `The material world they're drawn to: "${signals.materialChoice}"`,
    );
  }

  // Emotional priorities (sliders)
  if (signals.sliderValues?.length) {
    const sliderLines = signals.sliderValues
      .map((s) => `  - ${s.label}: ${s.value}/10`)
      .join("\n");
    parts.push(`Emotional priorities (scored by them):\n${sliderLines}`);
  }

  // Lifestyle choices
  if (signals.lifestyleChoices?.length) {
    parts.push(
      `Lifestyle choices: ${signals.lifestyleChoices.join(", ")}`,
    );
  }

  // Open reflection — most personal signal
  if (signals.freeTextReflection?.trim()) {
    parts.push(
      `In their own words about their ideal space:\n"${signals.freeTextReflection.trim()}"`,
    );
  }

  // Reflection prompt answers
  if (signals.reflectionAnswers?.length) {
    const answerLines = signals.reflectionAnswers
      .filter((a) => a.answer?.trim())
      .map((a) => `  Q: ${a.question}\n  A: "${a.answer.trim()}"`)
      .join("\n\n");
    if (answerLines) {
      parts.push(`Guided reflection answers:\n${answerLines}`);
    }
  }

  // Number of visual references
  if (signals.selectedImageIds?.length) {
    parts.push(
      `They selected ${signals.selectedImageIds.length} visual references that resonated with them`,
    );
  }

  const signalSummary =
    parts.length > 0
      ? parts.join("\n\n")
      : "No specific signals provided — generate a balanced, considered aesthetic identity.";

  return `You are the world's most discerning interior design intelligence — a critic, curator, and psychologist combined. Your role is to synthesise a person's behavioural signals into a deeply personal, singular aesthetic identity. Your language is elevated editorial prose.

BEHAVIOURAL SIGNALS:
${signalSummary}

Generate a JSON object with EXACTLY this structure. Return ONLY the JSON — no markdown fences, no surrounding text:

{
  "identityName": "A unique, original 2–4 word poetic title. Must feel like a private designation only they would understand. Examples of the right register: 'The Liminal Purist', 'The Burnished Recluse', 'The Considered Romantic', 'The Material Witness'. NEVER use existing archetype names like 'The Quiet Curator' or 'The Warm Modernist'.",
  "tagline": "One sentence, 18–28 words. A private truth about how this person experiences space. Should feel like something they've always felt but never articulated. Use second person ('you').",
  "narrative": "3–4 sentences, 65–100 words. An intimate, resonant description of their spatial psychology. Written directly to them in second person. Reference their specific signals where possible. Avoid design clichés and generic descriptions.",
  "traits": ["Trait1", "Trait2", "Trait3", "Trait4", "Trait5"],
  "materialBias": "2–4 words naming their dominant material language (e.g. 'Aged Oak & Stone', 'Burnished Steel & Linen')",
  "confidence": 0.85,
  "sensoryMap": {
    "light": "2–3 evocative words (e.g. 'Amber Hour', 'Northern Wash', 'Soft Tungsten')",
    "material": "2–3 words (e.g. 'Raw Linen', 'Worn Patina', 'Cool Concrete')",
    "layout": "2–3 words describing spatial rhythm (e.g. 'Still Axis', 'Gathered Flow', 'Open Threshold')",
    "energy": "2–3 words for emotional resonance (e.g. 'Focused Quiet', 'Warm Tension', 'Serene Pulse')"
  },
  "designStrategy": {
    "lighting": "One actionable lighting direction, 20–40 words. Reference real techniques — indirect wash, warm tungsten, raking light, etc.",
    "materials": "One material strategy, 20–40 words. Reference real materials and their interplay.",
    "colorPalette": "One colour direction, 15–30 words. Name actual palettes or reference points.",
    "layout": "One spatial arrangement principle, 20–40 words. Reference real design concepts — axis, threshold, negative space.",
    "atmosphere": "One atmospheric intention, 15–30 words. Describe the emotional register the space should inhabit."
  }
}

Rules you must follow:
- identityName must be entirely original — never reuse any existing interior design archetype name
- All prose must feel like it was written by a human editor at a design magazine — considered, specific, non-generic
- traits should be compound or nuanced descriptors (e.g. 'Architecturally Sensitive', 'Materially Precise', 'Quietly Opinionated')
- If the signals suggest creative tension or contradiction, embrace it — the most compelling identities live at intersections
- confidence should reflect how strongly the signals aligned (0.6 = noisy/contradictory, 0.95 = very coherent)
- Return ONLY the JSON object`;
}
