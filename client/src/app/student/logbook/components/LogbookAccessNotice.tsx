import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LogbookAccessNoticeProps {
  hasPlacement: boolean;
}

export function LogbookAccessNotice({ hasPlacement }: LogbookAccessNoticeProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {hasPlacement ? "Placement Not Approved" : "No Placement Registered"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {hasPlacement
                ? "Your placement must be approved before you can create logbook entries"
                : "You need to register your placement before creating logbook entries"}
            </p>
          </div>
          {!hasPlacement ? (
            <Button asChild>
              <a href="/student/placement">Register Placement</a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
