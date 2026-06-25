# GSD UI Review — Admin Productivity & Workflow UX

**Date:** 2026-06-19
**Scope:** Admin dashboard efficiency, task completion flow, information density, pipeline friction, bulk operations, form UX, error recovery
**GSD = Getting Stuff Done — evaluating how fast an admin can complete core tasks**

---

## 1. Critical Path: Lead → Quote → Win

### 1.1 Current Flow

```
Dashboard → Leads (list view) → Click lead → DetailSheet (slide-over) → Review info → 
Change stage dropdown → Click save → Toast confirms → Navigate back to list
```

**Clicks:** 6-7
**Page navigations:** 2-3 (list → detail → list)
**Data entry fields:** 1 (stage change) + optional notes

### 1.2 Friction Points

| Step | Issue | Severity |
| --- | --- | --- |
| Lead list → detail sheet | Sheet opens, but focus may not move into sheet — user must tab to first field | MAJOR — auto-focus first interactive element |
| Stage change | Dropdown with 6+ options, no keyboard shortcut | MINOR — keybind (e.g., "2" for qualified) |
| Save action | Requires reaching button at bottom of sheet | MINOR — consider Cmd+Enter |
| Return to list | Sheet closes, but URL params may not reflect the stage change | MAJOR — URL sync on every mutation |
| Lead scoring | Score is calculated but not visually explained | MINOR — tooltip or breakdown popover |
| Same-lead note taking | No inline note field in sheet — must open separate view | MAJOR — add note textarea to sheet |

### 1.3 Optimized Flow (Suggested)

```
Dashboard (1 click to leads filtered by "New") → Inline stage dropdown (no sheet) → 
Auto-save on change → Toast confirms → Next lead auto-loads
```

**Clicks:** 2-3

---

## 2. Critical Path: Blog Ideation → Publish

### 2.1 Current Flow

```
Dashboard → Blogs → "New Post" button → Editor tab loads → Fill form (title, content, SEO, 
tags, status) → Click "Publish" → Toast confirms → Redirects to all posts list
```

**Clicks:** 7+ (tab switch, fill fields, click save)
**Page state:** Tab-based (all ↔ editor)

### 2.2 Friction Points

| Step | Issue | Severity |
| --- | --- | --- |
| List → Editor tab switch | `handleNew()` switches to "editor" tab — URL changes but no `?edit=` param set, making deep-link impossible | MAJOR — `window.history.replaceState` after new post creation |
| Rich text editor (Tiptap) | Editor loads plugins — may have 1-2s delay before ready | MINOR — show loading skeleton for editor |
| Content area | `dangerouslySetInnerHTML` — no live preview of rendered post | MAJOR — add preview pane or toggle |
| SEO fields | Separate section below editor — easily missed | MINOR — collapsible panel with "SEO" label |
| Post status | Dropdown with "Draft / Published / Scheduled" — no explanation of visibility implications | MINOR — add helper text |
| Image upload | Must open separate MediaPicker modal, upload, get URL, paste into editor | MAJOR — inline image upload in editor |
| Cancel without saving | No "unsaved changes" warning — `handleCancel` discards immediately | CRITICAL — add `beforeunload` listener + dirty state check |

### 2.3 Optimized Flow (Suggested)

```
Dashboard → "New Post" (URL sets ?new=true) → Editor loads with auto-save (every 30s) → 
Preview toggle → Publish → Stays on editor with success banner → "View post" link
```

---

## 3. Critical Path: Project → Portfolio → Publish

### 3.1 Current Flow

```
Dashboard → Portfolio → "Add Project" → Dialog form (title, slug, category, status, images, 
client, content) → Submit → Toast confirms → Dialog closes → List refreshes
```

**Clicks:** 6-8
**Dialog fields:** ~12+

### 3.2 Friction Points

