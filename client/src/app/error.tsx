"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 mb-8">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        An unexpected error occurred while processing your request. We've been notified and are looking into it.
      </p>
      <Button onClick={() => reset()} size="lg" variant="primary">
        Try again
      </Button>
    </div>
  );
}
