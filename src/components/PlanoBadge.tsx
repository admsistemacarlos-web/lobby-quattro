import { Badge } from "@/components/ui/badge";
import { Crown, Star, Award, Gem, Shield, Sparkles } from "lucide-react";

export type PlanoCorretor = 
  | 'lobby_start'
  | 'lobby_pro' 
  | 'lobby_authority'
  | 'partner_start'
  | 'partner_pro'
  | 'partner_authority';

interface PlanoBadgeProps {
  plano: PlanoCorretor | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const planoConfig: Record<PlanoCorretor, {
  label: string;
  icon: typeof Crown;
  colors: string;
  bgGradient: string;
}> = {
  lobby_start: {
    label: 'Lobby Start',
    icon: Star,
    colors: 'text-slate-600 border-slate-400',
    bgGradient: 'bg-gradient-to-r from-slate-100 to-slate-200',
  },
  lobby_pro: {
    label: 'Lobby Pro',
    icon: Sparkles,
    colors: 'text-blue-600 border-blue-400',
    bgGradient: 'bg-gradient-to-r from-blue-100 to-blue-200',
  },
  lobby_authority: {
    label: 'Lobby Authority',
    icon: Award,
    colors: 'text-purple-600 border-purple-400',
    bgGradient: 'bg-gradient-to-r from-purple-100 to-purple-200',
  },
  partner_start: {
    label: 'Partner Start',
    icon: Shield,
    colors: 'text-emerald-600 border-emerald-400',
    bgGradient: 'bg-gradient-to-r from-emerald-100 to-emerald-200',
  },
  partner_pro: {
    label: 'Partner Pro',
    icon: Gem,
    colors: 'text-amber-600 border-amber-400',
    bgGradient: 'bg-gradient-to-r from-amber-100 to-amber-200',
  },
  partner_authority: {
    label: 'Partner Authority',
    icon: Crown,
    colors: 'text-amber-700 border-amber-500',
    bgGradient: 'bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const PlanoBadge = ({ plano, size = 'md', showLabel = true }: PlanoBadgeProps) => {
  if (!plano) {
    return (
      <Badge variant="outline" className={`${sizeClasses[size]} text-muted-foreground border-dashed`}>
        Sem plano
      </Badge>
    );
  }

  const config = planoConfig[plano];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`
        ${sizeClasses[size]} 
        ${config.colors} 
        ${config.bgGradient}
        font-semibold
        border
        inline-flex items-center
        shadow-sm
      `}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
};

export default PlanoBadge;
