import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Loader2,
  Megaphone,
  ExternalLink,
  Users,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnuncioWithCorretor {
  id: string;
  nome: string;
  slug: string;
  plataforma: string | null;
  status: string;
  created_at: string;
  lead_count: number;
  corretor_nome: string;
  corretor_slug: string;
}

const AdminAnunciosManager = () => {
  const { toast } = useToast();
  const [anuncios, setAnuncios] = useState<AnuncioWithCorretor[]>([]);
  const [filteredAnuncios, setFilteredAnuncios] = useState<AnuncioWithCorretor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAnuncios = async () => {
    setIsLoading(true);

    // Fetch all anuncios with corretor info
    const { data: anunciosData, error } = await supabase
      .from("anuncios")
      .select(`
        id,
        nome,
        slug,
        plataforma,
        status,
        created_at,
        corretor_id
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar anúncios",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Get unique corretor IDs
    const corretorIds = [...new Set(anunciosData?.map(a => a.corretor_id) || [])];

    // Fetch corretor info
    const { data: corretoresData } = await supabase
      .from("corretores")
      .select("id, nome, slug")
      .in("id", corretorIds);

    const corretoresMap = new Map(
      corretoresData?.map(c => [c.id, { nome: c.nome, slug: c.slug }]) || []
    );

    // Fetch lead counts for each anuncio
    const anunciosWithDetails = await Promise.all(
      (anunciosData || []).map(async (anuncio) => {
        const { count } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("anuncio_id", anuncio.id);

        const corretor = corretoresMap.get(anuncio.corretor_id);

        return {
          ...anuncio,
          lead_count: count || 0,
          corretor_nome: corretor?.nome || "Desconhecido",
          corretor_slug: corretor?.slug || "",
        };
      })
    );

    setAnuncios(anunciosWithDetails);
    setFilteredAnuncios(anunciosWithDetails);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnuncios();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredAnuncios(anuncios);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = anuncios.filter(
      (anuncio) =>
        anuncio.nome.toLowerCase().includes(term) ||
        anuncio.corretor_nome.toLowerCase().includes(term) ||
        anuncio.plataforma?.toLowerCase().includes(term)
    );
    setFilteredAnuncios(filtered);
  }, [searchTerm, anuncios]);

  const clearFilters = () => {
    setSearchTerm("");
  };

  const baseUrl = window.location.origin;

  const plataformaIcons: Record<string, string> = {
    facebook: "📘",
    instagram: "📷",
    google: "🔍",
    tiktok: "🎵",
    youtube: "📺",
    outro: "📢",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Todos os Anúncios
          </h2>
          <p className="text-sm text-muted-foreground">
            Visualize os anúncios de todos os corretores
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do anúncio, corretor ou plataforma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Anúncios</p>
              <p className="text-2xl font-bold text-foreground">{anuncios.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold text-foreground">
                {anuncios.filter(a => a.status === "ativo").length}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold text-foreground">
                {anuncios.reduce((acc, a) => acc + a.lead_count, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredAnuncios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Megaphone className="w-12 h-12 mb-4 opacity-50" />
            <p>Nenhum anúncio encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground font-semibold">Anúncio</TableHead>
                  <TableHead className="text-foreground font-semibold">Corretor</TableHead>
                  <TableHead className="text-foreground font-semibold">Plataforma</TableHead>
                  <TableHead className="text-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-foreground font-semibold">Leads</TableHead>
                  <TableHead className="text-foreground font-semibold">Data</TableHead>
                  <TableHead className="text-foreground font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnuncios.map((anuncio) => (
                  <TableRow key={anuncio.id} className="border-border hover:bg-secondary/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{plataformaIcons[anuncio.plataforma?.toLowerCase() || "outro"] || "📢"}</span>
                        <span className="font-medium text-foreground">{anuncio.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{anuncio.corretor_nome}</TableCell>
                    <TableCell className="text-muted-foreground">{anuncio.plataforma || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          anuncio.status === "ativo"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            anuncio.status === "ativo" ? "bg-green-500" : "bg-muted-foreground"
                          }`}
                        />
                        {anuncio.status === "ativo" ? "Ativo" : "Pausado"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Users className="w-3.5 h-3.5" />
                        {anuncio.lead_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(anuncio.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `${baseUrl}/c/${anuncio.corretor_slug}/${anuncio.slug}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnunciosManager;
