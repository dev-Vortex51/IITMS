"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { studentService, logbookService } from "@/services/student.service";
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
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import type { LogbookEntry } from "@/types/models";

export default function StudentLogbookPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weekNumber: "",
    date: "",
    activity: "",
    skillsLearned: "",
    evidence: null as File | null,
  });
  const [error, setError] = useState("");

  // Fetch student data
  const { data: students } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getAllStudents(),
    enabled: !!user,
  });

  const student = students?.data?.[0];

  // Fetch placement
  const { data: placement } = useQuery({
    queryKey: ["placement", student?._id],
    queryFn: () => studentService.getStudentPlacement(student._id),
    enabled: !!student,
  });

  // Fetch logbook entries
  const { data: logbookEntries, isLoading } = useQuery<LogbookEntry[]>({
    queryKey: ["logbook", placement?._id],
    queryFn: async () => {
      const response = await logbookService.getAllLogbooks({
        placement: placement?._id,
      });
      return response.data;
    },
    enabled: !!placement,
  });

  // Create logbook entry mutation
  const createEntryMutation = useMutation({
    mutationFn: (data: FormData) => logbookService.createLogbookEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbook"] });
      setFormData({
        weekNumber: "",
        date: "",
        activity: "",
        skillsLearned: "",
        evidence: null,
      });
      setError("");
      setShowForm(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to create logbook entry");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!placement) {
      setError("No placement found. Please register your placement first.");
      return;
    }

    const data = new FormData();
    data.append("placement", placement._id);
    data.append("weekNumber", formData.weekNumber);
    data.append("date", formData.date);
    data.append("activity", formData.activity);
    data.append("skillsLearned", formData.skillsLearned);
    if (formData.evidence) {
      data.append("evidence", formData.evidence);
    }

    createEntryMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, evidence: e.target.files[0] });
    }
  };

  const getStatusBadge = (entry: LogbookEntry) => {
    if (entry.supervisor_approval) {
      return {
        icon: CheckCircle,
        text: "Approved",
        color: "text-green-600",
        bg: "bg-green-50",
      };
    }
    return {
      icon: Clock,
      text: "Pending Review",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    };
  };

  if (!placement) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Logbook</h1>
          <p className="text-muted-foreground mt-2">
            Track your weekly activities
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  No Placement Registered
                </h3>
                <p className="text-muted-foreground mt-1">
                  You need to register your placement before creating logbook
                  entries
                </p>
              </div>
              <Button asChild>
                <a href="/student/placement">Register Placement</a>
              </Button>
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Logbook Entry</CardTitle>
            <CardDescription>
              Document your activities and learning for the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weekNumber">Week Number *</Label>
                  <Input
                    id="weekNumber"
                    type="number"
                    min="1"
                    value={formData.weekNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, weekNumber: e.target.value })
                    }
                    required
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Activity/Tasks Performed *</Label>
                <Textarea
                  id="activity"
                  className="min-h-[120px]"
                  value={formData.activity}
                  onChange={(e) =>
                    setFormData({ ...formData, activity: e.target.value })
                  }
                  required
                  placeholder="Describe the tasks and activities you performed this week..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillsLearned">Skills Learned *</Label>
                <Textarea
                  id="skillsLearned"
                  className="min-h-[80px]"
                  value={formData.skillsLearned}
                  onChange={(e) =>
                    setFormData({ ...formData, skillsLearned: e.target.value })
                  }
                  required
                  placeholder="What new skills or knowledge did you gain?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence">
                  Evidence (Optional - Image/PDF)
                </Label>
                <Input
                  id="evidence"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {formData.evidence && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.evidence.name}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={createEntryMutation.isPending}>
                  {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div>Loading entries...</div>
      ) : logbookEntries && logbookEntries.length > 0 ? (
        <div className="grid gap-4">
          {logbookEntries.map((entry) => {
            const status = getStatusBadge(entry);
            const StatusIcon = status.icon;

            return (
              <Card key={entry._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Week {entry.weekNumber}</CardTitle>
                      <CardDescription>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}
                    >
                      <StatusIcon className={`h-4 w-4 ${status.color}`} />
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Activities</Label>
                    <p className="mt-1">{entry.activity}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Skills Learned
                    </Label>
                    <p className="mt-1">{entry.skillsLearned}</p>
                  </div>
                  {entry.supervisor_comment && (
                    <div className="p-3 rounded-lg bg-muted">
                      <Label className="text-muted-foreground">
                        Supervisor Comments
                      </Label>
                      <p className="mt-1">{entry.supervisor_comment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
