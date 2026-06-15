import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SystemSettingsFormScoring {
  systemScoreMax: number;
  defenseScoreMax: number;
  logbookWeight: number;
  assessmentWeight: number;
}

interface SystemScoringSettingsSectionProps {
  form: SystemSettingsFormScoring;
  onChange: (next: SystemSettingsFormScoring) => void;
}

export function SystemScoringSettingsSection({
  form,
  onChange,
}: SystemScoringSettingsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 font-medium">Scoring Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure 80/20 scoring split and system component weights
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-system-score-max">System Score Max</Label>
          <Input
            id="admin-system-score-max"
            type="number"
            value={form.systemScoreMax}
            onChange={(event) =>
              onChange({
                ...form,
                systemScoreMax: parseInt(event.target.value, 10) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-defense-score-max">Defense Score Max</Label>
          <Input
            id="admin-defense-score-max"
            type="number"
            value={form.defenseScoreMax}
            onChange={(event) =>
              onChange({
                ...form,
                defenseScoreMax: parseInt(event.target.value, 10) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-logbook-weight">Logbook Weight</Label>
          <Input
            id="admin-logbook-weight"
            type="number"
            value={form.logbookWeight}
            onChange={(event) =>
              onChange({
                ...form,
                logbookWeight: parseInt(event.target.value, 10) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-assessment-weight">Assessment Weight</Label>
          <Input
            id="admin-assessment-weight"
            type="number"
            value={form.assessmentWeight}
            onChange={(event) =>
              onChange({
                ...form,
                assessmentWeight: parseInt(event.target.value, 10) || 0,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
