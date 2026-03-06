import { GraduationCap } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";

export function AuthBrandHeader() {
  return (
    <>
      <div className="flex justify-center">
        <div className="rounded-full bg-accent p-4 text-primary">
          <GraduationCap className="h-12 w-12" />
        </div>
      </div>
      <div>
        <CardTitle className="text-2xl font-bold">SIWES Management System</CardTitle>
        <CardDescription className="mt-2">Industrial Training Portal</CardDescription>
      </div>
    </>
  );
}
