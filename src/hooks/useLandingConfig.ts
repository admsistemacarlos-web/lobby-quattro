import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FormConfig {
  titulo: string;
  subtitulo: string;
  botao_texto: string;
  campos: {
    income: { visivel: boolean; obrigatorio: boolean };
    goal: { visivel: boolean; obrigatorio: boolean };
    down_payment: { visivel: boolean; obrigatorio: boolean };
  };
}

export interface LandingConfig {
  id: string;
  corretor_id: string;
  template_id: string | null;
  whatsapp: string | null;
  email_contato: string | null;
  creci: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  headline_principal: string | null;
  subtitulo: string | null;
  imagem_fundo_url: string | null;
  badges_customizados: string[] | null;
  config_extra: Record<string, unknown> | null;
  form_config: FormConfig | null;
}

export interface LandingTemplate {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  thumbnail_url: string | null;
  planos_permitidos: string[];
  config_padrao: Record<string, unknown>;
  ativo: boolean;
}

export const useLandingConfig = (corretorId: string | undefined) => {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [templates, setTemplates] = useState<LandingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!corretorId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);

      // Fetch landing config
      const { data: configData } = await supabase
        .from("landing_configs")
        .select("*")
        .eq("corretor_id", corretorId)
        .maybeSingle();

      if (configData) {
        setConfig({
          ...configData,
          badges_customizados: configData.badges_customizados as string[] | null,
          config_extra: configData.config_extra as Record<string, unknown> | null,
          form_config: configData.form_config as unknown as FormConfig | null,
        });
      }

      // Fetch templates
      const { data: templatesData } = await supabase
        .from("landing_templates")
        .select("*")
        .eq("ativo", true);

      if (templatesData) {
        setTemplates(templatesData.map(t => ({
          ...t,
          planos_permitidos: t.planos_permitidos || [],
          config_padrao: (t.config_padrao as Record<string, unknown>) || {},
        })));
      }

      setIsLoading(false);
    };

    fetchData();
  }, [corretorId]);

  const saveConfig = async (updates: Partial<LandingConfig>) => {
    if (!corretorId) return { error: "No corretor ID" };

    // Prepare data for Supabase (convert types)
    const supabaseData: Record<string, unknown> = {
      whatsapp: updates.whatsapp || null,
      email_contato: updates.email_contato || null,
      creci: updates.creci || null,
      instagram_url: updates.instagram_url || null,
      facebook_url: updates.facebook_url || null,
      linkedin_url: updates.linkedin_url || null,
      tiktok_url: updates.tiktok_url || null,
      youtube_url: updates.youtube_url || null,
      headline_principal: updates.headline_principal || null,
      subtitulo: updates.subtitulo || null,
      imagem_fundo_url: updates.imagem_fundo_url || null,
      template_id: updates.template_id || null,
      badges_customizados: updates.badges_customizados || null,
      form_config: updates.form_config || null,
    };

    if (config?.id) {
      // Update existing config
      const { error } = await supabase
        .from("landing_configs")
        .update(supabaseData)
        .eq("id", config.id);

      if (!error) {
        setConfig(prev => prev ? { ...prev, ...updates } : null);
      }
      return { error: error?.message };
    } else {
      // Create new config
      const { data, error } = await supabase
        .from("landing_configs")
        .insert({
          corretor_id: corretorId,
          ...supabaseData,
        })
        .select()
        .single();

      if (data) {
        setConfig({
          ...data,
          badges_customizados: data.badges_customizados as string[] | null,
          config_extra: data.config_extra as Record<string, unknown> | null,
          form_config: data.form_config as unknown as FormConfig | null,
        });
      }
      return { error: error?.message };
    }
  };

  return { config, templates, isLoading, saveConfig, setConfig };
};
