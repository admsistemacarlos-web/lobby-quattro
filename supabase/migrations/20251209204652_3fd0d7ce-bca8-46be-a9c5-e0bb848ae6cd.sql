-- Create a secure function to validate invitation tokens without exposing the full table
CREATE OR REPLACE FUNCTION public.validate_invite_token(p_token text)
RETURNS TABLE(
  id uuid,
  email text,
  nome text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, nome, status
  FROM public.corretor_invites
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
$$;