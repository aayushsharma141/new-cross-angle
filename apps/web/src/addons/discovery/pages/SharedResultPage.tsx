import { useParams } from "react-router-dom";
import { lazy, useEffect, useState, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { AestheticScores, Archetype, AIAestheticResult } from "@/types/discovery";
import { getArchetype } from "@/addons/discovery/core/archetype";
import { initialSignals } from "@/addons/discovery/flow/session";

const ResultsReveal = lazy(() => import("@/addons/discovery/components/ResultsReveal"));

/** Map archetype names to a stable OG image slug so we can serve
 *  pre-generated social preview images from /public/og/archetypes/.
 *  Falls back to a generic quiz OG if no match. */
function getArchetypeOgImage(archetypeName: string): string {
  const slugMap: Record<string, string> = {
    "The Quiet Curator": "quiet-curator",
    "The Social Minimalist": "social-minimalist",
    "The Warm Modernist": "warm-modernist",
    "The Expressive Collector": "expressive-collector",
    "The Serene Naturalist": "serene-naturalist",
    "The Bold Structuralist": "bold-structuralist",
    "The Intimate Storyteller": "intimate-storyteller",
    "The Refined Classicist": "refined-classicist",
    "The Fluid Experimentalist": "fluid-experimentalist",
    "The Grounded Pragmatist": "grounded-pragmatist",
  };
  const slug = slugMap[archetypeName];
  const base = typeof window !== "undefined" ? window.location.origin : "https://crossangleinterior.com";
  return slug
    ? `${base}/og/archetypes/${slug}.jpg`
    : `${base}/og/style-quiz.jpg`;
}

export default function SharedResultPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scores, setScores] = useState<AestheticScores | null>(null);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [aiResult, setAiResult] = useState<AIAestheticResult | null>(null);

  useEffect(() => {
    if (!slug) { setError(true); setLoading(false); return; }
    supabase
      .from("quiz_results")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setError(true); setLoading(false); return; }
        const s = data.scores as AestheticScores;
        setScores(s);
        setArchetype(getArchetype(s));
        if (data.ai_result) setAiResult(data.ai_result as AIAestheticResult);
        setLoading(false);
      });
  }, [slug]);

  // Derive display values — prefer AI result over archetype fallback
  const displayName = aiResult?.identityName || archetype?.name || "My Design Style";
  const displayTagline = aiResult?.tagline || archetype?.tagline || "Discover your unique interior design identity.";
  const ogImage = archetype ? getArchetypeOgImage(archetype.name) : `${typeof window !== "undefined" ? window.location.origin : "https://crossangleinterior.com"}/og/style-quiz.jpg`;
  const pageUrl = `${typeof window !== "undefined" ? window.location.origin : "https://crossangleinterior.com"}/aesthetic-discovery-engine/results/${slug}`;

  const ogTitle = `I'm "${displayName}" — What's Your Interior Design Style?`;
  const ogDescription = `${displayTagline} Take the free 9-step Aesthetic Discovery Engine by Cross Angle Interior.`;

  if (loading) return (
    <>
      <Helmet>
        <title>Loading Aesthetic Blueprint… | Cross Angle Interior</title>
      </Helmet>
      <main id="main-content" className="min-h-screen bg-site-bg flex items-center justify-center">
        <div className="w-10 h-10 border border-site-border border-t-site-gold rounded-full animate-spin" />
      </main>
    </>
  );

  if (error || !scores || !archetype) return (
    <>
      <Helmet>
        <title>Aesthetic Blueprint Not Found | Cross Angle Interior</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main id="main-content" className="min-h-screen bg-site-bg flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-lg">Result not found</p>
        <a href="/aesthetic-discovery-engine" className="text-[#c9a96e] underline text-sm">Discover your aesthetic yourself →</a>
      </main>
    </>
  );

  return (
    <main id="main-content" className="min-h-screen bg-site-bg">
      <Helmet>
        {/* Primary */}
        <title>{displayName} — Aesthetic Discovery Engine | Cross Angle Interior</title>
        <meta name="description" content={ogDescription} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Cross Angle Interior" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${displayName} — Design Style by Cross Angle`} />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@crossangleinterior" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={`${displayName} Design Style`} />

        {/* WhatsApp / iMessage preview helpers */}
        <meta property="og:image:type" content="image/jpeg" />

        {/* Structured data */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": ogTitle,
          "description": ogDescription,
          "url": pageUrl,
          "isPartOf": {
            "@type": "WebSite",
            "name": "Cross Angle Interior",
            "url": "https://crossangleinterior.com"
          }
        })}</script>
      </Helmet>

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border border-site-border border-t-site-gold rounded-full animate-spin" />
        </div>
      }>
        <ResultsReveal
          scores={scores}
          archetype={archetype}
          aiResult={aiResult}
          signals={initialSignals}
        />
      </Suspense>
    </main>
  );
}
