import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Laptop, MonitorCheck, RefreshCw, ShieldAlert, Smartphone } from "lucide-react";

const ADMIN_MIN_DESKTOP_WIDTH = 1024;
const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;

type AdminDeviceSnapshot = {
  allowed: boolean;
  width: number;
  isMobileUserAgent: boolean;
  isTouchPrimary: boolean;
  isNarrowViewport: boolean;
};

const getAdminDeviceSnapshot = (): AdminDeviceSnapshot => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      allowed: true,
      width: ADMIN_MIN_DESKTOP_WIDTH,
      isMobileUserAgent: false,
      isTouchPrimary: false,
      isNarrowViewport: false,
    };
  }

  const userAgent = navigator.userAgent || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isIpadOS = /\bMacintosh\b/.test(userAgent) && maxTouchPoints > 1;
  const isMobileUserAgent = MOBILE_USER_AGENT_PATTERN.test(userAgent) || isIpadOS;
  const matchesMedia = (query: string) =>
    typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  const isTouchPrimary = matchesMedia("(pointer: coarse)") && matchesMedia("(hover: none)");
  const width = window.innerWidth || document.documentElement.clientWidth || ADMIN_MIN_DESKTOP_WIDTH;
  const isNarrowViewport = width < ADMIN_MIN_DESKTOP_WIDTH;

  return {
    allowed: !(isMobileUserAgent || isTouchPrimary || isNarrowViewport),
    width,
    isMobileUserAgent,
    isTouchPrimary,
    isNarrowViewport,
  };
};

type AdminDeviceGateProps = {
  children: ReactNode;
};

export function AdminDeviceGate({ children }: AdminDeviceGateProps) {
  const [deviceSnapshot, setDeviceSnapshot] = useState(getAdminDeviceSnapshot);

  useEffect(() => {
    const updateDeviceSnapshot = () => setDeviceSnapshot(getAdminDeviceSnapshot());

    updateDeviceSnapshot();
    window.addEventListener("resize", updateDeviceSnapshot);
    window.addEventListener("orientationchange", updateDeviceSnapshot);

    return () => {
      window.removeEventListener("resize", updateDeviceSnapshot);
      window.removeEventListener("orientationchange", updateDeviceSnapshot);
    };
  }, []);

  if (deviceSnapshot.allowed) {
    return <>{children}</>;
  }

  return (
    <AdminDesktopRequiredPrompt
      deviceSnapshot={deviceSnapshot}
      onRecheck={() => setDeviceSnapshot(getAdminDeviceSnapshot())}
    />
  );
}

type AdminDesktopRequiredPromptProps = {
  deviceSnapshot: AdminDeviceSnapshot;
  onRecheck: () => void;
};

function AdminDesktopRequiredPrompt({ deviceSnapshot, onRecheck }: AdminDesktopRequiredPromptProps) {
  const detectedReasons = [
    deviceSnapshot.isMobileUserAgent ? "Mobile or tablet browser detected" : null,
    deviceSnapshot.isTouchPrimary ? "Touch-first device detected" : null,
    deviceSnapshot.isNarrowViewport
      ? `Viewport is ${deviceSnapshot.width}px wide; admin requires ${ADMIN_MIN_DESKTOP_WIDTH}px or wider`
      : null,
  ].filter(Boolean);

  return (
    <main className="admin-theme min-h-screen bg-admin-background text-admin-foreground">
      <div className="flex min-h-screen items-center justify-center px-5 py-8">
        <section
          aria-labelledby="admin-device-title"
          className="w-full max-w-xl rounded-lg border border-admin-border bg-admin-card p-6 shadow-surface-lg sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10">
              <ShieldAlert className="h-6 w-6 text-amber-400" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-label text-admin-muted-foreground">
                Admin access restricted
              </p>
              <h1 id="admin-device-title" className="text-2xl font-semibold text-admin-foreground sm:text-3xl">
                Desktop browser required
              </h1>
              <p className="text-sm leading-6 text-admin-muted-foreground">
                Open the admin panel in Chrome desktop or another desktop browser. Mobile and tablet sessions
                are blocked for this workspace.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-admin-border bg-admin-background/70 p-3">
              <Laptop className="mb-2 h-5 w-5 text-admin-primary" aria-hidden="true" />
              <p className="text-sm font-semibold text-admin-foreground">Desktop device</p>
              <p className="mt-1 text-xs text-admin-muted-foreground">Laptop or workstation</p>
            </div>
            <div className="rounded-md border border-admin-border bg-admin-background/70 p-3">
              <MonitorCheck className="mb-2 h-5 w-5 text-admin-primary" aria-hidden="true" />
              <p className="text-sm font-semibold text-admin-foreground">Wide viewport</p>
              <p className="mt-1 text-xs text-admin-muted-foreground">1024px minimum</p>
            </div>
            <div className="rounded-md border border-admin-border bg-admin-background/70 p-3">
              <Smartphone className="mb-2 h-5 w-5 text-amber-400" aria-hidden="true" />
              <p className="text-sm font-semibold text-admin-foreground">Mobile blocked</p>
              <p className="mt-1 text-xs text-admin-muted-foreground">Phones and tablets</p>
            </div>
          </div>

          {detectedReasons.length > 0 && (
            <div className="mt-5 rounded-md border border-admin-border bg-admin-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-label text-admin-muted-foreground">
                Current session
              </p>
              <ul className="mt-2 space-y-1 text-sm text-admin-foreground">
                {detectedReasons.map((reason) => (
                  <li key={reason} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-admin-border px-4 text-sm font-semibold text-admin-foreground transition-colors hover:border-admin-primary hover:text-admin-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to site
            </Link>
            <button
              type="button"
              onClick={onRecheck}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-admin-primary px-4 text-sm font-semibold text-admin-primary-foreground transition-opacity hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Recheck device
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
