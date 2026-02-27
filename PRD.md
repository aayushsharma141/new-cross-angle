# Cross Angle Interior — Ralph Loop Task File

<!-- Ralph Loop reads this file each iteration. -->
<!-- Pick the FIRST unchecked [ ] task. Complete it. Mark [x]. Append to progress.txt. -->
<!-- CRITICAL: Each task touches EXACTLY ONE file. Do not read other files unless the task explicitly says so. -->

## Project Stack (memorise, do not re-read files for this)

- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui + lucide-react
- React Query (`@tanstack/react-query`)
- Supabase client at: `apps/web/src/integrations/supabase/client.ts`
- Admin pages: `apps/web/src/pages/admin/`
- Public pages: `apps/web/src/pages/`
- Components: `apps/web/src/components/`
- Migrations: `supabase/migrations/`

---

## Phase 1 — Semantic HTML Landmarks

- [x] **TASK-001** Open `apps/web/src/pages/Index.tsx` only. Wrap the main page content (everything below the Navbar and above the Footer) in a `<main>` element. Save.

- [x] **TASK-002** Open `apps/web/src/components/Navbar.tsx` only. Ensure the nav container is a `<nav>` element. Add `aria-label="Main navigation"` to it. Save.

- [x] **TASK-003** Open `apps/web/src/components/Footer.tsx` only. Wrap the outermost div in a `<footer>` semantic element. Save.

- [x] **TASK-004** Open `apps/web/src/pages/AboutPage.tsx` only. Wrap page body content in `<main>`. Save.

- [x] **TASK-005** Open `apps/web/src/pages/ServicesPage.tsx` only. Wrap page body content in `<main>`. Save.

- [x] **TASK-006** Open `apps/web/src/pages/GalleryPage.tsx` only. Wrap page body content in `<main>`. Save.

- [x] **TASK-007** Open `apps/web/src/pages/BlogPage.tsx` only. Wrap page body content in `<main>`. Save.

- [x] **TASK-008** Open `apps/web/src/pages/ContactPage.tsx` only. Wrap page body content in `<main>`. Save.

- [x] **TASK-009** Open `apps/web/src/pages/ProjectPage.tsx` only. Wrap page body content in `<main>`. Save.

---

## Phase 2 — Aria Labels for Icon Buttons

- [x] **TASK-010** Open `apps/web/src/components/Navbar.tsx` only. Find every `<button>` containing only an icon with no visible text. Add `aria-label="descriptive action"` to each one (e.g. `aria-label="Open menu"`, `aria-label="Close menu"`). Save.

- [x] **TASK-011** Open `apps/web/src/pages/admin/AdminLayout.tsx` only. Find every icon-only `<button>`. Add a descriptive `aria-label` to each. Save.

- [x] **TASK-012** Open `apps/web/src/pages/admin/AdminDashboard.tsx` only. Find every icon-only `<button>` and add `aria-label`. Find any `<img>` tags missing `alt` and add descriptive alt text. Save.

---

## Phase 3 — Fix Missing Admin Route

