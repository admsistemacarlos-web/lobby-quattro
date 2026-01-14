import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ExternalLink } from "lucide-react";
import { AdFormData } from "./types";

interface CreateAnuncioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AdFormData;
  corretorId: string;
  corretorSlug: string;
}

export const CreateAnuncioDialog = ({
  open,
  onOpenChange,
  formData,
  corretorId,
  corretorSlug,
}: CreateAnuncioDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [createdAnuncio, setCreatedAnuncio] = useState<{ slug: string } | null>(null);
  
  const buildSubtitulo = () => {
    const parts = [];
    if (formData.neighborhood) parts.push(formData.neighborhood);
    if (formData.bedrooms) parts.push(`${formData.bedrooms} quartos`);
    if (formData.area) parts.push(formData.area);
    return parts.join(" • ");
  };

  const [anuncioData, setAnuncioData] = useState({
    nome: formData.title || "",
    slug: formData.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "",
    plataforma: "",
    has_custom_landing: false,
    headline_custom: formData.title || "",
    subtitulo_custom: buildSubtitulo(),
  });

  const handleChange = (field: string, value: string | boolean) => {
    if (field === "slug" && typeof value === "string") {
      value = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    setAnuncioData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!anuncioData.nome.trim() || !anuncioData.slug.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e slug são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      corretor_id: corretorId,
      nome: anuncioData.nome.trim(),
      slug: anuncioData.slug.trim(),
      plataforma: anuncioData.plataforma || null,
      has_custom_landing: anuncioData.has_custom_landing,
      headline_custom: anuncioData.has_custom_landing ? anuncioData.headline_custom.trim() || null : null,
      subtitulo_custom: anuncioData.has_custom_landing ? anuncioData.subtitulo_custom.trim() || null : null,
    };

    const { error } = await supabase.from("anuncios").insert(payload);

    setIsLoading(false);

    if (error) {
      if (error.message.includes("anuncios_corretor_slug_unique")) {
        toast({
          title: "Slug já existe",
          description: "Este slug já está em uso. Escolha outro.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }

    setCreatedAnuncio({ slug: anuncioData.slug });
    toast({
      title: "Anúncio criado com sucesso!",
      description: "Sua campanha está pronta para receber leads.",
    });
  };

  const landingUrl = createdAnuncio 
    ? `${window.location.origin}/c/${corretorSlug}/${createdAnuncio.slug}`
    : null;

  const handleClose = () => {
    setCreatedAnuncio(null);
    setAnuncioData({
      nome: formData.title || "",
      slug: formData.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "",
      plataforma: "",
      has_custom_landing: false,
      headline_custom: formData.title || "",
      subtitulo_custom: buildSubtitulo(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {createdAnuncio ? "Anúncio Criado!" : "Criar Campanha"}
          </DialogTitle>
          <DialogDescription>
            {createdAnuncio 
              ? "Use o link abaixo para rastrear leads desta campanha."
              : "Vincule esta arte a uma campanha para rastrear os leads gerados."}
          </DialogDescription>
        </DialogHeader>

        {createdAnuncio ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <Label className="text-xs text-muted-foreground mb-1 block">Link da Landing Page</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={landingUrl || ""} 
                  readOnly 
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(landingUrl || "");
                    toast({ title: "Link copiado!" });
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
            
            <Button 
              variant="gold" 
              className="w-full"
              onClick={() => window.open(landingUrl || "", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Landing Page
            </Button>
            
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Campanha *</Label>
              <Input
                id="nome"
                placeholder="Ex: Apê Jardins - Instagram"
                value={anuncioData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug da URL *</Label>
              <Input
                id="slug"
                placeholder="Ex: ape-jardins-ig"
                value={anuncioData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground">
                URL: /c/{corretorSlug}/<strong>{anuncioData.slug || "slug"}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plataforma">Plataforma</Label>
              <Select
                value={anuncioData.plataforma}
                onValueChange={(value) => handleChange("plataforma", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facebook">📘 Facebook</SelectItem>
                  <SelectItem value="Instagram">📷 Instagram</SelectItem>
                  <SelectItem value="Google">🔍 Google</SelectItem>
                  <SelectItem value="TikTok">🎵 TikTok</SelectItem>
                  <SelectItem value="YouTube">📺 YouTube</SelectItem>
                  <SelectItem value="Outro">📢 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="has_custom_landing" className="cursor-pointer text-sm">
                  Landing page personalizada
                </Label>
                <p className="text-xs text-muted-foreground">
                  Usar textos customizados na LP
                </p>
              </div>
              <Switch
                id="has_custom_landing"
                checked={anuncioData.has_custom_landing}
                onCheckedChange={(checked) => handleChange("has_custom_landing", checked)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" variant="gold" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  "Criar Campanha"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
