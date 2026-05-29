import { Stage } from "@/types/discovery";

export function getNextStage(currentStage: Stage, mode: "quick" | "deep"): Stage {
    switch (currentStage) {
        case Stage.Welcome:
            return Stage.PropertyReality;
        case Stage.PropertyReality:
            return Stage.Reflection;
        case Stage.Reflection:
            return Stage.Lifestyle;
        case Stage.Lifestyle:
            return Stage.RoomPriority;
        case Stage.RoomPriority:
            return Stage.VisualInstinct;
        case Stage.VisualInstinct:
            return mode === "quick" ? Stage.LightCalibration : Stage.AdjectiveSelection;
        case Stage.ReinterpretationGate:
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
            return Stage.BudgetAlignment;
        case Stage.BudgetAlignment:
            return Stage.Analysis;
        case Stage.Analysis:
            return Stage.MiniResult;
        case Stage.MiniResult:
            return Stage.LeadCapture;
        case Stage.LeadCapture:
            return Stage.Results;
        default:
            return currentStage;
    }
}
