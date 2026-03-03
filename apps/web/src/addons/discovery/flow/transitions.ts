import { Stage } from "@/types/discovery";

export function getNextStage(currentStage: Stage, mode: "quick" | "deep"): Stage {
    switch (currentStage) {
        case Stage.Welcome:
            return mode === "quick" ? Stage.Lifestyle : Stage.Reflection;
        case Stage.Reflection:
            return Stage.Lifestyle;
        case Stage.Lifestyle:
            return Stage.VisualInstinct;
        case Stage.VisualInstinct:
            return mode === "quick" ? Stage.LightCalibration : Stage.AdjectiveSelection;
        case Stage.AdjectiveSelection:
            return Stage.EmotionalMapping;
        case Stage.EmotionalMapping:
            return Stage.MaterialResonance;
        case Stage.MaterialResonance:
            return Stage.LightCalibration;
        case Stage.LightCalibration:
            return mode === "quick" ? Stage.Analysis : Stage.PatternPreview;
        case Stage.PatternPreview:
            return Stage.Analysis;
        case Stage.Analysis:
            return Stage.LeadCapture; // Will be updated to MiniResult in Task 9
        case Stage.LeadCapture:
            return Stage.Results;
        default:
            return currentStage;
    }
}