| Step | Issue | Severity |
| --- | --- | --- |
| Dialog form length | 12+ fields in one dialog — scroll fatigue on long forms | MAJOR — multi-step or collapsible sections |
| Image upload | Requires separate MediaPicker modal integration | MAJOR — inline upload/select in dialog |
| Slug auto-generation | Must be manually typed — no auto-slug from title | MAJOR — auto-generate on blur with editable override |
| Featured toggle | Simple switch, but `featured` status can conflict with other featured projects | MINOR — warn if >3 featured selected |
| Delete recovery | No undo — deletion is permanent | MAJOR — soft-delete with 30-day trash |

---

## 4. Dashboard Information Density

### 4.1 AdminDashboard KPIs

| Metric | Evaluation | Verdict |
| --- | --- | --- |
| Total Projects | Raw count — no trend arrow | ⚠️ Add % change vs last period |
| Published | Raw count — no comparison | ⚠️ Same |
| Drafts | Raw count — actionable (click to view drafts) | ✅ Clickable is good |
| Featured | Raw count — vanity metric | ❌ Remove or make actionable |
| Leads (CRM) | Raw count — no pipeline velocity | ⚠️ Add conversion rate |
| Blog views | Raw count — no trend | ⚠️ Add trend direction |

### 4.2 Information Gap

| Missing | Why It Matters |
| --- | --- |
| Tasks requiring attention (e.g., "3 leads in 'New' for >48h") | Drives action, not vanity |
| Recent activity feed (e.g., "John updated Project X") | Team awareness |
| Quick-action shortcuts (e.g., "Create Lead", "New Blog Post") | Reduces click depth |
| Pending review count | Unpublished projects/blogs ready for review |

---

## 5. Command Palette / AdminHub UX

### 5.1 Current State

`AdminHub.tsx` implements a command-palette style interface. Evaluation:

| Aspect | Rating | Notes |
| --- | --- | --- |
| Search relevance | ⚠️ Needs testing | Does search include recently accessed items? |
| Result grouping | ✅ Good | Categories (Pages, Leads, Projects, etc.) |
| Keyboard shortcuts | ❌ Not implemented | No `/` to open, no arrow navigation |
| Recently accessed | ❌ Not tracked | No "recent" section |
| Action shortcuts (create) | ❌ Not available | Can navigate but can't create from palette |
| Dismiss behavior | ✅ Good | Click outside or Escape closes |

---

## 6. CRM Pipeline Friction

### 6.1 Stage Transitions

| Stage | Transition | UX | Verdict |
| --- | --- | --- | --- |
| New → Contacted | Dropdown in sheet | 3 clicks (open sheet, change, save) | ⚠️ Acceptable |
| Contacted → Qualified | Same flow | Same | ⚠️ Acceptable |
| Qualified → Proposal | Same flow | Same | ⚠️ Acceptable |
| Proposal → Negotiation | Same flow | Same | ⚠️ Acceptable |
| Negotiation → Won/Lost | Same flow | No reason capture on "Lost" | ❌ Missing — losing without learning why |

### 6.2 Missing CRM Features

| Feature | Impact | Severity |
| --- | --- | --- |
| Inline stage change (dropdown on list row) | Save 2 clicks per lead update | MAJOR |
| Activity logging per lead (call/email notes) | No record of interactions | CRITICAL |
| Lead source analytics in CRM view | Cannot optimize acquisition channels | MAJOR |
| Assignment to team members | No ownership model | MAJOR |
| Follow-up reminders | Leads can fall through cracks | MAJOR |

---

## 7. Bulk Operations Gap

### 7.1 Current State: Zero Bulk Operations

| Action | Portfolio | Blog | Gallery | Leads | Media |
| --- | --- | --- | --- | --- | --- |
| Multi-select | ❌ | ❌ | ❌ | ❌ | ✅ (Media only) |
| Batch delete | ❌ | ❌ | ❌ | ❌ | ✅ (Media only) |
| Batch publish/draft | ❌ | ❌ | ❌ | ❌ | ❌ |
| Batch status change | ❌ | ❌ | ❌ | ❌ | ❌ |
| Batch export | ❌ | ❌ | ❌ | ✅ (single export) | ❌ |
| Batch assign | ❌ | ❌ | ❌ | ❌ | ❌ |

### 7.2 Impact

