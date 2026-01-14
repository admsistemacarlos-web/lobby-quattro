
-- =====================================================
-- SECURITY FIX: Remove any public SELECT access to sensitive tables
-- =====================================================

-- 1. Ensure corretores table has NO public/anon SELECT access
-- Drop and recreate policies to be explicit about access control

-- First, drop all existing policies on corretores to start fresh
DROP POLICY IF EXISTS "Admins can manage corretores" ON public.corretores;
DROP POLICY IF EXISTS "Users can view own corretor profile" ON public.corretores;
DROP POLICY IF EXISTS "Users can update own corretor profile" ON public.corretores;
DROP POLICY IF EXISTS "Public can view active corretores" ON public.corretores;
DROP POLICY IF EXISTS "Anyone can view corretores" ON public.corretores;
DROP POLICY IF EXISTS "Anon can view corretores" ON public.corretores;

-- Recreate ONLY the necessary policies (no public SELECT)
CREATE POLICY "Admins can manage corretores"
ON public.corretores
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own corretor profile"
ON public.corretores
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own corretor profile"
ON public.corretores
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Ensure leads table has NO public/anon SELECT access
-- Drop and recreate policies

DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Corretores can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update all leads" ON public.leads;
DROP POLICY IF EXISTS "Corretores can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete all leads" ON public.leads;
DROP POLICY IF EXISTS "Public can view leads" ON public.leads;
DROP POLICY IF EXISTS "Anon can view leads" ON public.leads;

-- Recreate leads policies with explicit INSERT for anon, NO SELECT for anon
CREATE POLICY "Anyone can submit leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Corretores can view own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (corretor_id IN (
  SELECT id FROM public.corretores WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can update all leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Corretores can update own leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (corretor_id IN (
  SELECT id FROM public.corretores WHERE user_id = auth.uid()
))
WITH CHECK (corretor_id IN (
  SELECT id FROM public.corretores WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can delete all leads"
ON public.leads
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Revoke any direct table access from anon role
REVOKE SELECT ON public.corretores FROM anon;
REVOKE SELECT ON public.leads FROM anon;

-- 4. Ensure the RPC function exists and has proper grants
-- Drop and recreate to ensure it's correct
DROP FUNCTION IF EXISTS public.get_public_corretor_profile(text);

CREATE OR REPLACE FUNCTION public.get_public_corretor_profile(slug_input text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', c.id,
    'nome', c.nome,
    'telefone', c.telefone,
    'slug', c.slug,
    'logo_url', c.logo_url,
    'cor_primaria', c.cor_primaria,
    'creci', c.creci,
    'landing_config', CASE 
      WHEN lc.id IS NOT NULL THEN jsonb_build_object(
        'whatsapp', lc.whatsapp,
        'email_contato', lc.email_contato,
        'creci', lc.creci,
        'instagram_url', lc.instagram_url,
        'facebook_url', lc.facebook_url,
        'linkedin_url', lc.linkedin_url,
        'tiktok_url', lc.tiktok_url,
        'youtube_url', lc.youtube_url,
        'headline_principal', lc.headline_principal,
        'subtitulo', lc.subtitulo,
        'imagem_fundo_url', lc.imagem_fundo_url,
        'badges_customizados', lc.badges_customizados,
        'form_config', lc.form_config
      )
      ELSE NULL
    END
  ) INTO result
  FROM public.corretores c
  LEFT JOIN public.landing_configs lc ON lc.corretor_id = c.id
  WHERE c.slug = slug_input AND c.ativo = true;

  RETURN result;
END;
$$;

-- Grant execute to anon and authenticated for the RPC function
GRANT EXECUTE ON FUNCTION public.get_public_corretor_profile(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_corretor_profile(text) TO authenticated;
