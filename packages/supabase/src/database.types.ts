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
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_cierre"]
          extras: number
          factura_id: string | null
          id: string
          monto_total: number
          precio_unitario: number
          semana_inicio: string
          updated_at: string
        }
        Insert: {
          comprometidas: number
          consumidas: number
          created_at?: string
          empresa_id: string
          estado?: Database["public"]["Enums"]["estado_cierre"]
          extras: number
          factura_id?: string | null
          id?: string
          monto_total: number
          precio_unitario: number
          semana_inicio: string
          updated_at?: string
        }
        Update: {
          comprometidas?: number
          consumidas?: number
          created_at?: string
          empresa_id?: string
          estado?: Database["public"]["Enums"]["estado_cierre"]
          extras?: number
          factura_id?: string | null
          id?: string
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
      colaboradores: {
        Row: {
          activo: boolean
          created_at: string
          email: string | null
          empresa_id: string
          id: string
          nombre: string
          telefono: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email?: string | null
          empresa_id: string
          id?: string
          nombre: string
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string | null
          empresa_id?: string
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
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
          colaborador_id: string
          created_at: string
          empresa_id: string
          fecha: string
          id: string
          registrado_por: string | null
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          empresa_id: string
          fecha?: string
          id?: string
          registrado_por?: string | null
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          empresa_id?: string
          fecha?: string
          id?: string
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consumos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
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
      cuotas: {
        Row: {
          activo: boolean
          colaborador_id: string
          created_at: string
          fecha: string
          id: string
          origen: Database["public"]["Enums"]["origen_cuota"]
          updated_at: string
        }
        Insert: {
          activo?: boolean
          colaborador_id: string
          created_at?: string
          fecha: string
          id?: string
          origen?: Database["public"]["Enums"]["origen_cuota"]
          updated_at?: string
        }
        Update: {
          activo?: boolean
          colaborador_id?: string
          created_at?: string
          fecha?: string
          id?: string
          origen?: Database["public"]["Enums"]["origen_cuota"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          activo: boolean
          ciclo_facturacion: Database["public"]["Enums"]["ciclo_facturacion"]
          created_at: string
          id: string
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
          id?: string
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
          id?: string
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
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_factura"]
          id: string
          monto: number
          pdf_url: string | null
          periodo_fin: string
          periodo_inicio: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          empresa_id: string
          estado?: Database["public"]["Enums"]["estado_factura"]
          id?: string
          monto: number
          pdf_url?: string | null
          periodo_fin: string
          periodo_inicio: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          empresa_id?: string
          estado?: Database["public"]["Enums"]["estado_factura"]
          id?: string
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
          id: string
          platillo_id: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          fecha: string
          id?: string
          platillo_id: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          fecha?: string
          id?: string
          platillo_id?: string
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
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          foto_url?: string | null
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          foto_url?: string | null
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuarios_backoffice: {
        Row: {
          activo: boolean
          created_at: string
          nombre: string
          rol: Database["public"]["Enums"]["rol_backoffice"]
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          nombre: string
          rol: Database["public"]["Enums"]["rol_backoffice"]
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          nombre?: string
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
          empresa_id: string
          nombre: string
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          empresa_id: string
          nombre: string
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          empresa_id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_empresa_id_fkey"
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
      auth_user_id_por_email: { Args: { p_email: string }; Returns: string }
      colaboradores_de_mis_empresas: { Args: never; Returns: string[] }
      cuota_disponible: {
        Args: { p_colaborador_id: string; p_fecha: string }
        Returns: boolean
      }
      declarar_cuotas: {
        Args: {
          p_declaracion: Json
          p_empresa_id: string
          p_origen?: Database["public"]["Enums"]["origen_cuota"]
        }
        Returns: Json
      }
      es_finanzas: { Args: never; Returns: boolean }
      es_mesero: { Args: never; Returns: boolean }
      es_super_admin: { Args: never; Returns: boolean }
      generar_cierre_semanal: {
        Args: { p_empresa_id: string; p_semana_inicio: string }
        Returns: Json
      }
      generar_cierres_pendientes: { Args: { p_fecha: string }; Returns: Json }
      get_config: { Args: { p_clave: string }; Returns: Json }
      mis_colaboradores: { Args: never; Returns: string[] }
      mis_empresas_admin: { Args: never; Returns: string[] }
      mis_empresas_colaborador: { Args: never; Returns: string[] }
      registrar_consumo: {
        Args: { p_colaborador_id: string; p_registrado_por: string }
        Returns: {
          colaborador_id: string
          created_at: string
          empresa_id: string
          fecha: string
          id: string
          registrado_por: string | null
        }
        SetofOptions: {
          from: "*"
          to: "consumos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      tiene_algun_rol: { Args: never; Returns: boolean }
    }
    Enums: {
      ciclo_facturacion: "semanal" | "mensual"
      estado_cierre: "abierto" | "cerrado"
      estado_factura: "pendiente" | "pagada" | "cancelada"
      origen_cuota: "declaracion" | "extra"
      rol_backoffice: "super_admin" | "mesero" | "finanzas"
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
      origen_cuota: ["declaracion", "extra"],
      rol_backoffice: ["super_admin", "mesero", "finanzas"],
    },
  },
} as const

