// Task-Typen für die gesamte App
import type { WeClappUser } from './user'
import type { WeClappParty } from './party'
import type { WeClappTimeEntry } from './time-entry'
import type { WeClappOrder } from './order'

export interface TaskAssignee {
  id: string
  userId: string
  plannedEffort?: number
  firstName?: string
  lastName?: string
  fullName?: string
}

export interface Task {
  id: string
  subject: string
  description?: string
  identifier?: string
  taskStatus: TaskStatus
  taskPriority: TaskPriority
  taskVisibilityType?: string
  dateFrom?: number
  dateTo?: number
  plannedEffort?: number
  positionNumber?: number
  assignees: TaskAssignee[]
  watchers: { id: string }[]
  creatorUserId?: string
  parentTaskId?: string
  previousTaskId?: string
  orderItemId?: string
  customerId?: string
  articleId?: string
  ticketId?: string
  calendarEventId?: string
  userOfLastStatusChangeId?: string
  allowOverBooking?: boolean
  allowTimeBooking?: boolean
  billableStatus?: boolean
  invoicingStatus?: string
  createdDate?: number
  lastModifiedDate?: number
  // App-spezifisch
  isAssignee?: boolean
  isWatcher?: boolean
  canEdit?: boolean
  canDelete?: boolean
  subTasks?: Task[]
  // Relations
  creator?: WeClappUser
  customer?: WeClappParty
  parentTask?: Task
  previousTask?: Task
  order?: WeClappOrder
  timeEntries?: WeClappTimeEntry[]
}

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'WAITING_ON_OTHERS'
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface TaskStats {
  total: number
  open: number
  inProgress: number
  completed: number
  highPriority: number
}

