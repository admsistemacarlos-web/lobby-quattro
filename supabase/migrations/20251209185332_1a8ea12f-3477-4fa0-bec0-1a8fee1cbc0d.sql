-- Tabela para gerenciar convites de corretores
CREATE TABLE public.corretor_invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token text UNIQUE NOT NULL,
    email text NOT NULL,
    nome text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    created_by uuid REFERENCES auth.users(id)
);

-- Índice para busca rápida por token
CREATE INDEX idx_corretor_invites_token ON public.corretor_invites(token);

-- RLS
ALTER TABLE public.corretor_invites ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar convites
CREATE POLICY "Admins can manage invites" ON public.corretor_invites
    FOR ALL USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

-- Público pode ler convite pelo token (para validação)
CREATE POLICY "Public can read pending invites" ON public.corretor_invites
    FOR SELECT USING (status = 'pending' AND expires_at > now());