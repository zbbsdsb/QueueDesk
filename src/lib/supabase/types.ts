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
      tenant: {
        Row: {
          id: string
          name: string
          slug: string
          status: "active" | "suspended" | "trial"
          settings: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          status?: "active" | "suspended" | "trial"
          settings?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          status?: "active" | "suspended" | "trial"
          settings?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      app_user: {
        Row: {
          id: string
          tenant_id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          role: "owner" | "admin" | "agent" | "requester"
          status: "active" | "invited" | "disabled"
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          role?: "owner" | "admin" | "agent" | "requester"
          status?: "active" | "invited" | "disabled"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: "owner" | "admin" | "agent" | "requester"
          status?: "active" | "invited" | "disabled"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      team: {
        Row: {
          id: string
          tenant_id: string
          name: string
          slug: string
          description: string | null
          lead_user_id: string | null
          status: "active" | "paused" | "archived"
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          slug: string
          description?: string | null
          lead_user_id?: string | null
          status?: "active" | "paused" | "archived"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          slug?: string
          description?: string | null
          lead_user_id?: string | null
          status?: "active" | "paused" | "archived"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      queue: {
        Row: {
          id: string
          tenant_id: string
          team_id: string | null
          name: string
          slug: string
          description: string | null
          default_priority: "low" | "normal" | "high" | "urgent"
          routing_mode: "manual" | "round_robin" | "skill_based"
          visibility: "internal" | "restricted"
          status: "active" | "paused" | "archived"
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          team_id?: string | null
          name: string
          slug: string
          description?: string | null
          default_priority?: "low" | "normal" | "high" | "urgent"
          routing_mode?: "manual" | "round_robin" | "skill_based"
          visibility?: "internal" | "restricted"
          status?: "active" | "paused" | "archived"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          team_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          default_priority?: "low" | "normal" | "high" | "urgent"
          routing_mode?: "manual" | "round_robin" | "skill_based"
          visibility?: "internal" | "restricted"
          status?: "active" | "paused" | "archived"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      sla_policy: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          first_response_target_minutes: number
          resolution_target_minutes: number
          pause_on_statuses: string[]
          business_hours: Json
          status: "active" | "archived"
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          first_response_target_minutes?: number
          resolution_target_minutes?: number
          pause_on_statuses?: string[]
          business_hours?: Json
          status?: "active" | "archived"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          first_response_target_minutes?: number
          resolution_target_minutes?: number
          pause_on_statuses?: string[]
          business_hours?: Json
          status?: "active" | "archived"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      ticket: {
        Row: {
          tenant_id: string
          id: string
          queue_id: string
          requester_id: string
          assigned_agent_id: string | null
          status:
            | "open"
            | "in_progress"
            | "pending_approval"
            | "pending_customer"
            | "resolved"
            | "closed"
            | "cancelled"
          priority: "low" | "normal" | "high" | "urgent"
          subject: string
          description: string | null
          lock_version: number
          sla_deadline: string | null
          breach_notified_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          tenant_id: string
          id?: string
          queue_id: string
          requester_id: string
          assigned_agent_id?: string | null
          status?:
            | "open"
            | "in_progress"
            | "pending_approval"
            | "pending_customer"
            | "resolved"
            | "closed"
            | "cancelled"
          priority?: "low" | "normal" | "high" | "urgent"
          subject: string
          description?: string | null
          lock_version?: number
          sla_deadline?: string | null
          breach_notified_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          tenant_id?: string
          id?: string
          queue_id?: string
          requester_id?: string
          assigned_agent_id?: string | null
          status?:
            | "open"
            | "in_progress"
            | "pending_approval"
            | "pending_customer"
            | "resolved"
            | "closed"
            | "cancelled"
          priority?: "low" | "normal" | "high" | "urgent"
          subject?: string
          description?: string | null
          lock_version?: number
          sla_deadline?: string | null
          breach_notified_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      contact: {
        Row: {
          id: string
          tenant_id: string
          email: string
          display_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          display_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          display_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      ticket_comment: {
        Row: {
          id: string
          tenant_id: string
          ticket_id: string
          author_id: string
          author_type: "user" | "contact" | "system"
          visibility: "public" | "internal"
          body: string
          status: "published" | "edited" | "redacted"
          mentions: string[]
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_id: string
          author_id: string
          author_type?: "user" | "contact" | "system"
          visibility: "public" | "internal"
          body: string
          status?: "published" | "edited" | "redacted"
          mentions?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_id?: string
          author_id?: string
          author_type?: "user" | "contact" | "system"
          visibility?: "public" | "internal"
          body?: string
          status?: "published" | "edited" | "redacted"
          mentions?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      invite: {
        Row: {
          id: string
          tenant_id: string
          email: string
          role: "owner" | "admin" | "agent" | "requester"
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          role: "owner" | "admin" | "agent" | "requester"
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          role?: "owner" | "admin" | "agent" | "requester"
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
