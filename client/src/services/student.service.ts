import { apiClient } from "@/lib/api-client";
import { Student, Placement, LogbookEntry, Assessment } from "@/types/models";

export const studentService = {
  // Students
  getAllStudents: async () => {
    const response = await apiClient.get("/students/all");
    return response.data;
  },

  getStudents: async (params?: any) => {
    const response = await apiClient.get("/students", { params });
    return response.data;
  },

  getStudentById: async (id: string): Promise<Student> => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data.data;
  },

  createStudent: async (data: Partial<Student>) => {
    const response = await apiClient.post("/students", data);
    return response.data;
  },

  updateStudent: async (id: string, data: Partial<Student>) => {
    const response = await apiClient.patch(`/students/${id}`, data);
    return response.data;
  },

  deleteStudent: async (id: string) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  // Student Placements
  getStudentPlacement: async (studentId: string): Promise<Placement | null> => {
    try {
      const response = await apiClient.get(`/students/${studentId}/placement`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  assignSupervisors: async (
    studentId: string,
    data: { departmentalSupervisorId: string; industrialSupervisorId: string }
  ) => {
    const response = await apiClient.post(
      `/students/${studentId}/supervisors`,
      data
    );
    return response.data;
  },
};

export const placementService = {
  getAllPlacements: async (params?: any) => {
    const response = await apiClient.get("/placements", { params });
    return response.data;
  },

  getPlacementById: async (id: string): Promise<Placement> => {
    const response = await apiClient.get(`/placements/${id}`);
    return response.data.data;
  },

  createPlacement: async (data: any) => {
    const response = await apiClient.post("/placements", data);
    return response.data;
  },

  updatePlacement: async (id: string, data: Partial<Placement>) => {
    const response = await apiClient.put(`/placements/${id}`, data);
    return response.data;
  },

  updatePlacementByCoordinator: async (id: string, data: any) => {
    const response = await apiClient.patch(`/placements/${id}`, data);
    return response.data;
  },

  withdrawPlacement: async (id: string) => {
    const response = await apiClient.post(`/placements/${id}/withdraw`);
    return response.data;
  },

  approvePlacement: async (id: string, remarks?: string) => {
    const response = await apiClient.patch(`/placements/${id}/approve`, {
      remarks,
    });
    return response.data;
  },

  rejectPlacement: async (id: string, remarks: string) => {
    const response = await apiClient.patch(`/placements/${id}/reject`, {
      remarks,
    });
    return response.data;
  },

  // Placements assigned to the current supervisor (academic/industrial)
  getMyPlacements: async () => {
    const response = await apiClient.get(`/placements`);
    return response.data?.data || [];
  },
};

export const logbookService = {
  getAllLogbooks: async (params?: any) => {
    const response = await apiClient.get("/logbooks", { params });
    return response.data;
  },

  getLogbookById: async (id: string): Promise<LogbookEntry> => {
    const response = await apiClient.get(`/logbooks/${id}`);
    return response.data.data;
  },

  createLogbookEntry: async (data: FormData) => {
    const response = await apiClient.post("/logbooks", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateLogbookEntry: async (id: string, data: Partial<LogbookEntry>) => {
    const response = await apiClient.patch(`/logbooks/${id}`, data);
    return response.data;
  },

  approveLogbookEntry: async (id: string, comment?: string) => {
    const response = await apiClient.patch(`/logbooks/${id}/approve`, {
      comment,
    });
    return response.data;
  },

  rejectLogbookEntry: async (id: string, comment: string) => {
    const response = await apiClient.patch(`/logbooks/${id}/reject`, {
      comment,
    });
    return response.data;
  },
};

export const assessmentService = {
  getAllAssessments: async (params?: any) => {
    const response = await apiClient.get("/assessments", { params });
    return response.data;
  },

  getAssessmentById: async (id: string): Promise<Assessment> => {
    const response = await apiClient.get(`/assessments/${id}`);
    return response.data.data;
  },

  createAssessment: async (data: Partial<Assessment>) => {
    const response = await apiClient.post("/assessments", data);
    return response.data;
  },

  updateAssessment: async (id: string, data: Partial<Assessment>) => {
    const response = await apiClient.patch(`/assessments/${id}`, data);
    return response.data;
  },

  submitAssessment: async (id: string) => {
    const response = await apiClient.post(`/assessments/${id}/submit`);
    return response.data;
  },
};

// Create combined service object for convenience
const combinedStudentService = {
  ...studentService,
  placementService,
  logbookService,
  assessmentService,
};

export { combinedStudentService };
