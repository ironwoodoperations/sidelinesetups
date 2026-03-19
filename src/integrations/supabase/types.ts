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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      add_ons: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          equipment_id: string | null
          full_weekend_usd: number | null
          id: string
          is_active: boolean | null
          name: string
          per_day_usd: number | null
          per_game_usd: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          equipment_id?: string | null
          full_weekend_usd?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          per_day_usd?: number | null
          per_game_usd?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          equipment_id?: string | null
          full_weekend_usd?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          per_day_usd?: number | null
          per_game_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "add_ons_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          add_on_cents: number | null
          add_ons: Json | null
          agreed_to_terms: boolean | null
          archived: boolean | null
          base_cents: number | null
          coach_name: string | null
          contact_email: string | null
          created_at: string | null
          date: string | null
          discount_amount_cents: number | null
          discount_code_id: string | null
          equipment_setup_checklist: Json | null
          event_id: string | null
          event_type: string | null
          field_id: string | null
          full_name: string | null
          game_times: Json | null
          id: string
          id_photo_url: string | null
          id_skip_approved_by: string | null
          id_verified_by: string | null
          line_items_json: Json | null
          loyalty_points_earned: number | null
          loyalty_points_redeemed: number | null
          needs_id_review: boolean | null
          notes: string | null
          package_id: string | null
          package_mode: string | null
          park_id: string | null
          paypal_order_id: string | null
          phone: string | null
          sms_consent_given: boolean | null
          sport: string | null
          spot_id: string | null
          square_payment_id: string | null
          status: string | null
          team_name: string | null
          total_cents: number | null
          updated_at: string | null
          user_id: string | null
          xero_invoice_id: string | null
        }
        Insert: {
          add_on_cents?: number | null
          add_ons?: Json | null
          agreed_to_terms?: boolean | null
          archived?: boolean | null
          base_cents?: number | null
          coach_name?: string | null
          contact_email?: string | null
          created_at?: string | null
          date?: string | null
          discount_amount_cents?: number | null
          discount_code_id?: string | null
          equipment_setup_checklist?: Json | null
          event_id?: string | null
          event_type?: string | null
          field_id?: string | null
          full_name?: string | null
          game_times?: Json | null
          id?: string
          id_photo_url?: string | null
          id_skip_approved_by?: string | null
          id_verified_by?: string | null
          line_items_json?: Json | null
          loyalty_points_earned?: number | null
          loyalty_points_redeemed?: number | null
          needs_id_review?: boolean | null
          notes?: string | null
          package_id?: string | null
          package_mode?: string | null
          park_id?: string | null
          paypal_order_id?: string | null
          phone?: string | null
          sms_consent_given?: boolean | null
          sport?: string | null
          spot_id?: string | null
          square_payment_id?: string | null
          status?: string | null
          team_name?: string | null
          total_cents?: number | null
          updated_at?: string | null
          user_id?: string | null
          xero_invoice_id?: string | null
        }
        Update: {
          add_on_cents?: number | null
          add_ons?: Json | null
          agreed_to_terms?: boolean | null
          archived?: boolean | null
          base_cents?: number | null
          coach_name?: string | null
          contact_email?: string | null
          created_at?: string | null
          date?: string | null
          discount_amount_cents?: number | null
          discount_code_id?: string | null
          equipment_setup_checklist?: Json | null
          event_id?: string | null
          event_type?: string | null
          field_id?: string | null
          full_name?: string | null
          game_times?: Json | null
          id?: string
          id_photo_url?: string | null
          id_skip_approved_by?: string | null
          id_verified_by?: string | null
          line_items_json?: Json | null
          loyalty_points_earned?: number | null
          loyalty_points_redeemed?: number | null
          needs_id_review?: boolean | null
          notes?: string | null
          package_id?: string | null
          package_mode?: string | null
          park_id?: string | null
          paypal_order_id?: string | null
          phone?: string | null
          sms_consent_given?: boolean | null
          sport?: string | null
          spot_id?: string | null
          square_payment_id?: string | null
          status?: string | null
          team_name?: string | null
          total_cents?: number | null
          updated_at?: string | null
          user_id?: string | null
          xero_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string | null
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type?: string | null
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          pin: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          pin: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          pin?: string
          role?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          available_qty: number | null
          cogs_per_use_usd: number | null
          created_at: string | null
          damaged_qty: number | null
          id: string
          maintenance_qty: number | null
          name: string
          rented_qty: number | null
          total_qty: number | null
          type: string | null
        }
        Insert: {
          available_qty?: number | null
          cogs_per_use_usd?: number | null
          created_at?: string | null
          damaged_qty?: number | null
          id?: string
          maintenance_qty?: number | null
          name: string
          rented_qty?: number | null
          total_qty?: number | null
          type?: string | null
        }
        Update: {
          available_qty?: number | null
          cogs_per_use_usd?: number | null
          created_at?: string | null
          damaged_qty?: number | null
          id?: string
          maintenance_qty?: number | null
          name?: string
          rented_qty?: number | null
          total_qty?: number | null
          type?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          archived: boolean | null
          created_at: string | null
          end_date: string | null
          event_type: string | null
          field_ids: Json | null
          id: string
          is_active: boolean | null
          league_buffer_minutes: number | null
          league_dates: Json | null
          league_enabled: boolean | null
          league_end_time: string | null
          league_start_time: string | null
          name: string
          package_ids: Json | null
          park_ids: Json | null
          sport: string | null
          start_date: string | null
        }
        Insert: {
          archived?: boolean | null
          created_at?: string | null
          end_date?: string | null
          event_type?: string | null
          field_ids?: Json | null
          id?: string
          is_active?: boolean | null
          league_buffer_minutes?: number | null
          league_dates?: Json | null
          league_enabled?: boolean | null
          league_end_time?: string | null
          league_start_time?: string | null
          name: string
          package_ids?: Json | null
          park_ids?: Json | null
          sport?: string | null
          start_date?: string | null
        }
        Update: {
          archived?: boolean | null
          created_at?: string | null
          end_date?: string | null
          event_type?: string | null
          field_ids?: Json | null
          id?: string
          is_active?: boolean | null
          league_buffer_minutes?: number | null
          league_dates?: Json | null
          league_enabled?: boolean | null
          league_end_time?: string | null
          league_start_time?: string | null
          name?: string
          package_ids?: Json | null
          park_ids?: Json | null
          sport?: string | null
          start_date?: string | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
        }
        Relationships: []
      }
      fields: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          max_league_spots: number | null
          name: string
          park_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          max_league_spots?: number | null
          name: string
          park_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          max_league_spots?: number | null
          name?: string
          park_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fields_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["id"]
          },
        ]
      }
      locks: {
        Row: {
          booking_id: string | null
          created_at: string | null
          date: string | null
          expires_at: string | null
          field_id: string | null
          id: string
          spot_id: string | null
          status: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          date?: string | null
          expires_at?: string | null
          field_id?: string | null
          id?: string
          spot_id?: string | null
          status?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          date?: string | null
          expires_at?: string | null
          field_id?: string | null
          id?: string
          spot_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locks_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locks_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          add_on_ids: Json | null
          base_items: Json | null
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          full_weekend_usd: number | null
          id: string
          is_active: boolean | null
          name: string
          per_day_usd: number | null
          per_game_usd: number | null
          show_for_league: boolean | null
          show_for_tournament: boolean | null
        }
        Insert: {
          add_on_ids?: Json | null
          base_items?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          full_weekend_usd?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          per_day_usd?: number | null
          per_game_usd?: number | null
          show_for_league?: boolean | null
          show_for_tournament?: boolean | null
        }
        Update: {
          add_on_ids?: Json | null
          base_items?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          full_weekend_usd?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          per_day_usd?: number | null
          per_game_usd?: number | null
          show_for_league?: boolean | null
          show_for_tournament?: boolean | null
        }
        Relationships: []
      }
      parks: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          park_type: string | null
          state: string | null
          street_address: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          park_type?: string | null
          state?: string | null
          street_address?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          park_type?: string | null
          state?: string | null
          street_address?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          coach_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          sms_opt_in: boolean | null
          team_name: string | null
          updated_at: string | null
        }
        Insert: {
          coach_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          sms_opt_in?: boolean | null
          team_name?: string | null
          updated_at?: string | null
        }
        Update: {
          coach_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          sms_opt_in?: boolean | null
          team_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          brand_name: string | null
          created_at: string | null
          default_sport: string | null
          hero_baseball_url: string | null
          hero_soccer_url: string | null
          hero_softball_url: string | null
          id: string
          paypal_client_id: string | null
          paypal_mode: string | null
          service_fee_cents: number | null
          square_app_id: string | null
          square_environment: string | null
          square_location_id: string | null
          support_email: string | null
          tax_rate_percent: number | null
        }
        Insert: {
          brand_name?: string | null
          created_at?: string | null
          default_sport?: string | null
          hero_baseball_url?: string | null
          hero_soccer_url?: string | null
          hero_softball_url?: string | null
          id?: string
          paypal_client_id?: string | null
          paypal_mode?: string | null
          service_fee_cents?: number | null
          square_app_id?: string | null
          square_environment?: string | null
          square_location_id?: string | null
          support_email?: string | null
          tax_rate_percent?: number | null
        }
        Update: {
          brand_name?: string | null
          created_at?: string | null
          default_sport?: string | null
          hero_baseball_url?: string | null
          hero_soccer_url?: string | null
          hero_softball_url?: string | null
          id?: string
          paypal_client_id?: string | null
          paypal_mode?: string | null
          service_fee_cents?: number | null
          square_app_id?: string | null
          square_environment?: string | null
          square_location_id?: string | null
          support_email?: string | null
          tax_rate_percent?: number | null
        }
        Relationships: []
      }
      sms_auto_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          status_trigger: string
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          status_trigger: string
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          status_trigger?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_auto_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          message: string
          phone: string
          provider_response: Json | null
          sent_by: string | null
          status: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          phone: string
          provider_response?: Json | null
          sent_by?: string | null
          status?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          phone?: string
          provider_response?: Json | null
          sent_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      spots: {
        Row: {
          created_at: string | null
          field_id: string | null
          id: string
          label: string
          x: number | null
          y: number | null
        }
        Insert: {
          created_at?: string | null
          field_id?: string | null
          id?: string
          label: string
          x?: number | null
          y?: number | null
        }
        Update: {
          created_at?: string | null
          field_id?: string | null
          id?: string
          label?: string
          x?: number | null
          y?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spots_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
