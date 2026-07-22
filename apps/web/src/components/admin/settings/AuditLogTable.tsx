
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/primitives/table";
import { Badge } from "@/components/primitives/interactive";
import { format } from "date-fns";
import { Loader2, Activity } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { ScrollArea } from "@/components/ui/primitives/scroll-area";

export function AuditLogTable() {
    const { data: logs = [], isLoading } = useQuery({
        queryKey: ["audit_logs"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audit_logs")
                .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw error;
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-primary))]" />
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <EmptyState
                icon={Activity}
                title="No audit logs found"
                description="System activities will appear here once they occur."
            />
        );
    }

    return (
        <div className="rounded-md border">
            <ScrollArea className="h-[400px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                    {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {log.profiles?.full_name || "System"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {log.profiles?.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {log.action.replace(/_/g, " ")}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm capitalize">{log.entity_type}</span>
                                        <span className="text-xs text-muted-foreground font-mono truncate max-w-[100px]">
                                            {log.entity_id}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                    {JSON.stringify(log.details)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
}
