-- Add rich fields to design_process_steps for TimelineGantt
ALTER TABLE public.design_process_steps 
ADD COLUMN IF NOT EXISTS budget_range text,
ADD COLUMN IF NOT EXISTS timeline_estimate text,
ADD COLUMN IF NOT EXISTS client_does jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS we_do jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS deliverables jsonb DEFAULT '[]'::jsonb;

-- Update row 1
UPDATE public.design_process_steps 
SET 
  budget_range = 'No cost — free site visit',
  timeline_estimate = 'Week 1',
  client_does = '["Share reference images or ideas you like", "Communicate your budget range honestly", "Walk us through your daily routine in the space"]'::jsonb,
  we_do = '["Visit your site for initial assessment", "Explain our 5-stage process in plain language", "Provide a preliminary ballpark estimate", "Answer every question before you commit"]'::jsonb,
  deliverables = '["Initial project summary document", "Ballpark cost estimate", "Process timeline overview"]'::jsonb
WHERE step_number = '01';

-- Update row 2
UPDATE public.design_process_steps 
SET 
  budget_range = 'Included in design fee',
  timeline_estimate = 'Week 2',
  client_does = '["Grant site access for detailed measurements", "Confirm family/household requirements", "Review initial floor plans and provide feedback"]'::jsonb,
  we_do = '["Laser-measure every dimension", "Document existing electrical, plumbing, and structural points", "Create 2–3 layout options for your review", "Flag potential structural or budget constraints early"]'::jsonb,
  deliverables = '["Detailed floor plans with dimensions", "Existing condition report", "2–3 spatial layout options"]'::jsonb
WHERE step_number = '02';

-- Update row 3
UPDATE public.design_process_steps 
SET 
  budget_range = '₹1.5–3L for full design package',
  timeline_estimate = 'Week 3–4',
  client_does = '["Review 3D renders and material samples", "Choose between design options", "Approve final design before execution", "Finalize budget allocation per room"]'::jsonb,
  we_do = '["Create photorealistic 3D renders of every room", "Curate material boards with physical samples", "Design custom furniture and joinery details", "Prepare detailed electrical, plumbing, and lighting plans", "Provide itemized cost breakdown for approval"]'::jsonb,
  deliverables = '["Photorealistic 3D renders (front, top, perspective views)", "Material and finish sample board", "Furniture and lighting schedule", "Approved bill of quantities with costs"]'::jsonb
WHERE step_number = '03';

-- Update row 4
UPDATE public.design_process_steps 
SET 
  budget_range = '70% of total project cost',
  timeline_estimate = 'Week 5–7',
  client_does = '["Make scheduled payments per milestone", "Approve any change orders (rare, but communicated immediately)", "Provide site access during working hours"]'::jsonb,
  we_do = '["Manufacture and install all modular joinery", "Coordinate all trades (electrical, plumbing, painting, flooring)", "Daily progress photos and weekly status reports", "Proactively flag and resolve site issues", "Strict quality checks at every milestone"]'::jsonb,
  deliverables = '["Daily site progress photos", "Weekly status reports", "Milestone completion sign-offs"]'::jsonb
WHERE step_number = '04';

-- Update row 5
UPDATE public.design_process_steps 
SET 
  budget_range = 'Final 10% on completion',
  timeline_estimate = 'Week 8',
  client_does = '["Attend final walkthrough and sign-off", "Receive maintenance and warranty documentation"]'::jsonb,
  we_do = '["Final walkthrough with detailed checklist", "Deep-cleaning of entire space", "Interior styling and finishing touches", "Handover of all warranties, manuals, and maintenance guides", "Post-handover support for 30 days"]'::jsonb,
  deliverables = '["Final walkthrough sign-off document", "Maintenance and care guide", "Warranty certificates", "Styled, move-in-ready space"]'::jsonb
WHERE step_number = '05';

-- Create process FAQs
CREATE TABLE IF NOT EXISTS public.process_faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.process_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view process faqs" ON public.process_faqs FOR SELECT USING (true);
CREATE POLICY "Admin can modify process faqs" ON public.process_faqs USING (public.is_admin_or_editor(auth.uid()));

INSERT INTO public.process_faqs (question, answer, display_order) VALUES
('Do I need to hire an architect or structural engineer separately?', 'For most interior projects, no — our in-house team handles all spatial planning, electrical layouts, and modular joinery designs. For structural changes (load-bearing wall removal, additions), we coordinate with empanelled structural engineers and include that in the project management.', 1),
('Can I live in my home during the renovation?', 'It depends on the scope. For single-room renovations like a master suite or kitchen, you can usually stay in the rest of the home — we seal off the work zone and manage dust. For full-home renovations, we recommend temporary accommodation for 4–6 weeks. We can help arrange that.', 2),
('What if I don't like the design after seeing the 3D renders?', 'That''s exactly why we do 3D renders before execution. You can request revisions during the design stage (Stage Three) at no additional cost for up to two revision rounds. Once you approve and sign off, we proceed with zero ambiguity — what you see is what you get.', 3),
('How is payment structured?', 'Payments are tied to milestones, not calendar dates. Typically: 30% at design approval, 40% at execution start, 20% at installation completion, and 10% at final handover. Every payment is linked to a deliverable you can see and verify.', 4),
('What happens if the timeline slips?', 'Our timeline is contractually guaranteed. We build in 15% buffer for unforeseen delays (material availability, site conditions). If we exceed the agreed timeline due to factors within our control, we apply a pre-defined service credit. In over 500 projects, 95% have delivered on time.', 5),
('What areas do you serve?', 'We are based in Jamshedpur and serve the entire Jharkhand region including Ranchi, Tata Nagar, and nearby districts. For larger commercial projects, we also take on assignments across eastern India.', 6)
ON CONFLICT DO NOTHING;

-- Create process metrics
CREATE TABLE IF NOT EXISTS public.process_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  value text NOT NULL,
  label text NOT NULL,
  suffix text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.process_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view process metrics" ON public.process_metrics FOR SELECT USING (true);
CREATE POLICY "Admin can modify process metrics" ON public.process_metrics USING (public.is_admin_or_editor(auth.uid()));

INSERT INTO public.process_metrics (value, label, suffix, display_order) VALUES
('500+', 'Projects Delivered', NULL, 1),
('₹200Cr+', 'Total Value Managed', NULL, 2),
('95%', 'On-Time Delivery', NULL, 3),
('4.9', 'Client Rating', '★', 4)
ON CONFLICT DO NOTHING;
