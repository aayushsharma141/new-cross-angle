import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const track = async (eventName: string, payload: Record<string, any>) => {
    try {
        await supabase.from("addon_events").insert({
            event_name: eventName,
            payload,
            created_at: new Date().toISOString(),
        });
    } catch (error) {
        console.warn("Analytics tracking failed:", error);
    }
};

export const startSession = async (mode: "quick" | "deep"): Promise<string> => {
    const sessionId = uuidv4();
    try {
        await supabase.from("addon_sessions").insert({
            id: sessionId,
            started_at: new Date().toISOString(),
            mode,
            is_completed: false,
        });
    } catch (error) {
        console.warn("Session start failed:", error);
    }
    return sessionId;
};

export const completeSession = async (sessionId: string, archetype: string, totalSeconds: number) => {
    try {
        await supabase.from("addon_sessions").update({
            is_completed: true,
            archetype,
            total_seconds: totalSeconds,
            completed_at: new Date().toISOString(),
        }).eq("id", sessionId);
    } catch (error) {
        console.warn("Session completion failed:", error);
    }
};
