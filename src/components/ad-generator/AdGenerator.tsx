import { useState } from "react";
import { AdFormData, AdGeneratorProps, initialFormData } from "./types";
import { AdGeneratorForm } from "./AdGeneratorForm";
import { AdPreview } from "./AdPreview";
import { CreateAnuncioDialog } from "./CreateAnuncioDialog";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";

const AdGenerator = ({ corretorId, corretorSlug }: AdGeneratorProps) => {
  const [formData, setFormData] = useState<AdFormData>(initialFormData);
  const [showAnuncioDialog, setShowAnuncioDialog] = useState(false);

  const handleFormChange = (data: Partial<AdFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const canCreateAnuncio = corretorId && corretorSlug && formData.title.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-4 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">Gerador de Anúncios</h2>
        <p className="text-sm lg:text-base text-muted-foreground">
          Crie artes profissionais para suas redes sociais
        </p>
      </div>

      {/* Responsive Layout: Vertical on mobile, Two columns on desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Form Section */}
        <div className="glass-card p-4 lg:p-6 order-1">
          <h3 className="text-base lg:text-lg font-semibold text-foreground mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-border">
            Configuração do Anúncio
          </h3>
          <AdGeneratorForm formData={formData} onChange={handleFormChange} />
        </div>

        {/* Preview Section */}
        <div className="glass-card p-4 lg:p-6 order-2">
          <AdPreview formData={formData} />
          
          {/* Create Campaign Button */}
          {canCreateAnuncio && (
            <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAnuncioDialog(true)}
              >
                <Megaphone className="w-4 h-4 mr-2" />
                Criar Campanha com esta Arte
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Gere um link único para rastrear leads desta campanha
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Anuncio Dialog */}
      {corretorId && corretorSlug && (
        <CreateAnuncioDialog
          open={showAnuncioDialog}
          onOpenChange={setShowAnuncioDialog}
          formData={formData}
          corretorId={corretorId}
          corretorSlug={corretorSlug}
        />
      )}
    </div>
  );
};

export { AdGenerator };
