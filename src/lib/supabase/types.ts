export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          full_name: string | null
          phone: string | null
          role: string | null
        }
        Insert: {
          id: string
          created_at?: string | null
          updated_at?: string | null
          full_name?: string | null
          phone?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          full_name?: string | null
          phone?: string | null
          role?: string | null
        }
      }
      families: {
        Row: {
          id: string
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          profile_id: string
          role: string
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          profile_id: string
          role?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          profile_id?: string
          role?: string
          created_at?: string | null
        }
      }
      parents: {
        Row: {
          id: string
          family_id: string
          name: string
          relationship: string
          phone: string | null
          language: string | null
          primary_conditions: string[] | null
          risk_level: string | null
          health_index: number | null
          scorecard_answers: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          relationship: string
          phone?: string | null
          language?: string | null
          primary_conditions?: string[] | null
          risk_level?: string | null
          health_index?: number | null
          scorecard_answers?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          relationship?: string
          phone?: string | null
          language?: string | null
          primary_conditions?: string[] | null
          risk_level?: string | null
          health_index?: number | null
          scorecard_answers?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      consents: {
        Row: {
          id: string
          parent_id: string
          granted_by_profile_id: string | null
          consent_type: string
          ip_address: string | null
          consent_version: string | null
          is_granted: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          granted_by_profile_id?: string | null
          consent_type: string
          ip_address?: string | null
          consent_version?: string | null
          is_granted?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          granted_by_profile_id?: string | null
          consent_type?: string
          ip_address?: string | null
          consent_version?: string | null
          is_granted?: boolean | null
          created_at?: string | null
        }
      }
      vitals: {
        Row: {
          id: string
          parent_id: string
          measured_at: string | null
          bp_sys: number | null
          bp_dia: number | null
          sugar: number | null
          weight: number | null
          logged_by: string | null
          source: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          measured_at?: string | null
          bp_sys?: number | null
          bp_dia?: number | null
          sugar?: number | null
          weight?: number | null
          logged_by?: string | null
          source?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          measured_at?: string | null
          bp_sys?: number | null
          bp_dia?: number | null
          sugar?: number | null
          weight?: number | null
          logged_by?: string | null
          source?: string | null
          created_at?: string | null
        }
      }
      medications: {
        Row: {
          id: string
          parent_id: string
          name: string
          dosage: string
          timing: string
          instructions: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          dosage: string
          timing: string
          instructions?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          dosage?: string
          timing?: string
          instructions?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      medication_logs: {
        Row: {
          id: string
          parent_id: string
          medication_id: string
          log_date: string
          taken: boolean | null
          taken_at: string | null
          source: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          medication_id: string
          log_date?: string
          taken?: boolean | null
          taken_at?: string | null
          source?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          medication_id?: string
          log_date?: string
          taken?: boolean | null
          taken_at?: string | null
          source?: string | null
          created_at?: string | null
        }
      }
      lab_reports: {
        Row: {
          id: string
          parent_id: string
          report_date: string
          report_type: string
          storage_path: string
          summary: string | null
          biomarkers: Json | null
          full_analysis_markdown: string | null
          uploaded_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          report_date: string
          report_type?: string
          storage_path: string
          summary?: string | null
          biomarkers?: Json | null
          full_analysis_markdown?: string | null
          uploaded_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          report_date?: string
          report_type?: string
          storage_path?: string
          summary?: string | null
          biomarkers?: Json | null
          full_analysis_markdown?: string | null
          uploaded_by?: string | null
          created_at?: string | null
        }
      }
      doctors: {
        Row: {
          id: string
          profile_id: string
          specialty: string
          registration_number: string
          is_verified: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          specialty: string
          registration_number: string
          is_verified?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          specialty?: string
          registration_number?: string
          is_verified?: boolean | null
          created_at?: string | null
        }
      }
      care_teams: {
        Row: {
          id: string
          parent_id: string
          doctor_id: string
          assigned_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          doctor_id: string
          assigned_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          doctor_id?: string
          assigned_by?: string | null
          created_at?: string | null
        }
      }
      ai_conversations: {
        Row: {
          id: string
          parent_id: string
          user_message: string
          ai_response: string
          source: string | null
          token_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          user_message: string
          ai_response: string
          source?: string | null
          token_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          user_message?: string
          ai_response?: string
          source?: string | null
          token_count?: number | null
          created_at?: string | null
        }
      }
      whatsapp_messages: {
        Row: {
          id: string
          parent_id: string
          direction: string
          message_sid: string | null
          message_type: string
          body: string | null
          media_url: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          direction: string
          message_sid?: string | null
          message_type?: string
          body?: string | null
          media_url?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          direction?: string
          message_sid?: string | null
          message_type?: string
          body?: string | null
          media_url?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      audit_log: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
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
  }
}
