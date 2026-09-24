import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  Check,
  Cloud,
  Copy,
  Database,
  Mail,
  MessageSquare,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  REPORTING_WINDOW_DAYS,
  useAnalyticsMetrics,
  useEmailMetrics,
  useMediaMetrics,
  useSupabaseProbe,
  useWebhookMetrics,
} from "./_hooks/useIntegrationMetrics";

/**
 * Reference map of every third-party service this project talks to, with the
 * metrics we can actually measure attached to each one.
 *
 * Integrations with no measurable signal say so instead of showing a number.
 * Nothing on this page is a placeholder or a sample value.
 */

interface MetricTile {
  label: string;
  value: string;
  /** Provenance line shown under the value. */
  source: string;
}

interface ServiceCard {
  name: string;
  category: string;
  icon: LucideIcon;
  description: string;
  /** Where the integration lives, for someone going to read the code. */
  implementation: string;
  /** Config names only — never values. */
  config: string[];
  metrics: MetricTile[];
  /** Set when nothing measures this service; replaces the metric tiles. */
  unmeasured?: string;
  isLoading?: boolean;
  isError?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 MB";
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function formatCount(n: number): string {
  return n.toLocaleString();
}

export default function AdminServiceIntegrations() {
  const [copied, setCopied] = useState<string | null>(null);

  const supabaseProbe = useSupabaseProbe();
  const email = useEmailMetrics();
  const webhooks = useWebhookMetrics();
  const analytics = useAnalyticsMetrics();
  const media = useMediaMetrics();

  const copyConfigName = (name: string) => {
    void navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied((c) => (c === name ? null : c)), 2000);
  };

  const windowLabel = `last ${REPORTING_WINDOW_DAYS} days`;

