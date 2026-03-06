import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SetupActionsProps {
  isSubmitting: boolean;
}

export function SetupActions({ isSubmitting }: SetupActionsProps) {
  return (
    <div className="flex justify-end gap-4 pt-4">
      <Link href="/login">
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </Link>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Create Account
          </>
        )}
      </Button>
    </div>
  );
}
