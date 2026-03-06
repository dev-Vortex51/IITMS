interface AuthStatusMessageProps {
  type: "error" | "success";
  message: string;
}

export function AuthStatusMessage({ type, message }: AuthStatusMessageProps) {
  if (!message) return null;

  const classes =
    type === "error"
      ? "bg-destructive/10 text-destructive"
      : "bg-green-50 text-green-700";

  return <div className={`rounded-md p-3 text-sm ${classes}`}>{message}</div>;
}
