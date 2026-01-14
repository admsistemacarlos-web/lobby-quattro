import { cn } from "@/lib/utils";
import { AdTemplate, templateConfig } from "./types";

interface TemplateSelectorProps {
  template: AdTemplate;
  onChange: (template: AdTemplate) => void;
}

export const TemplateSelector = ({ template, onChange }: TemplateSelectorProps) => {
  const templates: AdTemplate[] = ['modern', 'classic', 'minimal'];

  return (
    <div className="grid grid-cols-3 gap-3">
      {templates.map((t) => {
        const config = templateConfig[t];
        const isSelected = template === t;

        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <span className="text-2xl">{config.icon}</span>
            <span className={cn(
              "font-medium text-sm",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {config.name}
            </span>
            <span className="text-xs text-muted-foreground text-center leading-tight">
              {config.description}
            </span>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
