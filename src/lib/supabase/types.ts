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
          auth_subject: string | null
          email: string
          display_name: string | null
          avatar_url: string | null
          type: "human" | "bot" | "service_account"
          status: "invited" | "active" | "suspended" | "deleted"
          locale: string
          time_zone: string
          attributes: Json
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          auth_subject?: string | null
          email: string
          display_name?: string | null
          avatar_url?: string | null
          type?: "human" | "bot" | "service_account"
          status?: "invited" | "active" | "suspended" | "deleted"
          locale?: string
          time_zone?: string
          attributes?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          auth_subject?: string | null
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          type?: "human" | "bot" | "service_account"
          status?: "invited" | "active" | "suspended" | "deleted"
          locale?: string
          time_zone?: string
          attributes?: Json
          meta?: Json
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
          ticket_no: number
          queue_id: string
          requester_user_id: string
          reporter_user_id: string | null
          assignee_user_id: string | null
          current_approval_id: string | null
          status:
            | "open"
            | "pending"
            | "waiting_approval"
            | "waiting_customer"
            | "resolved"
            | "closed"
          priority: "low" | "medium" | "high" | "urgent"
          source: "email" | "portal" | "chat" | "api" | "system"
          subject: string
          description: string | null
          lock_version: number
          next_sla_breach_at: string | null
          submitted_at: string
          first_responded_at: string | null
          resolved_at: string | null
          closed_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          tenant_id: string
          id?: string
          ticket_no?: never
          queue_id: string
          requester_user_id?: string
          reporter_user_id?: string | null
          assignee_user_id?: string | null
          current_approval_id?: string | null
          status?:
            | "open"
            | "pending"
            | "waiting_approval"
            | "waiting_customer"
            | "resolved"
            | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          source?: "email" | "portal" | "chat" | "api" | "system"
          subject: string
          description?: string | null
          lock_version?: number
          next_sla_breach_at?: string | null
          submitted_at?: string
          first_responded_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          tenant_id?: string
          id?: string
          ticket_no?: never
          queue_id?: string
          requester_user_id?: string
          reporter_user_id?: string | null
          assignee_user_id?: string | null
          current_approval_id?: string | null
          status?:
            | "open"
            | "pending"
            | "waiting_approval"
            | "waiting_customer"
            | "resolved"
            | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          source?: "email" | "portal" | "chat" | "api" | "system"
          subject?: string
          description?: string | null
          lock_version?: number
          next_sla_breach_at?: string | null
          submitted_at?: string
          first_responded_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
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
          author_user_id: string | null
          parent_comment_id: string | null
          visibility: "public" | "internal" | "approver_only"
          body: string
          is_redacted: boolean
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_id: string
          author_user_id?: string | null
          parent_comment_id?: string | null
          visibility?: "public" | "internal" | "approver_only"
          body: string
          is_redacted?: boolean
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_id?: string
          author_user_id?: string | null
          parent_comment_id?: string | null
          visibility?: "public" | "internal" | "approver_only"
          body?: string
          is_redacted?: boolean
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      invite: {
        Row: {
          id: string;
          tenant_id: string;
          email: string;
          role: "owner" | "admin" | "agent" | "requester";
          token: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          tenant_id: string;
          email: string;
          role: "owner" | "admin" | "agent" | "requester";
          token: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        }
        Update: {
          id?: string;
          tenant_id?: string;
          email?: string;
          role?: "owner" | "admin" | "agent" | "requester";
          token?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        }
      }
      kb_category: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        }
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        }
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        }
      }
      kb_article: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string | null;
          title: string;
          slug: string;
          body: string;
          author_id: string;
          status: "draft" | "published" | "archived";
          view_count: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        }
        Insert: {
          id?: string;
          tenant_id: string;
          category_id?: string | null;
          title: string;
          slug: string;
          body?: string;
          author_id?: string;
          status?: "draft" | "published" | "archived";
          view_count?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        }
        Update: {
          id?: string;
          tenant_id?: string;
          category_id?: string | null;
          title?: string;
          slug?: string;
          body?: string;
          author_id?: string;
          status?: "draft" | "published" | "archived";
          view_count?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
