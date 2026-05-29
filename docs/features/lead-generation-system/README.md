# Lead Generation System

## What Is This?

The system that captures, organizes, and tracks every potential client who shows interest through the website. It collects leads from multiple touchpoints and funnels them into a single CRM (Customer Relationship Management) view in the Admin Panel.

---

## Where Leads Come From

| Source | How It Captures | Lead Quality |
|--------|----------------|--------------|
| **Style Quiz** | User completes the discovery engine | ⭐⭐⭐⭐⭐ Highest — engaged, preferences known |
| **Cost Estimator** | User completes budget calculator | ⭐⭐⭐⭐ High — budget and scope known |
| **Contact Form** | User fills the contact page form | ⭐⭐⭐ Medium — intent clear, details limited |
| **WhatsApp** | User clicks WhatsApp button | ⭐⭐ Basic — just a conversation starter |
| **Phone Call** | User calls from the website | ⭐⭐ Basic — tracked via call button clicks |

---

## Lead Lifecycle

```
    NEW              CONTACTED          QUALIFIED          PROPOSAL           WON / LOST
     │                   │                  │                 │                  │
  Lead arrives      Team reaches       Budget & scope     Quotation sent     Deal closed
  from website       out to client      confirmed          to client          or dropped
```

---

## What Gets Captured Per Lead

| Field | Description |
|-------|-------------|
| Name | Client's full name |
| Email | Contact email |
| Phone | Phone number (if provided) |
| Service Interest | What they're looking for (residential, commercial, etc.) |
| Lead Source | Where they came from (quiz, estimator, contact form, etc.) |
| City | Their location |
| Budget Range | Expected budget (from estimator or form) |
| Message | Any notes or requirements they shared |
| Status | Current stage in the pipeline |
| Created Date | When the lead was captured |

---

## Managing Leads in Admin Panel

### Viewing Leads
- Go to **Admin → CRM → Leads**
- See all leads in a table with sorting and filtering
- Filter by: source, status, city, date range, budget

### Updating Lead Status
- Click on a lead to open details
- Change status as you progress through the sales pipeline
- Add notes for team context

### Estimator Leads (Separate View)
- **Admin → Estimator → Leads** shows leads specifically from the cost calculator
- Includes their full estimate details (property type, area, services, budget)

---

## Analytics & Reporting

The Admin Panel shows:
- **Total leads** this month vs. last month
- **Leads by source** — which channel brings the most
- **Leads by city** — geographic distribution
- **Conversion rate** — how many leads become clients
- **Response time** — how quickly the team follows up

---

## Business Value

- **No lead lost**: Every interaction is captured automatically
- **Prioritization**: High-quality leads (quiz/estimator) are easy to identify
- **Context**: Team knows what the client wants before the first call
- **Accountability**: Track who followed up and when
- **Growth insight**: See which marketing channels actually work

---

## Related Documentation

- [Interior Discovery Engine](../interior-discovery-engine/README.md) — Quiz lead source
- [Interior Cost Estimator](../interior-cost-estimator/README.md) — Estimator lead source
- [Admin Control Panel](../admin-control-panel/README.md) — CRM module details
