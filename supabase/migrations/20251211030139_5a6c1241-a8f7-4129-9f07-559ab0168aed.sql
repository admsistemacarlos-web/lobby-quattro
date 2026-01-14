-- ============================================
-- HARD RESET: Security Policies Cleanup
-- ============================================

-- ============================================
-- 1. CORRETORES TABLE
-- ============================================
ALTER TABLE public.corretores ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can manage corretores" ON public.corretores;
DROP POLICY IF EXISTS "Corretores can update own record" ON public.corretores;
DROP POLICY IF EXISTS "Corretores can view own record" ON public.corretores;
DROP POLICY IF EXISTS "Users can view own data" ON public.corretores;
DROP POLICY IF EXISTS "Public view" ON public.corretores;

-- Revoke public access
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.corretores FROM anon;

-- Recreate proper policies (PERMISSIVE by default)
CREATE POLICY "Admins can manage corretores"
ON public.corretores
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own corretor profile"
ON public.corretores
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own corretor profile"
ON public.corretores
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. CORRETOR_INVITES TABLE
-- ============================================
ALTER TABLE public.corretor_invites ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can manage invites" ON public.corretor_invites;
DROP POLICY IF EXISTS "Validate invite by token only" ON public.corretor_invites;
DROP POLICY IF EXISTS "Admins view invites" ON public.corretor_invites;

-- Revoke public access
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.corretor_invites FROM anon;

-- Recreate proper policies - only admins can access
CREATE POLICY "Admins can manage invites"
ON public.corretor_invites
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- 3. USER_ROLES TABLE
-- ============================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies (including restrictive ones)
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Restrictive Policy" ON public.user_roles;

-- Revoke public access
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.user_roles FROM anon;

-- Recreate proper PERMISSIVE policies
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);