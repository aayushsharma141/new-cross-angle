/**
 * Built-in text for the Privacy Policy and Terms & Conditions.
 *
 * These are the words that shipped with the site. Once a super admin publishes a
 * change in Site Content, the published version replaces them; "Use built-in text"
 * brings these back. Body fields are Markdown: **bold**, "- " bullet lists,
 * "### " sub-headings, "> " call-out boxes and [links](/path).
 *
 * This is legal text. Have it reviewed by a lawyer before changing meaning.
 */

export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalDocument {
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  badge: string;
  titleLead: string;
  titleEmphasis: string;
  intro: string;
  metaItems: string[];
  sections: LegalSection[];
  footerNote: string;
}

export const PRIVACY_DEFAULTS: LegalDocument = {
  seoTitle: "Privacy Policy & DPDPA Rights | Cross Angle Interior",
  seoDescription:
    "Cross Angle Interior's Privacy Policy compliant with DPDPA 2023. Learn how we collect, use, and protect your personal data.",
  ogTitle: "Privacy Policy | Cross Angle Interior",
  ogDescription: "Cross Angle Interior's Privacy Policy compliant with DPDPA 2023.",
  badge: "Legal & Privacy · Version 2.0",
  titleLead: "Privacy Policy &",
  titleEmphasis: "DPDPA Compliance",
  intro:
    "Published in compliance with the **Digital Personal Data Protection Act, 2023 (DPDPA)** of India. This policy governs how Crossangle Interior collects, uses, and protects your personal data.",
  metaItems: ["Last Updated: June 01, 2026", "Version 2.0 — DPDPA 2023 Compliant"],
  sections: [
    {
      title: "Statutory Overview",
      body: `**Crossangle Interior** (hereinafter "the Company," "we," "us," or "our") acts as the **Data Fiduciary** in relation to the personal data collected through our website and during the course of providing interior design services in Jamshedpur and Kolkata.

By accessing our website or engaging our services, you (the **Data Principal**) acknowledge that you have read and understood this Policy and consent to the collection and processing of your data as described herein.

- **Data Fiduciary:** Crossangle Interior — determines the purpose and means of processing personal data.
- **Data Principal:** The individual to whom the personal data relates (Client, Visitor, or Lead).
- **Personal Data:** Any data about an individual who is identifiable by or in relation to such data.
- **Processing:** Any automated or manual operation performed on personal data.`,
    },
    {
      title: "Nature of Data Collected",
      body: `We collect personal data only to the extent necessary for premium interior design service delivery:

### A. Voluntarily Provided

- **Identity & Contact:** Legal name, phone, email, and physical address.
- **Project Specifics:** Site location, floor plans, site photographs, and design preferences.
- **Financial Information:** PAN (for high-value transactions), GST details (commercial projects), and transaction history.

### B. Automatically Collected (Technical)

- **Identifiers:** IP addresses, browser type, and operating system.
- **Usage Data:** Clickstream patterns, time on pages, and referring URLs.
- **Cookies:** Essential cookies for session integrity and analytics cookies for site improvement.`,
    },
    {
      title: "Legal Grounds & Purposes for Processing",
      body: `Under DPDPA 2023, we process your data based on **Consent** or **Legitimate Use**:

- **Project Estimations & Quotes** — Contact, Project Specs. *Legal basis: Consent.*
- **3D Design Visualizations** — Site Photos, Floor Plans. *Legal basis: Contractual Necessity.*
- **Vendor Coordination (Hafele, Asian Paints)** — Name, Site Address. *Legal basis: Legitimate Use.*
- **10-Year Warranty Tracking** — Contact, Invoice History. *Legal basis: Contractual Necessity.*
- **Statutory Compliance (Tax)** — PAN, GST, Billing Info. *Legal basis: Legal Obligation.*`,
    },
    {
      title: "Your Rights as Data Principal (DPDPA 2023)",
      body: `Pursuant to the DPDPA 2023, you are entitled to the following rights:

- **Right to Information:** Receive a summary of your data being processed and the identities of third parties with whom it is shared.
- **Right to Correction & Erasure:** Request rectification of inaccurate data or deletion of data no longer required for its original purpose.
- **Right of Grievance Redressal:** Register a complaint with our Data Protection Officer regarding any processing concerns within 30 days.
- **Right to Nominate:** Nominate any individual to exercise your data rights in the event of your death or incapacity — unique to DPDPA.
- **Right to Withdraw Consent:** Withdraw consent at any time. Note: withdrawal may limit our ability to continue active project services.`,
    },
    {
      title: "Data Retention & Disposal",
      body: `- **Active Project Data — Project duration + 10 years.** Aligned with our 10-Year Modular Warranty period — legally justified contractual necessity.
- **Inquiry Data (Non-converted) — 24 months.** Securely deleted or anonymized after 24 months of inactivity from the initial inquiry date.
- **Financial Records — 8 years.** Mandated by the Companies Act and Income Tax Act of India.`,
    },
    {
      title: "Data Security & Third-Party Disclosure",
      body: `### Security Measures (TOMs)

- **Encryption:** SSL/TLS encryption for all data in transit.
- **Access Control:** Strict Role-Based Access Control (RBAC) for internal staff.
- **Vendor Due Diligence:** Data shared only with DPDPA-compliant partners (Godrej, Philips, Hettich, Jaquar).

### We Do NOT Sell Your Data

We disclose data only to: (a) **service partners** for project execution (contractors, logistics, suppliers), and (b) **compliance authorities** where mandated by law.`,
    },
    {
      title: "Grievance Redressal & Data Protection Officer",
      body: `As required by DPDPA 2023, Crossangle Interior has appointed a Data Protection Officer (DPO) to handle all privacy-related concerns:

- **DPO Email:** [privacy@crossangle.in](mailto:privacy@crossangle.in)
- **Legal Inquiries:** [hello@crossangle.in](mailto:hello@crossangle.in)
- **Phone:** [+91 7909041132](tel:+917909041132)
- **Response Time:** 48 hrs acknowledge / 30 days resolve

> **Breach Notification.** In the event of a personal data breach, Crossangle Interior will notify the **Data Protection Board of India** and affected Data Principals within the timelines prescribed by DPDPA 2023.`,
    },
  ],
  footerNote:
    "This policy was last updated on **June 01, 2026**. For the Terms and Conditions of our services, see our [Terms & Conditions](/terms).",
};

