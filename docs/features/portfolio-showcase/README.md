# Portfolio Showcase

## What Is This?

The project gallery at `/portfolio` that displays Cross Angle Interior's completed work. It's the primary trust-building tool — showing real projects with professional photography, before/after comparisons, and project details.

---

## What Visitors See

### Portfolio Grid
- Filterable grid of project cards
- Each card shows: hero image, project title, location, service type
- Hover reveals a brief description
- Click opens the full project detail page

### Project Detail Page (`/portfolio/:slug`)
- Full image gallery with lightbox viewer
- Project description and scope
- Service tags (residential, commercial, etc.)
- Before/after comparison slider (where available)
- Related projects at the bottom

### Before & After Showcase (Homepage)
- Side-by-side comparison slider
- Dramatic visual proof of transformation
- Drives visitors to the full portfolio

---

## How Projects Get Added

1. Admin goes to **Admin Panel → CMS → Portfolio**
2. Clicks "Add Project"
3. Fills in: title, description, service type, location, status
4. Uploads images to the Media Library
5. Sets project as "Published" to make it live on the website

---

## Project Data Structure

| Field | What It Is |
|-------|-----------|
| Title | Project name (e.g., "Serene Master Suite") |
| Slug | URL-friendly name (auto-generated) |
| Description | Brief overview of the project |
| Service Tag | Category: residential, commercial, turnkey |
| Location | City/area where the project was done |
| Images | Gallery of project photos |
| Status | Draft / Published / Archived |
| Featured | Whether it appears on the homepage |

---

## Business Value

- **Trust building**: Real photos prove capability better than any sales pitch
- **SEO**: Each project page is indexable, bringing organic traffic
- **Inspiration**: Visitors see what's possible and get excited about their own project
- **Differentiation**: Quality of portfolio separates premium firms from budget ones

---

## Related Documentation

- [Main Website](../main-website/README.md) — Where portfolio appears in the site
- [CMS-Driven Content](../cms-driven-content/README.md) — How to manage portfolio content
- [Admin Control Panel](../admin-control-panel/README.md) — Portfolio management in admin
