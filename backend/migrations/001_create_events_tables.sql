-- Promorang Events Feature - Add Missing Columns
-- Run this in Supabase SQL Editor to add new columns to existing events table

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS virtual_url TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_attendees INT;
