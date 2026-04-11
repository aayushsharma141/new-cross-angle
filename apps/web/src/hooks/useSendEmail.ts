/**
 * useSendEmail
 * ─────────────────────────────────────────────────────────────────────────────
 * Calls the `send-lead-email` Supabase Edge Function.
 * Returns a TanStack mutation with typed state so the Email tab UI can show
 * sending / success / error states per-template.
 */

import { useMutation } from "@tanstack/react-query";
import { invokeEdge } from "@/integrations/supabase/client";

export interface SendEmailPayload {
  lead_id: string;
  to_email: string;
  to_name: string;
  subject: string;
  body: string;
  template_id?: string;
}

export interface SendEmailResult {
  success: boolean;
  resend_id?: string;
  error?: string;
}

export function useSendEmail() {
  return useMutation<SendEmailResult, Error, SendEmailPayload>({
    mutationFn: async (payload) => {
      const { data, error } = await invokeEdge<SendEmailResult>("send-lead-email", payload);
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error ?? "Email delivery failed");
      return data;
    },
  });
}
