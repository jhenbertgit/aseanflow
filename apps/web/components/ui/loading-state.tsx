import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  message = "Loading...",
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-primary`}
      />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

export function PageLoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState size="lg" message="Loading page..." />
    </div>
  );
}

export function CardLoadingState() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3 animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-5/6" />
    </div>
  );
}
