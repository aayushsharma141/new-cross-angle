import { useState } from "react";
import { Mail, Database, Cloud, Activity, Plus, Bolt, Unplug } from "lucide-react";

const T = {
  bg: "#0D0F0E",
  surface: "#141716",
  card: "#181C1A",
  cardHover: "#1E2422",
  border: "#252A27",
  borderLight: "#2E3530",
  green: "#4ADE80",
  greenDim: "#22C55E",
  greenGlow: "rgba(74,222,128,0.12)",
  greenBorder: "rgba(74,222,128,0.25)",
  amber: "#F59E0B",
  amberDim: "rgba(245,158,11,0.15)",
  red: "#EF4444",
  redDim: "rgba(239,68,68,0.1)",
  redBorder: "rgba(239,68,68,0.3)",
  text: "#F0F4F2",
  muted: "#6B7A72",
  mutedLight: "#8A9990",
  accent: "#C8FF80",
};

export const INTEGRATIONS_DATA = [
  {
    id: "resend",
    name: "Resend",
    category: "Email",
    desc: "Transactional email delivery",
    detail: "crossangleinteriors@gmail.com",
    status: "active",
    icon: Mail,
    color: "#60A5FA",
    colorDim: "rgba(96,165,250,0.1)",
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Database",
    desc: "Primary database and auth provider",
    detail: "PostgreSQL · Realtime enabled",
    status: "active",
    icon: Database,
    color: "#34D399",
    colorDim: "rgba(52,211,153,0.1)",
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Hosting",
    desc: "Frontend hosting and edge functions",
    detail: "Production · main branch",
    status: "active",
    icon: Cloud,
    color: "#F8FAFC",
    colorDim: "rgba(248,250,252,0.07)",
  },
  {
    id: "posthog",
    name: "PostHog",
    category: "Analytics",
    desc: "Product analytics and event tracking",
    detail: "Event streaming via edge function",
    status: "active",
    icon: Activity,
    color: "#F97316",
    colorDim: "rgba(249,115,22,0.1)",
  },
];

function StatusBadge() {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "3px 9px",
      borderRadius: "20px",
      background: T.greenGlow,
      border: `1px solid ${T.greenBorder}`,
      fontSize: "11px",
      fontWeight: 600,
      color: T.green,
      letterSpacing: "0.02em",
    }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.green, boxShadow: `0 0 4px ${T.green}` }} />
      Active
    </span>
  );
}



