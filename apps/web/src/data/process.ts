export interface ProcessStage {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  detail: string;
  timeline: string;
  budgetRange: string;
  clientDoes: string[];
  weDo: string[];
  deliverables: string[];
  image: string;
}

export const processStages: ProcessStage[] = [
  {
    id: "consult",
    number: "01",
    title: "Consult",
    subtitle: "Discovery & Briefing",
    summary: "We learn how you live, what you need, and what your budget looks like.",
    detail: "An honest conversation about your goals, lifestyle, and vision. We visit your space, take initial notes, and explain exactly how our system works — including what you can expect from us and what we need from you.",
    timeline: "Week 1",
    budgetRange: "No cost — free site visit",
    clientDoes: [
      "Share reference images or ideas you like",
      "Communicate your budget range honestly",
      "Walk us through your daily routine in the space"
    ],
    weDo: [
      "Visit your site for initial assessment",
      "Explain our 5-stage process in plain language",
      "Provide a preliminary ballpark estimate",
      "Answer every question before you commit"
    ],
    deliverables: [
      "Initial project summary document",
      "Ballpark cost estimate",
      "Process timeline overview"
    ],
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "measure-plan",
    number: "02",
    title: "Measure & Plan",
    subtitle: "Technical Layout",
    summary: "Laser-precise measurements and spatial planning for optimal flow.",
    detail: "Our team takes detailed digital measurements and creates accurate floor plans. We study natural light patterns, traffic flow, and structural constraints to design a layout that maximizes every square foot.",
    timeline: "Week 2",
    budgetRange: "Included in design fee",
    clientDoes: [
      "Grant site access for detailed measurements",
      "Confirm family/household requirements",
      "Review initial floor plans and provide feedback"
    ],
    weDo: [
      "Laser-measure every dimension",
      "Document existing electrical, plumbing, and structural points",
      "Create 2–3 layout options for your review",
      "Flag potential structural or budget constraints early"
    ],
    deliverables: [
      "Detailed floor plans with dimensions",
      "Existing condition report",
      "2–3 spatial layout options"
    ],
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "design",
    number: "03",
    title: "Design",
    subtitle: "3D Visuals & Material Selection",
    summary: "See every detail in photorealistic 3D before we break ground.",
    detail: "We translate floor plans into a complete design package: material boards, color palettes, furniture layouts, lighting plans, and photorealistic 3D renders. You see exactly what your finished space will look like — and you approve everything before a single tool touches your home.",
    timeline: "Week 3–4",
    budgetRange: "₹1.5–3L for full design package",
    clientDoes: [
      "Review 3D renders and material samples",
      "Choose between design options",
      "Approve final design before execution",
      "Finalize budget allocation per room"
    ],
    weDo: [
      "Create photorealistic 3D renders of every room",
      "Curate material boards with physical samples",
      "Design custom furniture and joinery details",
      "Prepare detailed electrical, plumbing, and lighting plans",
      "Provide itemized cost breakdown for approval"
    ],
    deliverables: [
      "Photorealistic 3D renders (front, top, perspective views)",
      "Material and finish sample board",
      "Furniture and lighting schedule",
      "Approved bill of quantities with costs"
    ],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "execute",
    number: "04",
    title: "Execute",
    subtitle: "Build & Install",
    summary: "Our teams bring the approved design to life — on schedule and on budget.",
    detail: "We manufacture modular components in our facility and coordinate all on-site trades. Our project manager provides daily updates with photos, so you always know exactly where things stand. No surprises, no disappeared contractors.",
    timeline: "Week 5–7",
    budgetRange: "70% of total project cost",
    clientDoes: [
      "Make scheduled payments per milestone",
      "Approve any change orders (rare, but communicated immediately)",
      "Provide site access during working hours"
    ],
    weDo: [
      "Manufacture and install all modular joinery",
      "Coordinate all trades (electrical, plumbing, painting, flooring)",
      "Daily progress photos and weekly status reports",
      "Proactively flag and resolve site issues",
      "Strict quality checks at every milestone"
    ],
    deliverables: [
      "Daily site progress photos",
      "Weekly status reports",
      "Milestone completion sign-offs"
    ],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356fce?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "handover",
    number: "05",
    title: "Handover",
    subtitle: "Walkthrough & Move-In",
    summary: "Your space is cleaned, styled, and ready — we hand you the keys.",
    detail: "We perform a final walkthrough with you, demonstrating every installed element. After your sign-off, we deep-clean the entire space, style all interiors, and hand over your complete maintenance guide. You move into a home that's ready to live in from day one.",
    timeline: "Week 8",
    budgetRange: "Final 10% on completion",
    clientDoes: [
      "Attend final walkthrough and sign-off",
      "Receive maintenance and warranty documentation"
    ],
    weDo: [
      "Final walkthrough with detailed checklist",
      "Deep-cleaning of entire space",
      "Interior styling and finishing touches",
      "Handover of all warranties, manuals, and maintenance guides",
      "Post-handover support for 30 days"
    ],
    deliverables: [
      "Final walkthrough sign-off document",
      "Maintenance and care guide",
      "Warranty certificates",
      "Styled, move-in-ready space"
    ],
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop"
  }
];

export const processFAQs = [
  {
    question: "Do I need to hire an architect or structural engineer separately?",
    answer: "For most interior projects, no — our in-house team handles all spatial planning, electrical layouts, and modular joinery designs. For structural changes (load-bearing wall removal, additions), we coordinate with empanelled structural engineers and include that in the project management."
  },
  {
    question: "Can I live in my home during the renovation?",
    answer: "It depends on the scope. For single-room renovations like a master suite or kitchen, you can usually stay in the rest of the home — we seal off the work zone and manage dust. For full-home renovations, we recommend temporary accommodation for 4–6 weeks. We can help arrange that."
  },
  {
    question: "What if I don't like the design after seeing the 3D renders?",
    answer: "That's exactly why we do 3D renders before execution. You can request revisions during the design stage (Stage Three) at no additional cost for up to two revision rounds. Once you approve and sign off, we proceed with zero ambiguity — what you see is what you get."
  },
  {
    question: "How is payment structured?",
    answer: "Payments are tied to milestones, not calendar dates. Typically: 30% at design approval, 40% at execution start, 20% at installation completion, and 10% at final handover. Every payment is linked to a deliverable you can see and verify."
  },
  {
    question: "What happens if the timeline slips?",
    answer: "Our timeline is contractually guaranteed. We build in 15% buffer for unforeseen delays (material availability, site conditions). If we exceed the agreed timeline due to factors within our control, we apply a pre-defined service credit. In over 500 projects, 95% have delivered on time."
  },
  {
    question: "What areas do you serve?",
    answer: "We are based in Jamshedpur and serve the entire Jharkhand region including Ranchi, Tata Nagar, and nearby districts. For larger commercial projects, we also take on assignments across eastern India."
  }
];

export const processMetrics = [
  { value: "500+", label: "Projects Delivered" },
  { value: "₹200Cr+", label: "Total Value Managed" },
  { value: "95%", label: "On-Time Delivery" },
  { value: "4.9", label: "Client Rating", suffix: "★" }
];
