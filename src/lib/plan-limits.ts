export type PlanoCorretor = 
  | 'lobby_start' 
  | 'lobby_pro' 
  | 'lobby_authority' 
  | 'partner_start' 
  | 'partner_pro' 
  | 'partner_authority';

interface PlanLimits {
  customLandingPages: number;
}

export const PLAN_LIMITS: Record<PlanoCorretor, PlanLimits> = {
  lobby_start: { customLandingPages: 0 },
  lobby_pro: { customLandingPages: 4 },
  lobby_authority: { customLandingPages: 10 },
  partner_start: { customLandingPages: 0 },
  partner_pro: { customLandingPages: 4 },
  partner_authority: { customLandingPages: 10 },
};

export function canCreateCustomLandingPage(plano: PlanoCorretor | null): boolean {
  if (!plano) return false;
  return PLAN_LIMITS[plano]?.customLandingPages > 0;
}

export function getCustomLandingPageLimit(plano: PlanoCorretor | null): number {
  if (!plano) return 0;
  return PLAN_LIMITS[plano]?.customLandingPages ?? 0;
}
