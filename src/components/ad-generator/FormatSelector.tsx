import { ImageIcon, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdFormat } from "./types";

interface FormatSelectorProps {
  format: AdFormat;
  onChange: (format: AdFormat) => void;
}

export const FormatSelector = ({ format, onChange }: FormatSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onChange('single')}
        className={cn(
          "p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3",
          "hover:border-primary/50 hover:bg-primary/5",
          format === 'single'
            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
            : "border-border bg-card"
        )}
      >
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
          format === 'single' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <ImageIcon className="w-7 h-7" />
        </div>
        <div className="text-center">
          <p className={cn(
            "font-semibold text-sm",
            format === 'single' ? "text-primary" : "text-foreground"
          )}>
            Post Único
          </p>
          <p className="text-xs text-muted-foreground mt-1">1 Imagem</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('carousel')}
        className={cn(
          "p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3",
          "hover:border-primary/50 hover:bg-primary/5",
          format === 'carousel'
            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
            : "border-border bg-card"
        )}
      >
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
          format === 'carousel' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <Images className="w-7 h-7" />
        </div>
        <div className="text-center">
          <p className={cn(
            "font-semibold text-sm",
            format === 'carousel' ? "text-primary" : "text-foreground"
          )}>
            Carrossel
          </p>
          <p className="text-xs text-muted-foreground mt-1">2 a 5 Imagens</p>
        </div>
      </button>
    </div>
  );
};