export const TERMS_DEFAULTS: LegalDocument = {
  seoTitle: "Terms & Conditions | Cross Angle Interior",
  seoDescription:
    "Crossangle Interior's Terms and Conditions of Service — covering the 45-day delivery guarantee, 10-year modular warranty, payment schedule, and intellectual property rights.",
  ogTitle: "Terms & Conditions | Cross Angle Interior",
  ogDescription:
    "Crossangle Interior's Terms and Conditions of Service — 45-day delivery guarantee, 10-year modular warranty, payment schedule, and IP rights.",
  badge: "Legal Agreement",
  titleLead: "Terms &",
  titleEmphasis: "Conditions of Service",
  intro:
    "A legally binding agreement between **Crossangle Interior** and the Client. By paying a booking fee or signing a design brief, you agree to be bound by these Terms.",
  metaItems: ["Effective Date: June 01, 2026", "Jurisdiction: Jamshedpur & Kolkata, India"],
  sections: [
    {
      title: "The Agreement",
      body: `These Terms and Conditions ("Terms") constitute a legally binding agreement between **Crossangle Interior** ("the Company") and the **Client** — the individual or entity seeking interior design services. By paying a booking fee or signing a design brief, the Client agrees to be fully bound by these Terms.`,
    },
    {
      title: "Scope of Services",
      body: `The Company provides interior design and execution services including, but not limited to:

- Interior Architecture & Space Planning
- 3D Visualizations & Mood Boards
- Turnkey Execution (Civil, Electrical, Plumbing, Painting)
- Modular Manufacturing (Kitchens, Wardrobes, Storage)
- Procurement of Branded Fittings (Hafele, Hettich, Jaquar, etc.)`,
    },
    {
      title: "Project Quotations & Validity",
      body: `- **Provisional Estimates:** All initial estimates are provisional and based on Client-provided dimensions.
- **Final BOQ:** A final Bill of Quantities will be issued after detailed on-site measurement and material finalization.
- **Validity Period:** Quotations are valid for **15 days** from issuance due to fluctuating material costs (steel, plywood, etc.).`,
    },
    {
      title: `The "45-Day Delivery" Guarantee`,
      body: `The Company promises project handover within **45 days** of the "Execution Start Date."

### A. Execution Start Date — defined as the day ALL of these conditions are met

- Design sign-off on all 2D and 3D drawings
- Site is cleared of all previous debris or furniture
- 1st and 2nd payment milestones are fully cleared
- Site has continuous electricity and water supply

### B. The "Rent" Penalty

If the Company fails to hand over the project within the stipulated 45 days, the Company shall pay the Client a pre-agreed daily "rent" amount, **capped at 5% of the total contract value**.

### C. Exclusions — the penalty does NOT apply for delays caused by

- Client-requested design changes after sign-off
- Delayed material selection by the Client
- Society or Building restricted working hours
- Force Majeure events (floods, strikes, pandemic-related shutdowns)`,
    },
    {
      title: "Warranty & Post-Service Support",
      body: `- **10-Year Modular Warranty:** Applies specifically to modular kitchens and wardrobes manufactured by the Company. Covers manufacturing defects, termite infestation, and structural integrity.
- **Brand Warranty (Partners):** Fittings from **Hafele, Hettich, Godrej, and Philips** are covered by their respective manufacturer warranties. The Company will assist in facilitating these claims.
- **1-Year Free Maintenance:** Includes one (1) complimentary service visit every quarter for the first 12 months post-handover to adjust hinges, sliders, or touch-up paint.`,
    },
    {
      title: `Payment Schedule ("The Milestones")`,
      body: `Unless otherwise agreed in writing, the standard payment schedule is:

- **10% — Booking Fee.** To initiate the design phase. Non-refundable.
- **40% — Design Sign-off.** Payable before material procurement and factory production begins.
- **45% — Site Execution.** Payable in stages as work progresses on-site.
- **5% — Final Handover.** Payable upon completion of the final snag list and before handover of keys.`,
    },
    {
      title: "Intellectual Property Rights",
      body: `> All design concepts, 3D renders, and technical drawings remain the **sole intellectual property of Crossangle Interior**. The Client is granted a non-exclusive license to use these designs solely for the specific project site upon full payment of all dues.

**Unauthorized reproduction** or use of designs for other sites, or sharing with competing contractors, is strictly prohibited and may result in legal action.`,
    },
    {
      title: "Limitation of Liability",
      body: `- The Company's maximum liability for any defect, delay, or damage shall not exceed the **Service Fee portion** of the total contract value.
- The Company is **not liable** for structural defects in the building, seepage from external walls, or delays caused by third-party vendors not directly managed by the Company.`,
    },
    {
      title: "Termination",
      body: `- **By Client:** The Client may terminate by paying for all work completed to date plus a **15% cancellation fee** on the remaining contract value.
- **By Company:** The Company may terminate if the site is unsafe, the Client defaults on payments for more than **7 days**, or there is a material breach of these Terms.`,
    },
    {
      title: "Dispute Resolution & Governing Law",
      body: `- **Governing Law:** This agreement shall be governed by the laws of India.
- **Amicable Settlement:** Parties shall first attempt to resolve disputes through direct mediation between designated representatives.
- **Arbitration:** If unresolved within 30 days, disputes shall be referred to a sole arbitrator in **Jamshedpur or Kolkata** under the Arbitration and Conciliation Act, 1996 — faster and more private than court litigation.
- **Jurisdiction:** The courts of Jamshedpur or Kolkata shall have exclusive jurisdiction for matters not resolved by arbitration.`,
    },
    {
      title: "Contact for Legal Inquiries",
      body: `- **Legal Department:** [hello@crossangle.in](mailto:hello@crossangle.in)
- **Phone:** [+91 7909041132](tel:+917909041132)`,
    },
  ],
  footerNote:
    "These Terms are effective as of **June 01, 2026**. For our data practices, see our [Privacy Policy](/privacy).",
};
