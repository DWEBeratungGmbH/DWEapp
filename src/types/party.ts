// Party-Typen (Kunden & Lieferanten)
import type { Task } from './task'
import type { WeClappOrder } from './order'
import type { WeClappTimeEntry } from './time-entry'

export interface WeClappParty {
  id: string
  partyType?: string // ORGANIZATION, PERSON
  company?: string
  company2?: string
  firstName?: string
  lastName?: string
  middleName?: string
  salutation?: string
  email?: string
  emailHome?: string
  phone?: string
  mobilePhone1?: string
  fax?: string
  website?: string
  birthDate?: Date
  customer?: boolean
  customerNumber?: string
  customerBlocked?: boolean
  customerCreditLimit?: number
  supplier?: boolean
  supplierNumber?: string
  primaryAddressId?: string
  invoiceAddressId?: string
  deliveryAddressId?: string
  addresses?: any[]
  bankAccounts?: any[]
  contacts?: any[]
  tags?: any[]
  customAttributes?: any
  createdDate?: Date
  lastModifiedDate?: Date
  lastSyncAt: Date
  isActive: boolean
  // Relations
  tasks?: Task[]
  orders?: WeClappOrder[]
  timeEntries?: WeClappTimeEntry[]
  displayName?: string
  stats?: any
}
