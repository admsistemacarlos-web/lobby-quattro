-- Drop the existing public policy and recreate it properly
DROP POLICY IF EXISTS "Public can view configs for active corretores" ON public.landing_configs;

-- Create a permissive policy for public access (not restrictive)
CREATE POLICY "Public can view configs for active corretores" 
ON public.landing_configs 
FOR SELECT 
TO anon, authenticated
USING (
  corretor_id IN (
    SELECT id FROM corretores WHERE ativo = true
  )
);