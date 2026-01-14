import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, Star, Award, Gem, Shield, Sparkles, Check, ArrowLeft, 
  TrendingUp, MessageCircle, Loader2, ArrowRight, Percent 
} from "lucide-react";
import PlanoBadge, { PlanoCorretor, planoConfig } from "@/components/PlanoBadge";

interface Plan {
  id: PlanoCorretor;
  name: string;
  model: 'subscription' | 'partnership';
  icon: typeof Crown;
  tagline: string;
  features: string[];
  setupPrice?: number;
  monthlyPrice: number;
  commissionRate?: number;
  gradient: string;
  order: number;
}

const allPlans: Plan[] = [
  {
    id: 'lobby_start',
    name: 'Lobby START',
    model: 'subscription',
    icon: Star,
    tagline: 'Velocidade e Custo-Benefício',
    gradient: 'from-slate-500 to-slate-700',
    setupPrice: 1000,
    monthlyPrice: 700,
    order: 1,
    features: [
      'Landing Page Profissional',
      'Notificações por E-mail',
      '1 Campanha Meta Ads',
      '4 Cards Estáticos/mês'
    ]
  },
  {
    id: 'lobby_pro',
    name: 'Lobby PRO',
    model: 'subscription',
    icon: Sparkles,
    tagline: 'Gestão Profissional e Sistema',
    gradient: 'from-blue-500 to-blue-700',
    setupPrice: 2200,
    monthlyPrice: 1000,
    order: 2,
    features: [
      'Tudo do START +',
      'Painel Completo + CRM',
      'Meta + Google + Remarketing',
      '8 Posts/mês'
    ]
  },
  {
    id: 'lobby_authority',
    name: 'Lobby AUTHORITY',
    model: 'subscription',
    icon: Award,
    tagline: 'Dominância e Vídeo',
    gradient: 'from-purple-500 to-purple-700',
    setupPrice: 3500,
    monthlyPrice: 2200,
    order: 3,
    features: [
      'Tudo do PRO +',
      'Automação RD Station',
      'Meta + Google + TikTok',
      '12 Posts + 4 Vídeos/mês',
      'Reuniões Quinzenais'
    ]
  },
  {
    id: 'partner_start',
    name: 'Partner START',
    model: 'partnership',
    icon: Shield,
    tagline: 'Giro Rápido',
    gradient: 'from-emerald-500 to-emerald-700',
    monthlyPrice: 500,
    commissionRate: 20,
    order: 4,
    features: [
      'Landing Page Profissional',
      '1 Campanha Meta Ads'
    ]
  },
  {
    id: 'partner_pro',
    name: 'Partner PRO',
    model: 'partnership',
    icon: Gem,
    tagline: 'Médio e Alto Padrão',
    gradient: 'from-amber-500 to-amber-700',
    monthlyPrice: 900,
    commissionRate: 40,
    order: 5,
    features: [
      'Sistema Completo',
      'Google + Meta Ads',
      '4 Posts/mês'
    ]
  },
  {
    id: 'partner_authority',
    name: 'Partner AUTHORITY',
    model: 'partnership',
    icon: Crown,
    tagline: 'Alto Luxo',
    gradient: 'from-primary/80 to-amber-600',
    monthlyPrice: 1500,
    commissionRate: 50,
    order: 6,
    features: [
      'Ecossistema Completo',
      'CRM + Automação',
      'Vídeos Profissionais',
      'Meta + Google + TikTok'
    ]
  }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const UpgradePlano = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<PlanoCorretor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [corretorNome, setCorretorNome] = useState("");

  useEffect(() => {
    document.title = "Upgrade de Plano | Lobby Quattro";
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: corretor } = await supabase
        .from("corretores")
        .select("nome, plano")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (corretor) {
        setCurrentPlan(corretor.plano);
        setCorretorNome(corretor.nome);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const currentPlanOrder = currentPlan 
    ? allPlans.find(p => p.id === currentPlan)?.order || 0 
    : 0;

  const getWhatsAppUrl = (planName: string) => {
    const message = encodeURIComponent(
      `Olá! Sou ${corretorNome} e tenho interesse em fazer upgrade para o plano ${planName}. Meu plano atual é ${currentPlan ? planoConfig[currentPlan]?.label : 'nenhum'}.`
    );
    return `https://wa.me/5541985150607?text=${message}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">Lobby</span>
            <span className="text-xl font-bold text-primary">Quattro</span>
          </div>
          <div className="w-[140px]" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="border-primary/30 text-primary">
              Upgrade de Plano
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Evolua seu negócio com{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
              mais recursos
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Desbloqueie funcionalidades avançadas e alcance mais clientes.
          </p>
          
          {/* Current Plan Display */}
          <div className="inline-flex items-center gap-3 glass-card px-6 py-3">
            <span className="text-sm text-muted-foreground">Seu plano atual:</span>
            <PlanoBadge plano={currentPlan} size="lg" />
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="border-blue-400/40 text-blue-400 mb-4">
              Modelo de Assinatura
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Planos Lobby
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {allPlans.filter(p => p.model === 'subscription').map((plan) => {
              const isCurrentPlan = plan.id === currentPlan;
              const isUpgrade = plan.order > currentPlanOrder;
              const isDowngrade = plan.order < currentPlanOrder;
              const Icon = plan.icon;

              return (
                <Card
                  key={plan.id}
                  className={`
                    relative overflow-hidden transition-all duration-300
                    ${isCurrentPlan 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : isUpgrade
                        ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer'
                        : 'opacity-60'}
                  `}
                >
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground">
                        Plano Atual
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3 shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm text-primary">
                      {plan.tagline}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-secondary/40 rounded-lg p-4">
                      {plan.setupPrice && (
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="text-muted-foreground">Implantação:</span>
                          <span className="font-medium">{formatCurrency(plan.setupPrice)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Mensal:</span>
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(plan.monthlyPrice)}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        Seu Plano Atual
                      </Button>
                    ) : isUpgrade ? (
                      <Button
                        variant="gold"
                        className="w-full"
                        onClick={() => window.open(getWhatsAppUrl(plan.name), "_blank")}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Solicitar Upgrade
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button variant="ghost" className="w-full" disabled>
                        Plano Inferior
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partnership Plans */}
      <section className="py-12 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="border-amber-400/40 text-amber-400 mb-4">
              Modelo de Parceria
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Planos Partner
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {allPlans.filter(p => p.model === 'partnership').map((plan) => {
              const isCurrentPlan = plan.id === currentPlan;
              const isUpgrade = plan.order > currentPlanOrder;
              const Icon = plan.icon;

              return (
                <Card
                  key={plan.id}
                  className={`
                    relative overflow-hidden transition-all duration-300
                    ${isCurrentPlan 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : isUpgrade
                        ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer'
                        : 'opacity-60'}
                  `}
                >
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground">
                        Plano Atual
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3 shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm text-primary">
                      {plan.tagline}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-secondary/40 rounded-lg p-4">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-muted-foreground">Fixo Mensal:</span>
                        <span className="font-medium">{formatCurrency(plan.monthlyPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Comissão:</span>
                        <div className="flex items-center gap-1">
                          <Percent className="w-4 h-4 text-primary" />
                          <span className="text-xl font-bold text-primary">
                            {plan.commissionRate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        Seu Plano Atual
                      </Button>
                    ) : isUpgrade ? (
                      <Button
                        variant="gold"
                        className="w-full"
                        onClick={() => window.open(getWhatsAppUrl(plan.name), "_blank")}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Solicitar Upgrade
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button variant="ghost" className="w-full" disabled>
                        Plano Inferior
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="glass-card p-8 bg-gradient-to-br from-primary/5 to-amber-500/5 border-primary/20">
            <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Dúvidas sobre qual plano escolher?
            </h3>
            <p className="text-muted-foreground mb-6">
              Nossa equipe está pronta para ajudar você a escolher o melhor plano 
              para o seu momento de negócio.
            </p>
            <Button
              variant="gold"
              size="lg"
              onClick={() => window.open("https://wa.me/5541985150607?text=Olá! Gostaria de saber mais sobre os planos do Lobby Quattro.", "_blank")}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Falar com Consultor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Lobby Quattro by Studio Quattro 9
        </div>
      </footer>
    </div>
  );
};

export default UpgradePlano;
