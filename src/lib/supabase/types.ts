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
          status: 'active' | 'suspended' | 'trial'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          status?: 'active' | 'suspended' | 'trial'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          status?: 'active' | 'suspended' | 'trial'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      app_user: {
        Row: {
          tenant_id: string
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          status: 'active' | 'invited' | 'disabled'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          tenant_id: string
          id?: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          status?: 'active' | 'invited' | 'disabled'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          tenant_id?: string
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          status?: 'active' | 'invited' | 'disabled'
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
          status: 'open' | 'in_progress' | 'pending_approval' | 'pending_customer' | 'resolved' | 'closed' | 'cancelled'
          priority: 'low' | 'normal' | 'high' | 'urgent'
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
          status?: 'open' | 'in_progress' | 'pending_approval' | 'pending_customer' | 'resolved' | 'closed' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
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
          status?: 'open' | 'in_progress' | 'pending_approval' | 'pending_customer' | 'resolved' | 'closed' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
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
      // Add more tables as needed during development
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
