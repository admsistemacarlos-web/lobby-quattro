import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Shield,
  Building,
  Globe,
  Copy,
  ExternalLink,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Session } from "@supabase/supabase-js";
import UserRolesManager from "@/components/UserRolesManager";
import CorretoresManager from "@/components/CorretoresManager";
import AdminAnunciosManager from "@/components/AdminAnunciosManager";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdGenerator } from "@/components/ad-generator";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  income: string | null;
  goal: string | null;
  down_payment: string | null;
  created_at: string;
  corretor_id: string | null;
}

interface CorretorMap {
  [key: string]: string;
}

const incomeLabels: Record<string, string> = {
  "ate-5000": "Até R$ 5.000",
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
  nao: "Não",
  permuta: "Permuta",
};

interface AdminCorretor {
  id: string;
  nome: string;
  slug: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [corretoresMap, setCorretoresMap] = useState<CorretorMap>({});
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCorretor, setAdminCorretor] = useState<AdminCorretor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    return !!data;
  };

  useEffect(() => {
    document.title = "Admin | Lobby Quattro";
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
        // Check admin role then fetch leads
        checkAdminRole(session.user.id).then((hasAdminRole) => {
          setIsAdmin(hasAdminRole);
          if (hasAdminRole) {
            fetchLeads();
            fetchAdminCorretor(session.user.id);
          } else {
            setIsLoading(false);
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
      setFilteredLeads(data || []);

      // Fetch corretores names for mapping
      const corretorIds = [...new Set((data || []).map(l => l.corretor_id).filter(Boolean))];
      if (corretorIds.length > 0) {
        const { data: corretoresData } = await supabase
          .from("corretores")
          .select("id, nome")
          .in("id", corretorIds);
        
        if (corretoresData) {
          const map: CorretorMap = {};
          corretoresData.forEach(c => {
            map[c.id] = c.nome;
          });
          setCorretoresMap(map);
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar leads",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminCorretor = async (userId: string) => {
    const { data } = await supabase
      .from("corretores")
      .select("id, nome, slug")
      .eq("user_id", userId)
      .maybeSingle();
    
    setAdminCorretor(data);
  };

  const copyLandingPageLink = () => {
    if (!adminCorretor) return;
    const url = `${window.location.origin}/c/${adminCorretor.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!", description: url });
  };

  useEffect(() => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(term) ||
          lead.email.toLowerCase().includes(term) ||
          lead.phone.includes(term)
      );
    }

    // Date filter
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

    setFilteredLeads(filtered);
  }, [searchTerm, startDate, endDate, leads]);

  const handleLogout = async () => {
    // Clear local state first to prevent redirect loops
    setSession(null);
    
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
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há leads para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Nome",
      "Telefone",
      "E-mail",
      "Renda",
      "Objetivo",
      "Entrada",
      "Data",
    ];

    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.phone,
      lead.email,
      lead.income ? incomeLabels[lead.income] || lead.income : "",
      lead.goal ? goalLabels[lead.goal] || lead.goal : "",
      lead.down_payment
        ? downPaymentLabels[lead.down_payment] || lead.down_payment
        : "",
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
      title: "Exportação concluída",
      description: `${filteredLeads.length} leads exportados com sucesso.`,
    });
  };

  if (!session || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <Button onClick={handleLogout}>Sair</Button>
        </div>
      </div>
    );
  }

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              Painel Admin
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="corretores" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-6">
            <TabsTrigger value="corretores" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="gerador" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Gerador</span>
            </TabsTrigger>
            <TabsTrigger value="anuncios" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Anúncios</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Planos</span>
            </TabsTrigger>
            <TabsTrigger value="landing" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Leads</p>
                    <p className="text-2xl font-bold text-foreground">
                      {leads.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Este Mês</p>
                    <p className="text-2xl font-bold text-foreground">
                      {
                        leads.filter((lead) => {
                          const date = new Date(lead.created_at);
                          const now = new Date();
                          return (
                            date.getMonth() === now.getMonth() &&
                            date.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Filtrados</p>
                    <p className="text-2xl font-bold text-foreground">
                      {filteredLeads.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, e-mail ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      De:
                    </span>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Até:
                    </span>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                  {(searchTerm || startDate || endDate) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
                <Button variant="gold" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Users className="w-12 h-12 mb-4 opacity-50" />
                  <p>Nenhum lead encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-foreground font-semibold">
                          Nome
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Corretor
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Contato
                        </TableHead>
                        <TableHead className="text-foreground font-semibold hidden md:table-cell">
                          Renda
                        </TableHead>
                        <TableHead className="text-foreground font-semibold hidden lg:table-cell">
                          Objetivo
                        </TableHead>
                        <TableHead className="text-foreground font-semibold hidden lg:table-cell">
                          Entrada
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Data
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow
                          key={lead.id}
                          className="border-border hover:bg-secondary/50"
                        >
                          <TableCell className="font-medium text-foreground">
                            {lead.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {lead.corretor_id 
                              ? corretoresMap[lead.corretor_id] || "—" 
                              : <span className="text-xs italic">Sem corretor</span>
                            }
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-foreground">{lead.phone}</p>
                              <p className="text-sm text-muted-foreground">
                                {lead.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {lead.income
                              ? incomeLabels[lead.income] || lead.income
                              : "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {lead.goal ? goalLabels[lead.goal] || lead.goal : "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {lead.down_payment
                              ? downPaymentLabels[lead.down_payment] ||
                                lead.down_payment
                              : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(lead.created_at), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                            <br />
                            <span className="text-xs">
                              {format(new Date(lead.created_at), "HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="corretores">
            <CorretoresManager />
          </TabsContent>

          <TabsContent value="anuncios">
            <AdminAnunciosManager />
          </TabsContent>

          <TabsContent value="roles">
            <UserRolesManager />
          </TabsContent>

          <TabsContent value="gerador" className="space-y-6">
            {adminCorretor ? (
              <AdGenerator corretorId={adminCorretor.id} corretorSlug={adminCorretor.slug} />
            ) : (
              <div className="glass-card p-6 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">
                  Para criar campanhas a partir das artes geradas, você precisa ter um perfil de corretor.
                </p>
                <p className="text-sm text-muted-foreground">
                  Vá para a aba "Usuários" e cadastre-se como corretor primeiro.
                </p>
                <div className="mt-6">
                  <AdGenerator />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="landing" className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Minha Landing Page</h2>
              
              {adminCorretor ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">URL da sua página</p>
                    <p className="font-medium text-foreground text-lg">
                      {baseUrl}/c/{adminCorretor.slug}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={copyLandingPageLink}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Link
                    </Button>
                    <Button
                      variant="gold"
                      onClick={() => window.open(`${baseUrl}/c/${adminCorretor.slug}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Landing Page
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não tem uma landing page configurada.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vá para a aba "Corretores" e cadastre-se como corretor para ter sua própria landing page.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