- [x] **TASK-013** Create the file `apps/web/src/pages/admin/AdminEstimateLeads.tsx` with this content:

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminEstimateLeads() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['estimate-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estimate_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading data.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Estimate Leads</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Name</th>
              <th className="text-left py-2 pr-4">Email</th>
              <th className="text-left py-2 pr-4">Phone</th>
              <th className="text-left py-2 pr-4">Project Type</th>
              <th className="text-left py-2 pr-4">Area (sqft)</th>
              <th className="text-left py-2 pr-4">Quality Tier</th>
              <th className="text-left py-2 pr-4">Min Estimate</th>
              <th className="text-left py-2 pr-4">Max Estimate</th>
              <th className="text-left py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((lead: any) => (
              <tr key={lead.id} className="border-b hover:bg-muted/50">
                <td className="py-2 pr-4">{lead.name}</td>
                <td className="py-2 pr-4">{lead.email}</td>
                <td className="py-2 pr-4">{lead.phone}</td>
                <td className="py-2 pr-4">{lead.project_type}</td>
                <td className="py-2 pr-4">{lead.property_size}</td>
                <td className="py-2 pr-4">{lead.quality_tier}</td>
                <td className="py-2 pr-4">₹{lead.estimate_total_min?.toLocaleString('en-IN')}</td>
                <td className="py-2 pr-4">₹{lead.estimate_total_max?.toLocaleString('en-IN')}</td>
                <td className="py-2 pr-4">{lead.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **TASK-014** Open `apps/web/src/App.tsx` only. Add at the top imports: `import AdminEstimateLeads from './pages/admin/AdminEstimateLeads';`. Add route: `<Route path="/admin/estimate-leads" element={<AdminEstimateLeads />} />` inside the admin routes block. Save.

- [ ] **TASK-015** Open `apps/web/src/pages/admin/AdminLayout.tsx` only. Add a sidebar navigation item for "Estimate Leads" linking to `/admin/estimate-leads`. Use `Calculator` icon from lucide-react. Save.

---

## Phase 4 — Live Dashboard KPIs

- [ ] **TASK-016** Open `apps/web/src/pages/admin/AdminDashboard.tsx` only. Find the Total Leads KPI card. Replace mock value with: `const { data: leadsCount } = useQuery({ queryKey: ['leads-count'], queryFn: async () => { const { count } = await supabase.from('leads').select('id', { count: 'exact', head: true }); return count; } });`. Display `leadsCount ?? '—'`. Add `<Skeleton className="h-8 w-16" />` while loading. Save.

- [ ] **TASK-017** Open `apps/web/src/pages/admin/AdminDashboard.tsx` only. Find the Leads This Month KPI card. Compute `const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();`. Add query: `supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', monthStart)`. Display count. Add skeleton. Save.

- [ ] **TASK-018** Open `apps/web/src/pages/admin/AdminDashboard.tsx` only. Find the leads-by-source widget. Replace mock with: `supabase.from('leads').select('lead_source')`. Group in queryFn: `data.reduce((acc, r) => { acc[r.lead_source] = (acc[r.lead_source]||0)+1; return acc; }, {})`. Pass to chart. Save.

- [ ] **TASK-019** Open `apps/web/src/pages/admin/AdminDashboard.tsx` only. Find the leads-by-city widget. Replace mock with: `supabase.from('leads').select('city')`. Group by city, take top 5. Render. Save.

- [ ] **TASK-020** Open `apps/web/src/pages/admin/AdminDashboard.tsx` only. Find the leads-by-budget widget. Replace mock with: `supabase.from('leads').select('budget_range')`. Group by budget_range. Render with skeleton and error fallback `"—"`. Save.

---

## Phase 5 — Database Migrations

- [ ] **TASK-021** Create `supabase/migrations/20260226120000_add_lead_indexes.sql`:

```sql
-- Performance indexes for lead queries
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
```

- [ ] **TASK-022** Create `supabase/migrations/20260226120100_add_project_indexes.sql`:

```sql
-- Performance indexes for portfolio queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);
```

- [ ] **TASK-023** Create `supabase/migrations/20260226120200_city_normalise_trigger.sql`:

```sql
-- Normalise city casing to prevent duplicates like "mumbai" vs "Mumbai"
CREATE OR REPLACE FUNCTION normalise_city()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.city IS NOT NULL THEN
    NEW.city = INITCAP(TRIM(NEW.city));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalise_city ON leads;
CREATE TRIGGER trg_normalise_city
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION normalise_city();
```

- [ ] **TASK-024** Create `supabase/migrations/20260226120300_rls_leads.sql`:

```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_leads"
  ON leads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "auth_all_leads"
  ON leads FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

- [ ] **TASK-025** Create `supabase/migrations/20260226120400_rls_estimate_leads.sql`:

```sql
ALTER TABLE estimate_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_estimate_leads"
  ON estimate_leads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "auth_all_estimate_leads"
  ON estimate_leads FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

- [ ] **TASK-026** Create `supabase/migrations/20260226120500_rls_public_tables.sql`:

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "auth_all_projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_services" ON services FOR SELECT TO anon USING (true);
CREATE POLICY "auth_all_services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blogs" ON blogs FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "auth_all_blogs" ON blogs FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT TO anon USING (active = true);
CREATE POLICY "auth_all_testimonials" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## Phase 6 — CMS Feature Parity

- [ ] **TASK-027** Create `apps/web/src/pages/admin/AdminTeamMembers.tsx`. Build a CRUD page for `team_members` table using `useQuery` and `useMutation`. Table columns: Name, Designation, Display Order, Published toggle. Dialog form fields: `name`, `designation`, `bio` (textarea), `photo_url`, `display_order` (number), `is_published` (checkbox). Add, Edit, Delete operations. Call `queryClient.invalidateQueries(['team_members'])` after each mutation.

- [ ] **TASK-028** Open `apps/web/src/App.tsx` only. Add import and route for AdminTeamMembers: `import AdminTeamMembers from './pages/admin/AdminTeamMembers'` and `<Route path="/admin/team-members" element={<AdminTeamMembers />} />`. Save.

- [ ] **TASK-029** Open `apps/web/src/pages/admin/AdminLayout.tsx` only. Add sidebar link for Team Members → `/admin/team-members`. Use `Users` icon from lucide-react. Save.

- [ ] **TASK-030** Create `apps/web/src/pages/admin/AdminTestimonials.tsx`. CRUD page for `testimonials` table. Table: name, role, rating (n/5), city, active. Dialog fields: `name`, `role`, `content` (textarea), `rating` (number 1–5), `city`, `active` (boolean). Full CRUD with query invalidation.

- [ ] **TASK-031** Open `apps/web/src/App.tsx` only. Add import and route for AdminTestimonials. Save.

- [ ] **TASK-032** Open `apps/web/src/pages/admin/AdminLayout.tsx` only. Add sidebar link for Testimonials → `/admin/testimonials`. Use `Star` icon. Save.

---

## Phase 7 — Performance

- [ ] **TASK-033** Open `apps/web/src/components/Portfolio.tsx` only. Add `staleTime: 5 * 60 * 1000` and `gcTime: 30 * 60 * 1000` to all `useQuery` calls. Add `loading="lazy"` to all portfolio `<img>` tags. Save.

- [ ] **TASK-034** Open `apps/web/src/pages/Index.tsx` only. Add `staleTime: 5 * 60 * 1000` and `gcTime: 30 * 60 * 1000` to all `useQuery` calls. Add `loading="eager"` `fetchpriority="high"` to the hero image. Add `loading="lazy"` to all below-fold images. Save.

---

## Phase 8 — Repository Pattern

- [ ] **TASK-035** Create `apps/web/src/repositories/interfaces/LeadRepository.ts`:

```typescript
export interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  lead_source?: string;
  city?: string;
  budget_range?: string;
}
export interface Lead extends LeadPayload {
  id: string;
  status: string;
  created_at: string;
}
export interface LeadRepository {
  submitLead(payload: LeadPayload): Promise<void>;
  getLeads(): Promise<Lead[]>;
  updateLeadStatus(id: string, status: string): Promise<void>;
}
```

- [ ] **TASK-036** Create `apps/web/src/repositories/SupabaseLeadRepo.ts`:

```typescript
import { supabase } from '@/integrations/supabase/client';
import type { LeadRepository, LeadPayload, Lead } from './interfaces/LeadRepository';

export class SupabaseLeadRepo implements LeadRepository {
  async submitLead(payload: LeadPayload): Promise<void> {
    const { error } = await supabase.from('leads').insert(payload);
    if (error) throw error;
  }
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Lead[];
  }
  async updateLeadStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) throw error;
  }
}
export const leadRepo = new SupabaseLeadRepo();
```

---

## Phase 9 — Digital Intelligence Studio

- [ ] **TASK-037** Create `apps/web/src/components/calculators/AtmosphereOrchestrator.tsx`. Lighting cost calculator. State: mood (Warm/Neutral/Cool/Dramatic), intensity (0–100 slider), area (number input). Mood multipliers: `{Warm:1.2, Neutral:1.0, Cool:0.9, Dramatic:1.5}`. Formula: `lux = intensity * moodMultiplier * (area/10)`, `wattage = Math.ceil(lux/50)*40`, `monthlyCostINR = ((wattage*8*30)/1000)*8`. Show: Recommended Lux, Total Wattage, Monthly Cost ₹. Use `useState` only. No API calls.

- [ ] **TASK-038** Create `apps/web/src/components/calculators/TactileInvestmentEngine.tsx`. Material comparison calculator. Define MATERIALS constant (Italian Marble pricePerSqFt:850 wastageFactor:1.12 yearlyMaintenance:4000 valuePremiumPct:18 / Indian Granite 280 1.10 1500 10 / Vitrified Tiles 120 1.08 500 5 / Hardwood Flooring 450 1.15 3000 14 / Engineered Wood 220 1.10 1800 9 / Luxury Vinyl 95 1.05 600 4). Inputs: area (sqft), two material dropdowns. For each: show gross area with wastage, initial cost ₹, 10yr maintenance, lifecycle total, value premium %. Side-by-side layout.

- [ ] **TASK-039** Create `apps/web/src/components/calculators/DesignEquityForecaster.tsx`. ROI calculator. Inputs: investment ₹, room type (Kitchen=0.85 / Master Bath=0.75 / Living Room=0.65 / Bedroom=0.50 recovery multiplier), neighborhood (Premium=0.08 / Mid-tier=0.05 / Developing=0.03 annual appreciation). Formulas: `immediateRecovery = investment * roiMultiplier`, `year5 = investment * Math.pow(1+rate, 5)`, `year10 = investment * Math.pow(1+rate, 10)`, `recoverabilityIndex = (immediateRecovery/investment)*100`. Show: projection table (Today/5yr/10yr), Recoverability Index badge (green>75 yellow 50–75 red<50). Print button via `window.print()`.
