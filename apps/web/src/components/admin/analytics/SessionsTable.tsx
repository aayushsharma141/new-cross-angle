import { motion } from "framer-motion";
import { Download, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/tokens/icons";
import { Button } from "@/components/ui/primitives/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/components/Table";
import type { SessionRow } from "./analytics-utils";

interface SessionsTableProps {
  sessions: SessionRow[];
  loading: boolean;
  viewingType: "all" | "completed";
  onViewingTypeChange: (type: "all" | "completed") => void;
  onSelectSession: (session: SessionRow) => void;
}

export const SessionsTable = ({ sessions, loading, viewingType, onViewingTypeChange, onSelectSession }: SessionsTableProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7, duration: 0.4 }}
    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
  >
    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h3 className="text-lg font-serif-display font-semibold flex items-center gap-2">
        <Download className={cn("text-indigo-400", icons.md)} />
        Recent Discovery Sessions
      </h3>
      <div className="flex bg-background/50 backdrop-blur-sm rounded-lg p-1 border border-white/5">
        <Button variant="ghost" size="sm" onClick={() => onViewingTypeChange("all")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors h-auto ${viewingType === "all" ? "bg-white/10 text-foreground shadow-sm hover:bg-white/20" : "text-muted-foreground hover:text-foreground"}`}>
          All Sessions
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onViewingTypeChange("completed")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors h-auto ${viewingType === "completed" ? "bg-white/10 text-foreground shadow-sm hover:bg-white/20" : "text-muted-foreground hover:text-foreground"}`}>
          Completed Leads
        </Button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <Table className="w-full text-sm text-left">
        <TableHeader className="bg-white/5 text-muted-foreground font-medium border-b border-white/5">
          <TableRow>
            <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Date</TableHead>
            <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Session ID</TableHead>
            <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Platform</TableHead>
            <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Services</TableHead>
            <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Timeline</TableHead>
            <TableHead className="px-6 py-4 font-medium text-right border-none bg-transparent">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-white/5">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className="px-6 py-5 border-none"><div className="h-4 skeleton-shimmer-admin rounded w-24"></div></TableCell>
                <TableCell className="px-6 py-5 border-none"><div className="h-4 skeleton-shimmer-admin rounded w-32"></div></TableCell>
                <TableCell className="px-6 py-5 border-none"><div className="h-4 skeleton-shimmer-admin rounded w-20"></div></TableCell>
                <TableCell className="px-6 py-5 border-none"><div className="h-4 skeleton-shimmer-admin rounded w-48"></div></TableCell>
                <TableCell className="px-6 py-5 border-none"><div className="h-4 skeleton-shimmer-admin rounded w-24"></div></TableCell>
                <TableCell className="px-6 py-5 flex justify-end border-none"><div className="h-6 skeleton-shimmer-admin rounded-full w-20"></div></TableCell>
              </TableRow>
            ))
          ) : sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-6 py-12 text-center text-muted-foreground border-none">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-base font-medium text-foreground">No sessions found</p>
                  <p className="text-sm">No discovery sessions match the current filter.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => (
              <TableRow key={session.id} className="hover:bg-white/5 transition-colors group align-middle border-t border-white/5 cursor-pointer" onClick={() => onSelectSession(session)}>
                <TableCell className="px-6 py-4 whitespace-nowrap text-muted-foreground border-none">
                  {format(new Date(session.started_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="px-6 py-4 font-mono text-xs text-foreground/80 group-hover:text-pink-400 transition-colors border-none">
                  ...{session.id.slice(-8)}
                </TableCell>
                <TableCell className="px-6 py-4 border-none">
                  {(session.answers?.platform as string) || "-"}
                </TableCell>
                <TableCell className="px-6 py-4 max-w-xs truncate border-none" title={(session.answers?.services as string[] | undefined)?.join(", ")}>
                  {session.answers?.services ? (
                    <div className="flex gap-1.5 flex-wrap">
                      {(session.answers.services as string[]).slice(0, 2).map((s: string, i: number) => (
                        <span key={i} className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/20">{s}</span>
                      ))}
                      {(session.answers.services as string[]).length > 2 && (
                        <span className="bg-white/5 text-muted-foreground text-[10px] px-2 py-0.5 rounded-full border border-white/10">+{(session.answers.services as string[]).length - 2}</span>
                      )}
                    </div>
                  ) : "-"}
                </TableCell>
                <TableCell className="px-6 py-4 border-none">
                  {session.answers?.timeline ? (
                    <span className="flex items-center gap-1.5 text-xs">
                      <Clock className={cn("text-muted-foreground", icons.xs)} />
                      {session.answers.timeline as string}
                    </span>
                  ) : "-"}
                </TableCell>
                <TableCell className="px-6 py-4 text-right border-none">
                  {session.is_completed ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Captured Lead</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Incomplete</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  </motion.div>
);
