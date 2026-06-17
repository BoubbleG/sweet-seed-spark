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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          admin_password_hash: string | null
          created_at: string
          id: number
          updated_at: string
        }
        Insert: {
          admin_password_hash?: string | null
          created_at?: string
          id?: number
          updated_at?: string
        }
        Update: {
          admin_password_hash?: string | null
          created_at?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          banner_url: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          address: string | null
          created_at: string
          id: string
          last_order_at: string
          name: string | null
          neighborhood: string | null
          payment_method: string | null
          phone: string
          reference: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          last_order_at?: string
          name?: string | null
          neighborhood?: string | null
          payment_method?: string | null
          phone: string
          reference?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          last_order_at?: string
          name?: string | null
          neighborhood?: string | null
          payment_method?: string | null
          phone?: string
          reference?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          product_name: string
          quantity: number
          size: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          product_name: string
          quantity?: number
          size?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          product_name?: string
          quantity?: number
          size?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          change_for: number | null
          created_at: string
          customer_address: string | null
          customer_name: string
          customer_neighborhood: string | null
          customer_phone: string | null
          customer_reference: string | null
          delivery_fee: number
          id: string
          notes: string | null
          order_number: number
          order_type: string
          payment_method: string | null
          printed_at: string | null
          restaurant_id: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          change_for?: number | null
          created_at?: string
          customer_address?: string | null
          customer_name: string
          customer_neighborhood?: string | null
          customer_phone?: string | null
          customer_reference?: string | null
          delivery_fee?: number
          id?: string
          notes?: string | null
          order_number?: number
          order_type?: string
          payment_method?: string | null
          printed_at?: string | null
          restaurant_id: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          change_for?: number | null
          created_at?: string
          customer_address?: string | null
          customer_name?: string
          customer_neighborhood?: string | null
          customer_phone?: string | null
          customer_reference?: string | null
          delivery_fee?: number
          id?: string
          notes?: string | null
          order_number?: number
          order_type?: string
          payment_method?: string | null
          printed_at?: string | null
          restaurant_id?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_groups: {
        Row: {
          created_at: string
          display_order: number
          id: string
          max_select: number
          min_select: number
          name: string
          pricing_mode: Database["public"]["Enums"]["option_pricing_mode"]
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          max_select?: number
          min_select?: number
          name: string
          pricing_mode?: Database["public"]["Enums"]["option_pricing_mode"]
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          max_select?: number
          min_select?: number
          name?: string
          pricing_mode?: Database["public"]["Enums"]["option_pricing_mode"]
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          display_order: number
          extra_price: number
          group_id: string
          id: string
          is_available: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          extra_price?: number
          group_id: string
          id?: string
          is_available?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          extra_price?: number
          group_id?: string
          id?: string
          is_available?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_option_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          estimated_time: string | null
          has_sizes: boolean
          id: string
          image_url: string | null
          internal_notes: string | null
          is_available: boolean | null
          is_best_seller: boolean | null
          is_featured: boolean | null
          is_on_promo: boolean
          name: string
          nutritional_info: string | null
          options: Json | null
          price: number
          price_g: number | null
          price_m: number | null
          price_p: number | null
          promo_label: string | null
          promo_price: number | null
          restaurant_id: string
          sides_note: string | null
          updated_at: string | null
          variants: Json | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          estimated_time?: string | null
          has_sizes?: boolean
          id?: string
          image_url?: string | null
          internal_notes?: string | null
          is_available?: boolean | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_on_promo?: boolean
          name: string
          nutritional_info?: string | null
          options?: Json | null
          price: number
          price_g?: number | null
          price_m?: number | null
          price_p?: number | null
          promo_label?: string | null
          promo_price?: number | null
          restaurant_id: string
          sides_note?: string | null
          updated_at?: string | null
          variants?: Json | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          estimated_time?: string | null
          has_sizes?: boolean
          id?: string
          image_url?: string | null
          internal_notes?: string | null
          is_available?: boolean | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_on_promo?: boolean
          name?: string
          nutritional_info?: string | null
          options?: Json | null
          price?: number
          price_g?: number | null
          price_m?: number | null
          price_p?: number | null
          promo_label?: string | null
          promo_price?: number | null
          restaurant_id?: string
          sides_note?: string | null
          updated_at?: string | null
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_edit_tokens: {
        Row: {
          created_at: string
          edit_token: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          edit_token: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          edit_token?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_edit_tokens_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_pin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_used_at: string
          restaurant_id: string
          session_token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          last_used_at?: string
          restaurant_id: string
          session_token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_used_at?: string
          restaurant_id?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_pin_sessions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_snapshots: {
        Row: {
          created_at: string
          id: string
          label: string
          restaurant_id: string
          scope: string
          snapshot: Json
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          restaurant_id: string
          scope?: string
          snapshot: Json
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          restaurant_id?: string
          scope?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_snapshots_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          accepts_delivery: boolean
          accepts_pickup: boolean
          address: string | null
          average_delivery_time: string | null
          background_color: string | null
          banner_url: string | null
          border_radius: string | null
          business_type: string
          button_color: string | null
          card_style: string | null
          category_layout: string | null
          city: string | null
          created_at: string | null
          custom_css: string | null
          delivery_fee: number | null
          description: string | null
          font_family: string | null
          header_style: string | null
          id: string
          instagram: string | null
          is_demo: boolean
          logo_url: string | null
          min_order_for_free_delivery: number | null
          name: string
          opening_hours: string | null
          payment_methods: Json
          pin_failed_attempts: number
          pin_hash: string | null
          pin_locked_until: string | null
          primary_color: string | null
          product_card_layout: string | null
          secondary_color: string | null
          show_categories: boolean | null
          show_delivery_status: boolean | null
          show_search: boolean | null
          slug: string
          status: string | null
          text_color: string | null
          updated_at: string | null
          visual_style: string | null
          whatsapp: string
        }
        Insert: {
          accepts_delivery?: boolean
          accepts_pickup?: boolean
          address?: string | null
          average_delivery_time?: string | null
          background_color?: string | null
          banner_url?: string | null
          border_radius?: string | null
          business_type: string
          button_color?: string | null
          card_style?: string | null
          category_layout?: string | null
          city?: string | null
          created_at?: string | null
          custom_css?: string | null
          delivery_fee?: number | null
          description?: string | null
          font_family?: string | null
          header_style?: string | null
          id?: string
          instagram?: string | null
          is_demo?: boolean
          logo_url?: string | null
          min_order_for_free_delivery?: number | null
          name: string
          opening_hours?: string | null
          payment_methods?: Json
          pin_failed_attempts?: number
          pin_hash?: string | null
          pin_locked_until?: string | null
          primary_color?: string | null
          product_card_layout?: string | null
          secondary_color?: string | null
          show_categories?: boolean | null
          show_delivery_status?: boolean | null
          show_search?: boolean | null
          slug: string
          status?: string | null
          text_color?: string | null
          updated_at?: string | null
          visual_style?: string | null
          whatsapp: string
        }
        Update: {
          accepts_delivery?: boolean
          accepts_pickup?: boolean
          address?: string | null
          average_delivery_time?: string | null
          background_color?: string | null
          banner_url?: string | null
          border_radius?: string | null
          business_type?: string
          button_color?: string | null
          card_style?: string | null
          category_layout?: string | null
          city?: string | null
          created_at?: string | null
          custom_css?: string | null
          delivery_fee?: number | null
          description?: string | null
          font_family?: string | null
          header_style?: string | null
          id?: string
          instagram?: string | null
          is_demo?: boolean
          logo_url?: string | null
          min_order_for_free_delivery?: number | null
          name?: string
          opening_hours?: string | null
          payment_methods?: Json
          pin_failed_attempts?: number
          pin_hash?: string | null
          pin_locked_until?: string | null
          primary_color?: string | null
          product_card_layout?: string | null
          secondary_color?: string | null
          show_categories?: boolean | null
          show_delivery_status?: boolean | null
          show_search?: boolean | null
          slug?: string
          status?: string | null
          text_color?: string | null
          updated_at?: string | null
          visual_style?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      admin_clear_restaurant_pin: {
        Args: { _password_hash: string; _restaurant_id: string }
        Returns: undefined
      }
      admin_create_pin_session: {
        Args: { _password_hash: string; _restaurant_id: string }
        Returns: {
          expires_at: string
          session_token: string
        }[]
      }
      admin_ensure_edit_token: {
        Args: { _password_hash: string; _restaurant_id: string }
        Returns: string
      }
      admin_list_edit_tokens: {
        Args: { _password_hash: string }
        Returns: {
          edit_token: string
          restaurant_id: string
        }[]
      }
      admin_list_pin_status: {
        Args: { _password_hash: string }
        Returns: {
          has_pin: boolean
          is_locked: boolean
          locked_until: string
          restaurant_id: string
        }[]
      }
      admin_password_exists: { Args: never; Returns: boolean }
      admin_rotate_edit_token: {
        Args: {
          _new_token: string
          _password_hash: string
          _restaurant_id: string
        }
        Returns: undefined
      }
      admin_set_restaurant_pin: {
        Args: { _password_hash: string; _pin: string; _restaurant_id: string }
        Returns: undefined
      }
      cleanup_expired_pin_sessions: { Args: never; Returns: undefined }
      delete_customer_profile: {
        Args: { _phone: string; _restaurant_id: string; _session_token: string }
        Returns: undefined
      }
      delete_restaurant_order: {
        Args: { _order_id: string; _session_token: string }
        Returns: undefined
      }
      extend_pin_session: { Args: { _token: string }; Returns: string }
      find_customer_profile: {
        Args: { _phone: string; _restaurant_id: string }
        Returns: {
          address: string
          name: string
          neighborhood: string
          payment_method: string
          phone: string
          reference: string
        }[]
      }
      find_restaurant_by_edit_token: {
        Args: { _token: string }
        Returns: {
          accepts_delivery: boolean
          accepts_pickup: boolean
          address: string | null
          average_delivery_time: string | null
          background_color: string | null
          banner_url: string | null
          border_radius: string | null
          business_type: string
          button_color: string | null
          card_style: string | null
          category_layout: string | null
          city: string | null
          created_at: string | null
          custom_css: string | null
          delivery_fee: number | null
          description: string | null
          font_family: string | null
          header_style: string | null
          id: string
          instagram: string | null
          is_demo: boolean
          logo_url: string | null
          min_order_for_free_delivery: number | null
          name: string
          opening_hours: string | null
          payment_methods: Json
          pin_failed_attempts: number
          pin_hash: string | null
          pin_locked_until: string | null
          primary_color: string | null
          product_card_layout: string | null
          secondary_color: string | null
          show_categories: boolean | null
          show_delivery_status: boolean | null
          show_search: boolean | null
          slug: string
          status: string | null
          text_color: string | null
          updated_at: string | null
          visual_style: string | null
          whatsapp: string
        }[]
        SetofOptions: {
          from: "*"
          to: "restaurants"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      find_restaurant_by_pin_session: {
        Args: { _token: string }
        Returns: {
          accepts_delivery: boolean
          accepts_pickup: boolean
          address: string | null
          average_delivery_time: string | null
          background_color: string | null
          banner_url: string | null
          border_radius: string | null
          business_type: string
          button_color: string | null
          card_style: string | null
          category_layout: string | null
          city: string | null
          created_at: string | null
          custom_css: string | null
          delivery_fee: number | null
          description: string | null
          font_family: string | null
          header_style: string | null
          id: string
          instagram: string | null
          is_demo: boolean
          logo_url: string | null
          min_order_for_free_delivery: number | null
          name: string
          opening_hours: string | null
          payment_methods: Json
          pin_failed_attempts: number
          pin_hash: string | null
          pin_locked_until: string | null
          primary_color: string | null
          product_card_layout: string | null
          secondary_color: string | null
          show_categories: boolean | null
          show_delivery_status: boolean | null
          show_search: boolean | null
          slug: string
          status: string | null
          text_color: string | null
          updated_at: string | null
          visual_style: string | null
          whatsapp: string
        }[]
        SetofOptions: {
          from: "*"
          to: "restaurants"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_latest_restaurant_snapshot: {
        Args: { _restaurant_id: string; _session_token: string }
        Returns: {
          created_at: string
          id: string
          label: string
          restaurant_id: string
          scope: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_pin_session_valid: {
        Args: { _restaurant_id: string; _token: string }
        Returns: boolean
      }
      is_restaurant_session_valid: {
        Args: { _restaurant_id: string; _token: string }
        Returns: boolean
      }
      list_restaurant_snapshots: {
        Args: { _restaurant_id: string; _session_token: string }
        Returns: {
          created_at: string
          id: string
          label: string
          restaurant_id: string
          scope: string
        }[]
      }
      record_restaurant_snapshot: {
        Args: {
          _label: string
          _restaurant_id: string
          _scope: string
          _session_token: string
          _snapshot: Json
        }
        Returns: string
      }
      restore_restaurant_snapshot: {
        Args: { _snapshot_id: string }
        Returns: undefined
      }
      restore_restaurant_snapshot_secure: {
        Args: { _session_token: string; _snapshot_id: string }
        Returns: undefined
      }
      upsert_customer_profile: {
        Args: {
          _address: string
          _name: string
          _neighborhood: string
          _payment_method: string
          _phone: string
          _reference: string
          _restaurant_id: string
        }
        Returns: undefined
      }
      verify_admin_password: {
        Args: { _password_hash: string }
        Returns: boolean
      }
      verify_restaurant_pin: {
        Args: { _pin: string; _slug: string }
        Returns: {
          expires_at: string
          session_token: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      option_pricing_mode: "free" | "per_option" | "most_expensive"
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
      option_pricing_mode: ["free", "per_option", "most_expensive"],
    },
  },
} as const
