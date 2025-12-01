// Auftrag-Typen
import type { WeClappParty } from './party'
import type { WeClappTimeEntry } from './time-entry'

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerAddress?: string
  status: string
  totalAmount?: number
  createdDate: number
  lastModifiedDate?: number
}

export interface OrderItem {
  id: string
  orderId: string
  articleNumber?: string
  description?: string
  quantity?: number
  price?: number
}

export interface WeClappOrder {
  id: string
  orderNumber?: string
  orderNumberAtCustomer?: string
  orderStatus?: string
  orderDate?: Date
  customerId?: string
  invoiceRecipientId?: string
  totalAmount?: number
  currency?: string
  note?: string
  invoiced?: boolean
  paid?: boolean
  shipped?: boolean
  servicesFinished?: boolean
  projectModeActive?: boolean
  warehouseId?: string
  quotationId?: string
  plannedProjectStartDate?: Date
  plannedProjectEndDate?: Date
  billingAddress?: any
  shippingAddress?: any
  orderItems?: any[]
  payments?: any[]
  projectMembers?: any[]
  statusHistory?: any[]
  customAttributes?: any
  createdDate: Date
  lastModifiedDate: Date
  lastSyncAt: Date
  isActive: boolean
  // Relations
  customer?: WeClappParty
  timeEntries?: WeClappTimeEntry[]
  timeEntriesCount?: number
  totalTrackedTime?: number
  totalBillableTime?: number
}
