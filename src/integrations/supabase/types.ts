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
      gallery_photos: {
        Row: {
          caption: string | null
          created_at: string
          file_path: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_path: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_path?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      lomba_brackets: {
        Row: {
          data: Json
          lomba_name: string
          lomba_slug: string
          published: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data?: Json
          lomba_name: string
          lomba_slug: string
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          lomba_name?: string
          lomba_slug?: string
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      lomba_points: {
        Row: {
          data: Json
          lomba_name: string
          lomba_slug: string
          published: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data?: Json
          lomba_name: string
          lomba_slug: string
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          lomba_name?: string
          lomba_slug?: string
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alamat: string | null
          created_at: string
          email: string | null
          id: string
          jenjang: string | null
          nama_pic: string | null
          nama_sekolah: string | null
          no_wa: string | null
          npsn: string | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id: string
          jenjang?: string | null
          nama_pic?: string | null
          nama_sekolah?: string | null
          no_wa?: string | null
          npsn?: string | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          jenjang?: string | null
          nama_pic?: string | null
          nama_sekolah?: string | null
          no_wa?: string | null
          npsn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registration_files: {
        Row: {
          file_name: string
          file_path: string
          id: string
          jenis: string
          registration_id: string
          size_bytes: number | null
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_path: string
          id?: string
          jenis: string
          registration_id: string
          size_bytes?: number | null
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
          id?: string
          jenis?: string
          registration_id?: string
          size_bytes?: number | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_files_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_members: {
        Row: {
          created_at: string
          id: string
          jenis_kelamin: string | null
          kelas: string | null
          nama: string
          nisn: string | null
          no_wa: string | null
          peran: string | null
          registration_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_kelamin?: string | null
          kelas?: string | null
          nama: string
          nisn?: string | null
          no_wa?: string | null
          peran?: string | null
          registration_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_kelamin?: string | null
          kelas?: string | null
          nama?: string
          nisn?: string | null
          no_wa?: string | null
          peran?: string | null
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_members_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_status_log: {
        Row: {
          catatan: string | null
          changed_at: string
          changed_by: string | null
          from_status: Database["public"]["Enums"]["registration_status"] | null
          id: string
          registration_id: string
          to_status: Database["public"]["Enums"]["registration_status"]
        }
        Insert: {
          catatan?: string | null
          changed_at?: string
          changed_by?: string | null
          from_status?:
            | Database["public"]["Enums"]["registration_status"]
            | null
          id?: string
          registration_id: string
          to_status: Database["public"]["Enums"]["registration_status"]
        }
        Update: {
          catatan?: string | null
          changed_at?: string
          changed_by?: string | null
          from_status?:
            | Database["public"]["Enums"]["registration_status"]
            | null
          id?: string
          registration_id?: string
          to_status?: Database["public"]["Enums"]["registration_status"]
        }
        Relationships: [
          {
            foreignKeyName: "registration_status_log_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          catatan_panitia: string | null
          created_at: string
          id: string
          kategori: string | null
          lomba_name: string
          lomba_slug: string
          nama_tim: string | null
          pic_nama: string | null
          pic_wa: string | null
          school_id: string
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          catatan_panitia?: string | null
          created_at?: string
          id?: string
          kategori?: string | null
          lomba_name: string
          lomba_slug: string
          nama_tim?: string | null
          pic_nama?: string | null
          pic_wa?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          catatan_panitia?: string | null
          created_at?: string
          id?: string
          kategori?: string | null
          lomba_name?: string
          lomba_slug?: string
          nama_tim?: string | null
          pic_nama?: string | null
          pic_wa?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          akses_lomba: string | null
          created_at: string
          id: string
          label: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          username: string | null
        }
        Insert: {
          akses_lomba?: string | null
          created_at?: string
          id?: string
          label?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          username?: string | null
        }
        Update: {
          akses_lomba?: string | null
          created_at?: string
          id?: string
          label?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_lomba: {
        Args: { _lomba_name: string; _user_id: string }
        Returns: boolean
      }
      can_modify_lomba: {
        Args: { _lomba_name: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_panitia: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "school"
        | "panitia_superadmin"
        | "panitia_pj"
        | "panitia_viewer"
      registration_status: "draft" | "submitted" | "verified" | "rejected"
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
      app_role: [
        "school",
        "panitia_superadmin",
        "panitia_pj",
        "panitia_viewer",
      ],
      registration_status: ["draft", "submitted", "verified", "rejected"],
    },
  },
} as const
