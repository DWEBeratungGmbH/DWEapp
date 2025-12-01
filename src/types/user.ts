// User-Typen
import type { Task } from './task'
import type { WeClappTimeEntry } from './time-entry'

export type UserRole = 'employee' | 'manager' | 'admin'

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  position?: string;
  role?: UserRole;
  // WeClapp Integration
  weclappUserId?: string;
  profileMatched?: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  mobile?: string;
  active?: boolean;
  lastLoginDate?: number;
  createdDate?: number;
}

export interface WeClappUser {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  username?: string
  title?: string
  birthDate?: Date
  phoneNumber?: string
  mobilePhoneNumber?: string
  faxNumber?: string
  imageId?: string
  status: string // ACTIVE, NOT_ACTIVE, DEPARTURE
  userRoles?: any[]
  licenses?: any[]
  customAttributes?: any
  createdDate?: Date
  lastModifiedDate?: Date
  lastSyncAt: Date
  isActive: boolean
  // Relations
  createdTasks?: Task[]
  assignedTimeEntries?: WeClappTimeEntry[]
  appUser?: any
  fullName?: string
}
