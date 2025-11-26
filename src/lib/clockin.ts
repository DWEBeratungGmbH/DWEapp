import axios from "axios";

const CLOCKIN_BASE_URL = process.env.NEXT_PUBLIC_CLOCKIN_API_URL;
const CLOCKIN_API_KEY = process.env.NEXT_PUBLIC_CLOCKIN_API_KEY;

export const clockinApi = axios.create({
  baseURL: CLOCKIN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${CLOCKIN_API_KEY}`,
  },
});

export interface ClockInUser {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

export interface ClockInTimeEntry {
  id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  description?: string;
  type: "work" | "break" | "meeting";
  tags?: string[];
}

export interface ClockInProject {
  id: string;
  name: string;
  description?: string;
  customerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const clockinService = {
  // Users
  async getUsers(): Promise<ClockInUser[]> {
    const response = await clockinApi.get("/users");
    return response.data;
  },

  async getCurrentUser(): Promise<ClockInUser> {
    const response = await clockinApi.get("/users/me");
    return response.data;
  },

  // Time Entries
  async getTimeEntries(userId?: string, startDate?: string, endDate?: string): Promise<ClockInTimeEntry[]> {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const response = await clockinApi.get(`/time-entries?${params.toString()}`);
    return response.data;
  },

  async createTimeEntry(entry: Omit<ClockInTimeEntry, "id">): Promise<ClockInTimeEntry> {
    const response = await clockinApi.post("/time-entries", entry);
    return response.data;
  },

  async updateTimeEntry(id: string, entry: Partial<ClockInTimeEntry>): Promise<ClockInTimeEntry> {
    const response = await clockinApi.put(`/time-entries/${id}`, entry);
    return response.data;
  },

  async deleteTimeEntry(id: string): Promise<void> {
    await clockinApi.delete(`/time-entries/${id}`);
  },

  async startTimer(userId: string, taskId?: string, description?: string): Promise<ClockInTimeEntry> {
    const response = await clockinApi.post("/timer/start", {
      userId,
      taskId,
      description,
      type: "work",
    });
    return response.data;
  },

  async stopTimer(timerId: string): Promise<ClockInTimeEntry> {
    const response = await clockinApi.post("/timer/stop", { timerId });
    return response.data;
  },

  async getCurrentTimer(userId: string): Promise<ClockInTimeEntry | null> {
    try {
      const response = await clockinApi.get(`/timer/current/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Projects
  async getProjects(): Promise<ClockInProject[]> {
    const response = await clockinApi.get("/projects");
    return response.data;
  },

  async createProject(project: Omit<ClockInProject, "id" | "createdAt" | "updatedAt">): Promise<ClockInProject> {
    const response = await clockinApi.post("/projects", project);
    return response.data;
  },

  async syncProjectWithWeClapp(weClappProjectId: string): Promise<ClockInProject> {
    const response = await clockinApi.post("/projects/sync/weclapp", {
      weClappProjectId,
    });
    return response.data;
  },
};
