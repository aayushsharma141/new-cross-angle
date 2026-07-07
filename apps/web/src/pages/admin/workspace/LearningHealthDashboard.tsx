import { Activity, Database, AlertCircle, RefreshCw, BarChart2, Bug, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function LearningHealthDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      // 1. Event Ledger Health
      const [eventsRes, metaRes, sessionRes] = await Promise.all([
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('payload', '{}'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).is('payload->>sessionId', null)
      ]);

      // 2. Dataset v1 Readiness
      const [leadsRes, decisionsRes] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('source', 'estimator'),
        supabase.from('decision_events').select('*', { count: 'exact', head: true })
      ]);

      // 3. Platform Errors & Anomalies
      const [errorsRes, anomaliesRes] = await Promise.all([
        supabase.from('system_logs').select('*', { count: 'exact', head: true }).eq('status', 'error'),
        supabase.from('system_logs').select('*').in('status', ['error', 'anomaly']).order('created_at', { ascending: false }).limit(5)
      ]);

      setData({
        totalEvents: eventsRes.count || 0,
        missingMeta: metaRes.count || 0,
        missingCorrelation: sessionRes.count || 0,
        invalidPayloads: 0,
        
        observedLeads: leadsRes.count || 0,
        completedSessions: decisionsRes.count || 0,
        
        supabaseWriteFailures: errorsRes.count || 0,
        anomalies: anomaliesRes.data || []
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[var(--s-text-primary)] tracking-tight">
            Learning Health
          </h1>
          <p className="text-sm text-[hsl(var(--admin-muted))] mt-1">
            Operational dashboard for Dataset v1 Observation Phase. No product capabilities.
          </p>
        </div>
        <button 
          onClick={fetchHealthData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--admin-surface))] border border-[var(--s-border-subtle)] rounded-lg text-sm text-[var(--s-text-primary)] hover:bg-[var(--s-canvas-primary)] transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Event Ledger Health */}
        <div className="bg-[hsl(var(--admin-surface))] border border-[var(--s-border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[var(--s-accent-primary)]/10 rounded-lg">
              <Database className="w-5 h-5 text-[var(--s-accent-primary)]" />
            </div>
            <h2 className="font-semibold text-[var(--s-text-primary)]">1. Event Ledger Health</h2>
          </div>
          <ul className="space-y-3 text-sm text-[hsl(var(--admin-muted))]">
            <li className="flex justify-between"><span>Total Events Captured</span> <span className="font-mono">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : data?.totalEvents}</span></li>
            <li className="flex justify-between"><span>Missing Required Metadata</span> <span className="font-mono text-amber-500">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : data?.missingMeta}</span></li>
            <li className="flex justify-between"><span>Missing Correlation IDs</span> <span className="font-mono text-amber-500">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : data?.missingCorrelation}</span></li>
            <li className="flex justify-between"><span>Invalid Event Payloads</span> <span className="font-mono text-amber-500">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : data?.invalidPayloads}</span></li>
          </ul>
        </div>

        {/* 2. Dataset v1 Readiness */}
        <div className="bg-[hsl(var(--admin-surface))] border border-[var(--s-border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="font-semibold text-[var(--s-text-primary)]">2. Dataset v1 Readiness</h2>
          </div>
          <ul className="space-y-3 text-sm text-[hsl(var(--admin-muted))]">
            <li className="flex justify-between"><span>Observed Leads (Cases)</span> <span className="font-mono">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${data?.observedLeads} / 20`}</span></li>
            <li className="flex justify-between"><span>Completed Sessions</span> <span className="font-mono">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : data?.completedSessions}</span></li>
            <li className="flex justify-between"><span>Confidence Pre/Post Coverage</span> <span className="font-mono">--</span></li>
            <li className="flex justify-between"><span>Recommendation Coverage</span> <span className="font-mono">--</span></li>
          </ul>
        </div>

        {/* 3. Replay Health */}
        <div className="bg-[hsl(var(--admin-surface))] border border-[var(--s-border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="font-semibold text-[var(--s-text-primary)]">3. Replay Health</h2>
          </div>
          <ul className="space-y-3 text-sm text-[hsl(var(--admin-muted))]">
            <li className="flex justify-between"><span>Replay Success Rate</span> <span className="font-mono">--</span></li>
            <li className="flex justify-between"><span>Replay Failures</span> <span className="font-mono text-amber-500">--</span></li>
            <li className="flex justify-between"><span>Latest Replay TS</span> <span className="font-mono">--</span></li>
            <li className="flex justify-between"><span>Reconstruction Gaps</span> <span className="font-mono text-amber-500">--</span></li>
          </ul>
        </div>

        {/* 4. Learning Telemetry Quality */}
        <div className="bg-[hsl(var(--admin-surface))] border border-[var(--s-border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BarChart2 className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="font-semibold text-[var(--s-text-primary)]">4. Learning Telemetry Quality</h2>
          </div>
          <ul className="space-y-3 text-sm text-[hsl(var(--admin-muted))]">
            <li className="flex justify-between"><span>Evidence Availability</span> <span className="font-mono">--</span></li>
            <li className="flex justify-between"><span>Override Reasons</span> <span className="font-mono">--</span></li>
            <li className="flex justify-between"><span>DQI Input Completeness</span> <span className="font-mono">--</span></li>
            <li className="flex justify-between"><span>DCD Input Completeness</span> <span className="font-mono">--</span></li>
          </ul>
        </div>

        {/* 5. Platform Errors */}
        <div className="bg-[hsl(var(--admin-surface))] border border-[var(--s-border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="font-semibold text-[var(--s-text-primary)]">5. Platform Errors</h2>
          </div>
          <ul className="space-y-3 text-sm text-[hsl(var(--admin-muted))]">
            <li className="flex justify-between"><span>Supabase Write Failures</span> <span className="font-mono text-red-400">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : data?.supabaseWriteFailures}</span></li>
            <li className="flex justify-between"><span>CORS/Backend Errors</span> <span className="font-mono text-red-400">--</span></li>
            <li className="flex justify-between"><span>Analytics Dispatch Fails</span> <span className="font-mono text-red-400">--</span></li>
            <li className="flex justify-between"><span>Event Queue Drops</span> <span className="font-mono text-red-400">--</span></li>
          </ul>
        </div>

        {/* 6. Anomaly Log */}
        <div className="bg-[hsl(var(--admin-surface))] border border-[var(--s-border-subtle)] rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Bug className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="font-semibold text-[var(--s-text-primary)]">6. Anomaly Log</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[150px] space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-muted))]" /></div>
            ) : data?.anomalies?.length > 0 ? (
              data.anomalies.map((anomaly: any) => (
                <div key={anomaly.id} className="text-sm p-3 bg-[var(--s-canvas-primary)] border border-[var(--s-border-subtle)] rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-[var(--s-text-primary)]">{anomaly.action}</span>
                    <span className="text-xs text-[hsl(var(--admin-muted))]">{new Date(anomaly.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--admin-muted))] truncate">{anomaly.module} - {JSON.stringify(anomaly.details)}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-[var(--s-border-subtle)] rounded-lg bg-[var(--s-canvas-primary)]/50">
                <p className="text-sm text-[hsl(var(--admin-muted))] mb-2">No anomalies detected</p>
                <p className="text-xs text-[hsl(var(--admin-muted))]/70 max-w-[200px]">
                  All system functions operating within expected parameters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


