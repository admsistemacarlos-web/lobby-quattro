import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, User, Lock, Mail } from "lucide-react";
import { z } from "zod";
import LogoUpload from "@/components/LogoUpload";

const signupSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const profileSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  telefone: z.string().optional(),
  slug: z.string().min(2, "Slug deve ter no mínimo 2 caracteres"),
});

interface Invite {
  id: string;
  email: string;
  nome: string | null;
  status: string;
}

type Step = "loading" | "invalid" | "signup" | "profile" | "success";

const CorretorOnboarding = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("loading");
  const [invite, setInvite] = useState<Invite | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signup form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile form
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#d4a574");

  useEffect(() => {
    if (token) {
      validateToken(token);
    }
  }, [token]);

  const validateToken = async (tokenValue: string) => {
    // Use secure RPC function that bypasses RLS safely
    const { data, error } = await supabase
      .rpc("validate_invite_token", { p_token: tokenValue });

    const inviteData = Array.isArray(data) && data.length > 0 ? data[0] : null;

    if (error || !inviteData) {
      setStep("invalid");
      return;
    }

    setInvite(inviteData);
    setEmail(inviteData.email);
    if (inviteData.nome) {
      setNome(inviteData.nome);
      setSlug(generateSlug(inviteData.nome));
    }
    setStep("signup");
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (value: string) => {
    setNome(value);
    setSlug(generateSlug(value));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas são diferentes.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const redirectUrl = `${window.location.origin}/convite/${token}`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        // Try to sign in instead
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          toast({
            title: "E-mail já cadastrado",
            description: "Tente fazer login ou use outra senha.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    toast({ title: "Conta criada com sucesso!" });
    setStep("profile");
    setIsSubmitting(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = profileSchema.safeParse({ nome, telefone, slug });
    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Faça login novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Use secure RPC function to create profile and accept invite atomically
    const { error: corretorError } = await supabase.rpc("accept_corretor_invite", {
      p_invite_id: invite?.id,
      p_nome: nome.trim(),
      p_email: email.trim(),
      p_telefone: telefone.trim() || null,
      p_slug: slug.trim(),
      p_logo_url: logoUrl.trim() || null,
      p_cor_primaria: corPrimaria
    });

    if (corretorError) {
      // Handle specific errors from the function
      if (corretorError.message.includes("Slug already exists")) {
        toast({
          title: "Slug já existe",
          description: "Escolha um slug diferente para sua URL.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      if (corretorError.message.includes("already has a corretor profile")) {
        toast({
          title: "Perfil já existe",
          description: "Você já possui um cadastro. Tente fazer login.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      if (corretorError.message.includes("Invite already used")) {
        toast({
          title: "Convite já utilizado",
          description: "Este convite já foi aceito anteriormente.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      if (corretorError.message.includes("Invite not found")) {
        toast({
          title: "Convite não encontrado",
          description: "O convite é inválido ou expirou.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      toast({
        title: "Erro ao criar perfil",
        description: corretorError.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    setStep("success");
    setIsSubmitting(false);
  };

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validando convite...</p>
        </div>
      </div>
    );
  }

  if (step === "invalid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Convite Inválido
          </h1>
          <p className="text-muted-foreground mb-6">
            Este link de convite é inválido ou já expirou. Entre em contato com o administrador para receber um novo convite.
          </p>
          <Button onClick={() => navigate("/auth")}>Ir para Login</Button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Cadastro Concluído!
          </h1>
          <p className="text-muted-foreground mb-6">
            Seu perfil foi criado com sucesso. Agora é só aguardar a aprovação do administrador para ter acesso ao seu dashboard.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Ir para o Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === "signup" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "signup" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              1
            </div>
            <span className="hidden sm:inline">Conta</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-2 ${step === "profile" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "profile" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              2
            </div>
            <span className="hidden sm:inline">Perfil</span>
          </div>
        </div>

        {step === "signup" && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Criar Sua Conta
              </h1>
              <p className="text-muted-foreground">
                Você foi convidado para se tornar um corretor parceiro.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  E-mail definido pelo convite
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Digite a senha novamente"
                  />
                </div>
              </div>

              <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta e Continuar"
                )}
              </Button>
            </form>
          </>
        )}

        {step === "profile" && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Complete Seu Perfil
              </h1>
              <p className="text-muted-foreground">
                Essas informações aparecerão na sua landing page.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="pl-10"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">/c/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="seu-nome"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Este será o link da sua landing page
                </p>
              </div>

              <div className="space-y-2">
                <Label>Logo (opcional)</Label>
                <LogoUpload
                  value={logoUrl}
                  onChange={setLogoUrl}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="corPrimaria">Cor Principal</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="corPrimaria"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    placeholder="#d4a574"
                    className="flex-1"
                  />
                </div>
              </div>

              <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Concluir Cadastro"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CorretorOnboarding;
