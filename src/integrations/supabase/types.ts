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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_stock_log: {
        Row: {
          admin_user_id: string | null
          change_amount: number
          change_type: string
          created_at: string
          id: string
          new_stock: number
          notes: string | null
          previous_stock: number
          product_id: string | null
          product_name_snapshot: string
        }
        Insert: {
          admin_user_id?: string | null
          change_amount: number
          change_type: string
          created_at?: string
          id?: string
          new_stock: number
          notes?: string | null
          previous_stock: number
          product_id?: string | null
          product_name_snapshot: string
        }
        Update: {
          admin_user_id?: string | null
          change_amount?: number
          change_type?: string
          created_at?: string
          id?: string
          new_stock?: number
          notes?: string | null
          previous_stock?: number
          product_id?: string | null
          product_name_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_stock_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_stock_log_product_id_fkey_real"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      archived_orders: {
        Row: {
          archived_at: string
          archived_by: string | null
          client_address: string
          client_city: string
          client_name: string
          client_phone: string
          discount_applied: number | null
          final_price: number
          id: string
          notes: string | null
          original_created_at: string | null
          original_order_id: string
          original_updated_at: string | null
          product_id: string | null
          product_name_snapshot: string
          product_price_snapshot: number
          short_id: string | null
          size_selected: string
          status: string | null
          status_change_history: Json | null
          status_change_reason: string | null
        }
        Insert: {
          archived_at?: string
          archived_by?: string | null
          client_address: string
          client_city: string
          client_name: string
          client_phone: string
          discount_applied?: number | null
          final_price: number
          id?: string
          notes?: string | null
          original_created_at?: string | null
          original_order_id: string
          original_updated_at?: string | null
          product_id?: string | null
          product_name_snapshot: string
          product_price_snapshot: number
          short_id?: string | null
          size_selected: string
          status?: string | null
          status_change_history?: Json | null
          status_change_reason?: string | null
        }
        Update: {
          archived_at?: string
          archived_by?: string | null
          client_address?: string
          client_city?: string
          client_name?: string
          client_phone?: string
          discount_applied?: number | null
          final_price?: number
          id?: string
          notes?: string | null
          original_created_at?: string | null
          original_order_id?: string
          original_updated_at?: string | null
          product_id?: string | null
          product_name_snapshot?: string
          product_price_snapshot?: number
          short_id?: string | null
          size_selected?: string
          status?: string | null
          status_change_history?: Json | null
          status_change_reason?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      featured_products: {
        Row: {
          created_at: string | null
          id: string
          position: number
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          position?: number
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          client_address: string
          client_city: string
          client_name: string
          client_phone: string
          created_at: string | null
          discount_applied: number | null
          final_price: number
          id: string
          notes: string | null
          product_id: string | null
          product_name_snapshot: string
          product_price_snapshot: number
          short_id: string | null
          size_selected: string
          status: string | null
          status_change_history: Json | null
          status_change_reason: string | null
          updated_at: string | null
        }
        Insert: {
          client_address: string
          client_city: string
          client_name: string
          client_phone: string
          created_at?: string | null
          discount_applied?: number | null
          final_price: number
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name_snapshot: string
          product_price_snapshot: number
          short_id?: string | null
          size_selected: string
          status?: string | null
          status_change_history?: Json | null
          status_change_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          client_address?: string
          client_city?: string
          client_name?: string
          client_phone?: string
          created_at?: string | null
          discount_applied?: number | null
          final_price?: number
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name_snapshot?: string
          product_price_snapshot?: number
          short_id?: string | null
          size_selected?: string
          status?: string | null
          status_change_history?: Json | null
          status_change_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          images: string[]
          is_active: boolean | null
          name: string
          price: number
          season: string | null
          size_options: Json
          slug: string
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          images?: string[]
          is_active?: boolean | null
          name: string
          price: number
          season?: string | null
          size_options?: Json
          slug: string
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          images?: string[]
          is_active?: boolean | null
          name?: string
          price?: number
          season?: string | null
          size_options?: Json
          slug?: string
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string | null
          discount_percent: number
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          season: string | null
          start_date: string | null
          target_ids: string[]
          target_type: string
        }
        Insert: {
          created_at?: string | null
          discount_percent: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          season?: string | null
          start_date?: string | null
          target_ids?: string[]
          target_type: string
        }
        Update: {
          created_at?: string | null
          discount_percent?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          season?: string | null
          start_date?: string | null
          target_ids?: string[]
          target_type?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          delivery_zones: string | null
          id: string
          low_stock_threshold: number | null
          notifications_enabled: boolean | null
          show_footer_credit: boolean | null
          telegram_bot_token: string | null
          telegram_chat_id: string | null
          telegram_username: string | null
          updated_at: string | null
          whatsapp_api_token: string | null
          whatsapp_number: string | null
          whatsapp_phone_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_zones?: string | null
          id?: string
          low_stock_threshold?: number | null
          notifications_enabled?: boolean | null
          show_footer_credit?: boolean | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          telegram_username?: string | null
          updated_at?: string | null
          whatsapp_api_token?: string | null
          whatsapp_number?: string | null
          whatsapp_phone_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_zones?: string | null
          id?: string
          low_stock_threshold?: number | null
          notifications_enabled?: boolean | null
          show_footer_credit?: boolean | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          telegram_username?: string | null
          updated_at?: string | null
          whatsapp_api_token?: string | null
          whatsapp_number?: string | null
          whatsapp_phone_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_settings: {
        Row: {
          delivery_zones: string | null
          low_stock_threshold: number | null
          notifications_enabled: boolean | null
          show_footer_credit: boolean | null
          telegram_username: string | null
          whatsapp_number: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_and_clear_orders: {
        Args: { p_order_ids: string[] }
        Returns: {
          archived_count: number
        }[]
      }
      bulk_update_stock: {
        Args: {
          p_amount: number
          p_product_ids: string[]
          p_update_mode: string
        }
        Returns: {
          new_stock: number
          previous_stock: number
          product_id: string
        }[]
      }
      calculate_product_final_price: {
        Args: { p_product_id: string }
        Returns: {
          discount_percent: number
          final_price: number
          original_price: number
          sale_name: string
        }[]
      }
      create_order: {
        Args: {
          p_client_address: string
          p_client_city: string
          p_client_name: string
          p_client_phone: string
          p_notes?: string
          p_product_id: string
          p_size_selected: string
        }
        Returns: {
          id: string
          short_id: string
        }[]
      }
      decrement_stock: {
        Args: { p_product_id: string; p_quantity?: number }
        Returns: boolean
      }
      generate_short_id: { Args: never; Returns: string }
      get_public_settings: {
        Args: never
        Returns: {
          delivery_zones: string
          low_stock_threshold: number
          notifications_enabled: boolean
          show_footer_credit: boolean
          telegram_username: string
          whatsapp_number: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_stock_change: {
        Args: {
          p_change_type: string
          p_new_stock: number
          p_notes?: string
          p_previous_stock: number
          p_product_id: string
        }
        Returns: string
      }
      restore_stock: {
        Args: { p_product_id: string; p_quantity?: number }
        Returns: undefined
      }
      validate_order_status_transition: {
        Args: { p_current_status: string; p_new_status: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
