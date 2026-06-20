import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import ChipOption from "@/components/reflection/ChipOption";
import ImageOption from "@/components/reflection/ImageOption";

// Morning images
import imgMorningSilence from "@/assets/discovery/reflect-morning-silence.jpg";
import imgMorningMovement from "@/assets/discovery/reflect-morning-movement.jpg";
import imgMorningCoffee from "@/assets/discovery/reflect-morning-coffee.jpg";
import imgEnvSunlight from "@/assets/discovery/reflect-env-sunlight.jpg";
import imgEnvMinimal from "@/assets/discovery/reflect-env-minimal.jpg";
import imgEnvMusic from "@/assets/discovery/reflect-env-music.jpg";
import imgEnvKitchen from "@/assets/discovery/reflect-env-kitchen.jpg";
import imgEnvFocused from "@/assets/discovery/reflect-env-focused.jpg";
import imgEveningBook from "@/assets/discovery/reflect-evening-book.jpg";
import imgEveningDinner from "@/assets/discovery/reflect-evening-dinner.jpg";
import imgEveningCreative from "@/assets/discovery/reflect-evening-creative.jpg";
import imgEveningFilm from "@/assets/discovery/reflect-evening-film.jpg";
import imgEveningQuiet from "@/assets/discovery/reflect-evening-quiet.jpg";
import imgEveningConvo from "@/assets/discovery/reflect-evening-convo.jpg";
import imgNightWarm from "@/assets/discovery/reflect-night-warm.jpg";
import imgNightCrisp from "@/assets/discovery/reflect-night-crisp.jpg";
import imgNightCandle from "@/assets/discovery/reflect-night-candle.jpg";
import imgNightAmbient from "@/assets/discovery/reflect-night-ambient.jpg";
import imgNightMinimal from "@/assets/discovery/reflect-night-minimal.jpg";
import imgBedroomSanctuary from "@/assets/discovery/reflect-bedroom-sanctuary.jpg";
import imgBedroomRetreat from "@/assets/discovery/reflect-bedroom-retreat.jpg";
import imgBedroomDesign from "@/assets/discovery/reflect-bedroom-design.jpg";
import imgBedroomCocoon from "@/assets/discovery/reflect-bedroom-cocoon.jpg";
import imgBedroomMinimal from "@/assets/discovery/reflect-bedroom-minimal.jpg";
import imgWorkspaceQuiet from "@/assets/discovery/reflect-workspace-quiet.jpg";
import imgWorkspaceOpen from "@/assets/discovery/reflect-workspace-open.jpg";
import imgWorkspaceStructured from "@/assets/discovery/reflect-workspace-structured.jpg";
import imgWorkspaceInspiring from "@/assets/discovery/reflect-workspace-inspiring.jpg";
import imgWorkspaceDynamic from "@/assets/discovery/reflect-workspace-dynamic.jpg";

interface ReflectionPromptProps {
  onComplete: (answers: { question: string; answer: string }[]) => void;
}

type QuestionType = "chips" | "image-cards";

interface QuestionDef {
  key: string;
  type: QuestionType;
  optionKeys: string[];
  images?: string[];
  assetKeys?: string[];
  section: number;
}

const sectionGradients = [
  "radial-gradient(ellipse at top, hsl(40 60% 95% / 0.5) 0%, transparent 60%)",
  "radial-gradient(ellipse at top, hsl(45 50% 93% / 0.5) 0%, transparent 60%)",
  "radial-gradient(ellipse at top, hsl(25 40% 90% / 0.5) 0%, transparent 60%)",
  "radial-gradient(ellipse at top, hsl(230 20% 88% / 0.5) 0%, transparent 60%)",
  "radial-gradient(ellipse at top, hsl(30 30% 92% / 0.4) 0%, transparent 60%)",
  "radial-gradient(ellipse at top, hsl(120 15% 92% / 0.4) 0%, transparent 60%)",
  "radial-gradient(ellipse at top, hsl(260 10% 92% / 0.4) 0%, transparent 60%)",
  "radial-gradient(ellipse at top, hsl(15 40% 90% / 0.4) 0%, transparent 60%)",
];

