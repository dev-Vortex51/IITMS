import { apiClient, dedupedGet } from "@/lib/api-client";

export interface VisitQueryParams {
  student?: string;
  supervisor?: string;
  type?: "physical" | "virtual";
  status?: "scheduled" | "completed" | "cancelled";
  department?: string;
  page?: number;
  limit?: number;
}

export const visitService = {
  getVisits: async (params?: VisitQueryParams) => {
    const response = await dedupedGet(
      "/visits",
      { params },
      `visits:list:${JSON.stringify(params || {})}`,
    );
    return response.data;
  },

  getVisitById: async (id: string) => {
    const response = await apiClient.get(`/visits/${id}`);
    return response.data?.data;
  },

  createVisit: async (payload: any) => {
    const response = await apiClient.post("/visits", payload);
    return response.data;
  },

  updateVisit: async (id: string, payload: any) => {
    const response = await apiClient.put(`/visits/${id}`, payload);
    return response.data;
  },

  completeVisit: async (id: string, payload?: any) => {
    const response = await apiClient.post(`/visits/${id}/complete`, payload || {});
    return response.data;
  },

  cancelVisit: async (id: string, payload?: any) => {
    const response = await apiClient.post(`/visits/${id}/cancel`, payload || {});
    return response.data;
  },
};
