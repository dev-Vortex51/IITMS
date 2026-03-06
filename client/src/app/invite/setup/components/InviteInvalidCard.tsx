import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InviteInvalidCardProps {
  title: string;
  message: string;
}

export function InviteInvalidCard({ title, message }: InviteInvalidCardProps) {
  return (
    <Card className="w-full border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-base text-foreground">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="mt-4 flex justify-end">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
