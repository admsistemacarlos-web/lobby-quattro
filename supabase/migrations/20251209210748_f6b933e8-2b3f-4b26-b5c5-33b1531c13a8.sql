-- Create a SECURITY DEFINER function to safely accept corretor invites
-- This handles both profile creation and invite status update atomically
CREATE OR REPLACE FUNCTION public.accept_corretor_invite(
  p_invite_id uuid,
  p_nome text,
  p_email text,
  p_telefone text DEFAULT NULL,
  p_slug text DEFAULT NULL,
  p_logo_url text DEFAULT NULL,
  p_cor_primaria text DEFAULT '#d4a574'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_corretor_id uuid;
  v_invite_status text;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Validate invite exists and is pending
  SELECT status INTO v_invite_status
  FROM corretor_invites
  WHERE id = p_invite_id;
  
  IF v_invite_status IS NULL THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;
  
  IF v_invite_status != 'pending' THEN
    RAISE EXCEPTION 'Invite already used';
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
  INSERT INTO public.corretores (user_id, nome, email, telefone, slug, logo_url, cor_primaria, ativo)
  VALUES (v_user_id, p_nome, p_email, p_telefone, p_slug, p_logo_url, p_cor_primaria, false)
  RETURNING id INTO v_corretor_id;
  
  -- Update invite status to accepted
  UPDATE corretor_invites
  SET status = 'accepted'
  WHERE id = p_invite_id;
  
  RETURN v_corretor_id;
END;
$$;