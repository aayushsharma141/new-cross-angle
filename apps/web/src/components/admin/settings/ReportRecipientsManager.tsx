import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { useToast } from "@/hooks/useToast";
import { Mail, Plus, Trash2, Send } from "lucide-react";
import { AdminFormCard } from "@/components/admin/shared";

export function ReportRecipientsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ["report-recipients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      // report_recipients may not be in generated types yet — access via index
      const raw = (data as Record<string, unknown>)?.report_recipients;
      if (Array.isArray(raw)) return raw as string[];
      return [];
    },
  });

  const mutation = useMutation({
    mutationFn: async (emails: string[]) => {
      // Get the settings row ID first
      const { data: row } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (!row?.id) throw new Error("No site_settings row found");
      
      const { error } = await supabase
        .from("site_settings")
        .update({ report_recipients: emails } as never)
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-recipients"] });
      toast({ title: "Recipients updated", description: "Weekly report recipients saved." });
    },
    onError: () => {
      toast({ title: "Failed to save", description: "Could not update recipients.", variant: "destructive" });
    },
  });

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (recipients.includes(email)) {
      toast({ title: "Already added", description: "This email is already in the list.", variant: "destructive" });
      return;
    }
    mutation.mutate([...recipients, email]);
    setNewEmail("");
  };

  const removeEmail = (email: string) => {
    mutation.mutate(recipients.filter((e) => e !== email));
  };

  const sendTestReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("weekly-report-email", { body: {} });
      if (error) {
        // On non-2xx, data may contain the error details from the function
        const detail = data?.error || data?.message || error.message || "Unknown error from Edge Function.";
        toast({ title: "Report Failed", description: String(detail), variant: "destructive" });
        return;
      }
      if (data?.error) {
        toast({ title: "Report Failed", description: String(data.error), variant: "destructive" });
        return;
      }
      toast({ title: "Test report sent", description: `Report delivered to ${data?.metrics?.newLeadsCount ?? 0} leads tracked.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not reach the Edge Function.";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <AdminFormCard title="Report Recipients" description="Manage email addresses that receive weekly automated reports" icon={Mail} contentClassName="space-y-6">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email address"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
          className="flex-1"
        />
        <Button onClick={addEmail} disabled={mutation.isPending} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[hsl(var(--admin-text-muted))]">Loading...</p>
      ) : recipients.length === 0 ? (
        <div className="text-center py-8 text-sm text-[hsl(var(--admin-text-muted))] border border-dashed border-[hsl(var(--admin-border))] rounded-xl">
          <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No recipients configured. Add an email above.
        </div>
      ) : (
        <ul className="space-y-2">
          {recipients.map((email) => (
            <li key={email} className="flex items-center justify-between px-4 py-3 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
                <span className="text-sm text-[hsl(var(--admin-text))]">{email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeEmail(email)} disabled={mutation.isPending} className="text-[hsl(var(--admin-danger))] hover:text-[hsl(var(--admin-danger))] hover:bg-[hsl(var(--admin-danger))]/10 h-8 w-8 p-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-4 border-t border-[hsl(var(--admin-border))] flex justify-end">
        <Button variant="outline" size="sm" onClick={sendTestReport} className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9">
          <Send className="w-4 h-4 mr-2" /> Send Test Report Now
        </Button>
      </div>
    </AdminFormCard>
  );
}
