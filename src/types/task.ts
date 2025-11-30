// Task-Typen für die gesamte App

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
  dateFrom?: number
  dateTo?: number
  plannedEffort?: number
  assignees: TaskAssignee[]
  watchers: { id: string }[]
  creatorUserId?: string
  parentTaskId?: string
  orderItemId?: string
  customerId?: string
  createdDate?: number
  lastModifiedDate?: number
  // App-spezifisch
  isAssignee?: boolean
  isWatcher?: boolean
  canEdit?: boolean
  canDelete?: boolean
  subTasks?: Task[]
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

export interface WeClappUser {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  active: boolean
}
