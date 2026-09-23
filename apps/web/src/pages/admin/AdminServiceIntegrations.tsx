import React, { useState, useMemo } from 'react';
import {
  Database,
  Cloud,
  Mail,
  AlertCircle,
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Brain,
  Link as LinkIcon,
  Copy,
  Check,
  Server,
  Shield,
  Clock,
  ExternalLink,
  Activity,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { useServiceHealth, useServiceDashboardStats } from '@/hooks/useServiceHealth';

type ServiceStatus = 'active' | 'optional' | 'conditional';

interface ServiceInfo {
  name: string;
  icon: React.ReactNode;
  category: string;
  status: ServiceStatus;
  description: string;
  uses: string[];
  envVars?: string[];
  location?: string;
  documentation?: string;
}

const services: ServiceInfo[] = [
  // Infrastructure
  {
    name: 'Vercel',
    icon: <Cloud className="w-6 h-6" />,
    category: 'Hosting & Edge',
    status: 'active',
    description: 'Production hosting, Edge Middleware for crawler detection & OG meta injection, Serverless API routes',
    uses: ['Production Hosting', 'Edge Runtime', 'Serverless Auth'],
    envVars: ['vercel.json', 'middleware.ts'],
    location: 'apps/web/middleware.ts',
  },
  {
    name: 'Supabase',
    icon: <Database className="w-6 h-6" />,
    category: 'Backend & Database',
    status: 'active',
    description: 'PostgreSQL database, Real-time subscriptions, Authentication backend, Edge Functions runtime',
    uses: ['Database', 'Auth API', 'Edge Functions', 'Real-time'],
    envVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    location: 'apps/web/src/integrations/supabase/client.ts',
  },

  // Media
  {
    name: 'ImageKit',
    icon: <Zap className="w-6 h-6" />,
    category: 'Image Processing',
    status: 'active',
    description: 'Visual media DAM, Image optimization, Dynamic resizing/transformation, CDN distribution',
    uses: ['Image Hosting', 'Optimization', 'CDN'],
    location: 'apps/web/src/services/media/providers/ImageKitProvider.ts',
  },
  {
    name: 'Supabase Storage',
    icon: <Server className="w-6 h-6" />,
    category: 'File Storage',
    status: 'active',
    description: 'Serves as ImageKit endpoint origin, Asset uploads via Edge Functions',
    uses: ['ImageKit Origin', 'Backups'],
  },

  // Analytics
  {
    name: 'PostHog',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Analytics & Tracking',
    status: 'active',
    description: 'Event tracking (consent-gated), Session recording with privacy masking, Funnel analysis',
    uses: ['Event Tracking', 'Session Recording', 'Funnels'],
    envVars: ['VITE_POSTHOG_KEY'],
    location: 'apps/web/src/analytics/posthog-client.ts',
  },
  {
    name: 'Sentry',
    icon: <AlertCircle className="w-6 h-6" />,
    category: 'Error Tracking',
    status: 'active',
    description: 'Frontend error reporting, Performance monitoring, Session replay (1% baseline, 100% on error)',
    uses: ['Error Tracking', 'Performance', 'Replay'],
    envVars: ['VITE_SENTRY_DSN', 'VITE_SENTRY_ENV', 'VITE_RELEASE'],
    location: 'apps/web/src/lib/sentry.ts',
  },
  {
    name: 'OpenTelemetry',
    icon: <Clock className="w-6 h-6" />,
    category: 'Distributed Tracing',
    status: 'optional',
    description: 'Browser performance instrumentation, Fetch & document load tracking, OTLP HTTP exporter',
    uses: ['Tracing', 'Metrics'],
  },

  // Communications
  {
    name: 'Resend',
    icon: <Mail className="w-6 h-6" />,
    category: 'Email Delivery',
    status: 'active',
    description: 'Transactional email delivery, Weekly CRM reports, Lead notifications',
    uses: ['Weekly Reports', 'Lead Alerts', 'Transactional'],
    envVars: ['RESEND_API_KEY'],
    location: 'supabase/functions/weekly-report-email/index.ts',
  },
  {
    name: 'Telegram Bot API',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'Real-time Alerts',
    status: 'active',
    description: 'Instant lead notifications, Hot lead alerts (🔥 for ₹5M+ budget), Admin CRM links',
    uses: ['Lead Alerts', 'Hot Leads', 'Real-time'],
    envVars: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
    location: 'supabase/functions/notify-telegram/index.ts',
  },

  // AI
  {
    name: 'Anthropic Claude',
    icon: <Brain className="w-6 h-6" />,
    category: 'AI Model',
    status: 'active',
    description: 'Image caption generation via OpenRouter gateway, Aesthetic design analysis',
    uses: ['Caption Gen', 'AI Analysis'],
    envVars: ['ANTHROPIC_API_KEY'],
    location: 'supabase/functions/generate-caption/index.ts',
  },
  {
    name: 'OpenRouter',
    icon: <LinkIcon className="w-6 h-6" />,
    category: 'AI Gateway',
    status: 'conditional',
    description: 'Unified AI provider gateway, Model switching without code changes, Fallback routing',
    uses: ['AI Gateway', 'Anthropic Route'],
    envVars: ['OPENROUTER_API_KEY'],
  },

  // External
  {
    name: 'Security Infrastructure',
    icon: <Shield className="w-6 h-6" />,
    category: 'Security',
    status: 'active',
    description: 'Rate limiting (bucket-based), Request signing verification, CORS origin validation',
    uses: ['Rate Limiting', 'Auth Validation'],
    location: 'supabase/functions/_lib/security.ts',
  },
];

const statusConfig = {
  active: {
    label: 'Active',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  optional: {
    label: 'Optional',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  conditional: {
    label: 'Conditional',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    icon: <LinkIcon className="w-3.5 h-3.5" />,
  },
};

const categoryColors: Record<string, string> = {
  'Hosting & Edge': 'text-purple-400',
  'Backend & Database': 'text-blue-400',
  'Image Processing': 'text-pink-400',
  'File Storage': 'text-indigo-400',
  'Analytics & Tracking': 'text-green-400',
  'Error Tracking': 'text-red-400',
  'Distributed Tracing': 'text-cyan-400',
  'Email Delivery': 'text-amber-400',
  'Real-time Alerts': 'text-orange-400',
  'AI Model': 'text-violet-400',
  'AI Gateway': 'text-fuchsia-400',
  'Security': 'text-teal-400',
};

export default function AdminServiceIntegrations() {
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real service health data
  const { services: healthData, metrics, usage, loading, error, refetch } = useServiceHealth();
  const { data: dashboardStats } = useServiceDashboardStats();

  // Create a map of service health data by name
  const healthMap = useMemo(() => {
    const map = new Map();
    healthData.forEach(h => {
      map.set(h.service_name, h);
    });
    return map;
  }, [healthData]);

  const filteredServices = services.filter(
    (s) => filterStatus === 'all' || s.status === filterStatus
  );

  const handleCopyVar = (envVar: string) => {
    navigator.clipboard.writeText(envVar);
    setCopiedVar(envVar);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getServiceHealth = (serviceName: string) => {
    return healthMap.get(serviceName);
  };

  const getServiceMetrics = (serviceName: string) => {
    return metrics.get(serviceName);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Service Integrations</h1>
        <p className="text-gray-400">
          Complete map of all external services and APIs integrated into Cross Angle Interior
        </p>
      </div>

      {/* Loading/Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">Error loading service health: {error.message}</p>
        </div>
      )}

      {/* Stats - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Services</p>
              <p className="text-2xl font-bold text-white">{dashboardStats?.total || services.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Operational</p>
              <p className="text-2xl font-bold text-green-400">
                {dashboardStats?.operational || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Degraded</p>
              <p className="text-2xl font-bold text-yellow-400">
                {dashboardStats?.degraded || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Uptime</p>
              <p className="text-2xl font-bold text-blue-400">
                {dashboardStats?.avgUptime?.toFixed(2) || '99.90'}%
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex gap-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="px-4 py-2 rounded-lg bg-gold-500 text-gray-900 font-medium text-sm hover:bg-gold-600 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'optional', 'conditional'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filterStatus === status
                ? 'bg-gold-500 text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {status === 'all' ? 'All Services' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredServices.map((service) => {
          const isExpanded = expandedService === service.name;
          const statusStyle = statusConfig[service.status];

          return (
            <div
              key={service.name}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-gold-500/50 transition-all duration-300"
            >
              {/* Card Header */}
              <div
                onClick={() =>
                  setExpandedService(isExpanded ? null : service.name)
                }
                className="p-6 cursor-pointer hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-gold-400">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {service.name}
                      </h3>
                      <p
                        className={`text-sm font-medium ${
                          categoryColors[service.category] || 'text-gray-400'
                        }`}
                      >
                        {service.category}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}
                  >
                    {statusStyle.icon}
                    {statusStyle.label}
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Real-Time Health Status */}
              {!isExpanded && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  {(() => {
                    const health = getServiceHealth(service.name);
                    const serviceMetrics = getServiceMetrics(service.name);
                    if (!health) return null;

                    return (
                      <div className="text-xs space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-400">
                            <span className={
                              health.status === 'operational' ? 'text-green-400' :
                              health.status === 'degraded' ? 'text-yellow-400' :
                              'text-red-400'
                            }>
                              {health.status}
                            </span>
                            {' '} • {health.response_time_ms}ms • {health.uptime_percentage.toFixed(2)}% uptime
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Expandable Content */}
              {isExpanded && (
                <div className="border-t border-gray-700 bg-gray-900/50 p-6 space-y-4">
                  {/* Real-Time Metrics */}
                  {(() => {
                    const health = getServiceHealth(service.name);
                    const serviceMetrics = getServiceMetrics(service.name);
                    if (!health && !serviceMetrics) return null;

                    return (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                          Real-Time Metrics
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-900 border border-gray-700 rounded px-3 py-2">
                            <p className="text-xs text-gray-400">Uptime</p>
                            <p className="text-lg font-bold text-green-400">{health?.uptime_percentage.toFixed(2)}%</p>
                          </div>
                          <div className="bg-gray-900 border border-gray-700 rounded px-3 py-2">
                            <p className="text-xs text-gray-400">Response Time</p>
                            <p className="text-lg font-bold text-blue-400">{health?.response_time_ms}ms</p>
                          </div>
                          <div className="bg-gray-900 border border-gray-700 rounded px-3 py-2">
                            <p className="text-xs text-gray-400">Requests Today</p>
                            <p className="text-lg font-bold text-yellow-400">{serviceMetrics?.requests_today || 0}</p>
                          </div>
                          <div className="bg-gray-900 border border-gray-700 rounded px-3 py-2">
                            <p className="text-xs text-gray-400">Errors Today</p>
                            <p className="text-lg font-bold text-red-400">{serviceMetrics?.errors_today || 0}</p>
                          </div>
                          <div className="col-span-2 bg-gray-900 border border-gray-700 rounded px-3 py-2">
                            <p className="text-xs text-gray-400">Last Checked</p>
                            <p className="text-sm text-gray-300">
                              {health?.last_check_at ? new Date(health.last_check_at).toLocaleString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        {health?.last_error_message && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2 mt-3">
                            <p className="text-xs text-red-400 font-mono">{health.last_error_message}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Uses */}
                  {service.uses.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Uses
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {service.uses.map((use) => (
                          <span
                            key={use}
                            className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-md text-xs border border-gray-600"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Environment Variables */}
                  {service.envVars && service.envVars.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Environment Variables
                      </p>
                      <div className="space-y-2">
                        {service.envVars.map((envVar) => (
                          <div
                            key={envVar}
                            className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded px-3 py-2 hover:bg-gray-800/50 transition-colors"
                          >
                            <code className="text-xs text-gold-400 font-mono">
                              {envVar}
                            </code>
                            <button
                              onClick={() => handleCopyVar(envVar)}
                              className="text-gray-500 hover:text-gray-300 transition-colors"
                            >
                              {copiedVar === envVar ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {service.location && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Implementation
                      </p>
                      <code className="block text-xs text-gray-300 bg-gray-900 border border-gray-700 rounded px-3 py-2 font-mono">
                        {service.location}
                      </code>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Architecture Overview */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Data Flow Architecture</h2>
        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-gold-400 mb-2">Authentication Flow</p>
            <p className="text-gray-400 ml-4 border-l-2 border-gold-500/30 pl-4">
              Browser → Vercel Middleware → Supabase Auth API → Edge Function (login/logout/refresh)
            </p>
          </div>
          <div>
            <p className="font-semibold text-gold-400 mb-2">Media Upload Pipeline</p>
            <p className="text-gray-400 ml-4 border-l-2 border-gold-500/30 pl-4">
              User Selection → imagekit-upload Edge Function → ImageKit CDN → Supabase Metadata Storage
            </p>
          </div>
          <div>
            <p className="font-semibold text-gold-400 mb-2">Lead Notification Pipeline</p>
            <p className="text-gray-400 ml-4 border-l-2 border-gold-500/30 pl-4">
              Contact Form → handle-new-lead Function → DB Trigger → Telegram Bot + Resend Email
            </p>
          </div>
          <div>
            <p className="font-semibold text-gold-400 mb-2">Analytics Collection</p>
            <p className="text-gray-400 ml-4 border-l-2 border-gold-500/30 pl-4">
              Browser (consent-gated) → Vercel Proxy (/ingest) → PostHog Cloud (masked)
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Status Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded mt-0.5 ${statusConfig.active.bgColor} border ${statusConfig.active.borderColor}`} />
            <div>
              <p className="font-medium text-white">Active</p>
              <p className="text-xs text-gray-400">Running in production, core system dependency</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded mt-0.5 ${statusConfig.optional.bgColor} border ${statusConfig.optional.borderColor}`} />
            <div>
              <p className="font-medium text-white">Optional</p>
              <p className="text-xs text-gray-400">Enhanced functionality, gracefully degrades</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded mt-0.5 ${statusConfig.conditional.bgColor} border ${statusConfig.conditional.borderColor}`} />
            <div>
              <p className="font-medium text-white">Conditional</p>
              <p className="text-xs text-gray-400">Required for specific features, can be swapped</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
