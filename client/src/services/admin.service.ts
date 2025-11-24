import { apiClient } from "@/lib/api-client";
import { Supervisor, Faculty, Department } from "@/types/models";

export const supervisorService = {
  getAllSupervisors: async (params?: any) => {
    const response = await apiClient.get("/supervisors", { params });
    return response.data;
  },

  getSupervisorById: async (id: string): Promise<Supervisor> => {
    const response = await apiClient.get(`/supervisors/${id}`);
    return response.data.data;
  },

  createSupervisor: async (data: Partial<Supervisor>) => {
    const response = await apiClient.post("/supervisors", data);
    return response.data;
  },

  updateSupervisor: async (id: string, data: Partial<Supervisor>) => {
    const response = await apiClient.patch(`/supervisors/${id}`, data);
    return response.data;
  },

  deleteSupervisor: async (id: string) => {
    const response = await apiClient.delete(`/supervisors/${id}`);
    return response.data;
  },

  getAssignedStudents: async (supervisorId: string) => {
    const response = await apiClient.get(
      `/supervisors/${supervisorId}/students`
    );
    return response.data;
  },
};

export const facultyService = {
  getAllFaculties: async (params?: any) => {
    const response = await apiClient.get("/faculties", { params });
    return response.data;
  },

  getFacultyById: async (id: string): Promise<Faculty> => {
    const response = await apiClient.get(`/faculties/${id}`);
    return response.data.data;
  },

  createFaculty: async (data: Partial<Faculty>) => {
    const response = await apiClient.post("/faculties", data);
    return response.data;
  },

  updateFaculty: async (id: string, data: Partial<Faculty>) => {
    const response = await apiClient.patch(`/faculties/${id}`, data);
    return response.data;
  },

  deleteFaculty: async (id: string) => {
    const response = await apiClient.delete(`/faculties/${id}`);
    return response.data;
  },
};

export const departmentService = {
  getAllDepartments: async (params?: any) => {
    const response = await apiClient.get("/departments", { params });
    return response.data;
  },

  getDepartmentById: async (id: string): Promise<Department> => {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data.data;
  },

  createDepartment: async (data: Partial<Department>) => {
    const response = await apiClient.post("/departments", data);
    return response.data;
  },

  updateDepartment: async (id: string, data: Partial<Department>) => {
    const response = await apiClient.patch(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: string) => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  },

  assignCoordinator: async (id: string, coordinatorId: string) => {
    const response = await apiClient.patch(`/departments/${id}/coordinator`, {
      coordinatorId,
    });
    return response.data;
  },

  getAvailableCoordinators: async () => {
    const response = await apiClient.get("/users", {
      params: { role: "coordinator" },
    });
    return response.data;
  },

  getAvailableCoordinatorsForDepartment: async (departmentId: string) => {
    const response = await apiClient.get(
      `/departments/${departmentId}/available-coordinators`
    );
    return response.data;
  },
};

export const userService = {
  getAllUsers: async (params?: any) => {
    const response = await apiClient.get("/users", { params });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await apiClient.post("/users", userData);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await apiClient.patch(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

export const reportService = {
  getStudentReport: async (studentId: string) => {
    const response = await apiClient.get(`/reports/student/${studentId}`);
    return response.data;
  },

  getDepartmentReport: async (departmentId: string) => {
    const response = await apiClient.get(`/reports/department/${departmentId}`);
    return response.data;
  },

  getSystemReport: async () => {
    const response = await apiClient.get("/reports/system");
    return response.data;
  },

  exportReport: async (type: string, id?: string) => {
    const url = id
      ? `/reports/${type}/${id}/export`
      : `/reports/${type}/export`;
    const response = await apiClient.get(url, { responseType: "blob" });
    return response.data;
  },
};

// Export combined service as default
const adminService = {
  supervisorService,
  facultyService,
  departmentService,
  userService,
  reportService,
};

export default adminService;
