export function getRoleName(role: string) {
  const roleNames: Record<string, string> = {
    coordinator: "Coordinator",
    academic_supervisor: "Academic Supervisor",
    student: "Student",
    industrial_supervisor: "Industrial Supervisor",
  };
  return roleNames[role] || role;
}
