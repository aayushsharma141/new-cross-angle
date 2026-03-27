import { Stage, AestheticScores, UserSignals, AIAestheticResult } from "@/types/discovery";
import { initialScores } from "../core/scoring";

interface SessionState {
    stage: Stage;
    mode: "quick" | "deep";
    scores: AestheticScores;
    signals: UserSignals;
    aiResult: AIAestheticResult | null;
}

export const initialSignals: UserSignals = {
    reflectionAnswers: [],
    lifestyleChoices: [],
    selectedImageIds: [],
    selectedImageTags: [],
    selectedAdjectives: [],
    freeTextReflection: "",
    sliderValues: [],
    materialChoice: "",
    lightPreference: "",
    scores: initialScores,
};

const initialSession: SessionState = {
    stage: Stage.Welcome,
    mode: "deep",
    scores: initialScores,
    signals: initialSignals,
    aiResult: null,
};

export function resetSession(): SessionState {
    return { ...initialSession };
}
