import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { InvitationData, SetupFormData } from "../types";
import { getRoleName } from "../utils/setup-ui";
import { PasswordFields } from "./PasswordFields";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { StudentAcademicFields } from "./StudentAcademicFields";
import { SupervisorFields } from "./SupervisorFields";

interface SetupFormCardProps {
  invitation: InvitationData;
  formData: SetupFormData;
  onFieldChange: (field: keyof SetupFormData, value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  showConfirmPassword: boolean;
  onToggleShowConfirmPassword: () => void;
  onSubmit: (event: FormEvent) => void;
  isSubmitting: boolean;
}

export function SetupFormCard({
  invitation,
  formData,
  onFieldChange,
  showPassword,
  onToggleShowPassword,
  showConfirmPassword,
  onToggleShowConfirmPassword,
  onSubmit,
  isSubmitting,
}: SetupFormCardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = useMemo(() => {
    return [
      { id: "personal", label: "Personal Info" },
      { id: "role", label: "Role Details" },
      { id: "security", label: "Security" },
    ];
  }, []);

  const isLastStep = currentStepIndex === steps.length - 1;
  const currentStep = steps[currentStepIndex]?.id;
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [invitation.role]);

  const validateCurrentStep = () => {
    if (currentStep === "personal") {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("First name and last name are required");
        return false;
      }
      return true;
    }

    if (currentStep === "role") {
      if (invitation.role === "student") {
        if (!formData.matricNumber.trim() || !formData.level || !formData.session.trim()) {
          toast.error("Matric number, level, and session are required");
          return false;
        }
      }

      if (invitation.role === "industrial_supervisor") {
        const companyName = invitation.companyName?.trim() || formData.companyName.trim();
        if (!companyName) {
          toast.error("Company name is required");
          return false;
        }
      }

      return true;
    }

    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Card className="w-full border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Complete Account Setup</CardTitle>
        <CardDescription>
          Welcome! You&apos;ve been invited to join as a{" "}
          <span className="font-semibold">{getRoleName(invitation.role)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="sm:hidden">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
              <p className="text-xs font-medium text-foreground">{steps[currentStepIndex]?.label}</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="mb-2 grid grid-cols-3 gap-2">
              {steps.map((step, index) => (
                <p
                  key={`${step.id}-label`}
                  className={[
                    "text-[11px] font-medium",
                    index <= currentStepIndex ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {index + 1}. {step.label}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {steps.map((step, index) => {
                const isDone = index < currentStepIndex;
                const isActive = index === currentStepIndex;
                const width = isDone ? "100%" : isActive ? "60%" : "0%";

                return (
                  <div key={step.id} className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                      style={{ width }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="rounded-md border border-border/60 p-4">
            {currentStep === "personal" ? (
              <PersonalInfoFields
                invitationEmail={invitation.email}
                formData={formData}
                onFieldChange={onFieldChange}
              />
            ) : null}

            {currentStep === "role" ? (
              <div className="space-y-4">
                {invitation.role === "student" ? (
                  <StudentAcademicFields formData={formData} onFieldChange={onFieldChange} />
                ) : null}
                <SupervisorFields
                  role={invitation.role}
                  invitation={invitation}
                  formData={formData}
                  onFieldChange={onFieldChange}
                />
                {invitation.role !== "student" &&
                invitation.role !== "academic_supervisor" &&
                invitation.role !== "industrial_supervisor" ? (
                  <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                    <p className="text-sm text-muted-foreground">
                      No additional role details are required for this account type.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentStep === "security" ? (
              <PasswordFields
                formData={formData}
                showPassword={showPassword}
                onToggleShowPassword={onToggleShowPassword}
                showConfirmPassword={showConfirmPassword}
                onToggleShowConfirmPassword={onToggleShowConfirmPassword}
                onFieldChange={onFieldChange}
              />
            ) : null}
          </div>

          <div className="flex flex-col-reverse justify-between gap-2 border-t border-border pt-2 sm:flex-row sm:items-center">
            <Link href="/login">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {currentStepIndex > 0 ? (
                <Button type="button" variant="outline" onClick={goBack} className="w-full sm:w-auto">
                  Back
                </Button>
              ) : null}

              {isLastStep ? (
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              ) : (
                <Button type="button" onClick={goNext} className="w-full sm:w-auto">
                  Continue
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
