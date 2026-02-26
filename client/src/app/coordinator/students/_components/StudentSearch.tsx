import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface StudentSearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export function StudentSearch({
  searchQuery,
  setSearchQuery,
}: StudentSearchProps) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Search Directory</CardTitle>
        <CardDescription>
          Find students by name, matric number, or email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </CardContent>
    </Card>
  );
}
