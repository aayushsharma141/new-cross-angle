import { Stage } from "@/types/discovery";

export function getNextStage(currentStage: Stage, _mode: "quick" | "deep"): Stage {
    switch (currentStage) {
        case Stage.Welcome:
            return Stage.PhysicalSpace;
        case Stage.PhysicalSpace:
            return Stage.Timeline;
        case Stage.Timeline:
            return Stage.MorningRoutine;
        case Stage.MorningRoutine:
            return Stage.KitchenUsage;
        case Stage.KitchenUsage:
            return Stage.EntertainmentStyle;
        case Stage.EntertainmentStyle:
            return Stage.RoomPriority;
        case Stage.RoomPriority:
            return Stage.VisualInstinct;
        case Stage.VisualInstinct:
            return Stage.DesignIdentity;
        case Stage.ReinterpretationGate:
            return Stage.DesignIdentity;
        case Stage.DesignIdentity:
            return Stage.Atmosphere;
        case Stage.Atmosphere:
            return Stage.Constraints;
        case Stage.Constraints:
            return Stage.MaterialIdentity;
        case Stage.MaterialIdentity:
            return Stage.LivingPreferences;
        case Stage.LivingPreferences:
            return Stage.PivotQuestion;
        case Stage.PivotQuestion:
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