Managing >10 items of any type is 10x more work than it should be. For example, publishing 5 draft projects requires opening each one, changing status, and saving individually.

---

## 8. Form UX Patterns

### 8.1 Tab Order

| Page | Tab Order Quality | Notes |
| --- | --- | --- |
| `AdminGallery.tsx` — item form | ✅ Good | Logical left-to-right, top-to-bottom |
| `AdminTeam.tsx` — member form | ⚠️ Needs review | Social fields after name/role/bio — tab order follows display order |
| `AdminServices.tsx` — service form | ⚠️ Needs review | Features/process/FAQ sub-editors have complex tab flow |
| `AdminAuth.tsx` — login form | ✅ Good | Email → Password → Remember → Login |

### 8.2 Auto-Save Status

| Page | Auto-save? | Verdict |
| --- | --- | --- |
| All admin CRUD forms | ❌ No — manual save only | Users must remember to save; loss on navigation |
| Blog editor | ❌ No | Highest-risk due to long-form content |
| AdminSettings | ❌ No | System settings can be complex |

### 8.3 Field Autofocus

| Page | First Field Focused? |
| --- | --- |
| Gallery dialog | ❌ Should auto-focus title |
| Team dialog | ❌ Should auto-focus name |
| Milestones dialog | ❌ Should auto-focus year |
| Process steps dialog | ❌ Should auto-focus step_number |
| Lead sheet | ❌ Should auto-focus notes/next action |

---

## 9. Error Recovery Speed

| Scenario | Recovery UX | Verdict |
| --- | --- | --- |
| Accidental delete | No undo — item is permanently deleted | ❌ CRITICAL — soft-delete or undo toast needed |
| Form data loss on navigation | No "unsaved changes" warning on most forms | ❌ CRITICAL |
| Mistaken status change | Can re-change status (no audit trail visibility) | ⚠️ Acceptable but could improve |
| Wrong lead stage | Same — can re-change | ⚠️ Acceptable |
| Bulk operation mistake | No bulk undo mechanism | ❌ MAJOR |

---

## 10. Empty States

| Page | Empty State? | Quality |
| --- | --- | --- |
| `AdminPortfolio` | ✅ `AdminEmptyState` | ✅ Actionable: "Create your first project" |
| `AdminServices` | ✅ `AdminEmptyState` | ✅ |
| `AdminGallery` | ❌ No empty state | ❌ Shows blank grid |
| `AdminTeam` | ⚠️ `AdminEmptyState` depends on list length | Check if rendered when empty |
| `AdminMilestones` | ⚠️ Uses DataTable with empty rows | ⚠️ Shows empty table with headers only |
| `AdminTestimonials` | ❌ No empty state | ❌ Shows blank page |
| `AdminBlogPerformance` | ❌ No empty state | ❌ Shows empty charts (if no blog posts exist) |
| `AdminBlogEngagement` | ❌ No empty state | ❌ Same |
| Leads (AdminLeads) | ⚠️ DataTable with no rows | ⚠️ Header only |

---

## GSD Score Summary

| Category | Score | Grade |
| --- | --- | --- |
| Lead→Quote→Win flow | 40% | D |
| Blog publish flow | 35% | D |
| Project portfolio flow | 40% | D |
| Dashboard information density | 45% | D |
| Command palette utility | 50% | D |
| CRM pipeline automation | 20% | F |
| Bulk operations | 5% | F |
| Form UX (tab order, autofocus) | 30% | F |
| Error recovery | 10% | F |
| Empty states | 25% | F |
| **Overall GSD Score** | **30%** | **F — High admin friction** |

## Top 5 Quick Wins

1. **Auto-save drafts** in blog editor (30-min effort, prevents data loss)
2. **Auto-focus first field** in all admin CRUD dialogs (15-min effort)
3. **Inline stage dropdown** on lead list rows (saves 2 clicks per update)
4. **"Unsaved changes" warning** on tab-switch in AdminBlogs (30-min effort)
5. **Bulk publish/draft** toggle in portfolio and blog (1-hour effort)
