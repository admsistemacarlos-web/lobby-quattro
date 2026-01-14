import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  Loader2,
  Eye,
  ArrowLeft,
  Globe,
  Megaphone,
  User as UserIcon,
  Sparkles,
  Home,
  ContactRound,
} from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import PlanoBadge, { PlanoCorretor } from "@/components/PlanoBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LandingPagesEditor from "@/components/landing-editor/LandingPagesEditor";
import PerfilEditor from "@/components/PerfilEditor";
import ChangePlanDialog from "@/components/ChangePlanDialog";
import AnunciosManager from "@/components/AnunciosManager";
import { AdGenerator } from "@/components/ad-generator";

// --- MÓDULOS ---
import Clients from "./Clients";
import Properties from "./Properties";

interface Corretor {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  plano: PlanoCorretor | null;
}

const CorretorDashboard = () => {
  const navigate = useNavigate();
  const { corretorId } = useParams<{ corretorId?: string }>();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isViewingAs, setIsViewingAs] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  
  // Estado para controlar a aba ativa e filtros
  const [activeTab, setActiveTab] = useState("crm");
  const [propertyFilterIds, setPropertyFilterIds] = useState<string[] | null>(null);
  const [propertyFilterClientName, setPropertyFilterClientName] = useState<string>("");

  useEffect(() => {
    document.title = "Dashboard | Lobby Quattro";
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        checkAccess(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAccess = async (userId: string) => {
    if (corretorId) {
      const { data: adminData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (adminData) {
        const { data: targetCorretor } = await supabase
          .from("corretores")
          .select("id, nome, slug, ativo, plano")
          .eq("id", corretorId)
          .maybeSingle();

        if (targetCorretor) {
          setCorretor(targetCorretor);
          setIsViewingAs(true);
          setHasAccess(true);
          setIsLoading(false);
        } else {
          toast({
            title: "Corretor não encontrado",
            variant: "destructive",
          });
          navigate("/admin");
        }
      } else {
        setHasAccess(false);
        setIsLoading(false);
      }
      return;
    }

    const { data: corretorData } = await supabase
      .from("corretores")
      .select("id, nome, slug, ativo, plano")
      .eq("user_id", userId)
      .maybeSingle();

    if (corretorData) {
      setCorretor(corretorData);
      if (corretorData.ativo) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      setIsLoading(false);
    } else {
      const { data: adminData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (adminData) {
        navigate("/admin");
      } else {
        setHasAccess(false);
        setIsLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    setSession(null);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/auth", { replace: true });
    }
  };

  // Função para navegar para imóveis filtrados
  const handleNavigateToFilteredProperties = (propertyIds: string[], clientName: string) => {
    setPropertyFilterIds(propertyIds);
    setPropertyFilterClientName(clientName);
    setActiveTab("imoveis");
  };

  // Função para limpar filtro de imóveis
  const handleClearPropertyFilter = () => {
    setPropertyFilterIds(null);
    setPropertyFilterClientName("");
  };

  if (!session || hasAccess === null || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasAccess === false) {
    if (corretor && !corretor.ativo) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Aguardando Aprovação
            </h1>
            <p className="text-muted-foreground mb-6">
              Seu cadastro foi recebido e está em análise. Você será notificado assim que for aprovado pelo administrador.
            </p>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem uma conta de corretor.
          </p>
          <Button onClick={handleLogout}>Sair</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Viewing Banner */}
      {isViewingAs && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-600">
                Visualizando como: <strong>{corretor?.nome}</strong>
              </span>
              {corretor && <PlanoBadge plano={corretor.plano} size="sm" />}
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Admin
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              Lobby Quattro
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {corretor && !isViewingAs && (
              <button
                onClick={() => setShowPlanDialog(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <PlanoBadge plano={corretor.plano} size="sm" />
              </button>
            )}
            <span className="text-sm text-muted-foreground hidden sm:block">
              {corretor?.nome}
            </span>
            {!isViewingAs && (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Sair</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 max-w-5xl">
            <TabsTrigger value="crm" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <ContactRound className="w-4 h-4" />
              <span className="hidden sm:inline">CRM</span>
            </TabsTrigger>
            <TabsTrigger value="imoveis" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Imóveis</span>
            </TabsTrigger>
            <TabsTrigger value="gerador" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Gerador</span>
            </TabsTrigger>
            <TabsTrigger value="anuncios" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Anúncios</span>
            </TabsTrigger>
            <TabsTrigger value="landing" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* CRM - Lista de Clientes */}
          <TabsContent value="crm" className="mt-6">
            <Clients onNavigateToFilteredProperties={handleNavigateToFilteredProperties} />
          </TabsContent>

          {/* Imóveis */}
          <TabsContent value="imoveis" className="mt-6">
            <Properties 
              filterByIds={propertyFilterIds} 
              filterClientName={propertyFilterClientName}
              onClearFilter={handleClearPropertyFilter}
            />
          </TabsContent>

          {/* Gerador de Anúncios */}
          <TabsContent value="gerador" className="mt-6">
            <AdGenerator corretorId={corretor?.id} corretorSlug={corretor?.slug} />
          </TabsContent>

          {/* Anúncios */}
          <TabsContent value="anuncios" className="mt-6">
            {corretor && (
              <AnunciosManager
                corretorId={corretor.id}
                corretorSlug={corretor.slug}
                plano={corretor.plano}
              />
            )}
          </TabsContent>

          {/* Landing Pages */}
          <TabsContent value="landing" className="mt-6">
            {corretor && (
              <LandingPagesEditor
                corretorId={corretor.id}
                corretorSlug={corretor.slug}
                corretorPlano={corretor.plano}
              />
            )}
          </TabsContent>

          {/* Perfil */}
          <TabsContent value="perfil" className="mt-6">
            {corretor && <PerfilEditor corretorId={corretor.id} />}
          </TabsContent>
        </Tabs>
      </main>

      <ChangePlanDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
        currentPlan={corretor?.plano || null}
      />
    </div>
  );
};

export default CorretorDashboard;