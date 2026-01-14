-- Ensure GRANT EXECUTE permissions are set for the get_public_corretor_profile function
-- This allows anonymous users to call this secure SECURITY DEFINER function

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_public_corretor_profile(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_corretor_profile(text) TO authenticated;

-- Also ensure the existing get_corretor_by_slug function has proper grants (used as fallback)
GRANT EXECUTE ON FUNCTION public.get_corretor_by_slug(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_corretor_by_slug(text) TO authenticated;