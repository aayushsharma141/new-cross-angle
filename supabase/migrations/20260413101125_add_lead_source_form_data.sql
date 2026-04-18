-- Add tracking columns for CRM 
ALTER TABLE "public"."leads"
ADD COLUMN IF NOT EXISTS "source" text,
ADD COLUMN IF NOT EXISTS "form_data" jsonb;
