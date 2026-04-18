# Admin Authentication Flow

> **Source files**
> - `src/pages/admin/AdminAuth.tsx` — UI & view-state machine
> - `src/components/auth/AuthProvider.tsx` — session, role, signOut
> - `src/hooks/useAdminAuth.ts` — logout helper consumed by the admin sidebar

---

## 1. High-level View State Machine

The entire auth UI lives in a **single component** (`AdminAuth`) driven by one
`view` state variable of type:

```ts
type AuthView =
  | 'login'           // Default — email + password form
  | 'forgot'          // Enter email → get reset link
  | 'check-email'     // Confirmation screen after reset email sent
  | 'reset-password'  // New-password form (entered via email link)
  | 'reset-success'   // Password updated confirmation
  | 'expired'         // Reset link was stale / access_denied
  | 'signed-out'      // Post-logout confirmation
```

```mermaid
stateDiagram-v2
    direction LR

    [*] --> login : App loads / navigate to /admin/auth
    [*] --> signed_out : URL has ?signed-out=true
    [*] --> reset_password : URL hash has #type=recovery
    [*] --> expired : URL hash has #error=access_denied

    login --> forgot : Click "Forgot Password?"
    forgot --> login : Click "Return to Sign In"
    forgot --> check_email : handleForgot() succeeds
    check_email --> login : Click "Return to Sign In"

    reset_password --> reset_success : handleReset() succeeds
    reset_success --> login : Click "Sign In"

    expired --> forgot : Click "Request New Link"

    signed_out --> login : Click "Sign In Again"

    login --> [*] : handleLogin() succeeds → navigate /admin
```

---

## 2. Sign-In Flow (Happy Path)

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant UI as AdminAuth.tsx
    participant SB as Supabase Auth
    participant AP as AuthProvider
    participant Router as React Router

    Admin->>UI: Enter email + password → Submit
    UI->>SB: supabase.auth.signInWithPassword({ email, password })
    SB-->>UI: { data: { session, user }, error: null }

    note over SB,AP: Supabase fires onAuthStateChange("SIGNED_IN")
    AP->>SB: fetchUserRole(user.id)
    SB-->>AP: { role: "super_admin" } from user_roles table
    AP->>AP: setCachedRole(userId, role) [localStorage 30min TTL]
    AP->>AP: setUser / setSession / setRole / setLoading(false)

    UI->>Router: navigate("/admin")
    Router-->>Admin: Admin Dashboard ✓
```

### What happens if credentials are wrong?

```mermaid
sequenceDiagram
    actor Admin
    participant UI as AdminAuth.tsx
    participant SB as Supabase Auth

    Admin->>UI: Wrong email or password → Submit
    UI->>SB: supabase.auth.signInWithPassword(...)
    SB-->>UI: { error: "Invalid login credentials" }
    UI->>Admin: Toast — "Access Denied" (red)
    note over UI: Stays on 'login' view
```

---

## 3. Role Resolution Detail

`AuthProvider` uses a **three-tier fallback** every time it needs a fresh role:

```mermaid
flowchart TD
    A[User signs in] --> B{localStorage cache\nvalid & < 30 min?}
    B -- Yes --> Z[Use cached role ✓]
    B -- No --> C[Query user_roles table\ntimeout: 5 s]
    C -- Found --> D[Cache & return role ✓]
    C -- Not found / error --> E[Fallback: query\nprofiles.role\ntimeout: 5 s]
    E -- Found --> F[Cache & return role ✓]
    E -- Not found / error --> G[Call sync-user-role\nEdge Function\ntimeout: 5 s]
    G -- Returned role --> H[Cache & return role ✓]
    G -- Error / timeout --> I[Return null — no role]
    I --> J[AuthGuard blocks /admin\nUser sees 403 / redirect]

    style Z fill:#16a34a,color:#fff
    style D fill:#16a34a,color:#fff
    style F fill:#16a34a,color:#fff
    style H fill:#16a34a,color:#fff
    style I fill:#dc2626,color:#fff
    style J fill:#dc2626,color:#fff
