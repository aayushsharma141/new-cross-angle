import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import type { SecretStatusMap } from "@/lib/admin/integrations";

export interface SecretStatus {
  configured: SecretStatusMap;
  checkedAt: string;
}

/**
 * Which server-side integration secrets are set, as reported by the
 * admin-only `integration-status` edge function (true/false, never values).
 * Fails loudly if the function is not deployed, rather than reporting
 * everything as unset.
 */
export function useSecretStatus() {
  return useQuery<SecretStatus>({
    queryKey: queryKeys.integrations.secrets,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("integration-status");
      if (error) throw error;
      const configured = (data as { configured?: SecretStatusMap } | null)?.configured;
      if (!configured) throw new Error("integration-status returned no data");
      return { configured, checkedAt: (data as { checkedAt?: string }).checkedAt ?? new Date().toISOString() };
    },
    staleTime: 60_000,
    retry: false,
  });
}
