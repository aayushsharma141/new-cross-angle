import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { CostEstimator } from "@/addons/calculators/components/CostEstimator";
import { loadDiscoveryResult } from "@/addons/discovery/core/persistence";
import { ECOSYSTEM_COPY, ECOSYSTEM_ROUTES } from "@/addons/_shared/ecosystemCopy";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import {
  WorkspaceShell, wsEyebrow, wsRule, wsDisplay, wsBody, wsMeta,
  wsPrimaryCta, wsSecondaryCta, wsTextLink, wsArrow,
} from "@/addons/_shared/WorkspaceShell";
import { EntryChoice, type EntryDoor } from "@/addons/_shared/EntryChoice";
import { SampleEstimatePreview } from "@/addons/calculators/components/SampleEstimatePreview";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const ESTIMATE_OUTPUTS = [
  "Investment range for your scope",
  "Room-by-room cost breakdown",
  "Finish level comparison",
  "A brief you can bring to consultation",
];

const BLUEPRINT_OUTPUTS = [
  "Your design archetype",
  "Colour and material direction",
  "Spatial and lighting preferences",
  "An estimate calibrated to your taste",
];

const CostEstimatorPage = () => {
  const [started, setStarted] = useState(false);
  const discovery = useMemo(() => loadDiscoveryResult(), []);
  const blueprintName = discovery?.aiIdentity?.identityName || discovery?.displayName || discovery?.archetype;
  const hasBlueprint = Boolean(blueprintName);

  if (started) {
    return (
      <main id="main-content" className="relative h-screen w-full overflow-hidden bg-[#FAF8F5]">
        <Helmet>
          <title>Cost Estimator | Cross Angle Interior</title>
          <meta property="og:title" content="Cost Estimator | Cross Angle Interior" />
          <meta property="og:description" content="Estimate your interior design project cost — personalized for your style and scope." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://crossangleinterior.com/estimate" />
          <link rel="canonical" href="https://crossangleinterior.com/estimate" />
        </Helmet>
        <CostEstimator onBack={() => setStarted(false)} />
      </main>
    );
  }

  /* The estimator is the door being opened; discovery is the deeper route in. */
  const doors: EntryDoor[] = [
    {
      id: "estimate",
      index: "01",
      eyebrow: "Straight to numbers",
      title: hasBlueprint ? <>Estimate with your blueprint.</> : <>Estimate your project.</>,
      description: hasBlueprint
        ? ECOSYSTEM_COPY.estimatorWithBlueprint
        : "Answer a short set of questions about your space, scope and finish level. No style quiz required.",
      duration: "About 3 minutes",
      outputs: ESTIMATE_OUTPUTS,
      featured: true,
      action: (
        <button type="button" onClick={() => setStarted(true)} className={wsPrimaryCta}>
          {hasBlueprint ? ECOSYSTEM_COPY.ctas.startPersonalizedEstimator : ECOSYSTEM_COPY.ctas.startEstimator}
          {wsArrow}
        </button>
      ),
    },
    {
      id: "discovery",
      index: "02",
      eyebrow: ECOSYSTEM_COPY.discoveryRole.label,
      title: <>Find your design identity first.</>,
      description: ECOSYSTEM_COPY.discoveryRole.description,
      duration: "About 6 minutes",
      outputs: BLUEPRINT_OUTPUTS,
      action: (
        <Link to={ECOSYSTEM_ROUTES.discovery} className={wsSecondaryCta}>
          {hasBlueprint ? ECOSYSTEM_COPY.ctas.refineDiscovery : ECOSYSTEM_COPY.ctas.startDiscovery}
          {wsArrow}
        </Link>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Cost Estimator | Cross Angle Interior</title>
        <meta
          name="description"
          content="Turn your Discovery Blueprint into a personalized interior estimate, or start with a direct scope-based estimate."
        />
        <meta property="og:title" content="Cost Estimator | Cross Angle Interior" />
        <meta property="og:description" content="Turn your Discovery Blueprint into a personalized interior estimate, or start with a direct scope-based estimate." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crossangleinterior.com/estimate" />
        <link rel="canonical" href="https://crossangleinterior.com/estimate" />
      </Helmet>

      <SchemaMarkup
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Cost Estimator", url: "/estimate" }
          ]
        }}
      />

      <WorkspaceShell>
        <main id="main-content" className="mx-auto w-full max-w-[1280px] px-6 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
          {/* Statement */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="max-w-3xl"
          >
            <span className={cn(wsEyebrow, "mb-8")}>
              <span aria-hidden="true" className={wsRule} />
              Free · No obligation
            </span>
            <h1 className={cn(wsDisplay, "mb-6 text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02]")}>
              Know what your interior{" "}
              <span className="italic font-light text-[var(--ws-bronze)]">actually costs.</span>
            </h1>
            <p className={cn(wsBody, "max-w-xl")}>
              Most studios quote after three meetings. Ours gives you a costed range before the first one — built from
              real project data, and sharper still once it knows your taste.
            </p>
          </motion.div>

          {/* Blueprint status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--ws-line)] pt-6"
          >
            <span className={wsMeta}>{hasBlueprint ? "Blueprint connected" : "No blueprint yet"}</span>
            <span className="text-sm font-light text-[var(--ws-ink)]/80">
              {hasBlueprint ? (
                <>Your estimate will be calibrated to <span className="font-medium text-[var(--ws-bronze)]">{blueprintName}</span>.</>
              ) : (
                ECOSYSTEM_COPY.estimatorWithoutBlueprint
              )}
            </span>
          </motion.div>

          {/* The two doors */}
          <div className="mt-16 md:mt-24">
            <EntryChoice doors={doors} />
          </div>

          {/* What the tool hands back */}
          <div className="mt-24 md:mt-32">
            <SampleEstimatePreview />
          </div>

          {/* Closing route out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--ws-line)] pt-8"
          >
            <span className={wsMeta}>Prefer to talk it through?</span>
            <Link to={ECOSYSTEM_ROUTES.contact} className={wsTextLink}>
              {ECOSYSTEM_COPY.ctas.consult} {wsArrow}
            </Link>
          </motion.div>
        </main>
      </WorkspaceShell>
    </>
  );
};

export default CostEstimatorPage;
