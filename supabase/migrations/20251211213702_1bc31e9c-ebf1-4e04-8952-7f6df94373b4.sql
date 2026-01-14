-- Create function to get public corretor profile with landing config
CREATE OR REPLACE FUNCTION public.get_public_corretor_profile(slug_input text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
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

-- Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_corretor_profile(text) TO anon, authenticated;