  const services: ServiceCard[] = [
    {
      name: "Supabase",
      category: "Database, auth and edge functions",
      icon: Database,
      description:
        "Postgres, the cookie-based auth model and every edge function in supabase/functions.",
      implementation: "apps/web/src/integrations/supabase/client.ts",
      config: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
      isLoading: supabaseProbe.isLoading,
      isError: supabaseProbe.isError,
      metrics: [
        {
          label: "Query round trip",
          value: supabaseProbe.data ? `${supabaseProbe.data.latencyMs} ms` : "—",
          source: "Live probe from this page",
        },
      ],
    },
    {
      name: "Resend",
      category: "Transactional email",
      icon: Mail,
      description:
        "Lead auto-replies, internal alerts and the weekly CRM digest, all sent from edge functions.",
      implementation: "supabase/functions/handle-new-lead/index.ts",
      config: ["RESEND_API_KEY", "LEAD_ALERT_EMAIL"],
      isLoading: email.isLoading,
      isError: email.isError,
      metrics: [
        {
          label: `Auto-replies delivered (${windowLabel})`,
          value: email.data ? formatCount(email.data.autoRepliesSent) : "—",
          source: "lead_activities, logged after Resend accepted",
        },
        {
          label: `Internal alerts delivered (${windowLabel})`,
          value: email.data ? formatCount(email.data.internalNotificationsSent) : "—",
          source: "lead_activities, logged after Resend accepted",
        },
      ],
    },
    {
      name: "Telegram",
      category: "Instant lead alerts",
      icon: MessageSquare,
      description:
        "A Postgres trigger posts each new lead to notify-telegram. Failed sends queue in webhook_failures and are retried.",
      implementation: "supabase/functions/notify-telegram/index.ts",
      config: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "WEBHOOK_SECRET"],
      isLoading: webhooks.isLoading,
      isError: webhooks.isError,
      metrics: [
        {
          label: `Awaiting retry (${windowLabel})`,
          value: webhooks.data ? formatCount(webhooks.data.pending) : "—",
          source: "webhook_failures, status pending",
        },
        {
          label: `Gave up after 5 tries (${windowLabel})`,
          value: webhooks.data ? formatCount(webhooks.data.failed) : "—",
          source: "webhook_failures, status failed",
        },
        {
          label: `Recovered on retry (${windowLabel})`,
          value: webhooks.data ? formatCount(webhooks.data.succeeded) : "—",
          source: "webhook_failures, status succeeded",
        },
      ],
    },
    {
      name: "PostHog",
      category: "Product analytics",
      icon: TrendingUp,
      description:
        "Consent-gated event capture through the /ingest proxy. A nightly function rolls totals into analytics_reporting_daily.",
      implementation: "apps/web/src/analytics/posthog-client.ts",
      config: ["VITE_POSTHOG_KEY", "POSTHOG_PERSONAL_API_KEY", "POSTHOG_PROJECT_ID"],
      isLoading: analytics.isLoading,
      isError: analytics.isError,
      metrics: [
        {
          label: `Page views (${windowLabel})`,
          value: analytics.data ? formatCount(analytics.data.pageViews) : "—",
          source: "analytics_reporting_daily",
        },
        {
          label: `All tracked events (${windowLabel})`,
          value: analytics.data ? formatCount(analytics.data.trackedEvents) : "—",
          source: "analytics_reporting_daily",
        },
        {
          label: "Nightly sync last ran",
          value: analytics.data?.lastSyncDate ?? "No rows yet",
          source: "Newest date in analytics_reporting_daily",
        },
      ],
    },
    {
      name: "ImageKit",
      category: "Media CDN",
      icon: Zap,
      description:
        "Holds managed visual media. Uploads go through the imagekit-upload function, which keeps the private key server-side.",
      implementation: "apps/web/src/services/media/providers/ImageKitProvider.ts",
      config: ["IMAGEKIT_PRIVATE_KEY", "IMAGEKIT_PUBLIC_KEY", "IMAGEKIT_URL_ENDPOINT"],
      isLoading: media.isLoading,
      isError: media.isError,
      metrics: [
        {
          label: "Files on ImageKit",
          value: media.data ? formatCount(media.data.imagekitFiles) : "—",
          source: "media_files, storage_provider imagekit",
        },
        {
          label: "Still on Supabase Storage",
          value: media.data ? formatCount(media.data.supabaseFiles) : "—",
          source: "media_files, storage_provider supabase",
        },
        {
          label: "Total media size",
          value: media.data ? formatBytes(media.data.totalBytes) : "—",
          source: "get_total_media_bytes",
        },
      ],
    },
    {
      name: "Vercel",
      category: "Hosting and edge middleware",
      icon: Cloud,
      description:
        "Serves the SPA, runs the auth handlers, proxies /ingest to PostHog and injects Open Graph tags for crawlers.",
      implementation: "apps/web/middleware.ts",
      config: ["vercel.json"],
      metrics: [],
      unmeasured:
        "Deployment and edge health live in the Vercel dashboard. If this page loaded, the hosting layer served it.",
    },
    {
      name: "Sentry",
      category: "Error and performance monitoring",
      icon: AlertTriangle,
      description:
        "Browser error capture with PII scrubbing, plus edge function reporting. Admin routes are excluded from session replay.",
      implementation: "apps/web/src/lib/sentry.ts",
      config: ["VITE_SENTRY_DSN", "VITE_SENTRY_ENV", "SENTRY_DSN"],
      metrics: [],
      unmeasured:
        "Sentry stores issue counts on its own side and nothing writes them back here. Read them in the Sentry dashboard.",
    },
    {
      name: "Anthropic and OpenRouter",
      category: "AI features",
      icon: Brain,
      description:
        "Media caption generation and the aesthetic quiz analysis. OpenRouter is the gateway; Anthropic is the model behind it.",
      implementation: "supabase/functions/generate-caption/index.ts",
      config: ["ANTHROPIC_API_KEY", "OPENROUTER_API_KEY"],
      metrics: [],
      unmeasured:
        "Caption and quiz calls are not logged to a table, so there is no call count or spend figure to show yet.",
    },
    {
      name: "OpenTelemetry",
      category: "Browser tracing",
      icon: Activity,
      description:
        "Document-load and fetch spans exported over OTLP. Inactive unless an endpoint is configured.",
      implementation: "apps/web/src/analytics/telemetry/TelemetryBootstrap.ts",
      config: ["VITE_OTLP_ENDPOINT"],
      metrics: [],
      unmeasured:
        "Spans are exported to whichever collector VITE_OTLP_ENDPOINT points at. Query totals there, not here.",
    },
  ];

  const measured = services.filter((s) => !s.unmeasured).length;

  return (
    <div className="flex flex-col space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-display font-semibold text-[hsl(var(--admin-text))]">
          Service integrations
        </h1>
        <p className="text-sm text-[hsl(var(--admin-text-muted))] max-w-3xl">
          Every third-party service this project depends on. {measured} of {services.length} report
          live figures from data this codebase records; the rest name the dashboard that holds
          their numbers. Counts cover the {windowLabel}.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <section
              key={service.name}
              className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] overflow-hidden"
            >
              <div className="flex items-start gap-4 p-5 border-b border-[hsl(var(--admin-border-subtle))]">
                <div className="p-2.5 rounded-lg border border-[hsl(var(--admin-primary))]/20 bg-[hsl(var(--admin-primary-muted))] text-[hsl(var(--admin-primary))] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[hsl(var(--admin-text))]">{service.name}</h2>
                  <p className="text-[11px] uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mt-0.5">
                    {service.category}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <p className="text-[13px] leading-relaxed text-[hsl(var(--admin-text-muted))]">
                  {service.description}
                </p>

                {service.unmeasured ? (
                  <div className="rounded-lg border border-dashed border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mb-1.5">
                      Not measured here
                    </p>
                    <p className="text-[13px] text-[hsl(var(--admin-text-muted))] leading-relaxed">
                      {service.unmeasured}
                    </p>
                  </div>
                ) : service.isError ? (
                  <div className="rounded-lg border border-[hsl(var(--admin-danger))]/30 bg-[hsl(var(--admin-danger-muted))] p-4">
                    <p className="text-[13px] text-[hsl(var(--admin-danger))]">
                      Could not read metrics for {service.name}. The query failed, which may mean
                      the table is missing or your role cannot read it.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {service.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-lg border border-[hsl(var(--admin-border-subtle))] bg-[hsl(var(--admin-surface))] p-3"
                      >
                        <p className="text-[11px] text-[hsl(var(--admin-text-muted))] leading-snug">
                          {metric.label}
                        </p>
                        <p
                          className={cn(
                            "text-xl font-display font-semibold mt-1 text-[hsl(var(--admin-text))]",
                            service.isLoading && "opacity-40",
                          )}
                        >
                          {service.isLoading ? "…" : metric.value}
                        </p>
                        <p className="text-[10px] text-[hsl(var(--admin-text-muted))]/70 mt-1.5 leading-snug">
                          {metric.source}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
                    Configuration
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.config.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => copyConfigName(name)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[hsl(var(--admin-border-subtle))] bg-[hsl(var(--admin-surface))] px-2 py-1 font-mono text-[11px] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:border-[hsl(var(--admin-border))] transition-colors"
                        title={`Copy ${name}`}
                      >
                        {copied === name ? (
                          <Check className="w-3 h-3 text-[hsl(var(--admin-success))]" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-50" />
                        )}
                        {name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))]/70">
                    Names only. Values live in Vercel and Supabase secrets.
                  </p>
                </div>

                <div className="pt-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mb-1.5">
                    Implementation
                  </p>
                  <code className="block rounded-md border border-[hsl(var(--admin-border-subtle))] bg-[hsl(var(--admin-surface))] px-2.5 py-1.5 font-mono text-[11px] text-[hsl(var(--admin-text-muted))] break-all">
                    {service.implementation}
                  </code>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <footer className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mb-3">
          How lead notifications flow
        </h2>
        <ol className="space-y-1.5 text-[13px] text-[hsl(var(--admin-text-muted))]">
          {[
            "A visitor submits a form, which inserts a row into leads.",
            "A Postgres trigger posts that row to notify-telegram, which messages the studio chat.",
            "handle-new-lead sends the customer auto-reply and the internal alert through Resend.",
            "Each delivery writes a row to lead_activities; failed Telegram posts queue in webhook_failures.",
            "The counts above are read back from those same two tables.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="text-[hsl(var(--admin-primary))] font-mono shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </footer>
    </div>
  );
}
