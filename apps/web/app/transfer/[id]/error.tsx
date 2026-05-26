'use client';

import { Button } from '@aseanflow/ui/components/button';
import Link from 'next/link';

export default function TransferError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || 'Failed to load transfer details.'}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">
          Try again
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
