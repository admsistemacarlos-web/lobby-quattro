import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlanoCorretor, planoConfig } from "./PlanoBadge";

interface PlanoSelectProps {
  value: PlanoCorretor | null;
  onChange: (value: PlanoCorretor | null) => void;
  placeholder?: string;
}

const PlanoSelect = ({ value, onChange, placeholder = "Selecionar plano" }: PlanoSelectProps) => {
  const planos = Object.entries(planoConfig) as [PlanoCorretor, typeof planoConfig[PlanoCorretor]][];

  return (
    <Select 
      value={value || undefined} 
      onValueChange={(v) => onChange(v as PlanoCorretor)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {planos.map(([key, config]) => {
          const Icon = config.icon;
          return (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${config.colors.split(' ')[0]}`} />
                <span>{config.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default PlanoSelect;
