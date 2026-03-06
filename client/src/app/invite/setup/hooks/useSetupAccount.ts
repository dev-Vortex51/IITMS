import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import invitationService from "@/services/invitation.service";
import type { InvitationData, SetupFormData } from "../types";

const initialFormData: SetupFormData = {
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
  phone: "",
  matricNumber: "",
  level: "",
  session: "",
  specialization: "",
  companyName: "",
  companyAddress: "",
  position: "",
  yearsOfExperience: "",
};

export function useSetupAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SetupFormData>(initialFormData);

  const invitationQuery = useQuery({
    queryKey: ["verify-invitation", token],
    queryFn: () => invitationService.verifyToken(token!),
    enabled: !!token,
    retry: false,
  });

  const invitation: InvitationData | undefined = invitationQuery.data?.data;

  useEffect(() => {
    if (!invitation) return;

    setFormData((prev) => ({
      ...prev,
      companyName: invitation.companyName || prev.companyName,
      companyAddress: invitation.companyAddress || prev.companyAddress,
      position: invitation.position || prev.position,
      yearsOfExperience:
        invitation.yearsOfExperience?.toString() || prev.yearsOfExperience,
    }));
  }, [invitation]);

  const setupMutation = useMutation({
    mutationFn: (data: any) => invitationService.completeSetup(data),
    onSuccess: () => {
      toast.success("Account created successfully! You can now login.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create account");
    },
  });

  const setFieldValue = (field: keyof SetupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast.error("Invalid invitation token");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    const setupData: any = {
      token,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      phone: formData.phone,
    };

    if (invitation?.role === "student") {
      if (!formData.matricNumber || !formData.level || !formData.session) {
        toast.error("Please fill in all student information");
        return;
      }

      setupData.matricNumber = formData.matricNumber;
      setupData.level = parseInt(formData.level, 10);
      setupData.session = formData.session;
    }

    if (
      invitation?.role === "academic_supervisor" ||
      invitation?.role === "industrial_supervisor"
    ) {
      setupData.specialization = formData.specialization;
    }

    if (invitation?.role === "industrial_supervisor") {
      if (!formData.companyName) {
        toast.error("Please enter company name");
        return;
      }

      setupData.companyName = formData.companyName;
      setupData.companyAddress = formData.companyAddress;
      setupData.position = formData.position;
      setupData.yearsOfExperience = formData.yearsOfExperience
        ? parseInt(formData.yearsOfExperience, 10)
        : undefined;
    }

    setupMutation.mutate(setupData);
  };

  return {
    token,
    invitation,
    isLoadingInvitation: invitationQuery.isLoading,
    formData,
    setFieldValue,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleSubmit,
    isSubmitting: setupMutation.isPending,
  };
}
