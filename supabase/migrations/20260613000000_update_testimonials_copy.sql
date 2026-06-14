-- Update testimonials to reflect Predictability, Execution, Budget, and Timeline instead of aesthetics
DELETE FROM public.testimonials WHERE project_id IS NULL;

INSERT INTO public.testimonials (author_name, author_role, city, content, rating, display_order, active)
VALUES
('Rahul & Priya Verma', 'Homeowners', 'Bangalore', 'We had heard nightmares about interior projects doubling in cost midway. CrossAngle gave us a BOQ down to the last screw, and the final bill was exactly what we signed on day one. Zero hidden costs, total predictability.', 5, 1, true),
('Siddharth Menon', 'Startup Founder', 'Mumbai', 'I didn''t have the time to visit the site every day. Their dedicated engineer sent me daily progress photos on WhatsApp. The timeline was 45 days, and they handed over the keys on day 43. Flawless execution.', 5, 2, true),
('Ananya Rao', 'Architect', 'Pune', 'As someone in the industry, I know how contractors cut corners with materials. CrossAngle''s transparency is unheard of. They use factory-stamped marine plywood and top-tier German hardware, and everything is audited before installation.', 5, 3, true),
('Karan Singhal', 'Finance Director', 'Delhi', 'The difference between CrossAngle and a local contractor is engineering versus guesswork. They don''t just design; they manufacture your interior. The fit and finish is on par with premium European imported kitchens.', 5, 4, true);
