-- 1. Add 'corretor' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'corretor';

-- 2. Create corretores table
CREATE TABLE public.corretores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  slug text UNIQUE NOT NULL,
  logo_url text,
  cor_primaria text DEFAULT '#d4a574',
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Add corretor_id to leads table (nullable for existing leads)
ALTER TABLE public.leads ADD COLUMN corretor_id uuid REFERENCES public.corretores(id) ON DELETE SET NULL;

-- 4. Enable RLS on corretores
ALTER TABLE public.corretores ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for corretores table
-- Admins can do everything
CREATE POLICY "Admins can manage corretores"
ON public.corretores
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Corretores can view their own record
CREATE POLICY "Corretores can view own record"
ON public.corretores
FOR SELECT
USING (auth.uid() = user_id);

-- Public can view active corretores (for landing pages)
CREATE POLICY "Public can view active corretores"
ON public.corretores
FOR SELECT
USING (ativo = true);

-- 6. Update leads RLS policies for multi-tenant
-- Drop existing policies first
DROP POLICY IF EXISTS "Only admins can view leads" ON public.leads;
DROP POLICY IF EXISTS "Only admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.leads;

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Corretores can view their own leads
CREATE POLICY "Corretores can view own leads"
ON public.leads
FOR SELECT
USING (
  corretor_id IN (
    SELECT id FROM public.corretores WHERE user_id = auth.uid()
  )
);

-- Admins can update all leads
CREATE POLICY "Admins can update all leads"
ON public.leads
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Corretores can update their own leads
CREATE POLICY "Corretores can update own leads"
ON public.leads
FOR UPDATE
USING (
  corretor_id IN (
    SELECT id FROM public.corretores WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  corretor_id IN (
    SELECT id FROM public.corretores WHERE user_id = auth.uid()
  )
);

-- Admins can delete all leads
CREATE POLICY "Admins can delete all leads"
ON public.leads
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Create function to get corretor by slug
CREATE OR REPLACE FUNCTION public.get_corretor_by_slug(p_slug text)
RETURNS TABLE (
  id uuid,
  nome text,
  email text,
  telefone text,
  slug text,
  logo_url text,
  cor_primaria text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, nome, email, telefone, slug, logo_url, cor_primaria
  FROM public.corretores
  WHERE slug = p_slug AND ativo = true
$$;

-- 8. Create function to check if user is corretor
CREATE OR REPLACE FUNCTION public.is_corretor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.corretores
    WHERE user_id = _user_id AND ativo = true
  )
$$;