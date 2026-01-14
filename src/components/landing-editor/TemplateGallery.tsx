import { Badge } from "@/components/ui/badge";
import { Check, Lock } from "lucide-react";
import { LandingTemplate } from "@/hooks/useLandingConfig";
import { PlanoCorretor } from "@/components/PlanoBadge";
import { cn } from "@/lib/utils";

interface TemplateGalleryProps {
  templates: LandingTemplate[];
  selectedTemplateId: string | null;
  plano: PlanoCorretor | null;
  onSelect: (templateId: string) => void;
}

const planoHierarchy: Record<string, number> = {
  lobby_start: 1,
  lobby_pro: 2,
  lobby_authority: 3,
};

const planoLabels: Record<string, string> = {
  lobby_start: "Lobby Start",
  lobby_pro: "Lobby Pro",
  lobby_authority: "Lobby Authority",
};

const TemplateGallery = ({ templates, selectedTemplateId, plano, onSelect }: TemplateGalleryProps) => {
  const userPlanoLevel = plano ? planoHierarchy[plano] || 0 : 0;

  const canUseTemplate = (template: LandingTemplate) => {
    if (!template.planos_permitidos || template.planos_permitidos.length === 0) {
      return true;
    }
    
    const minRequiredLevel = Math.min(
      ...template.planos_permitidos.map(p => planoHierarchy[p] || 0)
    );
    
    return userPlanoLevel >= minRequiredLevel;
  };

  const getRequiredPlan = (template: LandingTemplate) => {
    if (!template.planos_permitidos || template.planos_permitidos.length === 0) {
      return null;
    }
    
    const minRequired = template.planos_permitidos.reduce((min, p) => {
      const level = planoHierarchy[p] || 0;
      const minLevel = planoHierarchy[min] || 0;
      return level < minLevel ? p : min;
    }, template.planos_permitidos[0]);
    
    return planoLabels[minRequired] || minRequired;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Templates Disponíveis
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isAllowed = canUseTemplate(template);
          const isSelected = selectedTemplateId === template.id;
          const requiredPlan = getRequiredPlan(template);
          
          return (
            <button
              key={template.id}
              onClick={() => isAllowed && onSelect(template.id)}
              disabled={!isAllowed}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : isAllowed 
                    ? "border-border hover:border-primary/50 hover:bg-secondary/50" 
                    : "border-border/50 opacity-60 cursor-not-allowed"
              )}
            >
              {/* Template Preview */}
              <div className="aspect-video rounded-lg bg-gradient-to-br from-secondary to-background mb-3 overflow-hidden relative">
                {template.thumbnail_url ? (
                  <img 
                    src={template.thumbnail_url} 
                    alt={template.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground/30">
                      {template.nome.charAt(0)}
                    </span>
                  </div>
                )}
                
                {!isAllowed && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              
              {/* Template Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{template.nome}</h4>
                  {!isAllowed && requiredPlan && (
                    <Badge variant="secondary" className="text-xs">
                      {requiredPlan}
                    </Badge>
                  )}
                </div>
                {template.descricao && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.descricao}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {templates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum template disponível
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
