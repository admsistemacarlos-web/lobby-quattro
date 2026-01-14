-- Add CRM fields to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS crm_status TEXT DEFAULT 'novo';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS temperature TEXT DEFAULT 'morno';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS empreendimento TEXT;

-- Add check constraints for valid values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_crm_status') THEN
    ALTER TABLE public.leads ADD CONSTRAINT valid_crm_status 
      CHECK (crm_status IN ('novo', 'em_atendimento', 'visita_agendada', 'proposta', 'vendido'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_temperature') THEN
    ALTER TABLE public.leads ADD CONSTRAINT valid_temperature 
      CHECK (temperature IN ('quente', 'morno', 'frio'));
  END IF;
END $$;