// eslint-disable-next-line @typescript-eslint/no-explicit-any
function IntegrationCard({ integration, onRevoke, onConfigure }: { integration: any, onRevoke: (id: string) => void, onConfigure: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (integration as any).icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setRevokeConfirm(false); }}
      style={{
        background: hovered ? T.cardHover : T.card,
        border: `1px solid ${hovered ? T.borderLight : T.border}`,
        borderRadius: "12px",
        padding: "20px 24px",
        transition: "all 0.2s ease",
        display: "grid",
        gridTemplateColumns: "44px 1fr auto",
        gap: "16px",
        alignItems: "center",
      }}
    >
      {/* Icon */}
      <div style={{
        width: "44px", height: "44px",
        borderRadius: "10px",
        background: integration.colorDim,
        border: `1px solid ${integration.color}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon style={{ width: "20px", height: "20px", color: integration.color }} aria-hidden="true" />
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, color: T.text }}>{integration.name}</span>
          <span style={{
            fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em",
            padding: "2px 7px", borderRadius: "4px",
            background: `${integration.color}18`, color: integration.color,
            textTransform: "uppercase",
          }}>{integration.category}</span>
          <StatusBadge />
        </div>
        <div style={{ fontSize: "13px", color: T.muted, marginBottom: "10px" }}>
          {integration.desc} · <span style={{ color: T.mutedLight }}>{integration.detail}</span>
        </div>

        {/* Note: per-integration usage metrics (requests, uptime) require a server-side probe and are not tracked client-side. */}
        <div style={{ fontSize: "11px", color: T.muted, fontStyle: "italic" }}>
          Runtime metrics not available — check each provider's dashboard.
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
        <button
          onClick={() => onConfigure(integration.id)}
          style={{
            padding: "8px 16px",
            background: "transparent",
            border: `1px solid ${T.borderLight}`,
            borderRadius: "7px",
            color: T.text,
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s ease",
            display: "flex", alignItems: "center", gap: "5px",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = T.mutedLight; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.borderLight; }}
        >
          <Bolt style={{ width: "13px", height: "13px" }} aria-hidden="true" />
          Configure
        </button>

        {revokeConfirm ? (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: T.red, fontWeight: 500, whiteSpace: "nowrap" }}>Confirm revoke?</span>
            <button
              onClick={() => onRevoke(integration.id)}
              style={{
                padding: "8px 12px",
                background: T.redDim,
                border: `1px solid ${T.redBorder}`,
                borderRadius: "7px",
                color: T.red,
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >Yes</button>
            <button
              onClick={() => setRevokeConfirm(false)}
              style={{
                padding: "8px 10px",
                background: "transparent",
                border: `1px solid ${T.border}`,
                borderRadius: "7px",
                color: T.muted,
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >No</button>
          </div>
        ) : (
          <button
            onClick={() => setRevokeConfirm(true)}
            style={{
              padding: "8px 10px",
              background: "transparent",
              border: `1px solid transparent`,
              borderRadius: "7px",
              color: T.muted,
              fontSize: "12px",
              fontWeight: 400,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              display: "flex", alignItems: "center", gap: "4px",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.redBorder; e.currentTarget.style.background = T.redDim; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
          >
            <Unplug style={{ width: "13px", height: "13px" }} aria-hidden="true" />
            Revoke
          </button>
        )}
      </div>
    </div>
  );
}

export function IntegrationsManager({ onConfigure, onRevoke }: { onConfigure: (id: string) => void, onRevoke: (id: string) => void }) {
  return (
    <div className="w-full" style={{ fontFamily: "'DM Mono', 'IBM Plex Mono', 'Courier New', monospace" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-2 { animation: fadeUp 0.35s 0.05s ease both; }
        .fade-up-3 { animation: fadeUp 0.35s 0.10s ease both; }
        .fade-up-4 { animation: fadeUp 0.35s 0.15s ease both; }
        .fade-up-5 { animation: fadeUp 0.35s 0.20s ease both; }
        .fade-up-6 { animation: fadeUp 0.35s 0.25s ease both; }
      `}</style>
      
      {/* Section header */}
      <div className="fade-up-3" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", marginTop: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Bolt style={{ width: "15px", height: "15px", color: T.accent }} aria-hidden="true" />
          <span style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>Connected Integrations</span>
          <span style={{
            background: T.greenGlow,
            border: `1px solid ${T.greenBorder}`,
            borderRadius: "20px",
            padding: "1px 9px",
            fontSize: "11px",
            fontWeight: 600,
            color: T.green,
          }}>4 active</span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["All", "Email", "Database", "Hosting", "Analytics"].map((f, i) => (
            <button
              key={f}
              style={{
                padding: "5px 11px",
                background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent",
                border: `1px solid ${i === 0 ? T.borderLight : "transparent"}`,
                borderRadius: "5px",
                color: i === 0 ? T.text : T.muted,
                fontSize: "11px",
                fontWeight: i === 0 ? 500 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { if (i !== 0) { e.currentTarget.style.color = T.text; } }}
              onMouseLeave={e => { if (i !== 0) { e.currentTarget.style.color = T.muted; } }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Integration cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {INTEGRATIONS_DATA.map((integration, i) => (
          <div key={integration.id} className={`fade-up-${(i % 4) + 3}`}>
            <IntegrationCard
              integration={integration}
              onConfigure={onConfigure}
              onRevoke={onRevoke}
            />
          </div>
        ))}
      </div>

      {/* Empty add card */}
      <div className="fade-up-6" style={{ marginTop: "10px" }}>
        <button style={{
          width: "100%",
          padding: "20px",
          background: "transparent",
          border: `1.5px dashed ${T.border}`,
          borderRadius: "12px",
          color: T.muted,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontSize: "13px",
          fontFamily: "inherit",
          transition: "all 0.2s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.greenBorder; e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.greenGlow; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent"; }}
        >
          <Plus style={{ width: "16px", height: "16px" }} aria-hidden="true" />
          Connect a new integration
        </button>
      </div>
    </div>
  );
}
