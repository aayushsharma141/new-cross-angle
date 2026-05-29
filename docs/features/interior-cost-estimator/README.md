# Interior Cost Estimator

## What Is This?

A step-by-step budget calculator at `/estimate` that gives visitors an instant cost estimate for their interior project. It asks about property type, size, rooms, services needed, and timeline — then generates a price range.

---

## Why It Exists

- The #1 question every potential client asks: **"How much will it cost?"**
- Giving a ballpark estimate builds trust and removes the fear of "hidden costs"
- It captures highly qualified leads — people who fill in project details are serious buyers
- It gives the sales team budget context before the first conversation

---

## How It Works (User Journey)

```
1. Choose Property Type
   (Apartment / Villa / Office / Commercial)
        │
2. Enter Property Details
   (City, area in sq.ft, number of rooms)
        │
3. Select Services Needed
   (Full interior / Kitchen / Bedroom / Bathroom / Living room / etc.)
        │
4. Choose Add-ons
   (Smart home / False ceiling / Modular furniture / etc.)
        │
5. Select Timeline
   (Standard / Express / Flexible)
        │
6. Set Budget Range
   (Slider from ₹5L to ₹1Cr+)
        │
7. Results Page
   → Estimated cost breakdown
   → "Get detailed quote" → Lead capture form
```

---

## Pricing Logic

The estimator uses configurable rates managed by the Super Admin:

| Factor | How It Affects Price |
|--------|---------------------|
| Property type | Base rate per sq.ft varies (apartment vs. villa vs. commercial) |
| City | Location multiplier (metro cities cost more) |
| Area (sq.ft) | Primary cost driver |
| Services selected | Each service has its own rate |
| Add-ons | Fixed or per-unit pricing |
| Timeline | Express delivery adds a premium |

**Rates are editable** in Admin Panel → Estimator → Rates (super admin only).

---

## What Data Gets Captured

When someone completes the estimator:
- All property details (type, city, area, rooms)
- Services and add-ons selected
- Budget range preference
- Generated estimate amount
- Contact details (name, email, phone)

This appears in Admin Panel under **Estimator → Leads** (source: `estimator`).

---

## Business Value

- **Instant gratification**: Visitors get a number immediately, no waiting for callbacks
- **Lead qualification**: Budget + project scope known before first contact
- **Conversion**: Estimator users convert at higher rates than generic form fills
- **Sales efficiency**: Team knows exactly what the client wants and can afford

---

## Related Documentation

- [Lead Generation System](../lead-generation-system/README.md) — How estimator leads enter the CRM
- [Admin Control Panel](../admin-control-panel/README.md) — Managing estimator rates
- [Main Website](../main-website/README.md) — Where the "Get Free Estimate" button lives
