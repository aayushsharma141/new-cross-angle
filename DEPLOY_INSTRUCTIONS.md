---
description: How to deploy the application to Vercel and Supabase
---

# Deployment Guide

This guide covers deploying the full stack application: the React frontend (Vite) and the Supabase backend (Edge Functions & Database).

## Prerequisites

1.  **Supabase Project**: You need a Supabase project created at [supabase.com](https://supabase.com).
2.  **Vercel Account**: You need a Vercel account for hosting the frontend at [vercel.com](https://vercel.com).
3.  **Supabase CLI**: Installed locally (`npm install -g supabase`).
4.  **Vercel CLI**: Installed locally (`npm install -g vercel`) (Optional, can use UI).

## 1. Deploying the Backend (Supabase)

The backend consists of Database schema (migrations) and Edge Functions.

### A. Link Local Project

Run the following command in your terminal to link your local environment to your remote Supabase project. You will need your Reference ID (found in Supabase Dashboard > Settings > General).

```bash
npx supabase link --project-ref <your-project-ref>
```

You will be asked for your database password.

### B. Push Database Changes

Apply your local migrations to the remote database to ensure the schema is up to date (this includes the new tables for admin users, blogs, logs, etc.).

```bash
npx supabase db push
```

### C. Deploy Edge Functions

Deploy all your server-side functions (`manage-user`, `process-lead`, etc.) to the edge.

```bash
npx supabase functions deploy
```

## 2. Deploying the Frontend (Vercel)

The frontend is a Vite + React application located in `apps/web`.

### Option A: Using Vercel Dashboard (Recommended)

1.  Push your latest code to your Git repository (GitHub/GitLab/Bitbucket).
2.  Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3.  Import your repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `apps/web` (Important! Do not leave as root).
    *   **Build Command**: `vite build` (or npm run build)
    *   **Output Directory**: `dist`
5.  **Environment Variables**:
    Add the following variables from your Supabase project (Settings > API):
    *   `VITE_SUPABASE_URL`: Your Project URL
    *   `VITE_SUPABASE_ANON_KEY`: Your `anon` public key
6.  Click **Deploy**.

### Option B: Using Vercel CLI

1.  Navigate to the web app directory:
    ```bash
    cd apps/web
    ```
2.  Run deploy:
    ```bash
    npx vercel
    ```
3.  Follow the prompts. Set `apps/web` as the root if asked.
4.  When asked for environment variables, you can link them or add them in the dashboard later.

## 3. Post-Deployment Checks

1.  **Visit your Vercel URL**: Ensure the website loads correctly.
2.  **Test Admin Panel**: Go to `/admin/login`.
3.  **Test Blog**: Check `/blog` and `/blog/some-post-slug`.
4.  **Check Edge Functions**: Try an action like "Contact Us" or "Suspend User" (Admin) to verify Edge Functions are reachable.

## Troubleshooting

*   **CORS Issues**: If Edge Functions fail, check `cors.ts` in your function folder and ensure your Vercel domain is allowed or headers are set correctly.
*   **Missing Styles**: If the site looks broken, ensure `dist` is correctly set as the output directory.
*   **Auth Errors**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in Vercel.
