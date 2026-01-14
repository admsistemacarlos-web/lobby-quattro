import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Image, Upload } from "lucide-react";
import { PlanoCorretor } from "@/components/PlanoBadge";

interface VisualEditorProps {
  imagemFundoUrl: string;
  plano: PlanoCorretor | null;
  onChange: (field: string, value: string) => void;
}

const VisualEditor = ({ imagemFundoUrl, plano, onChange }: VisualEditorProps) => {
  const canEditBackground = plano === "lobby_pro" || plano === "lobby_authority";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Image className="w-5 h-5 text-primary" />
        Visual
      </h3>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="imagem_fundo" className="flex items-center gap-2">
            Imagem de Fundo
            {!canEditBackground && (
              <Badge variant="secondary" className="text-xs">
                Lobby Pro+
              </Badge>
            )}
          </Label>
          
          {canEditBackground ? (
            <>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="imagem_fundo"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imagemFundoUrl}
                  onChange={(e) => onChange("imagem_fundo_url", e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cole a URL de uma imagem. Recomendado: 1920x1080px
              </p>
              
              {imagemFundoUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={imagemFundoUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Upload de imagem personalizada disponível nos planos Lobby Pro e Lobby Authority
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualEditor;
