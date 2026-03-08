import { apiClient, dedupedGet } from "@/lib/api-client";

export interface EvaluationQueryParams {
  student?: string;
  supervisor?: string;
  type?: "midterm" | "final";
  status?: "draft" | "submitted" | "completed";
  page?: number;
  limit?: number;
}

export const evaluationService = {
  getEvaluations: async (params?: EvaluationQueryParams) => {
    const response = await dedupedGet(
      "/evaluations",
      { params },
      `evaluations:list:${JSON.stringify(params || {})}`,
    );
    return response.data;
  },

  getEvaluationById: async (id: string) => {
    const response = await apiClient.get(`/evaluations/${id}`);
    return response.data?.data;
  },

  createEvaluation: async (payload: any) => {
    const response = await apiClient.post("/evaluations", payload);
    return response.data;
  },

  updateEvaluation: async (id: string, payload: any) => {
    const response = await apiClient.put(`/evaluations/${id}`, payload);
    return response.data;
  },

  submitEvaluation: async (id: string) => {
    const response = await apiClient.post(`/evaluations/${id}/submit`);
    return response.data;
  },

  completeEvaluation: async (id: string) => {
    const response = await apiClient.post(`/evaluations/${id}/complete`);
    return response.data;
  },
};
