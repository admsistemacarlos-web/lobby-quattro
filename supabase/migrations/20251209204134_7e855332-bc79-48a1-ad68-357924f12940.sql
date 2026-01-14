-- Drop the overly permissive public SELECT policy that exposes email and telefone
DROP POLICY IF EXISTS "Public can view active corretores" ON public.corretores;