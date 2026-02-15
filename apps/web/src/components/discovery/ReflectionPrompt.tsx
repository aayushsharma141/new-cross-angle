import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, ArrowLeft, ArrowRight, Sunrise, Sun, Sunset, Moon, Users, Leaf, Brain, Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import ChipOption from "@/components/reflection/ChipOption";
import ImageOption from "@/components/reflection/ImageOption";
import SectionProgress from "@/components/reflection/SectionProgress";

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
  section: number;
}

// Section icons mapped by index
const sectionIcons = [Sunrise, Sun, Sunset, Moon, Users, Leaf, Brain, Flame];

// Ambient gradient colors per section
const sectionGradients = [
  "radial-gradient(ellipse at top, hsl(40 60% 95% / 0.5) 0%, transparent 60%)", // Morning - warm
  "radial-gradient(ellipse at top, hsl(45 50% 93% / 0.5) 0%, transparent 60%)", // Midday - bright
  "radial-gradient(ellipse at top, hsl(25 40% 90% / 0.5) 0%, transparent 60%)", // Evening - amber
  "radial-gradient(ellipse at top, hsl(230 20% 88% / 0.5) 0%, transparent 60%)", // Night - cool
  "radial-gradient(ellipse at top, hsl(30 30% 92% / 0.4) 0%, transparent 60%)", // Social
  "radial-gradient(ellipse at top, hsl(120 15% 92% / 0.4) 0%, transparent 60%)", // Sensory
  "radial-gradient(ellipse at top, hsl(260 10% 92% / 0.4) 0%, transparent 60%)", // Deeper
  "radial-gradient(ellipse at top, hsl(15 40% 90% / 0.4) 0%, transparent 60%)", // Identity
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
    { key: "rq1", type: "image-cards", section: 0, optionKeys: ["rq1_o1", "rq1_o2", "rq1_o3", "rq1_o4", "rq1_o5"], images: [imgMorningSilence, imgMorningMovement, imgMorningCoffee, imgEnvFocused, imgEnvKitchen] },
    { key: "rq2", type: "image-cards", section: 0, optionKeys: ["rq2_o1", "rq2_o2", "rq2_o3", "rq2_o4", "rq2_o5"], images: [imgEnvSunlight, imgEnvMinimal, imgEnvMusic, imgEnvKitchen, imgEnvFocused] },
    { key: "rq3", type: "chips", section: 1, optionKeys: ["rq3_o1", "rq3_o2", "rq3_o3", "rq3_o4", "rq3_o5"] },
    { key: "rq4", type: "image-cards", section: 1, optionKeys: ["rq4_o1", "rq4_o2", "rq4_o3", "rq4_o4", "rq4_o5"], images: [imgWorkspaceQuiet, imgWorkspaceOpen, imgWorkspaceStructured, imgWorkspaceInspiring, imgWorkspaceDynamic] },
    { key: "rq5", type: "image-cards", section: 2, optionKeys: ["rq5_o1", "rq5_o2", "rq5_o3", "rq5_o4", "rq5_o5", "rq5_o6"], images: [imgEveningBook, imgEveningDinner, imgEveningCreative, imgEveningFilm, imgEveningQuiet, imgEveningConvo] },
    { key: "rq6", type: "image-cards", section: 2, optionKeys: ["rq6_o1", "rq6_o2", "rq6_o3", "rq6_o4", "rq6_o5"], images: [imgNightWarm, imgNightCrisp, imgNightCandle, imgNightAmbient, imgNightMinimal] },
    { key: "rq7", type: "chips", section: 3, optionKeys: ["rq7_o1", "rq7_o2", "rq7_o3", "rq7_o4", "rq7_o5"] },
    { key: "rq8", type: "image-cards", section: 3, optionKeys: ["rq8_o1", "rq8_o2", "rq8_o3", "rq8_o4", "rq8_o5"], images: [imgBedroomSanctuary, imgBedroomRetreat, imgBedroomDesign, imgBedroomCocoon, imgBedroomMinimal] },
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
      // Color wash transition
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

  const SectionIcon = sectionIcons[currentSection] || Sun;

  const renderQuestion = (q: QuestionDef, idx: number) => {
    const optionLabels = q.optionKeys.map((k) => t(k));
    const hasImages = q.type === "image-cards" && q.images;
    const imageOptions = hasImages
      ? q.optionKeys.map((k, i) => ({ key: k, label: optionLabels[i], img: q.images![i] })).filter((o) => o.img)
      : [];
    const chipOnlyOptions = hasImages
      ? q.optionKeys.map((k, i) => ({ key: k, label: optionLabels[i], img: q.images![i] })).filter((o) => !o.img)
      : q.optionKeys.map((k, i) => ({ key: k, label: optionLabels[i], img: undefined }));

    return (
      <motion.div
        key={q.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.15 }}
        className="space-y-4"
      >
        <h3 className="font-serif-display text-lg md:text-xl text-foreground leading-snug">
          {t(q.key)}
        </h3>
        {imageOptions.length > 0 && (
          <div className={`grid gap-3 ${imageOptions.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {imageOptions.map((o) => (
              <ImageOption key={o.key} label={o.label} imageSrc={o.img!} isActive={answers[q.key] === o.key} onClick={() => selectAnswer(q.key, o.key)} />
            ))}
          </div>
        )}
        {chipOnlyOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chipOnlyOptions.map((o) => (
              <ChipOption key={o.key} label={o.label} isActive={answers[q.key] === o.key} onClick={() => selectAnswer(q.key, o.key)} />
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
      className="relative flex h-full flex-col items-center justify-start px-6 pt-12 pb-24"
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

      {/* Color wash overlay */}
      <AnimatePresence>
        {showWash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 pointer-events-none bg-foreground"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-3">
          <Feather size={14} className="text-muted-foreground" />
          <p className="tracking-premium text-muted-foreground">{t("reflection_subtitle")}</p>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif-display text-3xl md:text-4xl font-medium text-center max-w-lg leading-tight mb-3"
        >
          {t("reflection_title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-center max-w-md mb-8"
        >
          {t("reflection_desc")}
        </motion.p>

        <SectionProgress current={currentSection} total={totalSections} labels={sectionLabels} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg space-y-10"
          >
            {/* Section header with animated icon */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <SectionIcon size={24} className="text-foreground/50" />
              </motion.div>
              <h2 className="font-serif-display text-2xl text-center text-foreground">
                {sectionLabels[currentSection]}
              </h2>
            </div>
            {sectionQuestions.map((q, i) => renderQuestion(q, i))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex items-center gap-4"
        >
          {currentSection > 0 && (
            <button onClick={goBack} className="flex items-center gap-2 px-6 py-3 border border-border text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors rounded-sm">
              <ArrowLeft size={14} />
              {t("reflection_prev_section")}
            </button>
          )}
          <button onClick={goNext} className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity rounded-sm">
            {isLastSection ? t("reflection_continue") : t("reflection_next_section")}
            {!isLastSection && <ArrowRight size={14} />}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          {t("reflection_skip")}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ReflectionPrompt;
