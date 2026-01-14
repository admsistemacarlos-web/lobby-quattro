import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Award, Sparkles, Check, ArrowLeft, Rocket, BarChart3, Palette, Mail, Target, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
type PlanLevel = 'start' | 'pro' | 'authority';
type PlanMode = 'lobby' | 'partner';
interface UnifiedPlan {
  level: PlanLevel;
  name: string;
  icon: typeof Star;
  highlight?: boolean;
  lobby: {
    tagline: string;
    targetAudience: string;
    features: string[];
    setupPrice: number;
    monthlyPrice: number;
  };
  partner: {
    tagline: string;
    targetAudience: string;
    features: string[];
    monthlyPrice: number;
    commissionRate: number;
  };
}
const unifiedPlans: UnifiedPlan[] = [{
  level: 'start',
  name: 'START',
  icon: Star,
  highlight: false,
  lobby: {
    tagline: 'Velocidade e Custo-Benefício',
    targetAudience: 'Corretores iniciantes que buscam presença digital',
    setupPrice: 1000,
    monthlyPrice: 700,
    features: ['Landing Page Profissional (Template Otimizado)', 'Integração de Leads: Notificações por E-mail', 'Gestão de Tráfego: Meta Ads — 1 Campanha Ativa (Verba não inclusa)', 'Produção de Conteúdo: 4 Cards Estáticos Profissionais/mês']
  },
  partner: {
    tagline: 'Giro Rápido / Econômico',
    targetAudience: 'Foco em vendas de alto giro e volume',
    monthlyPrice: 500,
    commissionRate: 20,
    features: ['Landing Page Profissional (Template Otimizado)', 'Gestão de Tráfego: Meta Ads — 1 Campanha (Verba não inclusa)']
  }
}, {
  level: 'pro',
  name: 'PRO',
  icon: Sparkles,
  highlight: true,
  lobby: {
    tagline: 'Gestão Profissional e Sistema Próprio',
    targetAudience: 'Corretores experientes que precisam de organização',
    setupPrice: 2200,
    monthlyPrice: 1000,
    features: ['Acesso Completo ao Sistema: Painel do Corretor', 'Dashboard de Vendas e CRM Integrado (Kanban)', 'Gestão Estratégica de Tráfego: Meta Ads + Google Ads + Remarketing (Verba não inclusa)', 'Produção de Conteúdo: 8 Posts/mês (Feed + Carrossel)']
  },
  partner: {
    tagline: 'Médio e Alto Padrão',
    targetAudience: 'Imóveis de médio e alto padrão',
    monthlyPrice: 900,
    commissionRate: 40,
    features: ['Acesso Completo ao Sistema Lobby Quattro', 'Gestão de Tráfego: Google Ads + Meta Ads (Verba não inclusa)', 'Produção de Conteúdo: 4 Posts Profissionais/mês']
  }
}, {
  level: 'authority',
  name: 'AUTHORITY',
  icon: Award,
  highlight: false,
  lobby: {
    tagline: 'Dominância de Mercado',
    targetAudience: 'Imobiliárias e Top Producers de Alto Padrão',
    setupPrice: 3500,
    monthlyPrice: 2200,
    features: ['Tudo do Lobby PRO incluído', 'Automação Avançada: RD Station (Régua de E-mails e Nutrição de Leads)', 'Gestão de Tráfego Full: Meta + Google + TikTok Ads (Verba não inclusa)', 'Produção de Conteúdo Premium: 12 Posts/mês', 'Reunião Quinzenal de Análise de Dados e Estratégia']
  },
  partner: {
    tagline: 'Alto Luxo (Ticket > R$ 2MM)',
    targetAudience: 'Mercado de luxo e altíssimo padrão',
    monthlyPrice: 1500,
    commissionRate: 50,
    features: ['Ecossistema Completo: CRM, Automação e Dashboards Personalizados', 'Automação de E-mail Marketing com Nutrição de Leads', 'Gestão de Tráfego Full: Meta + Google + TikTok Ads (Verba não inclusa)']
  }
}];
const benefitIcons = [{
  icon: Rocket,
  title: 'Landing Pages',
  description: 'Páginas otimizadas para alta conversão'
}, {
  icon: Target,
  title: 'Tráfego Pago',
  description: 'Gestão profissional de anúncios'
}, {
  icon: Palette,
  title: 'Conteúdo',
  description: 'Posts e cards para suas redes'
}, {
  icon: BarChart3,
  title: 'CRM & Dashboard',
  description: 'Organize leads e acompanhe vendas'
}, {
  icon: Mail,
  title: 'Automação',
  description: 'E-mails e nutrição de leads'
}];
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
const Planos = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Planos e Preços | Lobby Quattro";
  }, []);
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex-shrink-0">
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-base sm:text-xl font-bold text-foreground">Lobby</span>
            <span className="text-base sm:text-xl font-bold text-primary">Quattro</span>
          </div>
          <Button variant="gold" size="sm" onClick={() => navigate("/auth")} className="flex-shrink-0">
            <span className="hidden sm:inline">Começar Agora</span>
            <span className="sm:hidden">Começar</span>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Planos e Investimento
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Escolha o modelo ideal para{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
              seu negócio
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Duas modalidades flexíveis: Assinatura mensal com receita previsível ou 
            Parceria estratégica com comissionamento sobre vendas.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-12 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {benefitIcons.map((benefit, index) => <div key={index} className="glass-card p-4 text-center hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Escolha seu plano
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cada plano está disponível em duas modalidades: Assinatura mensal (Lobby) ou 
              Parceria com comissionamento (Partner).
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {unifiedPlans.map(plan => <UnifiedPlanCard key={plan.level} plan={plan} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-amber-500/5 border-primary/20">
            <Crown className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Pronto para transformar seu negócio?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Entre em contato com nossa equipe para escolher o modelo ideal 
              e começar a capturar mais leads hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" onClick={() => navigate("/auth")}>
                Criar Minha Conta
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a target="_blank" rel="noopener noreferrer" href="https://wa.me/5541985150607?text=Ol%C3%A1!%20Preciso%20tirar%20d%C3%BAvidas%20sobre%20os%20planos%20da%20Lobby%20Quattro.">
                  Falar com Suporte
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Lobby Quattro by Studio Quattro 9. Todos os direitos reservados.
        </div>
      </footer>
    </div>;
};
interface UnifiedPlanCardProps {
  plan: UnifiedPlan;
}
const UnifiedPlanCard = ({
  plan
}: UnifiedPlanCardProps) => {
  const Icon = plan.icon;
  const navigate = useNavigate();
  const [mode, setMode] = useState<PlanMode>('lobby');
  const data = mode === 'lobby' ? plan.lobby : plan.partner;
  const gradients: Record<PlanLevel, string> = {
    start: 'from-slate-500 to-slate-700',
    pro: 'from-primary/80 to-amber-600',
    authority: 'from-purple-500 to-purple-700'
  };
  return <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-2xl", plan.highlight ? "ring-2 ring-primary/60 bg-card/80 shadow-xl shadow-primary/5" : "border-border hover:border-border/80")}>
      {plan.highlight && <div className="absolute top-4 right-4">
          <Badge className="bg-primary/10 text-primary border border-primary/30 font-medium">
            Recomendado
          </Badge>
        </div>}

      <CardHeader className="pb-4">
        <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg", gradients[plan.level])}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        
        {/* Mode Toggle inside card */}
        <div className="flex rounded-xl border-2 border-primary/30 p-1 bg-primary/5 mt-3 shadow-inner">
          <button onClick={() => setMode('lobby')} className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300", mode === 'lobby' ? "bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-background/50")}>
            Lobby
          </button>
          <button onClick={() => setMode('partner')} className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300", mode === 'partner' ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-background/50")}>
            Partner
          </button>
        </div>
        
        <div key={mode} className="animate-fade-in">
          <CardDescription className="text-sm font-medium text-primary mt-3">
            {data.tagline}
          </CardDescription>
          <p className="text-xs text-muted-foreground mt-1">{data.targetAudience}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pricing */}
        <div key={`pricing-${mode}`} className="bg-secondary/40 rounded-xl p-5 space-y-4 animate-fade-in">
          {mode === 'lobby' ? <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Implantação:</span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(plan.lobby.setupPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border/40">
                <span className="text-sm text-muted-foreground">Mensal:</span>
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatCurrency(plan.lobby.monthlyPrice)}
                </span>
              </div>
            </> : <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Custo Fixo Mensal:</span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(plan.partner.monthlyPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border/40">
                <span className="text-sm text-muted-foreground">Comissão:</span>
                <div className="flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {plan.partner.commissionRate}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
                sobre a comissão do corretor em cada venda
              </p>
            </>}
        </div>

        {/* Features */}
        <ul key={`features-${mode}`} className="space-y-4 animate-fade-in">
          {data.features.map((feature, index) => <li key={index} className="flex items-start gap-3">
              <div className="mt-1 rounded-full p-1 bg-primary/10 flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm text-foreground leading-relaxed">{feature}</span>
            </li>)}
        </ul>

        <Button variant={plan.highlight ? "gold" : "outline"} className="w-full mt-6" onClick={() => navigate("/auth")}>
          Escolher {mode === 'lobby' ? 'Lobby' : 'Partner'} {plan.name}
        </Button>
      </CardContent>
    </Card>;
};
export default Planos;