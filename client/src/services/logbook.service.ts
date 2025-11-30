import { apiClient } from "@/lib/api-client";

export interface LogbookEntry {
  _id: string;
  student: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasksPerformed: string;
  skillsAcquired?: string;
  challenges?: string;
  lessonsLearned?: string;
  evidence?: {
    name: string;
    path: string;
    type: string;
    uploadedAt: string;
  }[];
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  submittedAt?: string;
  reviews?: {
    supervisor: any;
    supervisorType: "departmental" | "industrial";
    comment: string;
    rating?: number;
    status: string;
    reviewedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogbookData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasksPerformed: string;
  skillsAcquired?: string;
  challenges?: string;
  lessonsLearned?: string;
}

export const logbookService = {
  // Get all logbooks for current student
  getLogbooks: async (filters?: any): Promise<{ data: LogbookEntry[] }> => {
    const response = await apiClient.get("/logbooks", { params: filters });
    return response.data;
  },

  // Get logbook by ID
  getLogbookById: async (id: string): Promise<LogbookEntry> => {
    const response = await apiClient.get(`/logbooks/${id}`);
    return response.data.data;
  },

  // Create logbook entry
  createLogbookEntry: async (
    data: CreateLogbookData
  ): Promise<LogbookEntry> => {
    const response = await apiClient.post("/logbooks", data);
    return response.data.data;
  },

  // Update logbook entry (draft only)
  updateLogbookEntry: async (
    id: string,
    data: Partial<CreateLogbookData>
  ): Promise<LogbookEntry> => {
    const response = await apiClient.put(`/logbooks/${id}`, data);
    return response.data.data;
  },

  // Submit logbook entry
  submitLogbookEntry: async (id: string): Promise<LogbookEntry> => {
    const response = await apiClient.post(`/logbooks/${id}/submit`);
    return response.data.data;
  },

  // Upload evidence file
  uploadEvidence: async (id: string, file: File): Promise<LogbookEntry> => {
    const formData = new FormData();
    formData.append("evidence", file);
    const response = await apiClient.post(
      `/logbooks/${id}/evidence`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },
};
