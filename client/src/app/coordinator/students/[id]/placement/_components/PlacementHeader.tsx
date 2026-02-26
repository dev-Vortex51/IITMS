import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function PlacementHeader({ studentId }: { studentId: string }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <Button variant="outline" size="icon" asChild className="shrink-0 mt-1">
        <Link href={`/coordinator/students/${studentId}`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Placement Details
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and manage student placement
        </p>
      </div>
    </div>
  );
}
