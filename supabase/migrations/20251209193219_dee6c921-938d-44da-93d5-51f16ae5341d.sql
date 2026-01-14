-- Create enum for subscription plans
CREATE TYPE public.plano_corretor AS ENUM (
  'lobby_start',
  'lobby_pro', 
  'lobby_authority',
  'partner_start',
  'partner_pro',
  'partner_authority'
);

-- Add plan column to corretores table
ALTER TABLE public.corretores 
ADD COLUMN plano plano_corretor DEFAULT NULL;