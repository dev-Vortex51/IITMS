import { apiClient, dedupedGet } from "@/lib/api-client";

export interface ComplianceFormQueryParams {
  student?: string;
  formType?: string;
  status?: "draft" | "submitted" | "approved" | "rejected";
  department?: string;
  page?: number;
  limit?: number;
}

export const complianceFormService = {
  getTemplate: async () => {
    const response = await dedupedGet(
      "/compliance-forms/template",
      {},
      "compliance:template",
    );
    return response.data;
  },

  getComplianceForms: async (params?: ComplianceFormQueryParams) => {
    const response = await dedupedGet(
      "/compliance-forms",
      { params },
      `compliance:list:${JSON.stringify(params || {})}`,
    );
    return response.data;
  },

  getComplianceFormById: async (id: string) => {
    const response = await apiClient.get(`/compliance-forms/${id}`);
    return response.data?.data;
  },

  createComplianceForm: async (payload: FormData) => {
    const response = await apiClient.post("/compliance-forms", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateComplianceForm: async (id: string, payload: FormData) => {
    const response = await apiClient.put(`/compliance-forms/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  submitComplianceForm: async (id: string) => {
    const response = await apiClient.post(`/compliance-forms/${id}/submit`, {});
    return response.data;
  },

  reviewComplianceForm: async (
    id: string,
    payload: { status: "approved" | "rejected"; reviewComment?: string },
  ) => {
    const response = await apiClient.post(`/compliance-forms/${id}/review`, payload);
    return response.data;
  },
};
