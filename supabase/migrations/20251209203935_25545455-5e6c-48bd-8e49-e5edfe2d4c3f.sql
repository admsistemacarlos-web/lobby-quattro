-- Add UPDATE policy for corretores to update their own records
CREATE POLICY "Corretores can update own record"
ON public.corretores
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);