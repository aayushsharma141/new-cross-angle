# Cross Angle Interior - Admin Dashboard & Website

This is a monorepo containing the frontend web application and backend configurations for Cross Angle Interior.

## Structure

- `apps/web`: The main web application (Vite + React + TypeScript + shadcn/ui).
- `supabase`: Supabase configuration, migrations, and edge functions.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Copy `apps/web/.env.local.example` to `apps/web/.env` and fill in your Supabase credentials.

3.  **Run Development Server**:
    ```bash
    npm run dev
    # or
    cd apps/web && npm run dev
    ```

## Deployment

The site is configured for deployment on Netlify or Surge.sh.

### Surge.sh (Free Hosting)

To deploy manually to Surge:

1.  Build the project:
    ```bash
    cd apps/web
    npm run build
    ```

2.  Deploy the `dist` folder:
    ```bash
    npx surge dist --domain cross-angle-admin-v1.surge.sh
    ```

See `DEPLOY_INSTRUCTIONS.md` (if available) for more details.

## Features

- **Admin Dashboard**: Secure login, lead management, blog editor, media library.
- **Public Website**: Portfolio showcase, services, contact forms.
- **Backend**: Supabase for database, authentication, and edge functions (AI integration).
