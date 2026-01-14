-- Add has_custom_landing column to anuncios table
ALTER TABLE public.anuncios 
ADD COLUMN has_custom_landing boolean NOT NULL DEFAULT false;