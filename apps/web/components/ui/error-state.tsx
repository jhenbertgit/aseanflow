import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@aseanflow/ui";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function PageErrorState({
  error,
  reset,
}: {
  error: Error;
  reset?: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorState
        title="Page Error"
        message={error.message || "An unexpected error occurred"}
        onRetry={reset}
      />
    </div>
  );
}
