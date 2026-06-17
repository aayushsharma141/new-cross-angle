import { Stage } from "@/types/discovery";

export function getNextStage(currentStage: Stage, mode: "quick" | "deep"): Stage {
    switch (currentStage) {
        case Stage.Welcome:
            return Stage.PropertyReality;
        case Stage.PropertyReality:
            return Stage.Lifestyle;
        case Stage.Lifestyle:
            return Stage.RoomPriority;
        case Stage.RoomPriority:
            return Stage.VisualInstinct;
        case Stage.VisualInstinct:
            return Stage.AdjectiveSelection;
        case Stage.ReinterpretationGate:
            return Stage.AdjectiveSelection;
        case Stage.AdjectiveSelection:
            return Stage.PivotQuestion;
        case Stage.PivotQuestion:
            return mode === "quick" ? Stage.LightCalibration : Stage.MaterialResonance;
        case Stage.MaterialResonance:
            return Stage.LightCalibration;
        case Stage.LightCalibration:
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
