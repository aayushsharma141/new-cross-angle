# Admin Control Panel

## What Is This?

A private dashboard at `/admin` where the Cross Angle team manages the entire business platform — leads, content, portfolio, analytics, and system settings. Only authorized team members can access it.

---

## How to Access

1. Go to `crossangleinterior.com/admin`
2. Sign in with your authorized email and password
3. You'll land on the Admin Hub — your central command center

---

## Modules Overview

### 📊 Dashboard
- Key performance indicators (KPIs) at a glance
- New leads count, active projects, website traffic
- Quick access to all modules

### 👥 CRM (Customer Relationship Management)
| Feature | What It Does |
|---------|--------------|
| Leads Table | View all incoming leads from website, quiz, estimator |
| Lead Status | Track each lead: New → Contacted → Qualified → Proposal → Won/Lost |
| Filters & Search | Find leads by source, city, budget, date |

### 📝 CMS (Content Management)
| Section | What You Can Edit |
|---------|-------------------|
| Portfolio | Add/edit/remove project showcases |
| Services | Update service descriptions and pricing |
| Blog | Write and publish articles |
| Testimonials | Manage client reviews |
| Hero Section | Update homepage hero images and text |
| Gallery | Manage the image gallery |
| Media Library | Upload and organize images/files |
| Team | Update team member profiles |

### 📈 Analytics
- Discovery Engine analytics (quiz completions, popular styles)
- Blog performance metrics
- Lead source tracking

### 🧮 Estimator Management
- View estimate leads (people who used the cost calculator)
- Configure pricing rates (super admin only)

### ⚙️ System (Super Admin Only)
| Feature | What It Does |
|---------|--------------|
| Settings | System-wide configuration |
| Team Members | Manage who has admin access |
| Audit Logs | Track all changes made in the system |
| Access Control | Assign roles (admin, editor, viewer) |

---

## User Roles

| Role | Can Do |
|------|--------|
| **Super Admin** | Everything — including system settings, rate config, user management |
| **Admin** | Manage all content, leads, and analytics |
| **Editor** | Edit content (blog, portfolio, services) |
| **Viewer** | View-only access to dashboard and reports |

---

## Security Features

- **Email + password authentication** via Supabase
- **Role-based access control** — each page checks your permission level
- **Session timeout** — automatic logout after inactivity
- **Audit logging** — every action is recorded with timestamp and user
- **Secure logout** — clears all session data completely

---

## Related Documentation

- [Lead Generation System](../lead-generation-system/README.md) — Where leads come from
- [CMS-Driven Content](../cms-driven-content/README.md) — Content editing details
- Technical: `docs/guides/admin-auth-flow.md` — Authentication flow diagram
- Technical: `docs/ADMIN_PANEL_REQUIREMENTS.md` — Full technical specification
