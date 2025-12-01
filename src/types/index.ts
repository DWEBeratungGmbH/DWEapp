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

export interface Project extends WeClappProject {
  tasks?: WeClappTask[];
  progress?: number;
  teamMembers?: User[];
}

// Export Task types
export * from './task'
export * from './user'
export * from './order'
export * from './party'
export * from './time-entry'

// Re-export WeClapp types for compatibility
import type { Task } from './task'
export type WeClappTask = Task

export interface WeClappProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeClappTaskTemplate {
  id: string;
  name: string;
  description?: string;
  estimatedHours?: number;
  defaultPriority: string;
  taskType: string;
}

