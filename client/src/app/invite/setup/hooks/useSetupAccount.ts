import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
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

const INVITE_CACHE_PREFIX = "itms:invite:invitation:";
const DRAFT_CACHE_PREFIX = "itms:invite:setup-draft:";
const QUEUED_SETUP_PREFIX = "itms:invite:queued-setup:";

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export function useSetupAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invitationCacheKey = token ? `${INVITE_CACHE_PREFIX}${token}` : "";
  const draftCacheKey = token ? `${DRAFT_CACHE_PREFIX}${token}` : "";
  const queuedSetupKey = token ? `${QUEUED_SETUP_PREFIX}${token}` : "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SetupFormData>(initialFormData);
  const [isOnline, setIsOnline] = useState(true);
  const [cachedInvitation, setCachedInvitation] = useState<InvitationData | null>(null);
  const [hasQueuedSetup, setHasQueuedSetup] = useState(false);
  const [isSyncingQueuedSetup, setIsSyncingQueuedSetup] = useState(false);
  const syncInFlight = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setIsOnline(window.navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setCachedInvitation(null);
      setHasQueuedSetup(false);
      return;
    }

    const storedInvitation = readJson<InvitationData | null>(invitationCacheKey, null);
    if (storedInvitation) {
      setCachedInvitation(storedInvitation);
    }

    const storedDraft = readJson<SetupFormData | null>(draftCacheKey, null);
    if (storedDraft) {
      setFormData((prev) => ({ ...prev, ...storedDraft }));
    }

    const queued = readJson<any | null>(queuedSetupKey, null);
    setHasQueuedSetup(Boolean(queued));
  }, [token, invitationCacheKey, draftCacheKey, queuedSetupKey]);

  const invitationQuery = useQuery({
    queryKey: ["verify-invitation", token],
    queryFn: () => invitationService.verifyToken(token!),
    enabled: !!token && isOnline,
    retry: false,
  });

  const invitation: InvitationData | undefined = invitationQuery.data?.data || cachedInvitation || undefined;

  useEffect(() => {
    if (!invitation) return;

    if (typeof window !== "undefined" && invitationCacheKey) {
      window.localStorage.setItem(invitationCacheKey, JSON.stringify(invitation));
    }
    setCachedInvitation(invitation);

    setFormData((prev) => ({
      ...prev,
      companyName: invitation.companyName || prev.companyName,
      companyAddress: invitation.companyAddress || prev.companyAddress,
      position: invitation.position || prev.position,
      yearsOfExperience:
        invitation.yearsOfExperience?.toString() || prev.yearsOfExperience,
    }));
  }, [invitation, invitationCacheKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !draftCacheKey) {
      return;
    }
    window.localStorage.setItem(draftCacheKey, JSON.stringify(formData));
  }, [formData, draftCacheKey]);

  const setupMutation = useMutation({
    mutationFn: (data: any) => invitationService.completeSetup(data),
    onSuccess: () => {
      toast.success("Account created successfully! You can now login.");
      if (typeof window !== "undefined") {
        if (draftCacheKey) {
          window.localStorage.removeItem(draftCacheKey);
        }
        if (queuedSetupKey) {
          window.localStorage.removeItem(queuedSetupKey);
        }
      }
      setHasQueuedSetup(false);
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

  const syncQueuedSetup = useCallback(async () => {
    if (!token || !isOnline || syncInFlight.current || !queuedSetupKey) {
      return;
    }
    const queued = readJson<any | null>(queuedSetupKey, null);
    if (!queued) {
      setHasQueuedSetup(false);
      return;
    }

    syncInFlight.current = true;
    setIsSyncingQueuedSetup(true);

    try {
      await setupMutation.mutateAsync(queued);
    } catch {
      toast.error("Queued setup submission could not sync yet.");
    } finally {
      setIsSyncingQueuedSetup(false);
      syncInFlight.current = false;
      const stillQueued = readJson<any | null>(queuedSetupKey, null);
      setHasQueuedSetup(Boolean(stillQueued));
    }
  }, [isOnline, queuedSetupKey, setupMutation, token]);

  useEffect(() => {
    if (isOnline && hasQueuedSetup) {
      void syncQueuedSetup();
    }
  }, [hasQueuedSetup, isOnline, syncQueuedSetup]);

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
      const companyName = invitation.companyName || formData.companyName;
      if (!companyName?.trim()) {
        toast.error("Company name is missing. Contact your coordinator.");
        return;
      }

      setupData.companyName = companyName;
      setupData.companyAddress =
        invitation.companyAddress || formData.companyAddress;
      setupData.position = invitation.position || formData.position;
      setupData.yearsOfExperience = invitation.yearsOfExperience
        ? Number(invitation.yearsOfExperience)
        : formData.yearsOfExperience
        ? parseInt(formData.yearsOfExperience, 10)
        : undefined;
    }

    if (!isOnline) {
      if (typeof window !== "undefined" && queuedSetupKey) {
        window.localStorage.setItem(queuedSetupKey, JSON.stringify(setupData));
      }
      setHasQueuedSetup(true);
      toast.info("Setup submission queued offline. It will submit automatically when online.");
      return;
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
    isOnline,
    hasQueuedSetup,
    isSyncingQueuedSetup,
    syncQueuedSetup,
  };
}
