import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useLandingConfig, LandingConfig } from "@/hooks/useLandingConfig";
import ContactInfoForm from "@/components/landing-editor/ContactInfoForm";
import SocialLinksForm from "@/components/landing-editor/SocialLinksForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PerfilEditorProps {
  corretorId: string;
}

const PerfilEditor = ({ corretorId }: PerfilEditorProps) => {
  const { toast } = useToast();
  const { config, isLoading, saveConfig } = useLandingConfig(corretorId);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    whatsapp: "",
    email_contato: "",
    creci: "",
    instagram_url: "",
    facebook_url: "",
    linkedin_url: "",
    tiktok_url: "",
    youtube_url: "",
  });

  useEffect(() => {
    if (config) {
      setFormData({
        whatsapp: config.whatsapp || "",
        email_contato: config.email_contato || "",
        creci: config.creci || "",
        instagram_url: config.instagram_url || "",
        facebook_url: config.facebook_url || "",
        linkedin_url: config.linkedin_url || "",
        tiktok_url: config.tiktok_url || "",
        youtube_url: config.youtube_url || "",
      });
    }
  }, [config]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const { error } = await saveConfig(formData as Partial<LandingConfig>);
    
    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perfil salvo!",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Informações do Perfil</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas informações de contato e redes sociais
          </p>
        </div>
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

      <Tabs defaultValue="contato" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="redes">Redes</TabsTrigger>
        </TabsList>
        
        <div className="mt-6 glass-card p-6">
          <TabsContent value="contato" className="mt-0">
            <ContactInfoForm
              whatsapp={formData.whatsapp}
              email={formData.email_contato}
              creci={formData.creci}
              onChange={handleChange}
            />
          </TabsContent>
          
          <TabsContent value="redes" className="mt-0">
            <SocialLinksForm
              instagram={formData.instagram_url}
              facebook={formData.facebook_url}
              linkedin={formData.linkedin_url}
              tiktok={formData.tiktok_url}
              youtube={formData.youtube_url}
              onChange={handleChange}
            />
          </TabsContent>
        </div>
      </Tabs>

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

export default PerfilEditor;
