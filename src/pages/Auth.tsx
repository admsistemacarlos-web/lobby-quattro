import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Phone, Link, Award, CheckCircle, ArrowLeft, DoorOpen, UserPlus, Sparkles, MessageCircle, Eye, EyeOff } from "lucide-react";
import LobbyLogo from "@/components/LobbyLogo";
import PlanSelector from "@/components/PlanSelector";
import PlanoBadge, { PlanoCorretor } from "@/components/PlanoBadge";
type AuthView = "home" | "login" | "signup";
type SignupStep = "credentials" | "profile" | "plan" | "success";
const Auth = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [view, setView] = useState<AuthView>("home");
  const [signupStep, setSignupStep] = useState<SignupStep>("credentials");

  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [slug, setSlug] = useState("");
  const [creci, setCreci] = useState("");

  // Plan
  const [selectedPlan, setSelectedPlan] = useState<PlanoCorretor | null>(null);
  const generateSlug = (name: string) => {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
  };
  const handleNomeChange = (value: string) => {
    setNome(value);
    if (!slug || slug === generateSlug(nome)) {
      setSlug(generateSlug(value));
    }
  };
  const redirectByRole = async (userId: string) => {
    const {
      data: adminRole
    } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (adminRole) {
      navigate("/admin");
      return;
    }
    const {
      data: corretorData
    } = await supabase.from("corretores").select("id, ativo").eq("user_id", userId).maybeSingle();
    if (corretorData) {
      if (corretorData.ativo) {
        navigate("/dashboard");
      } else {
        toast({
          title: "Aguardando aprovação",
          description: "Sua conta ainda está pendente de aprovação pelo administrador.",
          variant: "destructive"
        });
        await supabase.auth.signOut();
      }
      return;
    }
    toast({
      title: "Acesso pendente",
      description: "Sua conta ainda não possui acesso ao sistema. Entre em contato com o administrador.",
      variant: "destructive"
    });
    await supabase.auth.signOut();
  };
  useEffect(() => {
    document.title = "Entrar | Lobby Quattro";
  }, []);
  useEffect(() => {
    let isMounted = true;
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      // Always stop checking session on any auth event
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
        setIsCheckingSession(false);
      }

      // Only redirect if SIGNED_IN event and not in signup flow
      if (event === 'SIGNED_IN' && session?.user && view !== "signup") {
        setTimeout(() => {
          redirectByRole(session.user.id);
        }, 0);
      }
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (!isMounted) return;
      if (session?.user && view !== "signup") {
        // Verify session is still valid by checking if user exists
        supabase.auth.getUser().then(({
          data: {
            user
          },
          error
        }) => {
          if (!isMounted) return;
          if (user && !error) {
            redirectByRole(user.id);
          } else {
            // Session exists but user invalid - clear it
            supabase.auth.signOut({
              scope: 'local'
            });
            setIsCheckingSession(false);
          }
        });
      } else {
        setIsCheckingSession(false);
      }
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, view]);
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha e-mail e senha.",
        variant: "destructive"
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A confirmação de senha deve ser igual à senha.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      if (error) {
        if (error.message.includes("already registered")) {
          const {
            data: loginData,
            error: loginError
          } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });
          if (loginError) {
            toast({
              title: "E-mail já cadastrado",
              description: "Este e-mail já está em uso. Se é sua conta, clique em 'Acessar Lobby' e faça login.",
              variant: "destructive"
            });
            setView("home");
          } else if (loginData.user) {
            const {
              data: corretorData
            } = await supabase.from("corretores").select("id").eq("user_id", loginData.user.id).maybeSingle();
            if (corretorData) {
              toast({
                title: "Conta já completa",
                description: "Seu cadastro já foi realizado. Redirecionando..."
              });
              redirectByRole(loginData.user.id);
            } else {
              toast({
                title: "Bem-vindo de volta!",
                description: "Continue seu cadastro preenchendo seu perfil."
              });
              setSignupStep("profile");
            }
          }
        } else {
          throw error;
        }
      } else {
        setSignupStep("profile");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || nome.trim().length < 2) {
      toast({
        title: "Nome inválido",
        description: "O nome deve ter pelo menos 2 caracteres.",
        variant: "destructive"
      });
      return;
    }
    if (!telefone.trim()) {
      toast({
        title: "Telefone obrigatório",
        description: "Informe seu telefone/WhatsApp.",
        variant: "destructive"
      });
      return;
    }
    if (!creci.trim()) {
      toast({
        title: "CRECI obrigatório",
        description: "Informe seu número de CRECI.",
        variant: "destructive"
      });
      return;
    }
    if (!slug.trim() || slug.trim().length < 2) {
      toast({
        title: "Slug inválido",
        description: "O slug deve ter pelo menos 2 caracteres.",
        variant: "destructive"
      });
      return;
    }

    // Move to plan selection step
    setSignupStep("plan");
  };
  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      toast({
        title: "Plano obrigatório",
        description: "Selecione um plano para continuar.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        toast({
          title: "Erro de sessão",
          description: "Sessão expirada. Por favor, tente novamente.",
          variant: "destructive"
        });
        resetForm();
        return;
      }

      // Use secure RPC function to create profile with plan and auto-create landing_configs
      const {
        error: insertError
      } = await supabase.rpc("create_corretor_profile", {
        p_nome: nome.trim(),
        p_email: email.trim(),
        p_telefone: telefone.trim(),
        p_slug: slug.trim(),
        p_creci: creci.trim(),
        p_plano: selectedPlan
      });
      if (insertError) {
        if (insertError.message.includes("Slug already exists")) {
          toast({
            title: "Slug já existe",
            description: "Este endereço já está em uso. Escolha outro.",
            variant: "destructive"
          });
          setSignupStep("profile");
          return;
        }
        if (insertError.message.includes("already has a corretor profile")) {
          toast({
            title: "Perfil já existe",
            description: "Você já possui um cadastro. Tente fazer login.",
            variant: "destructive"
          });
          return;
        }
        throw insertError;
      }
      await supabase.auth.signOut();
      setSignupStep("success");
    } catch (error: any) {
      toast({
        title: "Erro ao criar perfil",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha e-mail e senha.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Credenciais inválidas",
            description: "E-mail ou senha incorretos.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const resetForm = () => {
    setView("home");
    setSignupStep("credentials");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNome("");
    setTelefone("");
    setSlug("");
    setCreci("");
    setSelectedPlan(null);
  };
  const handleBackToHome = async () => {
    if (view === "signup" && (signupStep === "profile" || signupStep === "plan")) {
      await supabase.auth.signOut();
    }
    resetForm();
  };
  const handleBackToPreviousStep = () => {
    if (signupStep === "plan") {
      setSignupStep("profile");
    } else if (signupStep === "profile") {
      setSignupStep("credentials");
    }
  };
  if (isCheckingSession) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }

  // Success screen
  if (view === "signup" && signupStep === "success") {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="glass-card p-8 shadow-card text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Cadastro Enviado com Sucesso!
              </h1>
              <p className="text-muted-foreground mb-4">
                Sua solicitação foi enviada para análise. Você receberá acesso assim que o administrador aprovar sua conta.
              </p>
              
              {selectedPlan && <div className="p-3 rounded-lg bg-muted/50 inline-flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Plano selecionado:</span>
                  <PlanoBadge plano={selectedPlan} size="sm" />
                </div>}
            </div>
            
            <Button variant="gold" size="lg" className="w-full" onClick={resetForm}>
              <DoorOpen className="w-4 h-4 mr-2" />
              Ir para Login
            </Button>
          </div>
        </div>
      </div>;
  }

  // Home view - Landing with buttons
  if (view === "home") {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
          {/* Logo */}
          <div className="mb-8 opacity-0 animate-fade-up" style={{
          animationFillMode: "forwards"
        }}>
            <LobbyLogo size="lg" animate />
          </div>
          
          {/* Tagline */}
          <p style={{
          animationFillMode: "forwards"
        }} className="text-center text-muted-foreground mb-12 max-w-md opacity-0 animate-fade-up animation-delay-200 text-sm">
            A plataforma completa para corretores de imóveis transformarem seu negócio
          </p>
          
          {/* Buttons */}
          <div className="w-full max-w-sm space-y-4">
            <Button variant="gold" size="xl" className="w-full opacity-0 animate-fade-up animation-delay-300" style={{
            animationFillMode: "forwards"
          }} onClick={() => setView("login")}>
              <DoorOpen className="w-5 mr-2 h-[25px]" />
              Acessar Lobby
            </Button>
            
            <Button variant="secondary" size="xl" className="w-full opacity-0 animate-fade-up animation-delay-400" style={{
            animationFillMode: "forwards"
          }} onClick={() => setView("signup")}>
              <UserPlus className="w-5 h-5 mr-2" />
              Criar Cadastro
            </Button>
            
            <Button variant="outline" size="xl" className="w-full opacity-0 animate-fade-up animation-delay-500" style={{
            animationFillMode: "forwards"
          }} onClick={() => navigate("/planos")}>
              <Sparkles className="w-5 h-5 mr-2" />
              Conhecer Nossos Planos
            </Button>
          </div>
          
          {/* WhatsApp link */}
          <a target="_blank" rel="noopener noreferrer" style={{
          animationFillMode: "forwards"
        }} className="mt-8 flex items-center gap-2 transition-colors opacity-0 animate-fade-up animation-delay-600 text-primary" href="https://wa.me/<5541985150607>?text=<Ol\\xE1.%20Preciso%20de%20atendimento%20para%20o%sistema%20Lobby%20Quattro.>">
            <MessageCircle className="w-4 h-4" />
            Falar com suporte   
          </a>
          
          {/* Trust badges */}
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground opacity-0 animate-fade-in animation-delay-600" style={{
          animationFillMode: "forwards"
        }}>
            
            
          </div>
        </div>
      </div>;
  }

  // Login/Signup forms
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-in-right">
        <div className="glass-card p-8 shadow-card">
          {/* Back button */}
          <button onClick={signupStep === "plan" ? handleBackToPreviousStep : handleBackToHome} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            {signupStep === "plan" ? "Voltar" : "Início"}
          </button>

          {/* Progress indicator for signup */}
          {view === "signup" && signupStep !== "success" && <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className={`flex items-center gap-1 ${signupStep === "credentials" ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${signupStep === "credentials" ? "bg-primary text-primary-foreground" : signupStep === "profile" || signupStep === "plan" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1</span>
                  Conta
                </div>
                <div className="w-6 h-px bg-border" />
                <div className={`flex items-center gap-1 ${signupStep === "profile" ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${signupStep === "profile" ? "bg-primary text-primary-foreground" : signupStep === "plan" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2</span>
                  Perfil
                </div>
                <div className="w-6 h-px bg-border" />
                <div className={`flex items-center gap-1 ${signupStep === "plan" ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${signupStep === "plan" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>3</span>
                  Plano
                </div>
              </div>
            </div>}

          {/* Header */}
          <div className="text-center mb-8">
            <LobbyLogo size="sm" showSubtitle={false} className="mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {view === "login" ? "Acessar Lobby" : signupStep === "credentials" ? "Criar Cadastro" : signupStep === "profile" ? "Complete seu Perfil" : "Escolha seu Plano"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {view === "login" ? "Entre com suas credenciais" : signupStep === "credentials" ? "Informe seus dados de acesso" : signupStep === "profile" ? "Preencha seus dados profissionais" : "Selecione o plano ideal para você"}
            </p>
          </div>

          {/* Login Form */}
          {view === "login" && <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" minLength={6} required />
                </div>
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Entrando...
                  </> : <>
                    <DoorOpen className="w-4 h-4" />
                    Entrar
                  </>}
              </Button>

              <div className="text-center pt-4">
                <button type="button" onClick={() => setView("signup")} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Não tem conta? Criar cadastro
                </button>
              </div>
            </form>}

          {/* Signup Step 1: Credentials */}
          {view === "signup" && signupStep === "credentials" && <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" minLength={6} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-10 pr-10" minLength={6} required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando conta...
                  </> : "Continuar"}
              </Button>

              <div className="text-center pt-4">
                <button type="button" onClick={() => setView("login")} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Já tem conta? Fazer login
                </button>
              </div>
            </form>}

          {/* Signup Step 2: Profile */}
          {view === "signup" && signupStep === "profile" && <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="nome" type="text" placeholder="Seu nome completo" value={nome} onChange={e => handleNomeChange(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="telefone" type="tel" placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creci">CRECI *</Label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="creci" type="text" placeholder="000000-F" value={creci} onChange={e => setCreci(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Endereço da sua página *</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="slug" type="text" placeholder="seu-nome" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="pl-10" required />
                </div>
                <p className="text-xs text-muted-foreground">
                  Sua página será: /c/{slug || "seu-nome"}
                </p>
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isLoading}>
                Continuar
              </Button>
            </form>}

          {/* Signup Step 3: Plan Selection */}
          {view === "signup" && signupStep === "plan" && <form onSubmit={handlePlanSubmit} className="space-y-6">
              <PlanSelector value={selectedPlan} onChange={setSelectedPlan} />

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isLoading || !selectedPlan}>
                {isLoading ? <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finalizando...
                  </> : "Finalizar Cadastro"}
              </Button>
            </form>}
        </div>
      </div>
    </div>;
};
export default Auth;