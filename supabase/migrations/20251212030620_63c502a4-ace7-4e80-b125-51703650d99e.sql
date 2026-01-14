-- Add explicit DENY policies for anon role to silence security scanner

-- 1. Deny anon SELECT on corretores table
CREATE POLICY "Deny anon select on corretores"
ON public.corretores
FOR SELECT
TO anon
USING (false);

-- 2. Deny anon SELECT on leads table (INSERT already allowed via existing policy)
CREATE POLICY "Deny anon select on leads"
ON public.leads
FOR SELECT
TO anon
USING (false);

-- 3. Deny anon UPDATE on leads table
CREATE POLICY "Deny anon update on leads"
ON public.leads
FOR UPDATE
TO anon
USING (false);

-- 4. Deny anon DELETE on leads table  
CREATE POLICY "Deny anon delete on leads"
ON public.leads
FOR DELETE
TO anon
USING (false);