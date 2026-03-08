import { useState } from "react";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  SystemScoringSettingsSection,
  type SystemSettingsFormScoring,
} from "./SystemScoringSettingsSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SystemSettingsForm {
  currentSession: string;
  semester: string;
  siweDuration: number;
  minWeeks: number;
  systemScoreMax: SystemSettingsFormScoring["systemScoreMax"];
  defenseScoreMax: SystemSettingsFormScoring["defenseScoreMax"];
  logbookWeight: SystemSettingsFormScoring["logbookWeight"];
  evaluationWeight: SystemSettingsFormScoring["evaluationWeight"];
  assessmentWeight: SystemSettingsFormScoring["assessmentWeight"];
  visitationWeight: SystemSettingsFormScoring["visitationWeight"];
  maxVisitations: SystemSettingsFormScoring["maxVisitations"];
  autoAssignSupervisors: boolean;
  requireLogbookApproval: boolean;
}

interface SystemSettingsCardProps {
  systemSettingsForm: SystemSettingsForm;
  onSystemSettingsChange: (next: SystemSettingsForm) => void;
  onSave: () => void;
}

export function SystemSettingsCard({
  systemSettingsForm,
  onSystemSettingsChange,
  onSave,
}: SystemSettingsCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg border border-border bg-muted p-2">
              <Database className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base">System Settings</CardTitle>
              <p className="text-sm text-muted-foreground">Configure session, SIWES, and approval controls</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Edit Settings</Button>
          </DialogTrigger>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>System Settings</DialogTitle>
                <DialogDescription>
                  Update session, SIWES, and approval configuration.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 font-medium">Academic Session</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure the current academic session
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="admin-current-session">Current Session</Label>
                      <Input
                        id="admin-current-session"
                        value={systemSettingsForm.currentSession}
                        onChange={(event) =>
                          onSystemSettingsChange({
                            ...systemSettingsForm,
                            currentSession: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-semester">Semester</Label>
                      <Input
                        id="admin-semester"
                        value={systemSettingsForm.semester}
                        onChange={(event) =>
                          onSystemSettingsChange({
                            ...systemSettingsForm,
                            semester: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <SystemScoringSettingsSection
                  form={{
                    systemScoreMax: systemSettingsForm.systemScoreMax,
                    defenseScoreMax: systemSettingsForm.defenseScoreMax,
                    logbookWeight: systemSettingsForm.logbookWeight,
                    evaluationWeight: systemSettingsForm.evaluationWeight,
                    assessmentWeight: systemSettingsForm.assessmentWeight,
                    visitationWeight: systemSettingsForm.visitationWeight,
                    maxVisitations: systemSettingsForm.maxVisitations,
                  }}
                  onChange={(scoring) =>
                    onSystemSettingsChange({
                      ...systemSettingsForm,
                      ...scoring,
                    })
                  }
                />

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 font-medium">SIWES Duration</h3>
                    <p className="text-sm text-muted-foreground">
                      Set the standard duration for industrial training
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="admin-duration">Duration (Months)</Label>
                      <Input
                        id="admin-duration"
                        type="number"
                        value={systemSettingsForm.siweDuration}
                        onChange={(event) =>
                          onSystemSettingsChange({
                            ...systemSettingsForm,
                            siweDuration: parseInt(event.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-min-weeks">Minimum Weeks</Label>
                      <Input
                        id="admin-min-weeks"
                        type="number"
                        value={systemSettingsForm.minWeeks}
                        onChange={(event) =>
                          onSystemSettingsChange({
                            ...systemSettingsForm,
                            minWeeks: parseInt(event.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 font-medium">Approval Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure placement and logbook approval settings
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-assign Supervisors</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically assign supervisors after placement approval
                        </p>
                      </div>
                      <Switch
                        checked={systemSettingsForm.autoAssignSupervisors}
                        onCheckedChange={(checked) =>
                          onSystemSettingsChange({
                            ...systemSettingsForm,
                            autoAssignSupervisors: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Logbook Approval</Label>
                        <p className="text-sm text-muted-foreground">
                          Supervisors must approve all logbook entries
                        </p>
                      </div>
                      <Switch
                        checked={systemSettingsForm.requireLogbookApproval}
                        onCheckedChange={(checked) =>
                          onSystemSettingsChange({
                            ...systemSettingsForm,
                            requireLogbookApproval: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => {
                      onSave();
                      setOpen(false);
                    }}
                  >
                    Save System Settings
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
          <DetailRow
            label="Current Session"
            value={systemSettingsForm.currentSession || "Not configured"}
          />
          <DetailRow label="Semester" value={systemSettingsForm.semester || "Not configured"} />
          <DetailRow
            label="SIWES Duration"
            value={`${systemSettingsForm.siweDuration} months / ${systemSettingsForm.minWeeks} weeks minimum`}
          />
          <DetailRow
            label="Scoring Split"
            value={`System ${systemSettingsForm.systemScoreMax}% / Defense ${systemSettingsForm.defenseScoreMax}%`}
          />
          <DetailRow
            label="System Weights"
            value={`Logbook ${systemSettingsForm.logbookWeight}, Evaluation ${systemSettingsForm.evaluationWeight}, Assessment ${systemSettingsForm.assessmentWeight}, Visitation ${systemSettingsForm.visitationWeight}`}
          />
          <DetailRow
            label="Max Visitations"
            value={`${systemSettingsForm.maxVisitations}`}
          />
          <DetailRow
            label="Auto Assign Supervisors"
            value={systemSettingsForm.autoAssignSupervisors ? "Enabled" : "Disabled"}
          />
          <DetailRow
            label="Require Logbook Approval"
            value={systemSettingsForm.requireLogbookApproval ? "Enabled" : "Disabled"}
          />
          <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[190px_1fr] md:items-center">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Configuration</Label>
            <p className="text-sm font-medium text-foreground">
              System-wide configuration is managed in a dialog to reduce accidental changes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border/60 p-3 last:border-b-0 md:grid-cols-[190px_1fr] md:items-center">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
