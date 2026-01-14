-- Create anuncios table for ad campaign management
CREATE TABLE public.anuncios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id uuid NOT NULL REFERENCES corretores(id) ON DELETE CASCADE,
  nome text NOT NULL,
  slug text NOT NULL,
  plataforma text,
  status text NOT NULL DEFAULT 'ativo',
  headline_custom text,
  subtitulo_custom text,
  imagem_fundo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique index to prevent duplicate slugs per corretor
CREATE UNIQUE INDEX anuncios_corretor_slug_unique ON public.anuncios(corretor_id, slug);

-- Enable RLS
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anuncios
CREATE POLICY "Corretores can view own anuncios"
ON public.anuncios FOR SELECT
USING (corretor_id IN (
  SELECT id FROM corretores WHERE user_id = auth.uid()
));

CREATE POLICY "Corretores can insert own anuncios"
ON public.anuncios FOR INSERT
WITH CHECK (corretor_id IN (
  SELECT id FROM corretores WHERE user_id = auth.uid()
));

CREATE POLICY "Corretores can update own anuncios"
ON public.anuncios FOR UPDATE
USING (corretor_id IN (
  SELECT id FROM corretores WHERE user_id = auth.uid()
))
WITH CHECK (corretor_id IN (
  SELECT id FROM corretores WHERE user_id = auth.uid()
));

CREATE POLICY "Corretores can delete own anuncios"
ON public.anuncios FOR DELETE
USING (corretor_id IN (
  SELECT id FROM corretores WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all anuncios"
ON public.anuncios FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active anuncios (for landing pages)
CREATE POLICY "Public can view active anuncios"
ON public.anuncios FOR SELECT
USING (status = 'ativo');

-- Add anuncio_id to leads table
ALTER TABLE public.leads ADD COLUMN anuncio_id uuid REFERENCES anuncios(id);

-- Trigger for updated_at
CREATE TRIGGER update_anuncios_updated_at
BEFORE UPDATE ON public.anuncios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();