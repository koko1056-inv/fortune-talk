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
      agent_configs: {
        Row: {
          accent_color: string
          agent_id: string
          created_at: string
          description: string
          emoji: string
          gradient: string
          id: string
          image_url: string | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          accent_color: string
          agent_id?: string
          created_at?: string
          description: string
          emoji: string
          gradient: string
          id: string
          image_url?: string | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          accent_color?: string
          agent_id?: string
          created_at?: string
          description?: string
          emoji?: string
          gradient?: string
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      billing_exemptions: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          choices: Json | null
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          choices?: Json | null
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          choices?: Json | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          agent_emoji: string | null
          agent_name: string
          created_at: string
          ended_at: string | null
          id: string
          rally_count: number
          started_at: string
          ticket_used: boolean
          user_id: string
        }
        Insert: {
          agent_emoji?: string | null
          agent_name: string
          created_at?: string
          ended_at?: string | null
          id?: string
          rally_count?: number
          started_at?: string
          ticket_used?: boolean
          user_id: string
        }
        Update: {
          agent_emoji?: string | null
          agent_name?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          rally_count?: number
          started_at?: string
          ticket_used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      daily_fortunes: {
        Row: {
          content: string
          created_at: string
          fortune_date: string
          id: string
          lucky_color: string | null
          lucky_item: string | null
          lucky_number: number | null
          overall_luck: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          fortune_date?: string
          id?: string
          lucky_color?: string | null
          lucky_item?: string | null
          lucky_number?: number | null
          overall_luck?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          fortune_date?: string
          id?: string
          lucky_color?: string | null
          lucky_item?: string | null
          lucky_number?: number | null
          overall_luck?: number | null
          user_id?: string
        }
        Relationships: []
      }
      fortune_readings: {
        Row: {
          agent_emoji: string | null
          agent_name: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          is_free_reading: boolean
          started_at: string
          user_id: string
        }
        Insert: {
          agent_emoji?: string | null
          agent_name: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_free_reading?: boolean
          started_at?: string
          user_id: string
        }
        Update: {
          agent_emoji?: string | null
          agent_name?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_free_reading?: boolean
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          blood_type: string | null
          created_at: string
          display_name: string | null
          id: string
          tutorial_completed: boolean | null
          updated_at: string
          user_id: string
          zodiac_sign: string | null
        }
        Insert: {
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          tutorial_completed?: boolean | null
          updated_at?: string
          user_id: string
          zodiac_sign?: string | null
        }
        Update: {
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          tutorial_completed?: boolean | null
          updated_at?: string
          user_id?: string
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      ticket_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          price_per_ticket: number | null
          ticket_amount: number
          total_price: number | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          price_per_ticket?: number | null
          ticket_amount: number
          total_price?: number | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          price_per_ticket?: number | null
          ticket_amount?: number
          total_price?: number | null
          transaction_type?: string
          user_id?: string
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
      user_tickets: {
        Row: {
          created_at: string
          id: string
          ticket_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ticket_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ticket_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          app_user_id: string | null
          created_at: string
          event_id: string | null
          event_type: string
          id: string
          process_error: string | null
          processed: boolean
          processed_at: string | null
          product_id: string | null
          raw_payload: Json
        }
        Insert: {
          app_user_id?: string | null
          created_at?: string
          event_id?: string | null
          event_type: string
          id?: string
          process_error?: string | null
          processed?: boolean
          processed_at?: string | null
          product_id?: string | null
          raw_payload: Json
        }
        Update: {
          app_user_id?: string | null
          created_at?: string
          event_id?: string | null
          event_type?: string
          id?: string
          process_error?: string | null
          processed?: boolean
          processed_at?: string | null
          product_id?: string | null
          raw_payload?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_tickets: {
        Args: {
          _amount: number
          _price_per_ticket: number
          _total_price: number
          _user_id: string
        }
        Returns: boolean
      }
      get_monthly_usage_seconds: {
        Args: { _month: number; _user_id: string; _year: number }
        Returns: number
      }
      get_ticket_balance: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_used_free_reading: { Args: { _user_id: string }; Returns: boolean }
      is_billing_exempt: { Args: { _user_id: string }; Returns: boolean }
      use_ticket: { Args: { _user_id: string }; Returns: boolean }
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
