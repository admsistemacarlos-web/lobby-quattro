import { useState } from "react";
import { PlanoCorretor, planoConfig } from "@/components/PlanoBadge";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanSelectorProps {
  value: PlanoCorretor | null;
  onChange: (value: PlanoCorretor) => void;
}

type PlanType = "assinatura" | "parceria";

const planDetails: Record<PlanoCorretor, {
  price: string;
  setup?: string;
  features: string[];
  recommended?: boolean;
}> = {
  lobby_start: {
    price: "R$ 700/mês",
    setup: "R$ 1.000 setup",
    features: ["Landing page padrão", "Rastreamento de leads"],
  },
  lobby_pro: {
    price: "R$ 1.000/mês",
    setup: "R$ 2.200 setup",
    features: ["4 landing pages", "CRM integrado", "Gestão de tráfego"],
    recommended: true,
  },
  lobby_authority: {
    price: "R$ 2.200/mês",
    setup: "R$ 3.500 setup",
    features: ["10 landing pages", "Produção de vídeos", "Automação completa"],
  },
  partner_start: {
    price: "R$ 500/mês",
    features: ["Landing page padrão", "Comissão 20%"],
  },
  partner_pro: {
    price: "R$ 900/mês",
    features: ["4 landing pages", "CRM integrado", "Comissão 40%"],
    recommended: true,
  },
  partner_authority: {
    price: "R$ 1.500/mês",
    features: ["10 landing pages", "Produção de vídeos", "Comissão 50%"],
  },
};

const assinaturaPlans: PlanoCorretor[] = ["lobby_start", "lobby_pro", "lobby_authority"];
const parceriaPlans: PlanoCorretor[] = ["partner_start", "partner_pro", "partner_authority"];

const PlanSelector = ({ value, onChange }: PlanSelectorProps) => {
  const [planType, setPlanType] = useState<PlanType>("assinatura");

  const currentPlans = planType === "assinatura" ? assinaturaPlans : parceriaPlans;

  return (
    <div className="space-y-6">
      {/* Plan Type Toggle */}
      <div className="flex rounded-lg border border-border p-1 bg-muted/50">
        <button
          type="button"
          onClick={() => setPlanType("assinatura")}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
            planType === "assinatura"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Assinatura
        </button>
        <button
          type="button"
          onClick={() => setPlanType("parceria")}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
            planType === "parceria"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Parceria
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-3">
        {currentPlans.map((planKey) => {
          const config = planoConfig[planKey];
          const details = planDetails[planKey];
          const Icon = config.icon;
          const isSelected = value === planKey;

          return (
            <button
              key={planKey}
              type="button"
              onClick={() => onChange(planKey)}
              className={cn(
                "relative w-full text-left p-4 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-background"
              )}
            >
              {details.recommended && (
                <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Recomendado
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    config.bgGradient
                  )}>
                    <Icon className={cn("w-5 h-5", config.colors.split(" ")[0])} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {config.label}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-primary mb-2">
                      {details.price}
                      {details.setup && (
                        <span className="text-muted-foreground font-normal ml-1">
                          + {details.setup}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {details.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={cn(
                  "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                )}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info text */}
      <p className="text-xs text-center text-muted-foreground">
        {planType === "assinatura"
          ? "Planos com taxa de setup e mensalidade fixa"
          : "Planos com mensalidade reduzida e comissão sobre vendas"}
      </p>
    </div>
  );
};

export default PlanSelector;
