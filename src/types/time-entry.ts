// TimeEntry-Typen
import type { Task } from './task'
import type { WeClappUser } from './user'
import type { WeClappParty } from './party'
import type { WeClappOrder } from './order'

export interface WeClappTimeEntry {
  id: string
  taskId?: string
  userId?: string
  customerId?: string
  projectId?: string
  salesOrderId?: string
  articleId?: string
  ticketId?: string
  description?: string
  startDate?: Date
  durationSeconds?: number
  billableDurationSeconds?: number
  billable?: boolean
  billableInvoiceStatus?: string
  hourlyRate?: number
  printOnPerformanceRecord?: boolean
  createdDate: Date
  lastModifiedDate: Date
  customAttributes?: any
  lastSyncAt: Date
  isActive: boolean
  // Relations
  task?: Task
  user?: WeClappUser
  customer?: WeClappParty
  salesOrder?: WeClappOrder
}
