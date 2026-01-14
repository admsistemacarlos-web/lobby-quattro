-- Update create_corretor_profile function to accept plano and create landing_configs automatically
CREATE OR REPLACE FUNCTION public.create_corretor_profile(
  p_nome text, 
  p_email text, 
  p_telefone text DEFAULT NULL,
  p_slug text DEFAULT NULL,
  p_logo_url text DEFAULT NULL,
  p_cor_primaria text DEFAULT '#d4a574',
  p_creci text DEFAULT NULL,
  p_plano text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_corretor_id uuid;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if user already has a corretor profile
  IF EXISTS (SELECT 1 FROM corretores WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'User already has a corretor profile';
  END IF;
  
  -- Check if slug is available
  IF EXISTS (SELECT 1 FROM corretores WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'Slug already exists';
  END IF;
  
  -- Insert the corretor with ativo=false (pending admin approval)
  INSERT INTO public.corretores (user_id, nome, email, telefone, slug, logo_url, cor_primaria, creci, plano, ativo)
  VALUES (v_user_id, p_nome, p_email, p_telefone, p_slug, p_logo_url, p_cor_primaria, p_creci, p_plano::plano_corretor, false)
  RETURNING id INTO v_corretor_id;
  
  -- Create initial landing_configs with contact info pre-filled
  INSERT INTO public.landing_configs (corretor_id, whatsapp, email_contato, creci)
  VALUES (v_corretor_id, p_telefone, p_email, p_creci);
  
  RETURN v_corretor_id;
END;
$$;