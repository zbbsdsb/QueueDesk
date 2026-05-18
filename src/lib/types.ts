import type { Database } from '@/lib/supabase/types'

// Direct Supabase types
export type Tenant = Database['public']['Tables']['tenant']['Row']
export type TenantInsert = Database['public']['Tables']['tenant']['Insert']
export type TenantUpdate = Database['public']['Tables']['tenant']['Update']

export type AppUser = Database['public']['Tables']['app_user']['Row']
export type AppUserInsert = Database['public']['Tables']['app_user']['Insert']
export type AppUserUpdate = Database['public']['Tables']['app_user']['Update']

export type Team = Database['public']['Tables']['team']['Row']
export type TeamInsert = Database['public']['Tables']['team']['Insert']
export type TeamUpdate = Database['public']['Tables']['team']['Update']

export type TeamMember = Database['public']['Tables']['team_member']['Row']
export type TeamMemberInsert = Database['public']['Tables']['team_member']['Insert']
export type TeamMemberUpdate = Database['public']['Tables']['team_member']['Update']

export type Queue = Database['public']['Tables']['queue']['Row']
export type QueueInsert = Database['public']['Tables']['queue']['Insert']
export type QueueUpdate = Database['public']['Tables']['queue']['Update']

export type QueueMember = Database['public']['Tables']['queue_member']['Row']
export type QueueMemberInsert = Database['public']['Tables']['queue_member']['Insert']
export type QueueMemberUpdate = Database['public']['Tables']['queue_member']['Update']

export type Ticket = Database['public']['Tables']['ticket']['Row']
export type TicketInsert = Database['public']['Tables']['ticket']['Insert']
export type TicketUpdate = Database['public']['Tables']['ticket']['Update']

export type TicketComment = Database['public']['Tables']['ticket_comment']['Row']
export type TicketCommentInsert = Database['public']['Tables']['ticket_comment']['Insert']
export type TicketCommentUpdate = Database['public']['Tables']['ticket_comment']['Update']

export type TicketStatusTransition = Database['public']['Tables']['ticket_status_transition']['Row']
export type TicketStatusTransitionInsert = Database['public']['Tables']['ticket_status_transition']['Insert']
export type TicketStatusTransitionUpdate = Database['public']['Tables']['ticket_status_transition']['Update']

export type Label = Database['public']['Tables']['label']['Row']
export type LabelInsert = Database['public']['Tables']['label']['Insert']
export type LabelUpdate = Database['public']['Tables']['label']['Update']

export type TicketLabel = Database['public']['Tables']['ticket_label']['Row']
export type TicketLabelInsert = Database['public']['Tables']['ticket_label']['Insert']
export type TicketLabelUpdate = Database['public']['Tables']['ticket_label']['Update']

export type SlaPolicy = Database['public']['Tables']['sla_policy']['Row']
export type SlaPolicyInsert = Database['public']['Tables']['sla_policy']['Insert']
export type SlaPolicyUpdate = Database['public']['Tables']['sla_policy']['Update']

export type BusinessCalendar = Database['public']['Tables']['business_calendar']['Row']
export type BusinessCalendarInsert = Database['public']['Tables']['business_calendar']['Insert']
export type BusinessCalendarUpdate = Database['public']['Tables']['business_calendar']['Update']

export type BusinessCalendarRule = Database['public']['Tables']['business_calendar_rule']['Row']
export type BusinessCalendarRuleInsert = Database['public']['Tables']['business_calendar_rule']['Insert']
export type BusinessCalendarRuleUpdate = Database['public']['Tables']['business_calendar_rule']['Update']

export type BusinessCalendarHoliday = Database['public']['Tables']['business_calendar_holiday']['Row']
export type BusinessCalendarHolidayInsert = Database['public']['Tables']['business_calendar_holiday']['Insert']
export type BusinessCalendarHolidayUpdate = Database['public']['Tables']['business_calendar_holiday']['Update']

export type BusinessCalendarException = Database['public']['Tables']['business_calendar_exception']['Row']
export type BusinessCalendarExceptionInsert = Database['public']['Tables']['business_calendar_exception']['Insert']
export type BusinessCalendarExceptionUpdate = Database['public']['Tables']['business_calendar_exception']['Update']

export type TicketSlaClock = Database['public']['Tables']['ticket_sla_clock']['Row']
export type TicketSlaClockInsert = Database['public']['Tables']['ticket_sla_clock']['Insert']
export type TicketSlaClockUpdate = Database['public']['Tables']['ticket_sla_clock']['Update']

export type TicketSlaPauseSegment = Database['public']['Tables']['ticket_sla_pause_segment']['Row']
export type TicketSlaPauseSegmentInsert = Database['public']['Tables']['ticket_sla_pause_segment']['Insert']
export type TicketSlaPauseSegmentUpdate = Database['public']['Tables']['ticket_sla_pause_segment']['Update']

export type ApprovalWorkflow = Database['public']['Tables']['approval_workflow']['Row']
export type ApprovalWorkflowInsert = Database['public']['Tables']['approval_workflow']['Insert']
export type ApprovalWorkflowUpdate = Database['public']['Tables']['approval_workflow']['Update']

