"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import invitationService from "@/services/invitation.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SetupAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    // Student-specific
    matricNumber: "",
    level: "",
    session: "",
    // Supervisor-specific
    specialization: "",
    // Industrial supervisor-specific
    companyName: "",
    companyAddress: "",
    position: "",
    yearsOfExperience: "",
  });

  // Verify token and get invitation details
  const { data: invitationData, isLoading } = useQuery({
    queryKey: ["verify-invitation", token],
    queryFn: () => invitationService.verifyToken(token!),
    enabled: !!token,
    retry: false,
  });

  const invitation = invitationData?.data;

  // Setup mutation
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Prepare data based on role
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
      setupData.level = parseInt(formData.level);
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
        ? parseInt(formData.yearsOfExperience)
        : undefined;
    }

    setupMutation.mutate(setupData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      coordinator: "Coordinator",
      academic_supervisor: "Academic Supervisor",
      student: "Student",
      industrial_supervisor: "Industrial Supervisor",
    };
    return roleNames[role] || role;
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-destructive">
              Invalid Link
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              This invitation link is invalid. Please check your email for the
              correct link.
            </p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-destructive">
              Invalid or Expired Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              This invitation link is invalid or has expired. Please contact
              your administrator for a new invitation.
            </p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Complete Your Account Setup
          </CardTitle>
          <CardDescription className="text-center">
            Welcome! You&apos;ve been invited to join as a{" "}
            <span className="font-semibold">
              {getRoleName(invitation.role)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={invitation.email} disabled className="bg-muted" />
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 XXX XXX XXXX"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            {/* Student-specific fields */}
            {invitation.role === "student" && (
              <>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="matricNumber">
                        Matric Number{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="matricNumber"
                        placeholder="e.g., CSC/2020/001"
                        value={formData.matricNumber}
                        onChange={(e) =>
                          handleChange("matricNumber", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level">
                        Level <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) => handleChange("level", value)}
                      >
                        <SelectTrigger id="level">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 Level</SelectItem>
                          <SelectItem value="200">200 Level</SelectItem>
                          <SelectItem value="300">300 Level</SelectItem>
                          <SelectItem value="400">400 Level</SelectItem>
                          <SelectItem value="500">500 Level</SelectItem>
                          <SelectItem value="600">600 Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session">
                        Session <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="session"
                        placeholder="e.g., 2023/2024"
                        value={formData.session}
                        onChange={(e) =>
                          handleChange("session", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Supervisor-specific fields */}
            {(invitation.role === "academic_supervisor" ||
              invitation.role === "industrial_supervisor") && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">
                  {invitation.role === "industrial_supervisor"
                    ? "Company & Professional Information"
                    : "Supervisor Information"}
                </h3>
                <div className="space-y-4">
                  {invitation.role === "industrial_supervisor" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">
                          Company Name{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="companyName"
                          placeholder="e.g., Tech Solutions Ltd"
                          value={formData.companyName}
                          onChange={(e) =>
                            handleChange("companyName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">Company Address</Label>
                        <Input
                          id="companyAddress"
                          placeholder="e.g., 123 Main St, City"
                          value={formData.companyAddress}
                          onChange={(e) =>
                            handleChange("companyAddress", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="position">Position/Title</Label>
                          <Input
                            id="position"
                            placeholder="e.g., Senior Engineer"
                            value={formData.position}
                            onChange={(e) =>
                              handleChange("position", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yearsOfExperience">
                            Years of Experience
                          </Label>
                          <Input
                            id="yearsOfExperience"
                            type="number"
                            min="0"
                            placeholder="e.g., 5"
                            value={formData.yearsOfExperience}
                            onChange={(e) =>
                              handleChange("yearsOfExperience", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          placeholder="e.g., Software Engineering"
                          value={formData.specialization}
                          onChange={(e) =>
                            handleChange("specialization", e.target.value)
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        placeholder="e.g., Computer Science"
                        value={formData.specialization}
                        onChange={(e) =>
                          handleChange("specialization", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Password */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Set Your Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 justify-end pt-4">
              <Link href="/login">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={setupMutation.isPending}>
                {setupMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
