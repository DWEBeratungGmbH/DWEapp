import axios from "axios";

const WECLAPP_BASE_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL;
const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY;

export const weclappApi = axios.create({
  baseURL: WECLAPP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "AuthenticationToken": WECLAPP_API_KEY,
  },
});

export interface WeClappSalesOrder {
  id: string;
  orderNumber: string;
  orderDate: number;
  status: string;
  customerId: string;
  customerNumber: string;
  netAmount: string;
  grossAmount: string;
  recordCurrencyName: string;
  description?: string;
  invoiceAddress?: {
    firstName?: string;
    lastName?: string;
    city?: string;
    street1?: string;
    zipcode?: string;
    countryCode?: string;
  };
  orderItems?: Array<{
    id: string;
    title: string;
    quantity: string;
    unitPrice: string;
    articleNumber?: string;
    description?: string;
  }>;
  tasks?: Array<{
    id: string;
  }>;
}

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
  projectId?: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  estimatedHours?: number;
  actualHours?: number;
  assignedUserId?: string;
  dueDate?: number;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  orderNumber?: string;
  createdDate?: number;
  orderInfo?: {
    id: string;
    orderNumber: string;
    status: string;
    customerNumber: string;
    invoiceAddress?: {
      firstName?: string;
      lastName?: string;
      city?: string;
    }
  };
}

export interface WeClappTaskTemplate {
  id: string;
  name: string;
  description?: string;
  estimatedHours?: number;
  defaultPriority: string;
  taskType: string;
}

export interface WeClappUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  active: boolean;
  roles?: string[];
  department?: string;
  position?: string;
  phone?: string;
  mobile?: string;
  createdDate?: number;
  lastLoginDate?: number;
}

export const weclappService = {
  // Projects
  async getProjects(): Promise<WeClappProject[]> {
    const response = await weclappApi.get("/project");
    return response.data.result;
  },

  async getProject(id: string): Promise<WeClappProject> {
    const response = await weclappApi.get(`/project/${id}`);
    return response.data.result;
  },

  async createProject(project: Partial<WeClappProject>): Promise<WeClappProject> {
    const response = await weclappApi.post("/project", project);
    return response.data.result;
  },

  async updateProject(id: string, project: Partial<WeClappProject>): Promise<WeClappProject> {
    const response = await weclappApi.put(`/project/${id}`, project);
    return response.data.result;
  },

  // Tasks
  async getTasks(projectId?: string): Promise<WeClappTask[]> {
    const url = projectId ? `/task?projectId=${projectId}` : "/task";
    const response = await weclappApi.get(url);
    return response.data.result;
  },

  async getTask(id: string): Promise<WeClappTask> {
    const response = await weclappApi.get(`/task/${id}`);
    return response.data.result;
  },

  async createTask(task: Partial<WeClappTask>): Promise<WeClappTask> {
    const response = await weclappApi.post("/task", task);
    return response.data.result;
  },

  async updateTask(id: string, task: Partial<WeClappTask>): Promise<WeClappTask> {
    const response = await weclappApi.put(`/task/${id}`, task);
    return response.data.result;
  },

  async updateTaskTime(id: string, actualHours: number): Promise<WeClappTask> {
    const response = await weclappApi.put(`/task/${id}`, { actualHours });
    return response.data.result;
  },

  // Task Templates
  async getTaskTemplates(): Promise<WeClappTaskTemplate[]> {
    const response = await weclappApi.get("/taskTemplate");
    return response.data.result;
  },

  async createTaskFromTemplate(templateId: string, projectId: string): Promise<WeClappTask> {
    const template = await weclappApi.get(`/taskTemplate/${templateId}`);
    const taskData = {
      ...template.data.result,
      projectId,
    };
    const response = await weclappApi.post("/task", taskData);
    return response.data.result;
  },

  // Users
  async getUsers(): Promise<WeClappUser[]> {
    const response = await weclappApi.get("/user");
    return response.data.result;
  },

  async getUser(id: string): Promise<WeClappUser> {
    const response = await weclappApi.get(`/user/${id}`);
    return response.data.result;
  },

  async getActiveUsers(): Promise<WeClappUser[]> {
    const allUsers = await this.getUsers();
    return allUsers.filter(user => user.active === true);
  },
};
