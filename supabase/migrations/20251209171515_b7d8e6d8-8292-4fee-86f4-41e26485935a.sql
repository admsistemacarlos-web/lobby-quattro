-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;

-- Create restrictive SELECT policy - only admins can view leads
CREATE POLICY "Only admins can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));