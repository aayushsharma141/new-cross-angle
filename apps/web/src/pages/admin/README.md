# Admin Module

This directory contains the page components for the Admin Dashboard.

## Key Files

- **`AdminAuth.tsx`**: Handles Login, Signup, and Password Reset.
- **`AdminMedia.tsx`**: The Media Library manager.
    - Refactored into `components/admin/media/*` for better maintainability.
- **`AdminDashboard.tsx`**: The main overview page.
- **`AdminLayout.tsx`**: The common layout wrapper (Sidebar/Navbar) for all admin routes.

## Security Note

All routes in this directory should be protected by the `AdminLayout` wrapper which checks for authentication.
Data mutations (Create/Update/Delete) must be secured by **Supabase RLS Policies** on the backend. Client-side checks are for UX only.
