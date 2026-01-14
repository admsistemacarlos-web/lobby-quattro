import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Lock, AlertCircle } from "lucide-react";
import { PlanoCorretor, canCreateCustomLandingPage, getCustomLandingPageLimit } from "@/lib/plan-limits";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Anuncio {
  id: string;
  nome: string;
  slug: string;
  plataforma: string | null;
  status: string;
  headline_custom: string | null;
  subtitulo_custom: string | null;
  imagem_fundo_url: string | null;
  has_custom_landing?: boolean;
}

interface AnuncioFormProps {
  corretorId: string;
  anuncio: Anuncio | null;
  plano: PlanoCorretor | null;
  customLandingCount: number;
  onSave: () => void;
  onCancel: () => void;
}

const AnuncioForm = ({ corretorId, anuncio, plano, customLandingCount, onSave, onCancel }: AnuncioFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const canCreateCustomLP = canCreateCustomLandingPage(plano);
  const customLandingLimit = getCustomLandingPageLimit(plano);
  // When editing, don't count the current anuncio in the limit
  const currentCount = anuncio?.has_custom_landing ? customLandingCount - 1 : customLandingCount;
  const isAtLimit = currentCount >= customLandingLimit;

  const [formData, setFormData] = useState({
    nome: anuncio?.nome || "",
    slug: anuncio?.slug || "",
    plataforma: anuncio?.plataforma || "",
    has_custom_landing: anuncio?.has_custom_landing || false,
    headline_custom: anuncio?.headline_custom || "",
    subtitulo_custom: anuncio?.subtitulo_custom || "",
    imagem_fundo_url: anuncio?.imagem_fundo_url || "",
  });

  const handleChange = (field: string, value: string) => {
    if (field === "slug") {
      // Sanitize slug: lowercase, no spaces, only alphanumeric and hyphens
      value = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
    if (field === "has_custom_landing") {
      setFormData((prev) => ({ ...prev, has_custom_landing: value === "true" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.slug.trim()) {
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
      nome: formData.nome.trim(),
      slug: formData.slug.trim(),
      plataforma: formData.plataforma || null,
      has_custom_landing: formData.has_custom_landing,
      headline_custom: formData.has_custom_landing ? (formData.headline_custom.trim() || null) : null,
      subtitulo_custom: formData.has_custom_landing ? (formData.subtitulo_custom.trim() || null) : null,
      imagem_fundo_url: formData.has_custom_landing ? (formData.imagem_fundo_url.trim() || null) : null,
    };

    let error;

    if (anuncio) {
      // Update
      const result = await supabase
        .from("anuncios")
        .update(payload)
        .eq("id", anuncio.id);
      error = result.error;
    } else {
      // Create
      const result = await supabase.from("anuncios").insert(payload);
      error = result.error;
    }

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
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }

    toast({
      title: anuncio ? "Anúncio atualizado!" : "Anúncio criado!",
    });
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Anúncio *</Label>
        <Input
          id="nome"
          placeholder="Ex: Campanha Facebook Dezembro"
          value={formData.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug da URL *</Label>
        <Input
          id="slug"
          placeholder="Ex: fb-dezembro"
          value={formData.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
          maxLength={50}
          required
        />
        <p className="text-xs text-muted-foreground">
          A URL será: /c/seu-slug/<strong>{formData.slug || "slug-do-anuncio"}</strong>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plataforma">Plataforma</Label>
        <Select
          value={formData.plataforma}
          onValueChange={(value) => handleChange("plataforma", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Facebook">📘 Facebook Ads</SelectItem>
            <SelectItem value="Instagram">📷 Instagram Ads</SelectItem>
            <SelectItem value="Google">🔍 Google Ads</SelectItem>
            <SelectItem value="TikTok">🎵 TikTok Ads</SelectItem>
            <SelectItem value="YouTube">📺 YouTube Ads</SelectItem>
            <SelectItem value="Outro">📢 Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium text-foreground">
            Landing Page Customizada
          </p>
        </div>
        
        {!canCreateCustomLP ? (
          <Alert className="border-amber-500/20 bg-amber-500/5">
            <Lock className="w-4 h-4 text-amber-500" />
            <AlertDescription className="text-amber-600">
              Disponível nos planos Pro e Authority. Entre em contato para fazer upgrade.
            </AlertDescription>
          </Alert>
        ) : isAtLimit && !anuncio?.has_custom_landing ? (
          <Alert className="border-amber-500/20 bg-amber-500/5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <AlertDescription className="text-amber-600">
              Limite de {customLandingLimit} landing pages customizadas atingido. 
              Desative uma landing page customizada para habilitar outra.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="has_custom_landing" className="cursor-pointer">
                  Usar landing page customizada
                </Label>
                <p className="text-xs text-muted-foreground">
                  {formData.has_custom_landing 
                    ? "Este anúncio terá sua própria landing page personalizada"
                    : "Leads irão para sua landing page principal"}
                </p>
              </div>
              <Switch
                id="has_custom_landing"
                checked={formData.has_custom_landing}
                onCheckedChange={(checked) => handleChange("has_custom_landing", checked ? "true" : "")}
              />
            </div>

            {formData.has_custom_landing && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="headline_custom">Headline Customizado</Label>
                  <Input
                    id="headline_custom"
                    placeholder="Deixe vazio para usar o padrão"
                    value={formData.headline_custom}
                    onChange={(e) => handleChange("headline_custom", e.target.value)}
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitulo_custom">Subtítulo Customizado</Label>
                  <Textarea
                    id="subtitulo_custom"
                    placeholder="Deixe vazio para usar o padrão"
                    value={formData.subtitulo_custom}
                    onChange={(e) => handleChange("subtitulo_custom", e.target.value)}
                    maxLength={500}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem_fundo_url">URL da Imagem de Fundo</Label>
                  <Input
                    id="imagem_fundo_url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.imagem_fundo_url}
                    onChange={(e) => handleChange("imagem_fundo_url", e.target.value)}
                    maxLength={500}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="gold" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : anuncio ? (
            "Salvar Alterações"
          ) : (
            "Criar Anúncio"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AnuncioForm;