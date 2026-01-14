-- Add form configuration to landing_configs
ALTER TABLE public.landing_configs 
ADD COLUMN IF NOT EXISTS form_config jsonb DEFAULT '{
  "titulo": "Receba uma Consultoria Gratuita",
  "subtitulo": "Preencha o formulário e entraremos em contato",
  "botao_texto": "Quero minha consultoria agora",
  "campos": {
    "income": {"visivel": true, "obrigatorio": false},
    "goal": {"visivel": true, "obrigatorio": false},
    "down_payment": {"visivel": true, "obrigatorio": false}
  }
}'::jsonb;