import { apiClient, dedupedGet } from "@/lib/api-client";

export interface TechnicalReportQueryParams {
  student?: string;
  status?: "draft" | "submitted" | "approved" | "rejected";
  department?: string;
  page?: number;
  limit?: number;
}

export const technicalReportService = {
  getTechnicalReports: async (params?: TechnicalReportQueryParams) => {
    const response = await dedupedGet(
      "/technical-reports",
      { params },
      `technical-reports:list:${JSON.stringify(params || {})}`,
    );
    return response.data;
  },

  getTechnicalReportById: async (id: string) => {
    const response = await apiClient.get(`/technical-reports/${id}`);
    return response.data?.data;
  },

  createTechnicalReport: async (payload: FormData) => {
    const response = await apiClient.post("/technical-reports", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateTechnicalReport: async (id: string, payload: FormData) => {
    const response = await apiClient.put(`/technical-reports/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  submitTechnicalReport: async (id: string) => {
    const response = await apiClient.post(`/technical-reports/${id}/submit`, {});
    return response.data;
  },

  reviewTechnicalReport: async (
    id: string,
    payload: { status: "approved" | "rejected"; reviewComment?: string },
  ) => {
    const response = await apiClient.post(`/technical-reports/${id}/review`, payload);
    return response.data;
  },
};
