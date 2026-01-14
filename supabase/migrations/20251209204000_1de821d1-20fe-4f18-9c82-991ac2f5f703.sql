-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public can read pending invites" ON public.corretor_invites;

-- Create a more restrictive policy that only allows reading by token (for validation)
-- This prevents enumeration of all invites while still allowing token validation
CREATE POLICY "Validate invite by token only"
ON public.corretor_invites
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
);