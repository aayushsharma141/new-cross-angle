import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ───────────────────────────────────────────────
   Hub Stats — shared between AdminHub and AdminLayout
   ─────────────────────────────────────────────── */
export interface HubStats {
    actionsToday: number;
    newLeads: number;
    storageUsedGB: number;
    storageTotalGB: number;
    pipelineValue: number;
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    inboxCount: number;
    callCount: number;
    proposalCount: number;
    signedCount: number;
    quizLeadsCount: number;
    estimatorLeadsCount: number;
    /** At least one query failed, so some zeros above mean "unknown", not "none". */
    partialFailure: boolean;
}

async function fetchHubStats(): Promise<HubStats> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
        { count: activityCount, error: e1 },
        { count: versionCount, error: e2 },
        { count: newLeadCount, error: e3 },
        { data: mediaData, error: e4 },
        { data: leadsData, error: e5 },
    ] = await Promise.all([
        supabase
            .from("lead_activities")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart.toISOString()),
        supabase
            .from("content_versions")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart.toISOString()),
        supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("status", "new"),
        supabase.from("media_files").select("size_bytes"),
        supabase
            .from("leads")
            .select("status, lead_source, estimated_min"),
    ]);

    const partialFailure = Boolean(e1 || e2 || e3 || e4 || e5);
    if (partialFailure) {
        console.error("Hub stats partial failure", { e1, e2, e3, e4, e5 });
    }

    const totalBytes = (mediaData ?? []).reduce(
        (sum: number, m: { size_bytes: number | null }) => sum + (m.size_bytes ?? 0),
        0
    );
    const usedGB = totalBytes / (1024 * 1024 * 1024);

    const leads = leadsData ?? [];
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === "won").length;
    const lostLeads = leads.filter(l => l.status === "lost").length;
    const inboxCount = leads.filter(l => l.status === "new").length;
    const callCount = leads.filter(l => l.status === "in_conversation" || l.status === "meeting_planned").length;
    const proposalCount = leads.filter(l => l.status === "quote_sent" || l.status === "closing").length;
    const signedCount = wonLeads;

    const quizLeadsCount = leads.filter(l => l.lead_source === "style_quiz" || l.lead_source === "aesthetic_discovery_engine").length;
    const estimatorLeadsCount = leads.filter(l => l.lead_source === "estimator").length;

    const pipelineValue = leads
        .filter(l => l.lead_source === "estimator")
        .reduce((sum: number, l) => sum + (Number(l.estimated_min) || 0), 0);

    return {
        actionsToday: (activityCount ?? 0) + (versionCount ?? 0),
        newLeads: newLeadCount ?? 0,
        storageUsedGB: usedGB,
        storageTotalGB: 20,
        pipelineValue,
        totalLeads,
        wonLeads,
        lostLeads,
        inboxCount,
        callCount,
        proposalCount,
        signedCount,
        quizLeadsCount,
        estimatorLeadsCount,
        partialFailure,
    };
}

const DEFAULT_STATS: HubStats = {
    actionsToday: 0,
    newLeads: 0,
    storageUsedGB: 0,
    storageTotalGB: 20,
    pipelineValue: 0,
    totalLeads: 0,
    wonLeads: 0,
    lostLeads: 0,
    inboxCount: 0,
    callCount: 0,
    proposalCount: 0,
    signedCount: 0,
    quizLeadsCount: 0,
    estimatorLeadsCount: 0,
    partialFailure: false,
};

export function useHubStats() {
    const { data, isFetching, isError, isPending, refetch } = useQuery({
        queryKey: ["hub-stats"],
        queryFn: fetchHubStats,
        refetchInterval: 60_000,
    });

    return {
        stats: data ?? DEFAULT_STATS,
        isRefreshing: isFetching,
        isLoading: isPending,
        hasError: isError || Boolean(data?.partialFailure),
        refresh: refetch,
    };
}

export const formatStorage = (usedGB: number): string => {
    if (usedGB < 0.001) return "0 MB";
    if (usedGB < 1) return `${(usedGB * 1024).toFixed(1)} MB`;
    return `${usedGB.toFixed(1)} GB`;
};
