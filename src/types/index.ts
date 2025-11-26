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
  tasks?: Task[];
  progress?: number;
  teamMembers?: User[];
}

export interface Task extends WeClappTask {
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
  timeEntries?: TimeEntry[];
}

export interface TaskTemplate extends WeClappTaskTemplate {
  isFavorite?: boolean;
  usageCount?: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description?: string;
  clockInId?: string;
  syncedToWeClapp: boolean;
}

export interface ClockInEntry {
  id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  description?: string;
  type: "work" | "break" | "meeting";
}

// Re-export WeClapp types
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

export interface WeClappTask {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  estimatedHours?: number;
  actualHours?: number;
  assignedUserId?: string;
  dueDate?: string;
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
