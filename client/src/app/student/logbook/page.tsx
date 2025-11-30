"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { Loading, LoadingCard } from "@/components/ui/loading";
import { studentService } from "@/services/student.service";
import { logbookService, type LogbookEntry } from "@/services/logbook.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Send,
  FileText,
  Upload,
  X,
} from "lucide-react";

export default function StudentLogbookPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
  const [formData, setFormData] = useState({
    weekNumber: "",
    startDate: "",
    endDate: "",
    tasksPerformed: "",
    skillsAcquired: "",
    challenges: "",
    lessonsLearned: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const studentId = user?.profileData?._id;

  // Fetch placement
  const { data: placement, isLoading: isLoadingPlacement } = useQuery({
    queryKey: ["placement", studentId],
    queryFn: () => studentService.getStudentPlacement(studentId!),
    enabled: !!studentId,
    retry: false,
  });

  // Fetch logbook entries
  const { data: logbooksData, isLoading } = useQuery({
    queryKey: ["logbooks", studentId],
    queryFn: async () => {
      const response = await logbookService.getLogbooks({
        student: studentId,
      });
      return response.data || [];
    },
    enabled: !!studentId,
  });

  const logbooks = logbooksData || [];

  // Create logbook entry mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => logbookService.createLogbookEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      resetForm();
      setSuccess("Logbook entry created successfully");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to create logbook entry");
    },
  });

  // Update logbook entry mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      logbookService.updateLogbookEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      resetForm();
      setSuccess("Logbook entry updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update logbook entry");
    },
  });

  // Submit logbook entry mutation
  const submitMutation = useMutation({
    mutationFn: (id: string) => logbookService.submitLogbookEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      setSuccess("Logbook entry submitted successfully");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to submit logbook entry");
    },
  });

  const resetForm = () => {
    setFormData({
      weekNumber: "",
      startDate: "",
      endDate: "",
      tasksPerformed: "",
      skillsAcquired: "",
      challenges: "",
      lessonsLearned: "",
    });
    setSelectedFiles([]);
    setShowForm(false);
    setEditingEntry(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!placement) {
      setError("No placement found. Please register your placement first.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("weekNumber", formData.weekNumber);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);
    formDataToSend.append("tasksPerformed", formData.tasksPerformed);
    formDataToSend.append("skillsAcquired", formData.skillsAcquired);
    formDataToSend.append("challenges", formData.challenges);
    formDataToSend.append("lessonsLearned", formData.lessonsLearned);

    // Append files
    selectedFiles.forEach((file) => {
      formDataToSend.append("evidence", file);
    });

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry._id, data: formDataToSend });
    } else {
      createMutation.mutate(formDataToSend);
    }
  };

  const handleEdit = (entry: LogbookEntry) => {
    setEditingEntry(entry);
    setFormData({
      weekNumber: entry.weekNumber.toString(),
      startDate: entry.startDate.split("T")[0],
      endDate: entry.endDate.split("T")[0],
      tasksPerformed: entry.tasksPerformed,
      skillsAcquired: entry.skillsAcquired || "",
      challenges: entry.challenges || "",
      lessonsLearned: entry.lessonsLearned || "",
    });
    setShowForm(true);
  };

  const handleSubmitEntry = (id: string) => {
    if (
      confirm(
        "Are you sure you want to submit this entry? You won't be able to edit it after submission."
      )
    ) {
      submitMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return {
          variant: "secondary" as const,
          label: "Draft",
          icon: FileText,
        };
      case "submitted":
        return { variant: "default" as const, label: "Submitted", icon: Clock };
      case "reviewed":
        return {
          variant: "default" as const,
          label: "Reviewed",
          icon: CheckCircle,
        };
      case "approved":
        return {
          variant: "success" as const,
          label: "Approved",
          icon: CheckCircle,
        };
      case "rejected":
        return {
          variant: "destructive" as const,
          label: "Rejected",
          icon: XCircle,
        };
      default:
        return { variant: "secondary" as const, label: status, icon: FileText };
    }
  };

  console.log("Placement data:", placement);
  console.log("Placement status:", placement?.status);

  if (isLoadingPlacement) {
    return <Loading />;
  }

  if (!placement || placement?.status !== "approved") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Logbook</h1>
          <p className="text-muted-foreground mt-2">
            Document your weekly training activities
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {!placement
                    ? "No Placement Registered"
                    : "Placement Not Approved"}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {!placement
                    ? "You need to register your placement before creating logbook entries"
                    : "Your placement must be approved before you can create logbook entries"}
                </p>
              </div>
              {!placement && (
                <Button asChild>
                  <a href="/student/placement">Register Placement</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Logbook</h1>
          <p className="text-muted-foreground mt-2">
            Document your weekly training activities
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Logbook Entry" : "Create Logbook Entry"}
            </DialogTitle>
            <DialogDescription>
              Document your activities and learning for the week
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weekNumber">Week Number *</Label>
                <Input
                  id="weekNumber"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.weekNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, weekNumber: e.target.value })
                  }
                  required
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tasksPerformed">Tasks Performed *</Label>
              <Textarea
                id="tasksPerformed"
                className="min-h-[120px]"
                value={formData.tasksPerformed}
                onChange={(e) =>
                  setFormData({ ...formData, tasksPerformed: e.target.value })
                }
                required
                placeholder="Describe the tasks and activities you performed this week..."
                minLength={10}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.tasksPerformed.length}/2000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillsAcquired">Skills Acquired</Label>
              <Textarea
                id="skillsAcquired"
                className="min-h-[80px]"
                value={formData.skillsAcquired}
                onChange={(e) =>
                  setFormData({ ...formData, skillsAcquired: e.target.value })
                }
                placeholder="What new skills or knowledge did you gain?"
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Challenges</Label>
              <Textarea
                id="challenges"
                className="min-h-[80px]"
                value={formData.challenges}
                onChange={(e) =>
                  setFormData({ ...formData, challenges: e.target.value })
                }
                placeholder="What challenges did you face this week?"
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonsLearned">Lessons Learned</Label>
              <Textarea
                id="lessonsLearned"
                className="min-h-[80px]"
                value={formData.lessonsLearned}
                onChange={(e) =>
                  setFormData({ ...formData, lessonsLearned: e.target.value })
                }
                placeholder="What lessons did you learn from this week?"
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence">Evidence (Images/Documents)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                <Input
                  id="evidence"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="evidence"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images or documents
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports: Images, PDF, Word documents
                  </p>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  <p className="text-sm font-medium">Selected files:</p>
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted p-2 rounded text-sm"
                      >
                        <span className="truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFiles(
                              selectedFiles.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingEntry
                  ? "Update Entry"
                  : "Save Draft"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div>Loading entries...</div>
      ) : logbooks.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-4">
          {logbooks.map((entry: LogbookEntry) => {
            const statusInfo = getStatusBadge(entry.status);
            const StatusIcon = statusInfo.icon;

            return (
              <AccordionItem
                key={entry._id}
                value={entry._id}
                className="border rounded-lg"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <AccordionTrigger className="hover:no-underline py-0">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div>
                          <CardTitle className="text-left font-semibold">
                            Week {entry.weekNumber}
                          </CardTitle>
                          <CardDescription className="text-left">
                            {new Date(entry.startDate).toLocaleDateString()} -{" "}
                            {new Date(entry.endDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                  </CardHeader>
                  <AccordionContent>
                    <CardContent className="space-y-4 pt-0">
                      <div>
                        <Label className="text-muted-foreground text-sm">
                          Tasks Performed
                        </Label>
                        <p className="mt-1 text-sm">{entry.tasksPerformed}</p>
                      </div>

                      {entry.skillsAcquired && (
                        <div>
                          <Label className="text-muted-foreground text-sm">
                            Skills Acquired
                          </Label>
                          <p className="mt-1 text-sm">{entry.skillsAcquired}</p>
                        </div>
                      )}

                      {entry.challenges && (
                        <div>
                          <Label className="text-muted-foreground text-sm">
                            Challenges
                          </Label>
                          <p className="mt-1 text-sm">{entry.challenges}</p>
                        </div>
                      )}

                      {entry.lessonsLearned && (
                        <div>
                          <Label className="text-muted-foreground text-sm">
                            Lessons Learned
                          </Label>
                          <p className="mt-1 text-sm">{entry.lessonsLearned}</p>
                        </div>
                      )}

                      {entry.reviews && entry.reviews.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">
                            Supervisor Reviews
                          </Label>
                          {entry.reviews.map((review, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-muted space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium capitalize">
                                  {review.supervisorType} Supervisor
                                </span>
                                {review.rating && (
                                  <Badge variant="outline">
                                    {review.rating}/10
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm">{review.comment}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  review.reviewedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {entry.status === "draft" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitEntry(entry._id)}
                            disabled={submitMutation.isPending}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Submit for Review
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No Entries Yet</h3>
                <p className="text-muted-foreground mt-1">
                  Start documenting your weekly training activities
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
