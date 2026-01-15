import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LogOut,
  Search,
  Download,
  Calendar,
  Loader2,
  Users,
  X,
  Eye,
  ArrowLeft,
  Globe,
  Megaphone,
  User as UserIcon,
  Sparkles,
  Briefcase,
  Home,
  ContactRound
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Session } from "@supabase/supabase-js"; // <--- MANTIDO O ORIGINAL
import PlanoBadge, { PlanoCorretor } from "@/components/PlanoBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LandingPagesEditor from "@/components/landing-editor/LandingPagesEditor";
import PerfilEditor from "@/components/PerfilEditor";
import ChangePlanDialog from "@/components/ChangePlanDialog";
import AnunciosManager from "@/components/AnunciosManager";
import { AdGenerator } from "@/components/ad-generator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- NOVOS MÃ“DULOS ---
import Clients from "./Clients";
import Properties from "./Properties";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  income: string | null;
  goal: string | null;
  down_payment: string | null;
  created_at: string;
  anuncio_id: string | null;
  anuncio?: {
    nome: string;
  } | null;
}

interface Anuncio {
  id: string;
  nome: string;
  slug: string;
}

interface Corretor {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  plano: PlanoCorretor | null;
}

const incomeLabels: Record<string, string> = {
  "ate-5000": "AtÃ© R$ 5.000",
  "5000-10000": "R$ 5.000 a R$ 10.000",
  "10000-20000": "R$ 10.000 a R$ 20.000",
  "acima-20000": "Acima de R$ 20.000",
};

const goalLabels: Record<string, string> = {
  moradia: "Moradia",
  investimento: "Investimento",
};

const downPaymentLabels: Record<string, string> = {
  sim: "Sim",
  nao: "NÃ£o",
  permuta: "Permuta",
};

const CorretorDashboard = () => {
  const navigate = useNavigate();
  const { corretorId } = useParams<{ corretorId?: string }>();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isViewingAs, setIsViewingAs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [selectedAnuncioId, setSelectedAnuncioId] = useState<string>("all");
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  useEffect(() => {
    document.title = "Dashboard | Lobby Quattro";
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

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
          fetchLeads(targetCorretor.id);
        } else {
          toast({
            title: "Corretor nÃ£o encontrado",
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
        fetchLeads(corretorData.id);
      } else {
        setHasAccess(false);
        setIsLoading(false);
      }
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

  const fetchLeads = async (corretorId: string) => {
    setIsLoading(true);
    
    const [leadsResult, anunciosResult] = await Promise.all([
      supabase
        .from("leads")
        .select("*, anuncio:anuncios(nome)")
        .eq("corretor_id", corretorId)
        .order("created_at", { ascending: false }),
      supabase
        .from("anuncios")
        .select("id, nome, slug")
        .eq("corretor_id", corretorId)
        .order("nome", { ascending: true })
    ]);

    if (leadsResult.error) {
      toast({
        title: "Erro ao carregar leads",
        description: leadsResult.error.message,
        variant: "destructive",
      });
    } else {
      setLeads(leadsResult.data || []);
      setFilteredLeads(leadsResult.data || []);
    }
    
    if (!anunciosResult.error) {
      setAnuncios(anunciosResult.data || []);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(term) ||
          lead.email.toLowerCase().includes(term) ||
          lead.phone.includes(term)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(
        (lead) => new Date(lead.created_at) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (lead) => new Date(lead.created_at) <= end
      );
    }

    if (selectedAnuncioId !== "all") {
      if (selectedAnuncioId === "landing") {
        filtered = filtered.filter((lead) => lead.anuncio_id === null);
      } else {
        filtered = filtered.filter((lead) => lead.anuncio_id === selectedAnuncioId);
      }
    }

    setFilteredLeads(filtered);
  }, [searchTerm, startDate, endDate, leads, selectedAnuncioId]);

  const handleLogout = async () => {
    setSession(null);
    setUser(null);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/auth", { replace: true });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSelectedAnuncioId("all");
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "NÃ£o hÃ¡ leads para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Nome", "Telefone", "E-mail", "Renda", "Objetivo", "Entrada", "Data"];

    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.phone,
      lead.email,
      lead.income ? incomeLabels[lead.income] || lead.income : "",
      lead.goal ? goalLabels[lead.goal] || lead.goal : "",
      lead.down_payment ? downPaymentLabels[lead.down_payment] || lead.down_payment : "",
      format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "ExportaÃ§Ã£o concluÃ­da",
      description: `${filteredLeads.length} leads exportados com sucesso.`,
    });
  };

  if (!session || hasAccess === null) {
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
              Aguardando AprovaÃ§Ã£o
            </h1>
            <p className="text-muted-foreground mb-6">
              Seu cadastro foi recebido e estÃ¡ em anÃ¡lise. VocÃª serÃ¡ notificado assim que for aprovado pelo administrador.
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
            VocÃª nÃ£o tem uma conta de corretor.
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
            {/* Plan Badge - Clickable to change plan */}
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
        <Tabs defaultValue="crm" className="w-full">
          <TabsList className="grid w-full grid-cols-6 max-w-5xl">
             {/* NOVAS ABAS AQUI */}
            <TabsTrigger value="crm" className="gap-1 sm:gap-2 px-2 sm:px-3 text-primary font-bold bg-primary/5">
              <ContactRound className="w-4 h-4" />
              <span className="hidden sm:inline">CRM</span>
            </TabsTrigger>
            <TabsTrigger value="imoveis" className="gap-1 sm:gap-2 px-2 sm:px-3 text-[rgba(148,162,184,1)] font-bold bg-secondary/5">
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
              <UserIcon className="w-4 h-4" /> {/* USANDO O ÃCONE RENOMEADO */}
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* NOVOS CONTEÚDOS */}
          <TabsContent value="crm" className="mt-6">
            <Clients />
          </TabsContent>

          <TabsContent value="imoveis" className="mt-6">
            <Properties />
          </TabsContent>

          {/* CONTEÚDOS ANTIGOS */}
          <TabsContent value="perfil" className="mt-6">
            {corretor && <PerfilEditor corretorId={corretor.id} />}
          </TabsContent>

          <TabsContent value="anuncios" className="mt-6">
            {corretor && (
              <AnunciosManager
                corretorId={corretor.id}
                corretorSlug={corretor.slug}
                plano={corretor.plano}
              />
            )}
          </TabsContent>

          <TabsContent value="gerador" className="mt-6">
            <AdGenerator corretorId={corretor?.id} corretorSlug={corretor?.slug} />
          </TabsContent>

          <TabsContent value="landing" className="mt-6">
            {corretor && (
              <LandingPagesEditor
                corretorId={corretor.id}
                corretorSlug={corretor.slug}
                corretorPlano={corretor.plano}
              />
            )}
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