```

> **Token Refresh Note** — `TOKEN_REFRESHED` events (every ~1 hr) never
> re-fetch the role from DB. They only update the session and restore the cached
> role to avoid a "role flip to null" bug that previously broke admin access.

---

## 4. Forgot Password / Reset Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant UI as AdminAuth.tsx
    participant SB as Supabase Auth
    participant Email as Admin Email Inbox

    Admin->>UI: Click "Forgot Password?"
    UI->>UI: setView('forgot')

    Admin->>UI: Enter email → "Send reset link"
    UI->>SB: supabase.auth.resetPasswordForEmail(email,\n  { redirectTo: origin + /admin/auth#type=recovery })
    SB-->>Email: Sends magic link email
    SB-->>UI: { error: null }
    UI->>UI: setView('check-email')
    UI-->>Admin: "Check Mail" screen shown

    Admin->>Email: Opens email → clicks reset link
    Email->>UI: Browser loads /admin/auth\n  URL hash: #type=recovery&access_token=...
    UI->>UI: useEffect detects hash type=recovery
    UI->>UI: setView('reset-password')

    Admin->>UI: Type new password + confirm → Submit
    UI->>SB: supabase.auth.updateUser({ password })
    SB-->>UI: { error: null }
    UI->>UI: setView('reset-success')
    UI-->>Admin: "Password Updated" screen shown

    Admin->>UI: Click "Sign In"
    UI->>UI: setView('login')
```

### Link Expiry / Access Denied Branch

```mermaid
flowchart LR
    A[Admin clicks email link] --> B{URL hash\nerror=access_denied?}
    B -- Yes --> C[setView 'expired']
    C --> D[Admin sees 'Link Expired' screen]
    D --> E[Click 'Request New Link']
    E --> F[setView 'forgot']
    B -- No, type=recovery --> G[setView 'reset-password']
```

---

## 5. Sign-Out Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Sidebar as AdminHub sidebar
    participant Hook as useAdminAuth.ts
    participant AP as AuthProvider
    participant SB as Supabase Auth
    participant Router as window.location

    Admin->>Sidebar: Click "Sign Out"
    Sidebar->>Hook: logout()
    Hook->>AP: signOut()
    AP->>SB: supabase.auth.signOut()
    SB-->>AP: SIGNED_OUT event
    AP->>AP: setUser(null)\nsetSession(null)\nsetRole(null)\nclearRoleCache()
    Hook->>Router: window.location.replace\n  ("/admin/auth?signed-out=true")

    note over Router: Full page reload — clears all React state
    Router->>UI: /admin/auth?signed-out=true
    UI->>UI: useEffect: signed-out=true && !user
    UI->>UI: setView('signed-out')
    UI-->>Admin: "Signed Out Securely" screen + ShieldCheck icon

    Admin->>UI: Click "Sign In Again"
    UI->>UI: setView('login')\nnavigate('/admin/auth', replace)
```

> **Why `window.location.replace` not `navigate()`?**
> The hard redirect guarantees a full re-render, preventing stale React state
> from the authenticated session leaking into the sign-out screen.

---

## 6. AuthProvider Bootstrap (on every page load)

```mermaid
flowchart TD
    A[App mounts / page refresh] --> B[AuthProvider useEffect runs]
    B --> C[supabase.auth.getUser\nserver-side token validation]
    C -- Invalid / expired --> D[setUser null\nsetLoading false]
    D --> E[AuthGuard redirects unauthenticated\nrequests to /admin/auth]
    C -- Valid user --> F[supabase.auth.getSession\nget current tokens]
    F --> G[fetchUserRole with 3-tier fallback]
    G --> H[setUser / setSession / setRole\nsetLoading false]
    H --> I[Admin sees requested route ✓]

    B --> J[Safety timeout 5 s]
    J -- Loading still true at 5 s --> K[Force setLoading false\nprevents white screen]
```

---

## 7. Complete View Map at a Glance

| `view` state | Screen | Entry trigger | Exit to |
|---|---|---|---|
| `login` | Sign-In form | App load / navigate | `forgot`, `/admin` |
| `forgot` | Email-for-reset form | "Forgot Password?" | `check-email`, `login` |
| `check-email` | Mail sent confirmation | `handleForgot` success | `login` |
| `reset-password` | New-password form | URL hash `#type=recovery` | `reset-success` |
| `reset-success` | Password updated confirmation | `handleReset` success | `login` |
| `expired` | Link expired error | URL hash `#error=access_denied` | `forgot` |
| `signed-out` | Signed out confirmation | URL param `?signed-out=true` | `login` |

---

## 8. Key Files Reference

| File | Responsibility |
|---|---|
| `src/pages/admin/AdminAuth.tsx` | All 7 view states, form handlers |
| `src/components/auth/AuthProvider.tsx` | Session bootstrap, role fetch (3-tier), `signOut`, token refresh guard |
| `src/hooks/useAdminAuth.ts` | `logout()` helper used by sidebar; wraps `signOut` + redirect |
| `src/components/auth/AuthGuard.tsx` | Protects `/admin/*` routes; redirects to `/admin/auth` if not authenticated |
| `src/components/admin/RoleGuard.tsx` | Protects individual admin pages by required role level |
| `src/lib/auth/rbac.ts` | Role hierarchy: `super_admin` → `admin` → `editor` → `viewer` |
