export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cierres_semanales: {
        Row: {
          comprometidas: number
          consumidas: number
          created_at: string
          empresa_id: number
          estado: Database["public"]["Enums"]["estado_cierre"]
          extras: number
          factura_id: number | null
          id: number
          monto_total: number
          precio_unitario: number
          semana_inicio: string
          updated_at: string
        }
        Insert: {
          comprometidas: number
          consumidas: number
          created_at?: string
          empresa_id: number
          estado?: Database["public"]["Enums"]["estado_cierre"]
          extras: number
          factura_id?: number | null
          id?: number
          monto_total: number
          precio_unitario: number
          semana_inicio: string
          updated_at?: string
        }
        Update: {
          comprometidas?: number
          consumidas?: number
          created_at?: string
          empresa_id?: number
          estado?: Database["public"]["Enums"]["estado_cierre"]
          extras?: number
          factura_id?: number | null
          id?: number
          monto_total?: number
          precio_unitario?: number
          semana_inicio?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cierres_semanales_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cierres_semanales_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
        ]
      }
      comensales: {
        Row: {
          activo: boolean
          consumo_libre: boolean
          created_at: string
          id: number
          updated_at: string
          usuario_id: number
        }
        Insert: {
          activo?: boolean
          consumo_libre?: boolean
          created_at?: string
          id?: number
          updated_at?: string
          usuario_id: number
        }
        Update: {
          activo?: boolean
          consumo_libre?: boolean
          created_at?: string
          id?: number
          updated_at?: string
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "comensales_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios_portal_empresarial"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_sistema: {
        Row: {
          clave: string
          descripcion: string | null
          updated_at: string
          valor: Json
        }
        Insert: {
          clave: string
          descripcion?: string | null
          updated_at?: string
          valor: Json
        }
        Update: {
          clave?: string
          descripcion?: string | null
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      consumos: {
        Row: {
          comensal_id: number
          created_at: string
          empresa_id: number
          fecha: string
          id: number
          registrado_por: string | null
        }
        Insert: {
          comensal_id: number
          created_at?: string
          empresa_id: number
          fecha?: string
          id?: number
          registrado_por?: string | null
        }
        Update: {
          comensal_id?: number
          created_at?: string
          empresa_id?: number
          fecha?: string
          id?: number
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consumos_comensal_id_fkey"
            columns: ["comensal_id"]
            isOneToOne: false
            referencedRelation: "comensales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumos_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios_backoffice"
            referencedColumns: ["user_id"]
          },
        ]
      }
      credenciales_qr: {
        Row: {
          activo: boolean
          comensal_id: number
          created_at: string
          id: number
          qr_token: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          comensal_id: number
          created_at?: string
          id?: number
          qr_token?: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          comensal_id?: number
          created_at?: string
          id?: number
          qr_token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credenciales_qr_comensal_id_fkey"
            columns: ["comensal_id"]
            isOneToOne: false
            referencedRelation: "comensales"
            referencedColumns: ["id"]
          },
        ]
      }
      cuotas: {
        Row: {
          activo: boolean
          comensal_id: number
          created_at: string
          fecha: string
          id: number
          origen: Database["public"]["Enums"]["origen_cuota"]
          updated_at: string
        }
        Insert: {
          activo?: boolean
          comensal_id: number
          created_at?: string
          fecha: string
          id?: number
          origen?: Database["public"]["Enums"]["origen_cuota"]
          updated_at?: string
        }
        Update: {
          activo?: boolean
          comensal_id?: number
          created_at?: string
          fecha?: string
          id?: number
          origen?: Database["public"]["Enums"]["origen_cuota"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_comensal_id_fkey"
            columns: ["comensal_id"]
            isOneToOne: false
            referencedRelation: "comensales"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          activo: boolean
          ciclo_facturacion: Database["public"]["Enums"]["ciclo_facturacion"]
          created_at: string
          dias_permitidos: number[]
          id: number
          limite_diario: number | null
          modo_consumo: Database["public"]["Enums"]["modo_consumo"]
          nombre_comercial: string | null
          precio_comida: number
          razon_social: string | null
          rfc: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          ciclo_facturacion?: Database["public"]["Enums"]["ciclo_facturacion"]
          created_at?: string
          dias_permitidos?: number[]
          id?: number
          limite_diario?: number | null
          modo_consumo?: Database["public"]["Enums"]["modo_consumo"]
          nombre_comercial?: string | null
          precio_comida: number
          razon_social?: string | null
          rfc?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          ciclo_facturacion?: Database["public"]["Enums"]["ciclo_facturacion"]
          created_at?: string
          dias_permitidos?: number[]
          id?: number
          limite_diario?: number | null
          modo_consumo?: Database["public"]["Enums"]["modo_consumo"]
          nombre_comercial?: string | null
          precio_comida?: number
          razon_social?: string | null
          rfc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      facturas: {
        Row: {
          activo: boolean
          created_at: string
          empresa_id: number
          estado: Database["public"]["Enums"]["estado_factura"]
          id: number
          monto: number
          pdf_url: string | null
          periodo_fin: string
          periodo_inicio: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          empresa_id: number
          estado?: Database["public"]["Enums"]["estado_factura"]
          id?: number
          monto: number
          pdf_url?: string | null
          periodo_fin: string
          periodo_inicio: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          empresa_id?: number
          estado?: Database["public"]["Enums"]["estado_factura"]
          id?: number
          monto?: number
          pdf_url?: string | null
          periodo_fin?: string
          periodo_inicio?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facturas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_dias: {
        Row: {
          activo: boolean
          created_at: string
          fecha: string
          id: number
          platillo_id: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          fecha: string
          id?: number
          platillo_id: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          fecha?: string
          id?: number
          platillo_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_dias_platillo_id_fkey"
            columns: ["platillo_id"]
            isOneToOne: false
            referencedRelation: "platillos"
            referencedColumns: ["id"]
          },
        ]
      }
      platillos: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          foto_url: string | null
          id: number
          nombre: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          foto_url?: string | null
          id?: number
          nombre: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          foto_url?: string | null
          id?: number
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles_portal_empresarial: {
        Row: {
          activo: boolean
          created_at: string
          rol: Database["public"]["Enums"]["rol_portal"]
          updated_at: string
          usuario_id: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          rol: Database["public"]["Enums"]["rol_portal"]
          updated_at?: string
          usuario_id: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          rol?: Database["public"]["Enums"]["rol_portal"]
          updated_at?: string
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "roles_portal_empresarial_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios_portal_empresarial"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_backoffice: {
        Row: {
          activo: boolean
          created_at: string
          debe_cambiar_password: boolean
          eliminado_en: string | null
          nombre: string
          password_reseteada_en: string | null
          password_reseteada_por: string | null
          rol: Database["public"]["Enums"]["rol_backoffice"]
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          debe_cambiar_password?: boolean
          eliminado_en?: string | null
          nombre: string
          password_reseteada_en?: string | null
          password_reseteada_por?: string | null
          rol: Database["public"]["Enums"]["rol_backoffice"]
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          debe_cambiar_password?: boolean
          eliminado_en?: string | null
          nombre?: string
          password_reseteada_en?: string | null
          password_reseteada_por?: string | null
          rol?: Database["public"]["Enums"]["rol_backoffice"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usuarios_portal_empresarial: {
        Row: {
          activo: boolean
          created_at: string
          eliminado_en: string | null
          email: string | null
          empresa_id: number
          id: number
          nombre: string
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          eliminado_en?: string | null
          email?: string | null
          empresa_id: number
          id?: number
          nombre: string
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          eliminado_en?: string | null
          email?: string | null
          empresa_id?: number
          id?: number
          nombre?: string
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_portal_empresarial_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      asignar_rol_unico: {
        Args: {
          p_rol: Database["public"]["Enums"]["rol_portal"]
          p_usuario_id: number
        }
        Returns: Json
      }
      auth_user_id_por_email: { Args: { p_email: string }; Returns: string }
      cambiar_rol_backoffice: {
        Args: {
          p_rol: Database["public"]["Enums"]["rol_backoffice"]
          p_user_id: string
        }
        Returns: undefined
      }
      comensales_de_mis_empresas: { Args: never; Returns: number[] }
      confirmar_cambio_password_backoffice: { Args: never; Returns: undefined }
      cuota_disponible: {
        Args: { p_comensal_id: number; p_fecha: string }
        Returns: boolean
      }
      declarar_cuotas: {
        Args: {
          p_declaracion: Json
          p_empresa_id: number
          p_origen?: Database["public"]["Enums"]["origen_cuota"]
        }
        Returns: Json
      }
      eliminar_usuario_backoffice: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      eliminar_usuario_portal: {
        Args: { p_usuario_id: number }
        Returns: undefined
      }
      es_capitan_meseros: { Args: never; Returns: boolean }
      es_consulta: { Args: never; Returns: boolean }
      es_finanzas: { Args: never; Returns: boolean }
      es_mesero: { Args: never; Returns: boolean }
      es_super_admin: { Args: never; Returns: boolean }
      establecer_comida_comensal: {
        Args: { p_activo: boolean; p_usuario_id: number }
        Returns: Json
      }
      establecer_consumo_libre: {
        Args: { p_activo: boolean; p_usuario_id: number }
        Returns: Json
      }
      establecer_estado_backoffice: {
        Args: { p_activo: boolean; p_user_id: string }
        Returns: undefined
      }
      establecer_estado_portal: {
        Args: { p_activo: boolean; p_usuario_id: number }
        Returns: Json
      }
      establecer_rol_portal: {
        Args: {
          p_activo: boolean
          p_rol: Database["public"]["Enums"]["rol_portal"]
          p_usuario_id: number
        }
        Returns: Json
      }
      generar_cierre_semanal: {
        Args: { p_empresa_id: number; p_semana_inicio: string }
        Returns: Json
      }
      generar_cierres_pendientes: { Args: { p_fecha: string }; Returns: Json }
      get_config: { Args: { p_clave: string }; Returns: Json }
      listar_usuarios_backoffice: {
        Args: never
        Returns: {
          activo: boolean
          debe_cambiar_password: boolean
          email: string
          nombre: string
          rol: Database["public"]["Enums"]["rol_backoffice"]
          user_id: string
        }[]
      }
      mi_perfil_backoffice: { Args: never; Returns: Json }
      mis_comensales: { Args: never; Returns: number[] }
      mis_empresas_admin: { Args: never; Returns: number[] }
      mis_empresas_comensal: { Args: never; Returns: number[] }
      registrar_consumo: {
        Args: { p_qr_token: string; p_registrado_por: string }
        Returns: Json
      }
      resumen_empresa: { Args: { p_empresa_id: number }; Returns: Json }
      tiene_algun_rol: { Args: never; Returns: boolean }
      usuarios_de_mis_empresas: { Args: never; Returns: number[] }
    }
    Enums: {
      ciclo_facturacion: "semanal" | "mensual"
      estado_cierre: "abierto" | "cerrado"
      estado_factura: "pendiente" | "pagada" | "cancelada"
      modo_consumo: "declaracion" | "libre"
      origen_cuota: "declaracion" | "extra"
      rol_backoffice:
        | "super_admin"
        | "mesero"
        | "finanzas"
        | "consulta"
        | "capitan_meseros"
      rol_portal: "admin" | "colaborador"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ciclo_facturacion: ["semanal", "mensual"],
      estado_cierre: ["abierto", "cerrado"],
      estado_factura: ["pendiente", "pagada", "cancelada"],
      modo_consumo: ["declaracion", "libre"],
      origen_cuota: ["declaracion", "extra"],
      rol_backoffice: [
        "super_admin",
        "mesero",
        "finanzas",
        "consulta",
        "capitan_meseros",
      ],
      rol_portal: ["admin", "colaborador"],
    },
  },
} as const

