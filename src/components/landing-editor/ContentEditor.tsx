import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Type, Plus, X } from "lucide-react";
import { useState } from "react";
import { PlanoCorretor } from "@/components/PlanoBadge";

interface ContentEditorProps {
  headline: string;
  subtitulo: string;
  badges: string[];
  plano: PlanoCorretor | null;
  onChange: (field: string, value: string | string[]) => void;
}

const ContentEditor = ({ headline, subtitulo, badges, plano, onChange }: ContentEditorProps) => {
  const [newBadge, setNewBadge] = useState("");

  // Check if plan allows editing
  const canEditHeadline = plano === "lobby_pro" || plano === "lobby_authority";
  const canEditBadges = plano === "lobby_authority";

  const addBadge = () => {
    if (newBadge.trim() && !badges.includes(newBadge.trim())) {
      onChange("badges_customizados", [...badges, newBadge.trim()]);
      setNewBadge("");
    }
  };

  const removeBadge = (badge: string) => {
    onChange("badges_customizados", badges.filter(b => b !== badge));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Type className="w-5 h-5 text-primary" />
        Textos Personalizados
      </h3>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="headline" className="flex items-center gap-2">
            Headline Principal
            {!canEditHeadline && (
              <Badge variant="secondary" className="text-xs">
                Lobby Pro+
              </Badge>
            )}
          </Label>
          <Input
            id="headline"
            placeholder="Encontre o Imóvel Ideal para Morar ou Investir."
            value={headline}
            onChange={(e) => onChange("headline_principal", e.target.value)}
            disabled={!canEditHeadline}
            className={!canEditHeadline ? "opacity-50" : ""}
          />
          {!canEditHeadline && (
            <p className="text-xs text-muted-foreground">
              Disponível nos planos Lobby Pro e Lobby Authority
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitulo" className="flex items-center gap-2">
            Subtítulo
            {!canEditHeadline && (
              <Badge variant="secondary" className="text-xs">
                Lobby Pro+
              </Badge>
            )}
          </Label>
          <Textarea
            id="subtitulo"
            placeholder="Consultoria personalizada para você realizar o melhor negócio com segurança e agilidade."
            value={subtitulo}
            onChange={(e) => onChange("subtitulo", e.target.value)}
            disabled={!canEditHeadline}
            className={!canEditHeadline ? "opacity-50" : ""}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Badges de Confiança
            {!canEditBadges && (
              <Badge variant="secondary" className="text-xs">
                Lobby Authority
              </Badge>
            )}
          </Label>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {badges.map((badge) => (
              <Badge key={badge} variant="outline" className="gap-1 pr-1">
                {badge}
                {canEditBadges && (
                  <button
                    onClick={() => removeBadge(badge)}
                    className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>

          {canEditBadges ? (
            <div className="flex gap-2">
              <Input
                placeholder="Novo badge..."
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBadge())}
              />
              <Button type="button" size="sm" onClick={addBadge}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Badges personalizados disponíveis apenas no Lobby Authority
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
