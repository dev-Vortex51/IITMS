import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export function ProfileCard() {
  const { user } = useAuth();
  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : null;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Profile Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 bg-muted/30 p-5 rounded-xl border border-border/50">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Full Name
            </Label>
            <p className="font-medium text-foreground">{fullName || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Email Address
            </Label>
            <p className="font-medium text-foreground">
              {user?.email || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Role
            </Label>
            <p className="font-medium text-foreground capitalize">
              {user?.role || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Member Since
            </Label>
            <p className="font-medium text-foreground">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
