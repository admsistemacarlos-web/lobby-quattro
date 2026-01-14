-- Create update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create landing_templates table
CREATE TABLE public.landing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text UNIQUE NOT NULL,
  descricao text,
  thumbnail_url text,
  planos_permitidos text[] DEFAULT ARRAY['lobby_start', 'lobby_pro', 'lobby_authority']::text[],
  config_padrao jsonb DEFAULT '{}'::jsonb,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create landing_configs table
CREATE TABLE public.landing_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id uuid REFERENCES public.corretores(id) ON DELETE CASCADE NOT NULL UNIQUE,
  template_id uuid REFERENCES public.landing_templates(id),
  whatsapp text,
  email_contato text,
  creci text,
  instagram_url text,
  facebook_url text,
  linkedin_url text,
  tiktok_url text,
  youtube_url text,
  headline_principal text,
  subtitulo text,
  imagem_fundo_url text,
  badges_customizados jsonb DEFAULT '[]'::jsonb,
  config_extra jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for landing_templates
CREATE POLICY "Anyone can view active templates"
ON public.landing_templates
FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can manage templates"
ON public.landing_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for landing_configs
CREATE POLICY "Corretores can view own config"
ON public.landing_configs
FOR SELECT
USING (corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid()));

CREATE POLICY "Corretores can insert own config"
ON public.landing_configs
FOR INSERT
WITH CHECK (corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid()));

CREATE POLICY "Corretores can update own config"
ON public.landing_configs
FOR UPDATE
USING (corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid()))
WITH CHECK (corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all configs"
ON public.landing_configs
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view configs for active corretores"
ON public.landing_configs
FOR SELECT
USING (corretor_id IN (SELECT id FROM corretores WHERE ativo = true));

-- Create trigger for updated_at
CREATE TRIGGER update_landing_configs_updated_at
BEFORE UPDATE ON public.landing_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default template (Template Clássico - the current one)
INSERT INTO public.landing_templates (nome, slug, descricao, planos_permitidos)
VALUES (
  'Template Clássico',
  'classico',
  'Layout elegante com hero de destaque e formulário de captura. Ideal para corretores que buscam um visual profissional e sofisticado.',
  ARRAY['lobby_start', 'lobby_pro', 'lobby_authority']::text[]
);