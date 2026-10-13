import { ExternalLink, Lock, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/queryKeys";
import { INTEGRATION_REGISTRY, integrationHealth, type IntegrationHealth } from "@/lib/admin/integrations";
import { useSecretStatus } from "@/pages/admin/_hooks/useSecretStatus";

const HEALTH_LABEL: Record<IntegrationHealth, string> = {
  ready: "Ready",
  partial: "Incomplete",
  missing: "Not set up",
};

const HEALTH_TONE: Record<IntegrationHealth, string> = {
  ready: "text-[hsl(var(--admin-success))] border-[hsl(var(--admin-success))]/20 bg-[hsl(var(--admin-success))]/5",
  partial: "text-[hsl(var(--admin-warning))] border-[hsl(var(--admin-warning))]/20 bg-[hsl(var(--admin-warning))]/5",
  missing: "text-[hsl(var(--admin-danger))] border-[hsl(var(--admin-danger))]/20 bg-[hsl(var(--admin-danger))]/5",
};

const BUTTON =
  "shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] text-xs text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-primary))] hover:text-black transition-colors";

/**
 * Server-side credentials, shown as set / not set. The values live only in
 * Supabase secrets; this panel can say whether each one exists but never reads
 * or stores it.
 */
export function ServerCredentialsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching } = useSecretStatus();
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.integrations.secrets });

  return (
    <section className="space-y-4" aria-labelledby="server-credentials-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id="server-credentials-heading" className="text-sm font-bold text-[hsl(var(--admin-text))]">
            Server credentials
          </h3>
          <p className="text-xs text-[hsl(var(--admin-muted))] mt-1">
            Keys the backend needs for email, notifications, analytics and media. Values are never shown here.
          </p>
        </div>
        <button type="button" onClick={refresh} disabled={isFetching} className={cn(BUTTON, "disabled:opacity-50")}>
          <RefreshCw className={cn("w-3 h-3", isFetching && "animate-spin")} aria-hidden="true" />
          Re-check
        </button>
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-xl border border-[hsl(var(--admin-warning))]/30 bg-[hsl(var(--admin-warning))]/5 px-4 py-3 text-xs text-[hsl(var(--admin-warning))]"
        >
          Could not check credentials. The <code className="font-mono">integration-status</code> function may not be
          deployed yet, so nothing below is confirmed either way.
        </div>
      )}

      <div className="grid gap-4">
        {INTEGRATION_REGISTRY.map((integration) => {
          const health = data ? integrationHealth(integration, data.configured) : null;
          return (
            <div key={integration.id} className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-[hsl(var(--admin-text))]">{integration.name}</h4>
                  <p className="text-xs text-[hsl(var(--admin-muted))] mt-1">{integration.purpose}</p>
                </div>
                {health ? (
                  <span className={cn("shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold border", HEALTH_TONE[health])}>
                    {HEALTH_LABEL[health]}
                  </span>
                ) : (
                  <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-muted))]">
                    {isLoading ? "Checking…" : "Unknown"}
                  </span>
                )}
              </div>

              <ul className="mt-4 space-y-2">
                {integration.secrets.map((secret) => {
                  const set = data?.configured[secret.name];
                  return (
                    <li key={secret.name} className="flex items-start justify-between gap-3 text-[11px]">
                      <div className="min-w-0">
                        <code className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))]">
                          {secret.name}
                        </code>
                        <span className="ml-2 text-[hsl(var(--admin-muted))]">{secret.required ? "Required" : "Optional"}</span>
                        {set === false && (
                          <p className="mt-1 text-[hsl(var(--admin-muted))]">
                            {secret.ifMissing}
                            {secret.fallbackNote ? ` ${secret.fallbackNote}` : ""}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-semibold",
                          set === true && "text-[hsl(var(--admin-success))]",
                          set === false && (secret.required ? "text-[hsl(var(--admin-danger))]" : "text-[hsl(var(--admin-muted))]"),
                          set === undefined && "text-[hsl(var(--admin-muted))]",
                        )}
                      >
                        {set === true ? "Set" : set === false ? "Not set" : "—"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-[hsl(var(--admin-muted))] flex items-center gap-1.5">
          <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />
          Set or rotate these in Supabase under Edge Functions, then press Re-check.
        </p>
        <a href="https://supabase.com/dashboard/project/_/functions/secrets" target="_blank" rel="noreferrer" className={BUTTON}>
          Manage in Supabase
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
