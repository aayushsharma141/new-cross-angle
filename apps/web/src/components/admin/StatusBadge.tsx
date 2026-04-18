import { Badge } from "@/components/ui/primitives/badge";

export type ContentStatus = "draft" | "published" | "archived";

export function StatusBadge({ status }: { status: ContentStatus }) {
    const map: Record<ContentStatus, string> = {
        published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        archived: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    };

    return (
        <Badge variant="outline" className={`text-[10px] font-medium border capitalize ${map[status] || map.draft}`}>
            {status}
        </Badge>
    );
}
