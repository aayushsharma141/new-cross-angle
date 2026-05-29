const SUPABASE_URL = "https://iuuivmwqodefdrrrewol.supabase.co";
const ANON_KEY = "sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ";

const payload = {
  signals: {
    selectedAdjectives: ["warm", "minimalist", "calm"],
    scores: {
      minimalism: 8,
      warmth: 7,
      social: 5,
      structure: 9,
      novelty: 4
    }
  }
};

async function test() {
  console.log("Testing aesthetic-ai Edge Function...");
  console.log("Endpoint:", `${SUPABASE_URL}/functions/v1/aesthetic-ai`);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/aesthetic-ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });

    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Raw Response Body:");
    console.log(text);

    if (res.ok) {
      const json = JSON.parse(text);
      console.log("\nParsed AIAestheticResult successfully!");
      console.log("Identity Name:", json.identityName);
      console.log("Tagline:", json.tagline);
      console.log("Traits:", json.traits);
      console.log("Material Bias:", json.materialBias);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