const ReflectionPrompt = ({ onComplete }: ReflectionPromptProps) => {
  const { t } = useLanguage();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showWash, setShowWash] = useState(false);

  const sectionKeys = [
    "reflection_section_morning", "reflection_section_midday",
    "reflection_section_evening", "reflection_section_night",
    "reflection_section_social", "reflection_section_sensory",
    "reflection_section_deeper", "reflection_section_identity",
  ];

  const sectionLabels = sectionKeys.map((k) => t(k));

  const questions: QuestionDef[] = useMemo(() => [
    { key: "rq1", type: "image-cards", section: 0, optionKeys: ["rq1_o1", "rq1_o2", "rq1_o3", "rq1_o4", "rq1_o5"], images: [imgMorningSilence, imgMorningMovement, imgMorningCoffee, imgEnvFocused, imgEnvKitchen], assetKeys: ["discovery_reflect-morning-silence", "discovery_reflect-morning-movement", "discovery_reflect-morning-coffee", "discovery_reflect-env-focused", "discovery_reflect-env-kitchen"] },
    { key: "rq2", type: "image-cards", section: 0, optionKeys: ["rq2_o1", "rq2_o2", "rq2_o3", "rq2_o4", "rq2_o5"], images: [imgEnvSunlight, imgEnvMinimal, imgEnvMusic, imgEnvKitchen, imgEnvFocused], assetKeys: ["discovery_reflect-env-sunlight", "discovery_reflect-env-minimal", "discovery_reflect-env-music", "discovery_reflect-env-kitchen", "discovery_reflect-env-focused"] },
    { key: "rq3", type: "chips", section: 1, optionKeys: ["rq3_o1", "rq3_o2", "rq3_o3", "rq3_o4", "rq3_o5"] },
    { key: "rq4", type: "image-cards", section: 1, optionKeys: ["rq4_o1", "rq4_o2", "rq4_o3", "rq4_o4", "rq4_o5"], images: [imgWorkspaceQuiet, imgWorkspaceOpen, imgWorkspaceStructured, imgWorkspaceInspiring, imgWorkspaceDynamic], assetKeys: ["discovery_reflect-workspace-quiet", "discovery_reflect-workspace-open", "discovery_reflect-workspace-structured", "discovery_reflect-workspace-inspiring", "discovery_reflect-workspace-dynamic"] },
    { key: "rq5", type: "image-cards", section: 2, optionKeys: ["rq5_o1", "rq5_o2", "rq5_o3", "rq5_o4", "rq5_o5", "rq5_o6"], images: [imgEveningBook, imgEveningDinner, imgEveningCreative, imgEveningFilm, imgEveningQuiet, imgEveningConvo], assetKeys: ["discovery_reflect-evening-book", "discovery_reflect-evening-dinner", "discovery_reflect-evening-creative", "discovery_reflect-evening-film", "discovery_reflect-evening-quiet", "discovery_reflect-evening-convo"] },
    { key: "rq6", type: "image-cards", section: 2, optionKeys: ["rq6_o1", "rq6_o2", "rq6_o3", "rq6_o4", "rq6_o5"], images: [imgNightWarm, imgNightCrisp, imgNightCandle, imgNightAmbient, imgNightMinimal], assetKeys: ["discovery_reflect-night-warm", "discovery_reflect-night-crisp", "discovery_reflect-night-candle", "discovery_reflect-night-ambient", "discovery_reflect-night-minimal"] },
    { key: "rq7", type: "chips", section: 3, optionKeys: ["rq7_o1", "rq7_o2", "rq7_o3", "rq7_o4", "rq7_o5"] },
    { key: "rq8", type: "image-cards", section: 3, optionKeys: ["rq8_o1", "rq8_o2", "rq8_o3", "rq8_o4", "rq8_o5"], images: [imgBedroomSanctuary, imgBedroomRetreat, imgBedroomDesign, imgBedroomCocoon, imgBedroomMinimal], assetKeys: ["discovery_reflect-bedroom-sanctuary", "discovery_reflect-bedroom-retreat", "discovery_reflect-bedroom-design", "discovery_reflect-bedroom-cocoon", "discovery_reflect-bedroom-minimal"] },
    { key: "rq9", type: "chips", section: 4, optionKeys: ["rq9_o1", "rq9_o2", "rq9_o3", "rq9_o4", "rq9_o5"] },
    { key: "rq10", type: "chips", section: 4, optionKeys: ["rq10_o1", "rq10_o2", "rq10_o3", "rq10_o4", "rq10_o5"] },
    { key: "rq11", type: "chips", section: 5, optionKeys: ["rq11_o1", "rq11_o2", "rq11_o3", "rq11_o4", "rq11_o5"] },
    { key: "rq12", type: "chips", section: 5, optionKeys: ["rq12_o1", "rq12_o2", "rq12_o3", "rq12_o4", "rq12_o5"] },
    { key: "rq13", type: "chips", section: 6, optionKeys: ["rq13_o1", "rq13_o2", "rq13_o3", "rq13_o4", "rq13_o5"] },
    { key: "rq14", type: "chips", section: 6, optionKeys: ["rq14_o1", "rq14_o2", "rq14_o3", "rq14_o4", "rq14_o5"] },
    { key: "rq15", type: "chips", section: 7, optionKeys: ["rq15_o1", "rq15_o2", "rq15_o3", "rq15_o4", "rq15_o5"] },
  ], []);

  const sectionQuestions = questions.filter((q) => q.section === currentSection);
  const totalSections = sectionKeys.length;
  const isLastSection = currentSection === totalSections - 1;

  const selectAnswer = (qKey: string, optKey: string) => {
    setAnswers((prev) => ({ ...prev, [qKey]: prev[qKey] === optKey ? "" : optKey }));
  };

  const goNext = () => {
    if (isLastSection) {
      const result = questions.map((q) => ({ question: t(q.key), answer: answers[q.key] ? t(answers[q.key]) : "" }));
      onComplete(result);
    } else {
      setShowWash(true);
      setTimeout(() => {
        setCurrentSection((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setShowWash(false), 300);
      }, 200);
    }
  };

  const goBack = () => {
    if (currentSection > 0) {
      setShowWash(true);
      setTimeout(() => {
        setCurrentSection((s) => s - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setShowWash(false), 300);
      }, 200);
    }
  };

  const renderQuestion = (q: QuestionDef, idx: number) => {
    const optionLabels = q.optionKeys.map((k) => t(k));
    const hasImages = q.type === "image-cards" && q.images;
    const imageOptions = hasImages
      ? q.optionKeys.map((k, i) => ({ key: k, label: optionLabels[i], img: q.images![i], assetKey: q.assetKeys?.[i] })).filter((o) => o.img)
      : [];
    const chipOptions = !hasImages
      ? q.optionKeys.map((k, i) => ({ key: k, label: optionLabels[i] }))
      : [];

    return (
      <motion.div
        key={q.key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08 }}
        className="flex flex-col h-full"
      >
        {/* Question label — 20–22px, no underline, top border separator */}
        <h3 className="text-xl xl:text-2xl font-medium text-[#1a1a1a] mb-4 pb-3 leading-snug no-underline border-t border-[#1a1a1a]/[0.08] pt-4 shrink-0 min-h-[56px] flex items-start tracking-tight">
          {t(q.key)}
        </h3>

        {/* Image grid — smart layout, fills column height */}
        {imageOptions.length > 0 && (() => {
          const visibleImages = imageOptions.slice(0, 4);
          return (
            <div
              className="grid gap-3 grid-cols-2 w-full"
              style={{ gridTemplateRows: "repeat(2, 260px)" }}
            >
              {visibleImages.map((o) => (
                <ImageOption
                  key={o.key}
                  label={o.label}
                  imageSrc={o.img!}
                  assetKey={o.assetKey}
                  isActive={answers[q.key] === o.key}
                  onClick={() => selectAnswer(q.key, o.key)}
                />
              ))}
            </div>
          );
        })()}

        {/* Option rows — full-width, stacked, luxury list */}
        {chipOptions.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col border-t border-[#1a1a1a]/[0.06]">
            {chipOptions.map((o, i) => (
              <ChipOption
                key={o.key}
                label={o.label}
                index={i}
                isActive={answers[q.key] === o.key}
                onClick={() => selectAnswer(q.key, o.key)}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex h-full w-full flex-col overflow-hidden"
    >
      {/* Ambient background gradient */}
      <motion.div
        key={`grad-${currentSection}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: sectionGradients[currentSection] }}
      />

      {/* Cinematic faint noise texture to reduce digital flatness */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")", backgroundRepeat: 'repeat' }}
      />

      {/* Color wash transition overlay */}
      <AnimatePresence>
        {showWash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 pointer-events-none bg-[#1a1a1a]"
          />
        )}
      </AnimatePresence>

      {/* ── HEADER: bold section context ── */}
      <div className="relative z-10 shrink-0 px-8 xl:px-12 pt-3 pb-3 border-b border-[#1a1a1a]/[0.06]">
        <div className="flex items-center justify-between gap-8">
          {/* Left: eyebrow + large serif title + amber accent */}
          <div className="flex items-center gap-3">
            {/* Thin gold left accent */}
            <div className="w-[3px] h-8 bg-[#8b6f47]/60 rounded-full shrink-0" />
            <div className="flex flex-col gap-0">
              <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#1a1a1a]/70 font-semibold leading-none mb-0.5">
                Daily Habits
                <span className="mx-2 text-[#1a1a1a]/40">·</span>
                {String(currentSection + 1).padStart(2, "0")}/{totalSections}
              </span>
              <h2 className="-display text-2xl xl:text-3xl font-medium text-[#1a1a1a] leading-none mt-1">
                {sectionLabels[currentSection]}
              </h2>
            </div>
          </div>

          {/* Right: step progress dots + label — vertically centered */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Precision ceremonial progress track */}
            <div className="w-[120px] h-[2px] bg-[#1a1a1a]/10 rounded-full overflow-hidden relative mt-1">
              <motion.div
                initial={false}
                animate={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-0 bottom-0 bg-[#8b6f47] rounded-full"
              />
            </div>
            <span className="text-[11px] font-mono text-[#1a1a1a]/70 font-semibold tracking-widest mt-0.5">
              Step {currentSection + 1} of {totalSections}
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT: fills all remaining space ── */}
      <div className="relative z-10 flex-1 overflow-hidden px-4 xl:px-8 pt-1.5 pb-[56px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className={`h-full ${sectionQuestions.length >= 2
              ? "grid grid-cols-1 md:grid-cols-2 gap-0"
              : "flex flex-col"
              }`}
          >
            {sectionQuestions.length >= 2
              ? sectionQuestions.map((q, i) => (
                <div
                  key={q.key}
                  className={`flex flex-col h-full ${i === 0
                    ? "pr-5 border-r border-[#1a1a1a]/[0.06]"
                    : "pl-5"
                    }`}
                >
                  {renderQuestion(q, i)}
                </div>
              ))
              : sectionQuestions.map((q, i) => renderQuestion(q, i))
            }
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FIXED CTA FOOTER ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 xl:px-10 py-3.5 border-t border-[#e8e4dd] bg-[#ffffff]/85 backdrop-blur-md">
        {/* Zone 6: Skip text — 14px, premium, readable, centered-ish, with icon */}
        <p className="flex items-center gap-2 text-[14px] text-[#1a1a1a]/80 font-medium">
          <span className="inline-block rotate-90 text-[#8b6f47] font-bold">↓</span>
          {t("reflection_skip")}
        </p>
        <div className="flex items-center gap-3">
          {currentSection > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 px-5 py-2 border border-[#1a1a1a]/25 text-[#1a1a1a]/85 text-[11px] xl:text-[12px] font-semibold uppercase tracking-widest hover:bg-[#1a1a1a]/5 transition-all rounded-[4px] shadow-sm"
            >
              <ArrowLeft size={12} />
              Back
            </button>
          )}
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-2 bg-[#8b6f47] text-[#ffffff] text-[11px] xl:text-[12px] font-semibold uppercase tracking-widest hover:bg-[#8b6f47]/90 transition-colors rounded-[4px] shadow-sm"
          >
            {isLastSection ? t("reflection_continue") : "Next"}
            {!isLastSection && <ArrowRight size={12} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReflectionPrompt;
