import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Copy, ExternalLink, Eye } from "lucide-react";
import { useLandingConfig, LandingConfig, FormConfig } from "@/hooks/useLandingConfig";
import { PlanoCorretor } from "@/components/PlanoBadge";
import ContentEditor from "./ContentEditor";
import VisualEditor from "./VisualEditor";
import TemplateGallery from "./TemplateGallery";
import FormEditor from "./FormEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LandingPagesEditorProps {
  corretorId: string;
  corretorSlug: string;
  corretorPlano: PlanoCorretor | null;
}

const LandingPagesEditor = ({ corretorId, corretorSlug, corretorPlano }: LandingPagesEditorProps) => {
  const { toast } = useToast();
  const { config, templates, isLoading, saveConfig } = useLandingConfig(corretorId);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    template_id: null as string | null,
    headline_principal: "",
    subtitulo: "",
    imagem_fundo_url: "",
    badges_customizados: [] as string[],
    form_config: null as FormConfig | null,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        template_id: config.template_id,
        headline_principal: config.headline_principal || "",
        subtitulo: config.subtitulo || "",
        imagem_fundo_url: config.imagem_fundo_url || "",
        badges_customizados: config.badges_customizados || [],
        form_config: config.form_config || null,
      });
    }
  }, [config]);

  const handleChange = (field: string, value: string | string[] | FormConfig) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const { error } = await saveConfig({
      ...formData,
      badges_customizados: formData.badges_customizados,
      form_config: formData.form_config,
    } as Partial<LandingConfig>);
    
    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Configurações salvas!",
        description: "Sua landing page foi atualizada com sucesso.",
      });
    }
    
    setIsSaving(false);
  };

  const handleSelectTemplate = (templateId: string) => {
    setFormData(prev => ({ ...prev, template_id: templateId }));
  };

  const copyLink = () => {
    const url = `${window.location.origin}/c/${corretorSlug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!", description: url });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const baseUrl = window.location.origin;

  return (
    <div className="space-y-6">
      {/* Landing Page Link Box */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">Sua Landing Page</p>
          <p className="font-medium text-foreground text-sm sm:text-base break-all">
            <span className="hidden sm:inline">{baseUrl}</span>
            <span className="sm:hidden">...</span>/c/{corretorSlug}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Copiar Link</span>
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => window.open(`${baseUrl}/c/${corretorSlug}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Abrir</span>
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Configurar Landing Page</h2>
          <p className="text-sm text-muted-foreground">
            Personalize sua página de captura de leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${baseUrl}/c/${corretorSlug}`, "_blank")}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {/* Editor Tabs - Only Visual, Formulário, Textos, Template */}
      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="visual" className="text-xs sm:text-sm">Visual</TabsTrigger>
          <TabsTrigger value="formulario" className="text-xs sm:text-sm">Formulário</TabsTrigger>
          <TabsTrigger value="textos" className="text-xs sm:text-sm">Textos</TabsTrigger>
          <TabsTrigger value="template" className="text-xs sm:text-sm">Template</TabsTrigger>
        </TabsList>
        
        <div className="mt-6 glass-card p-6">
          <TabsContent value="visual" className="mt-0">
            <VisualEditor
              imagemFundoUrl={formData.imagem_fundo_url}
              plano={corretorPlano}
              onChange={handleChange}
            />
          </TabsContent>

          <TabsContent value="formulario" className="mt-0">
            <FormEditor
              formConfig={formData.form_config as any}
              onChange={handleChange}
            />
          </TabsContent>
          
          <TabsContent value="textos" className="mt-0">
            <ContentEditor
              headline={formData.headline_principal}
              subtitulo={formData.subtitulo}
              badges={formData.badges_customizados}
              plano={corretorPlano}
              onChange={handleChange}
            />
          </TabsContent>
          
          <TabsContent value="template" className="mt-0">
            <TemplateGallery
              templates={templates}
              selectedTemplateId={formData.template_id}
              plano={corretorPlano}
              onSelect={handleSelectTemplate}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Save Button Mobile */}
      <div className="sm:hidden">
        <Button
          variant="gold"
          size="lg"
          className="w-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default LandingPagesEditor;
