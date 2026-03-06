"use client";

import { useEffect } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { LoadingPage, PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { useCoordinatorStudents } from "./_hooks/useCoordinatorStudents";
import { StudentSearch } from "./_components/StudentSearch";
import { StudentStats } from "./_components/StudentStats";
import { StudentList } from "./_components/StudentList";

export default function CoordinatorStudentsPage() {
  useEffect(() => {
    document.title = "Students | ITMS";
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    placementFilter,
    setPlacementFilter,
    filteredStudents,
    stats,
    isLoading,
  } = useCoordinatorStudents();

  if (isLoading) {
    return <LoadingPage label="Loading students..." />;
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Students"
        description="Manage and monitor student placements within your department."
        actions={
          <Button asChild className="w-full sm:w-auto shrink-0">
            <Link href="/coordinator/invitations">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Student
            </Link>
          </Button>
        }
      />

      <div className="space-y-4 md:space-y-5">
        <StudentSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placementFilter={placementFilter}
          setPlacementFilter={setPlacementFilter}
        />
        <StudentStats stats={stats} />
        <StudentList
          students={filteredStudents}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