export type ApprovalStep = Database['public']['Tables']['approval_step']['Row']
export type ApprovalStepInsert = Database['public']['Tables']['approval_step']['Insert']
export type ApprovalStepUpdate = Database['public']['Tables']['approval_step']['Update']

export type TicketApproval = Database['public']['Tables']['ticket_approval']['Row']
export type TicketApprovalInsert = Database['public']['Tables']['ticket_approval']['Insert']
export type TicketApprovalUpdate = Database['public']['Tables']['ticket_approval']['Update']

export type TicketApprovalStep = Database['public']['Tables']['ticket_approval_step']['Row']
export type TicketApprovalStepInsert = Database['public']['Tables']['ticket_approval_step']['Insert']
export type TicketApprovalStepUpdate = Database['public']['Tables']['ticket_approval_step']['Update']

export type KnowledgeArticle = Database['public']['Tables']['knowledge_article']['Row']
export type KnowledgeArticleInsert = Database['public']['Tables']['knowledge_article']['Insert']
export type KnowledgeArticleUpdate = Database['public']['Tables']['knowledge_article']['Update']

export type Attachment = Database['public']['Tables']['attachment']['Row']
export type AttachmentInsert = Database['public']['Tables']['attachment']['Insert']
export type AttachmentUpdate = Database['public']['Tables']['attachment']['Update']

export type FieldPermission = Database['public']['Tables']['field_permission']['Row']
export type FieldPermissionInsert = Database['public']['Tables']['field_permission']['Insert']
export type FieldPermissionUpdate = Database['public']['Tables']['field_permission']['Update']

export type AiAction = Database['public']['Tables']['ai_action']['Row']
export type AiActionInsert = Database['public']['Tables']['ai_action']['Insert']
export type AiActionUpdate = Database['public']['Tables']['ai_action']['Update']

export type Contact = Database['public']['Tables']['contact']['Row']
export type ContactInsert = Database['public']['Tables']['contact']['Insert']
export type ContactUpdate = Database['public']['Tables']['contact']['Update']

export type Invite = Database['public']['Tables']['invite']['Row']
export type InviteInsert = Database['public']['Tables']['invite']['Insert']
export type InviteUpdate = Database['public']['Tables']['invite']['Update']

export type TenantRole = Database['public']['Tables']['tenant_role']['Row']
export type TenantRoleInsert = Database['public']['Tables']['tenant_role']['Insert']
export type TenantRoleUpdate = Database['public']['Tables']['tenant_role']['Update']

export type UserRoleAssignment = Database['public']['Tables']['user_role_assignment']['Row']
export type UserRoleAssignmentInsert = Database['public']['Tables']['user_role_assignment']['Insert']
export type UserRoleAssignmentUpdate = Database['public']['Tables']['user_role_assignment']['Update']

// Enum types
export type TicketStatus = Ticket['status']
export type TicketPriority = Ticket['priority']
export type TicketSource = Ticket['source']
export type UserType = AppUser['type']
export type UserStatus = AppUser['status']
export type TeamStatus = Team['status']
export type QueueStatus = Queue['status']
export type QueueVisibility = Queue['visibility']
export type QueueDefaultPriority = Queue['default_priority']
export type QueueRoutingMode = Queue['routing_mode']
export type CommentVisibility = TicketComment['visibility']
export type KnowledgeArticleStatus = KnowledgeArticle['status']
export type SlaMetric = TicketSlaClock['metric']
export type SlaState = TicketSlaClock['state']
export type ApprovalStatus = TicketApproval['status']
export type ApprovalStepStatus = TicketApprovalStep['status']
export type ApproverType = ApprovalStep['approver_type']
export type AiActionType = AiAction['action_type']
export type AiActionStatus = AiAction['status']
export type FieldPermissionEffect = FieldPermission['effect']
export type FieldPermissionMaskType = FieldPermission['mask_type']
export type FieldPermissionPrincipalType = FieldPermission['principal_type']
export type TeamMemberRole = TeamMember['membership_role']
export type QueueMemberRole = QueueMember['membership_role']
export type TenantStatus = Tenant['status']

// Utility types
export type Json = Database['public']['Tables']['tenant']['Row']['settings']

// Extended types with relations
export type TicketWithRelations = Ticket & {
  queue?: Queue
  requester?: AppUser
  reporter?: AppUser
  assignee?: AppUser
  comments?: TicketComment[]
  labels?: (TicketLabel & { label?: Label })[]
  slaPolicy?: SlaPolicy
  currentApproval?: TicketApproval
  slaClocks?: TicketSlaClock[]
}

export type SlaPolicyWithCalendar = SlaPolicy & {
  businessCalendar?: BusinessCalendar
}

export type QueueWithRelations = Queue & {
  ownerTeam?: Team
  defaultSlaPolicy?: SlaPolicy
  defaultApprovalWorkflow?: ApprovalWorkflow
  members?: (QueueMember & { user?: AppUser })[]
}

export type TeamWithMembers = Team & {
  manager?: AppUser
  lead?: AppUser
  members?: (TeamMember & { user?: AppUser })[]
}

export type ApprovalWorkflowWithSteps = ApprovalWorkflow & {
  steps?: ApprovalStep[]
}

// Pagination types
export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Sort types
export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
}

// Filter types
export interface FilterOption {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is'
  value: string | number | boolean | string[] | number[] | null
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedResult<T>> {}
