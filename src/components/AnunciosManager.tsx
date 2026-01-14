import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Copy,
  ExternalLink,
  Loader2,
  Megaphone,
  Pause,
  Play,
  Pencil,
  Trash2,
  Users,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AnuncioForm from "@/components/AnuncioForm";
import { PlanoCorretor, canCreateCustomLandingPage, getCustomLandingPageLimit } from "@/lib/plan-limits";
import { Badge } from "@/components/ui/badge";

interface Anuncio {
  id: string;
  nome: string;
  slug: string;
  plataforma: string | null;
  status: string;
  headline_custom: string | null;
  subtitulo_custom: string | null;
  imagem_fundo_url: string | null;
  has_custom_landing: boolean;
  created_at: string;
  lead_count?: number;
}

interface AnunciosManagerProps {
  corretorId: string;
  corretorSlug: string;
  plano: PlanoCorretor | null;
}

const AnunciosManager = ({ corretorId, corretorSlug, plano }: AnunciosManagerProps) => {
  const { toast } = useToast();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState<Anuncio | null>(null);
  const [deleteAnuncioId, setDeleteAnuncioId] = useState<string | null>(null);

  // Calculate custom landing page usage
  const customLandingCount = anuncios.filter((a) => a.has_custom_landing).length;
  const customLandingLimit = getCustomLandingPageLimit(plano);
  const canCreateCustomLP = canCreateCustomLandingPage(plano);

  const fetchAnuncios = async () => {
    setIsLoading(true);
    
    // Fetch anuncios
    const { data: anunciosData, error } = await supabase
      .from("anuncios")
      .select("*")
      .eq("corretor_id", corretorId)
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

    // Fetch lead counts for each anuncio
    const anunciosWithCounts = await Promise.all(
      (anunciosData || []).map(async (anuncio) => {
        const { count } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("anuncio_id", anuncio.id);
        
        return { ...anuncio, lead_count: count || 0 };
      })
    );

    setAnuncios(anunciosWithCounts);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnuncios();
  }, [corretorId]);

  const handleCopyLink = (anuncioSlug: string) => {
    const url = `${window.location.origin}/c/${corretorSlug}/${anuncioSlug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!", description: url });
  };

  const handleToggleStatus = async (anuncio: Anuncio) => {
    const newStatus = anuncio.status === "ativo" ? "pausado" : "ativo";
    
    const { error } = await supabase
      .from("anuncios")
      .update({ status: newStatus })
      .eq("id", anuncio.id);

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: newStatus === "ativo" ? "Anúncio ativado" : "Anúncio pausado",
      });
      fetchAnuncios();
    }
  };

  const handleDelete = async () => {
    if (!deleteAnuncioId) return;

    const { error } = await supabase
      .from("anuncios")
      .delete()
      .eq("id", deleteAnuncioId);

    if (error) {
      toast({
        title: "Erro ao excluir anúncio",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Anúncio excluído com sucesso" });
      fetchAnuncios();
    }
    setDeleteAnuncioId(null);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingAnuncio(null);
    fetchAnuncios();
  };

  const openEditDialog = (anuncio: Anuncio) => {
    setEditingAnuncio(anuncio);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingAnuncio(null);
    setIsDialogOpen(true);
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
            Meus Anúncios
          </h2>
          <p className="text-sm text-muted-foreground">
            {canCreateCustomLP 
              ? `Landing pages customizadas: ${customLandingCount}/${customLandingLimit}`
              : "Rastreie leads por campanha"}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Anúncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAnuncio ? "Editar Anúncio" : "Novo Anúncio"}
              </DialogTitle>
            </DialogHeader>
            <AnuncioForm
              corretorId={corretorId}
              anuncio={editingAnuncio}
              plano={plano}
              customLandingCount={customLandingCount}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Anuncios List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : anuncios.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Megaphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum anúncio criado
          </h3>
          <p className="text-muted-foreground mb-6">
            Crie seu primeiro anúncio para começar a rastrear leads por campanha
          </p>
          <Button variant="gold" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Anúncio
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {anuncios.map((anuncio) => (
            <div
              key={anuncio.id}
              className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-lg">
                    {plataformaIcons[anuncio.plataforma?.toLowerCase() || "outro"] || "📢"}
                  </span>
                  <h3 className="font-semibold text-foreground truncate">
                    {anuncio.nome}
                  </h3>
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
                  {anuncio.has_custom_landing && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Sparkles className="w-3 h-3" />
                      LP Customizada
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {anuncio.plataforma || "Plataforma não definida"}
                </p>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="text-muted-foreground truncate">
                    {baseUrl}/c/{corretorSlug}/{anuncio.slug}
                  </span>
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Users className="w-3.5 h-3.5" />
                    {anuncio.lead_count || 0} leads
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(anuncio.slug)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `${baseUrl}/c/${corretorSlug}/${anuncio.slug}`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(anuncio)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(anuncio)}
                >
                  {anuncio.status === "ativo" ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteAnuncioId(anuncio.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAnuncioId} onOpenChange={() => setDeleteAnuncioId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anúncio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os leads associados a este anúncio
              permanecerão, mas não estarão mais vinculados a ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AnunciosManager;