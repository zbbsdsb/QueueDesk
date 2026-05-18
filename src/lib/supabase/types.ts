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
          code: string
          name: string
          status: "active" | "suspended" | "deleted"
          plan_code: string | null
          default_time_zone: string
          data_region: string
          settings: Json
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          status?: "active" | "suspended" | "deleted"
          plan_code?: string | null
          default_time_zone?: string
          data_region?: string
          settings?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          status?: "active" | "suspended" | "deleted"
          plan_code?: string | null
          default_time_zone?: string
          data_region?: string
          settings?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      tenant_role: {
        Row: {
          id: string
          tenant_id: string
          role_key: string
          display_name: string
          description: string | null
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          role_key: string
          display_name: string
          description?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          role_key?: string
          display_name?: string
          description?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      app_user: {
        Row: {
          id: string
          tenant_id: string
          external_ref: string | null
          auth_subject: string | null
          email: string
          display_name: string
          type: "human" | "bot" | "service_account"
          status: "invited" | "active" | "suspended" | "deleted"
          locale: string
          time_zone: string
          attributes: Json
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
          role: "owner" | "admin" | "agent" | "requester"
          avatar_url: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          external_ref?: string | null
          auth_subject?: string | null
          email: string
          display_name: string
          type?: "human" | "bot" | "service_account"
          status?: "invited" | "active" | "suspended" | "deleted"
          locale?: string
          time_zone?: string
          attributes?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          role?: "owner" | "admin" | "agent" | "requester"
          avatar_url?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          external_ref?: string | null
          auth_subject?: string | null
          email?: string
          display_name?: string
          type?: "human" | "bot" | "service_account"
          status?: "invited" | "active" | "suspended" | "deleted"
          locale?: string
          time_zone?: string
          attributes?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          role?: "owner" | "admin" | "agent" | "requester"
          avatar_url?: string | null
        }
      }
      team: {
        Row: {
          id: string
          tenant_id: string
          name: string
          slug: string
          description: string | null
          manager_user_id: string | null
          settings: Json
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
          status: "active" | "paused" | "archived"
          lead_user_id: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          slug: string
          description?: string | null
          manager_user_id?: string | null
          settings?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          status?: "active" | "paused" | "archived"
          lead_user_id?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          slug?: string
          description?: string | null
          manager_user_id?: string | null
          settings?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          status?: "active" | "paused" | "archived"
          lead_user_id?: string | null
        }
      }
      team_member: {
        Row: {
          id: string
          tenant_id: string
          team_id: string
          user_id: string
          membership_role: "member" | "lead" | "manager"
          is_primary: boolean
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          team_id: string
          user_id: string
          membership_role?: "member" | "lead" | "manager"
          is_primary?: boolean
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          team_id?: string
          user_id?: string
          membership_role?: "member" | "lead" | "manager"
          is_primary?: boolean
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      user_role_assignment: {
        Row: {
          id: string
          tenant_id: string
          role_id: string
          user_id: string
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          role_id: string
          user_id: string
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          role_id?: string
          user_id?: string
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      business_calendar: {
        Row: {
          id: string
          tenant_id: string
          name: string
          time_zone: string
          is_default: boolean
          description: string | null
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          time_zone: string
          is_default?: boolean
          description?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          time_zone?: string
          is_default?: boolean
          description?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      business_calendar_rule: {
        Row: {
          id: string
          tenant_id: string
          calendar_id: string
          day_of_week: number
          start_time: string
          end_time: string
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          calendar_id: string
          day_of_week: number
          start_time: string
          end_time: string
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          calendar_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      business_calendar_holiday: {
        Row: {
          id: string
          tenant_id: string
          calendar_id: string
          holiday_date: string
          holiday_name: string
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          calendar_id: string
          holiday_date: string
          holiday_name: string
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          calendar_id?: string
          holiday_date?: string
          holiday_name?: string
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      business_calendar_exception: {
        Row: {
          id: string
          tenant_id: string
          calendar_id: string
          local_date: string
          is_closed: boolean
          start_time: string | null
          end_time: string | null
          note: string | null
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          calendar_id: string
          local_date: string
          is_closed?: boolean
          start_time?: string | null
          end_time?: string | null
          note?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          calendar_id?: string
          local_date?: string
          is_closed?: boolean
          start_time?: string | null
          end_time?: string | null
          note?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      sla_policy: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          business_calendar_id: string
          first_response_seconds: number | null
          next_response_seconds: number | null
          resolution_seconds: number | null
          pause_on_statuses: string[]
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
          business_hours: Json
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          business_calendar_id: string
          first_response_seconds?: number | null
          next_response_seconds?: number | null
          resolution_seconds?: number | null
          pause_on_statuses?: string[]
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          business_hours?: Json
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          business_calendar_id?: string
          first_response_seconds?: number | null
          next_response_seconds?: number | null
          resolution_seconds?: number | null
          pause_on_statuses?: string[]
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          business_hours?: Json
        }
      }
      approval_workflow: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          version: number
          is_active: boolean
          trigger_condition: Json
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          version?: number
          is_active?: boolean
          trigger_condition?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          version?: number
          is_active?: boolean
          trigger_condition?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      approval_step: {
        Row: {
          id: string
          tenant_id: string
          workflow_id: string
          step_order: number
          step_name: string
          approver_type: "user" | "team" | "role" | "requester_manager"
          approver_user_id: string | null
          approver_team_id: string | null
          approver_role_key: string | null
          mode: "all" | "any"
          timeout_seconds: number | null
          conditions: Json
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          workflow_id: string
          step_order: number
          step_name: string
          approver_type: "user" | "team" | "role" | "requester_manager"
          approver_user_id?: string | null
          approver_team_id?: string | null
          approver_role_key?: string | null
          mode?: "all" | "any"
          timeout_seconds?: number | null
          conditions?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          workflow_id?: string
          step_order?: number
          step_name?: string
          approver_type?: "user" | "team" | "role" | "requester_manager"
          approver_user_id?: string | null
          approver_team_id?: string | null
          approver_role_key?: string | null
          mode?: "all" | "any"
          timeout_seconds?: number | null
          conditions?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      queue: {
        Row: {
          id: string
          tenant_id: string
          code: string
          name: string
          description: string | null
          visibility: "private" | "team" | "tenant"
          owner_team_id: string | null
          default_assignee_user_id: string | null
          default_sla_policy_id: string | null
          default_approval_workflow_id: string | null
          settings: Json
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
          default_priority: "low" | "normal" | "high" | "urgent"
          routing_mode: "manual" | "round_robin" | "skill_based"
          status: "active" | "paused" | "archived"
        }
        Insert: {
          id?: string
          tenant_id: string
          code: string
          name: string
          description?: string | null
          visibility?: "private" | "team" | "tenant"
          owner_team_id?: string | null
          default_assignee_user_id?: string | null
          default_sla_policy_id?: string | null
          default_approval_workflow_id?: string | null
          settings?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          default_priority?: "low" | "normal" | "high" | "urgent"
          routing_mode?: "manual" | "round_robin" | "skill_based"
          status?: "active" | "paused" | "archived"
        }
        Update: {
          id?: string
          tenant_id?: string
          code?: string
          name?: string
          description?: string | null
          visibility?: "private" | "team" | "tenant"
          owner_team_id?: string | null
          default_assignee_user_id?: string | null
          default_sla_policy_id?: string | null
          default_approval_workflow_id?: string | null
          settings?: Json
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          default_priority?: "low" | "normal" | "high" | "urgent"
          routing_mode?: "manual" | "round_robin" | "skill_based"
          status?: "active" | "paused" | "archived"
        }
      }
      queue_member: {
        Row: {
          id: string
          tenant_id: string
          queue_id: string
          user_id: string
          membership_role: "agent" | "lead" | "viewer"
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          queue_id: string
          user_id: string
          membership_role?: "agent" | "lead" | "viewer"
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          queue_id?: string
          user_id?: string
          membership_role?: "agent" | "lead" | "viewer"
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      label: {
        Row: {
          id: string
          tenant_id: string
          name: string
          color: string | null
          description: string | null
          is_system: boolean
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          color?: string | null
          description?: string | null
          is_system?: boolean
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          color?: string | null
          description?: string | null
          is_system?: boolean
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      ticket: {
        Row: {
          id: string
          tenant_id: string
          ticket_no: number
          queue_id: string
          requester_user_id: string | null
          reporter_user_id: string | null
          assignee_user_id: string | null
          current_approval_id: string | null
          subject: string
          description: string | null
          status: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed"
          priority: "low" | "medium" | "high" | "urgent"
          source: "email" | "portal" | "chat" | "api" | "system"
          channel_ref: string | null
          waiting_reason: string | null
          custom_fields: Json
          meta: Json
          next_sla_breach_at: string | null
          submitted_at: string
          first_responded_at: string | null
          resolved_at: string | null
          closed_at: string | null
          last_customer_reply_at: string | null
          last_agent_reply_at: string | null
          lock_version: number
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
          sla_deadline: string | null
          breach_notified_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_no?: never
          queue_id: string
          requester_user_id?: string | null
          reporter_user_id?: string | null
          assignee_user_id?: string | null
          current_approval_id?: string | null
          subject: string
          description?: string | null
          status?: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          source?: "email" | "portal" | "chat" | "api" | "system"
          channel_ref?: string | null
          waiting_reason?: string | null
          custom_fields?: Json
          meta?: Json
          next_sla_breach_at?: string | null
          submitted_at?: string
          first_responded_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
          last_customer_reply_at?: string | null
          last_agent_reply_at?: string | null
          lock_version?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          sla_deadline?: string | null
          breach_notified_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_no?: never
          queue_id?: string
          requester_user_id?: string | null
          reporter_user_id?: string | null
          assignee_user_id?: string | null
          current_approval_id?: string | null
          subject?: string
          description?: string | null
          status?: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          source?: "email" | "portal" | "chat" | "api" | "system"
          channel_ref?: string | null
          waiting_reason?: string | null
          custom_fields?: Json
          meta?: Json
          next_sla_breach_at?: string | null
          submitted_at?: string
          first_responded_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
          last_customer_reply_at?: string | null
          last_agent_reply_at?: string | null
          lock_version?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          sla_deadline?: string | null
          breach_notified_at?: string | null
        }
      }
      ticket_status_transition: {
        Row: {
          id: string
          tenant_id: string
          ticket_id: string
          from_status: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed" | null
          to_status: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed"
          changed_by: string | null
          note: string | null
          meta: Json
          changed_at: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_id: string
          from_status?: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed" | null
          to_status: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed"
          changed_by?: string | null
          note?: string | null
          meta?: Json
          changed_at?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_id?: string
          from_status?: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed" | null
          to_status?: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed"
          changed_by?: string | null
          note?: string | null
          meta?: Json
          changed_at?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
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
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
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
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
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
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      knowledge_article: {
        Row: {
          id: string
          tenant_id: string
          author_user_id: string | null
          title: string
          slug: string
          language_code: string
          status: "draft" | "published" | "archived"
          summary: string | null
          body_markdown: string | null
          body_text: string
          embedding: string | null
          embedding_model: string | null
          embedding_updated_at: string | null
          published_at: string | null
          version: number
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          author_user_id?: string | null
          title: string
          slug: string
          language_code?: string
          status?: "draft" | "published" | "archived"
          summary?: string | null
          body_markdown?: string | null
          body_text?: string
          embedding?: string | null
          embedding_model?: string | null
          embedding_updated_at?: string | null
          published_at?: string | null
          version?: number
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          author_user_id?: string | null
          title?: string
          slug?: string
          language_code?: string
          status?: "draft" | "published" | "archived"
          summary?: string | null
          body_markdown?: string | null
          body_text?: string
          embedding?: string | null
          embedding_model?: string | null
          embedding_updated_at?: string | null
          published_at?: string | null
          version?: number
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      attachment: {
        Row: {
          id: string
          tenant_id: string
          ticket_id: string | null
          comment_id: string | null
          article_id: string | null
          uploaded_by: string | null
          storage_bucket: string
          object_key: string
          file_name: string
          content_type: string | null
          byte_size: number
          checksum_sha256: string | null
          is_inline: boolean
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_id?: string | null
          comment_id?: string | null
          article_id?: string | null
          uploaded_by?: string | null
          storage_bucket: string
          object_key: string
          file_name: string
          content_type?: string | null
          byte_size: number
          checksum_sha256?: string | null
          is_inline?: boolean
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_id?: string | null
          comment_id?: string | null
          article_id?: string | null
          uploaded_by?: string | null
          storage_bucket?: string
          object_key?: string
          file_name?: string
          content_type?: string | null
          byte_size?: number
          checksum_sha256?: string | null
          is_inline?: boolean
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      ticket_label: {
        Row: {
          id: string
          tenant_id: string
          ticket_id: string
          label_id: string
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_id: string
          label_id: string
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_id?: string
          label_id?: string
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      ticket_sla_clock: {
        Row: {
          id: string
          tenant_id: string
          ticket_id: string
          policy_id: string
          business_calendar_id: string
          metric: "first_response" | "next_response" | "resolution"
          target_seconds: number
          state: "running" | "paused" | "satisfied" | "breached" | "cancelled"
          started_at: string
          last_resumed_at: string
          paused_at: string | null
          consumed_seconds: number
          due_at: string | null
          breached_at: string | null
          satisfied_at: string | null
          snapshot: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_id: string
          policy_id: string
          business_calendar_id: string
          metric: "first_response" | "next_response" | "resolution"
          target_seconds: number
          state?: "running" | "paused" | "satisfied" | "breached" | "cancelled"
          started_at?: string
          last_resumed_at?: string
          paused_at?: string | null
          consumed_seconds?: number
          due_at?: string | null
          breached_at?: string | null
          satisfied_at?: string | null
          snapshot?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_id?: string
          policy_id?: string
          business_calendar_id?: string
          metric?: "first_response" | "next_response" | "resolution"
          target_seconds?: number
          state?: "running" | "paused" | "satisfied" | "breached" | "cancelled"
          started_at?: string
          last_resumed_at?: string
          paused_at?: string | null
          consumed_seconds?: number
          due_at?: string | null
          breached_at?: string | null
          satisfied_at?: string | null
          snapshot?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      ticket_sla_pause_segment: {
        Row: {
          id: string
          tenant_id: string
          ticket_sla_clock_id: string
          pause_status: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed" | null
          pause_start_at: string
          resumed_at: string | null
          note: string | null
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_sla_clock_id: string
          pause_status?: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed" | null
          pause_start_at: string
          resumed_at?: string | null
          note?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_sla_clock_id?: string
          pause_status?: "open" | "pending" | "waiting_approval" | "waiting_customer" | "resolved" | "closed" | null
          pause_start_at?: string
          resumed_at?: string | null
          note?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      ticket_approval: {
        Row: {
          id: string
          tenant_id: string
          ticket_id: string
          workflow_id: string
          status: "pending" | "approved" | "rejected" | "cancelled"
          current_step_order: number | null
          requested_by: string | null
          requested_at: string
          decided_at: string | null
          final_decider_user_id: string | null
          reason: string | null
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_id: string
          workflow_id: string
          status?: "pending" | "approved" | "rejected" | "cancelled"
          current_step_order?: number | null
          requested_by?: string | null
          requested_at?: string
          decided_at?: string | null
          final_decider_user_id?: string | null
          reason?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_id?: string
          workflow_id?: string
          status?: "pending" | "approved" | "rejected" | "cancelled"
          current_step_order?: number | null
          requested_by?: string | null
          requested_at?: string
          decided_at?: string | null
          final_decider_user_id?: string | null
          reason?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      ticket_approval_step: {
        Row: {
          id: string
          tenant_id: string
          ticket_approval_id: string
          workflow_step_id: string
          step_order: number
          approver_user_id: string | null
          approver_team_id: string | null
          status: "pending" | "approved" | "rejected" | "skipped" | "expired" | "cancelled"
          decided_by: string | null
          decided_at: string | null
          comment: string | null
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_approval_id: string
          workflow_step_id: string
          step_order: number
          approver_user_id?: string | null
          approver_team_id?: string | null
          status?: "pending" | "approved" | "rejected" | "skipped" | "expired" | "cancelled"
          decided_by?: string | null
          decided_at?: string | null
          comment?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_approval_id?: string
          workflow_step_id?: string
          step_order?: number
          approver_user_id?: string | null
          approver_team_id?: string | null
          status?: "pending" | "approved" | "rejected" | "skipped" | "expired" | "cancelled"
          decided_by?: string | null
          decided_at?: string | null
          comment?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      field_permission: {
        Row: {
          id: string
          tenant_id: string
          resource_name: string
          field_name: string
          principal_type: "user" | "team" | "role"
          principal_id: string | null
          role_key: string | null
          effect: "allow" | "deny"
          can_read: boolean
          can_write: boolean
          mask_type: "none" | "null" | "hash" | "partial"
          condition_expr: string | null
          priority: number
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          resource_name: string
          field_name: string
          principal_type: "user" | "team" | "role"
          principal_id?: string | null
          role_key?: string | null
          effect?: "allow" | "deny"
          can_read?: boolean
          can_write?: boolean
          mask_type?: "none" | "null" | "hash" | "partial"
          condition_expr?: string | null
          priority?: number
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          resource_name?: string
          field_name?: string
          principal_type?: "user" | "team" | "role"
          principal_id?: string | null
          role_key?: string | null
          effect?: "allow" | "deny"
          can_read?: boolean
          can_write?: boolean
          mask_type?: "none" | "null" | "hash" | "partial"
          condition_expr?: string | null
          priority?: number
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
      ai_action: {
        Row: {
          id: string
          tenant_id: string
          ticket_id: string | null
          article_id: string | null
          target_type: string
          target_id: string
          action_type: "classify" | "summarize" | "suggest_reply" | "retrieve" | "route" | "approval_recommendation" | "custom"
          status: "queued" | "running" | "succeeded" | "failed" | "cancelled"
          provider: string | null
          model_name: string | null
          prompt_version: string | null
          input_text: string | null
          output_text: string | null
          input_payload: Json
          output_payload: Json
          embedding: string | null
          input_tokens: number | null
          output_tokens: number | null
          latency_ms: number | null
          cost_usd: number | null
          requested_by: string | null
          completed_at: string | null
          meta: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_id?: string | null
          article_id?: string | null
          target_type: string
          target_id: string
          action_type: "classify" | "summarize" | "suggest_reply" | "retrieve" | "route" | "approval_recommendation" | "custom"
          status?: "queued" | "running" | "succeeded" | "failed" | "cancelled"
          provider?: string | null
          model_name?: string | null
          prompt_version?: string | null
          input_text?: string | null
          output_text?: string | null
          input_payload?: Json
          output_payload?: Json
          embedding?: string | null
          input_tokens?: number | null
          output_tokens?: number | null
          latency_ms?: number | null
          cost_usd?: number | null
          requested_by?: string | null
          completed_at?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_id?: string | null
          article_id?: string | null
          target_type?: string
          target_id?: string
          action_type?: "classify" | "summarize" | "suggest_reply" | "retrieve" | "route" | "approval_recommendation" | "custom"
          status?: "queued" | "running" | "succeeded" | "failed" | "cancelled"
          provider?: string | null
          model_name?: string | null
          prompt_version?: string | null
          input_text?: string | null
          output_text?: string | null
          input_payload?: Json
          output_payload?: Json
          embedding?: string | null
          input_tokens?: number | null
          output_tokens?: number | null
          latency_ms?: number | null
          cost_usd?: number | null
          requested_by?: string | null
          completed_at?: string | null
          meta?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
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
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
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
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
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
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
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
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
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
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
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
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
