-- Add city field to testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS city text;

-- Update RLS policies for testimonials (if needed, they're likely fine)
