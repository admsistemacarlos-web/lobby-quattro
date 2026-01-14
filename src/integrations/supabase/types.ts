export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anuncios: {
        Row: {
          corretor_id: string
          created_at: string
          has_custom_landing: boolean
          headline_custom: string | null
          id: string
          imagem_fundo_url: string | null
          nome: string
          plataforma: string | null
          slug: string
          status: string
          subtitulo_custom: string | null
          updated_at: string
        }
        Insert: {
          corretor_id: string
          created_at?: string
          has_custom_landing?: boolean
          headline_custom?: string | null
          id?: string
          imagem_fundo_url?: string | null
          nome: string
          plataforma?: string | null
          slug: string
          status?: string
          subtitulo_custom?: string | null
          updated_at?: string
        }
        Update: {
          corretor_id?: string
          created_at?: string
          has_custom_landing?: boolean
          headline_custom?: string | null
          id?: string
          imagem_fundo_url?: string | null
          nome?: string
          plataforma?: string | null
          slug?: string
          status?: string
          subtitulo_custom?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anuncios_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "corretores"
            referencedColumns: ["id"]
          },
        ]
      }
      corretor_invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          nome: string | null
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          nome?: string | null
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          nome?: string | null
          status?: string
          token?: string
        }
        Relationships: []
      }
      corretores: {
        Row: {
          ativo: boolean | null
          cor_primaria: string | null
          created_at: string
          creci: string | null
          email: string
          id: string
          logo_url: string | null
          nome: string
          plano: Database["public"]["Enums"]["plano_corretor"] | null
          slug: string
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor_primaria?: string | null
          created_at?: string
          creci?: string | null
          email: string
          id?: string
          logo_url?: string | null
          nome: string
          plano?: Database["public"]["Enums"]["plano_corretor"] | null
          slug: string
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor_primaria?: string | null
          created_at?: string
          creci?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          nome?: string
          plano?: Database["public"]["Enums"]["plano_corretor"] | null
          slug?: string
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      landing_configs: {
        Row: {
          badges_customizados: Json | null
          config_extra: Json | null
          corretor_id: string
          created_at: string
          creci: string | null
          email_contato: string | null
          facebook_url: string | null
          form_config: Json | null
          headline_principal: string | null
          id: string
          imagem_fundo_url: string | null
          instagram_url: string | null
          linkedin_url: string | null
          subtitulo: string | null
          template_id: string | null
          tiktok_url: string | null
          updated_at: string
          whatsapp: string | null
          youtube_url: string | null
        }
        Insert: {
          badges_customizados?: Json | null
          config_extra?: Json | null
          corretor_id: string
          created_at?: string
          creci?: string | null
          email_contato?: string | null
          facebook_url?: string | null
          form_config?: Json | null
          headline_principal?: string | null
          id?: string
          imagem_fundo_url?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          subtitulo?: string | null
          template_id?: string | null
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Update: {
          badges_customizados?: Json | null
          config_extra?: Json | null
          corretor_id?: string
          created_at?: string
          creci?: string | null
          email_contato?: string | null
          facebook_url?: string | null
          form_config?: Json | null
          headline_principal?: string | null
          id?: string
          imagem_fundo_url?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          subtitulo?: string | null
          template_id?: string | null
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_configs_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: true
            referencedRelation: "corretores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_configs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "landing_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_templates: {
        Row: {
          ativo: boolean | null
          config_padrao: Json | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          planos_permitidos: string[] | null
          slug: string
          thumbnail_url: string | null
        }
        Insert: {
          ativo?: boolean | null
          config_padrao?: Json | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          planos_permitidos?: string[] | null
          slug: string
          thumbnail_url?: string | null
        }
        Update: {
          ativo?: boolean | null
          config_padrao?: Json | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          planos_permitidos?: string[] | null
          slug?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          anuncio_id: string | null
          corretor_id: string | null
          created_at: string
          crm_status: string | null
          down_payment: string | null
          email: string
          empreendimento: string | null
          goal: string | null
          id: string
          income: string | null
          name: string
          phone: string
          temperature: string | null
          valor_estimado: number | null
        }
        Insert: {
          anuncio_id?: string | null
          corretor_id?: string | null
          created_at?: string
          crm_status?: string | null
          down_payment?: string | null
          email: string
          empreendimento?: string | null
          goal?: string | null
          id?: string
          income?: string | null
          name: string
          phone: string
          temperature?: string | null
          valor_estimado?: number | null
        }
        Update: {
          anuncio_id?: string | null
          corretor_id?: string | null
          created_at?: string
          crm_status?: string | null
          down_payment?: string | null
          email?: string
          empreendimento?: string | null
          goal?: string | null
          id?: string
          income?: string | null
          name?: string
          phone?: string
          temperature?: string | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "anuncios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "corretores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_corretor_invite: {
        Args: {
          p_cor_primaria?: string
          p_email: string
          p_invite_id: string
          p_logo_url?: string
          p_nome: string
          p_slug?: string
          p_telefone?: string
        }
        Returns: string
      }
      create_corretor_profile:
        | {
            Args: {
              p_cor_primaria?: string
              p_email: string
              p_logo_url?: string
              p_nome: string
              p_slug?: string
              p_telefone?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_cor_primaria?: string
              p_creci?: string
              p_email: string
              p_logo_url?: string
              p_nome: string
              p_slug?: string
              p_telefone?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_cor_primaria?: string
              p_creci?: string
              p_email: string
              p_logo_url?: string
              p_nome: string
              p_plano?: string
              p_slug?: string
              p_telefone?: string
            }
            Returns: string
          }
      get_corretor_by_slug: {
        Args: { p_slug: string }
        Returns: {
          cor_primaria: string
          email: string
          id: string
          logo_url: string
          nome: string
          slug: string
          telefone: string
        }[]
      }
      get_landing_page_data: {
        Args: { slug_anuncio?: string; slug_corretor: string }
        Returns: Json
      }
      get_public_corretor_profile: {
        Args: { slug_input: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_corretor: { Args: { _user_id: string }; Returns: boolean }
      validate_invite_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          id: string
          nome: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "corretor"
      plano_corretor:
        | "lobby_start"
        | "lobby_pro"
        | "lobby_authority"
        | "partner_start"
        | "partner_pro"
        | "partner_authority"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "corretor"],
      plano_corretor: [
        "lobby_start",
        "lobby_pro",
        "lobby_authority",
        "partner_start",
        "partner_pro",
        "partner_authority",
      ],
    },
  },
} as const
