"use client";

import { useEffect } from "react";
import { useCoordinatorStudents } from "./_hooks/useCoordinatorStudents";
import { StudentHeader } from "./_components/StudentHeader";
import { StudentSearch } from "./_components/StudentSearch";
import { StudentStats } from "./_components/StudentStats";
import { StudentList } from "./_components/StudentList";

export default function CoordinatorStudentsPage() {
  useEffect(() => {
    document.title = "Students | ITMS";
  }, []);

  const { searchQuery, setSearchQuery, filteredStudents, stats, isLoading } =
    useCoordinatorStudents();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StudentHeader />

      <div className="space-y-6">
        <StudentSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
