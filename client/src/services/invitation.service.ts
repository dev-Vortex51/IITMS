import { apiClient } from "@/lib/api-client";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Create a public axios instance for unauthenticated requests
const publicClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Invitation {
  _id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  invitedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  invitedByRole: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  metadata?: {
    department?: {
      _id: string;
      name: string;
      code: string;
    };
    faculty?: {
      _id: string;
      name: string;
      code: string;
    };
    matricNumber?: string;
    level?: number;
    session?: string;
  };
  resendCount: number;
  lastResentAt?: string;
  acceptedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvitationData {
  email: string;
  role: string;
  metadata?: {
    department?: string;
    faculty?: string;
    matricNumber?: string;
    level?: number;
    session?: string;
  };
}

export interface CompleteSetupData {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  matricNumber?: string;
  level?: number;
  session?: string;
  specialization?: string;
}

export interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
  cancelled: number;
}

const baseUrl = "/invitations";

const createInvitation = async (data: CreateInvitationData) => {
  console.log("Creating invitation with data:", data);
  console.log("Using API URL:", API_URL);
  console.log("Full URL:", `${API_URL}${baseUrl}`);

  try {
    const response = await apiClient.post(baseUrl, data);
    console.log("Invitation created successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating invitation:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    throw error;
  }
};

const getInvitations = async (filters?: {
  status?: string;
  role?: string;
  email?: string;
}) => {
  const response = await apiClient.get(baseUrl, { params: filters });
  return response.data;
};

const getInvitationById = async (id: string) => {
  const response = await apiClient.get(`${baseUrl}/${id}`);
  return response.data;
};

const verifyToken = async (token: string) => {
  const response = await publicClient.get(`${baseUrl}/verify/${token}`);
  return response.data;
};

const completeSetup = async (data: CompleteSetupData) => {
  const response = await publicClient.post(`${baseUrl}/complete-setup`, data);
  return response.data;
};

const resendInvitation = async (id: string) => {
  const response = await apiClient.post(`${baseUrl}/${id}/resend`);
  return response.data;
};

const cancelInvitation = async (id: string) => {
  const response = await apiClient.delete(`${baseUrl}/${id}`);
  return response.data;
};

const getStatistics = async () => {
  const response = await apiClient.get(`${baseUrl}/stats`);
  return response.data;
};

const cleanupExpired = async () => {
  const response = await apiClient.post(`${baseUrl}/cleanup`);
  return response.data;
};

export const invitationService = {
  createInvitation,
  getInvitations,
  getInvitationById,
  verifyToken,
  completeSetup,
  resendInvitation,
  cancelInvitation,
  getStatistics,
  cleanupExpired,
};

export default invitationService;
