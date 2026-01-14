-- Create master RPC function for public landing page data
-- This function bypasses RLS using SECURITY DEFINER and returns ONLY public data

CREATE OR REPLACE FUNCTION public.get_landing_page_data(
  slug_corretor text,
  slug_anuncio text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  corretor_record record;
  anuncio_record record;
BEGIN
  -- Fetch corretor data (only active ones)
  SELECT 
    c.id,
    c.nome,
    c.telefone,
    c.slug,
    c.logo_url,
    c.cor_primaria,
    c.creci
  INTO corretor_record
  FROM public.corretores c
  WHERE c.slug = slug_corretor AND c.ativo = true;

  -- Return null if corretor not found
  IF corretor_record.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Build base result with corretor data
  SELECT jsonb_build_object(
    'corretor', jsonb_build_object(
      'id', corretor_record.id,
      'nome', corretor_record.nome,
      'telefone', corretor_record.telefone,
      'slug', corretor_record.slug,
      'logo_url', corretor_record.logo_url,
      'cor_primaria', corretor_record.cor_primaria,
      'creci', corretor_record.creci
    ),
    'landing_config', (
      SELECT CASE 
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
      FROM public.landing_configs lc
      WHERE lc.corretor_id = corretor_record.id
    ),
    'anuncio', NULL::jsonb
  ) INTO result;

  -- If anuncio slug is provided, fetch anuncio data
  IF slug_anuncio IS NOT NULL THEN
    SELECT 
      a.id,
      a.nome,
      a.slug,
      a.status,
      a.has_custom_landing,
      a.headline_custom,
      a.subtitulo_custom,
      a.imagem_fundo_url
    INTO anuncio_record
    FROM public.anuncios a
    WHERE a.corretor_id = corretor_record.id 
      AND a.slug = slug_anuncio 
      AND a.status = 'ativo';

    -- Add anuncio to result if found
    IF anuncio_record.id IS NOT NULL THEN
      result := jsonb_set(
        result, 
        '{anuncio}', 
        jsonb_build_object(
          'id', anuncio_record.id,
          'nome', anuncio_record.nome,
          'slug', anuncio_record.slug,
          'status', anuncio_record.status,
          'has_custom_landing', anuncio_record.has_custom_landing,
          'headline_custom', anuncio_record.headline_custom,
          'subtitulo_custom', anuncio_record.subtitulo_custom,
          'imagem_fundo_url', anuncio_record.imagem_fundo_url
        )
      );
    END IF;
  END IF;

  RETURN result;
END;
$$;

-- Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_landing_page_data(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_landing_page_data(text, text) TO authenticated;