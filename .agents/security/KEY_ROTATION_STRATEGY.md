# Key Rotation Strategy: CrossAngle Interior

## Objective

To ensure regular, secure, zero-downtime rotation of primary access credentials for the Supabase infrastructure (`SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`) every quarter as part of Elite-tier lifecycle management.

## Schedule

A GitHub Action `key-rotation-reminder.yml` initiates an alert on the 1st day of January, April, July, and October.

## Zero-Downtime Rotation Methodology

Rotating environment variables requires coordinated alignment between Vercel (Front-end & Serverless Functions), Supabase (Backend/Auth), and GitHub Actions (CI/CD Deployments).

### 1. Preparation

- Announce the impending key rotation in the engineering communications channel.
- Verify that no major deploy or critical batch job is running concurrently.

### 2. Issuance (Supabase Dashboard)

1. Go to **Supabase Dashboard** -> **Project Settings** -> **API**.
2. Identify the `anon`/`public` and `service_role` keys.
3. *Crucial:* Do not immediately delete the old ones if multiple apps are consuming them. However, since Supabase currently supports issuing new JWT secrets for the platform, the process involves rolling the `JWT Secret`.
   - *Note: Rolling the JWT secret invalidates all currently issued JWTs (user sessions).* For seamless handling, execute this during low-traffic hours (e.g. 2:00 AM IST).
4. Click **Generate new JWT secret**. This will immediately invalidate existing keys and issue a fresh `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Immediate Cloud Provider Updates (Vercel)

1. Navigate to the **Vercel Dashboard** -> **CrossAngle Project** -> **Settings** -> **Environment Variables**.
2. Update the values for:
   - `VITE_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY` depending on current nomenclature)
   - `SUPABASE_SERVICE_ROLE_KEY` (if used by Vercel edge/serverless functions)
3. Redeploy the `production` environment via **Deployments** -> **Redeploy** to ensure the applications start using the new configurations.

### 4. CI/CD Environment Sync (GitHub)

1. Navigate to **GitHub Repository** -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Replace the values for:
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Trigger a manual dry-run workflow or rely on the next commit to ensure Github Actions has functional access.

## Post-Rotation Checklist

- [ ] Vercel application redeployed.
- [ ] Successfully logged in to the application dashboard using an existing admin credential.
- [ ] Executed an end-to-end API test (e.g., submitting a contact/discovery lead).
- [ ] Confirmed that edge functions operating on the `service_role` key function correctly without HTTP 401s.

## Emergency Rollback

If application behavior enters an unstable state due to rotation issues, you may revert to the old JWT secret (if documented securely) in the Supabase Dashboard, then redeploy the old configurations to Vercel and GitHub.
