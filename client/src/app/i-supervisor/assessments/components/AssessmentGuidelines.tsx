import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const guidelines = [
  "Assess students based on workplace performance, technical skills, and professionalism.",
  "Provide honest and constructive feedback to help students improve.",
  "Consider punctuality, ability to learn, initiative, and teamwork.",
  "Complete assessments before the program end date for timely grading.",
  "Contact the coordinator if you have questions about the assessment criteria.",
];

export function AssessmentGuidelines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Guidelines</CardTitle>
        <CardDescription>Important information about workplace assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          {guidelines.map((guideline) => (
            <div key={guideline} className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p>{guideline}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
