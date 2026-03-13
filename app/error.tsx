'use client';
 
import { useEffect } from 'react';
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error);
  }, [error]);
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-4 p-6 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-destructive">Oops, an error occurred!</h2>
        <p className="text-muted-foreground">
          There was a problem loading this page. The application is still running, but this specific section encountered an error.
        </p>
        <div className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">
          <p><strong>Error:</strong> {error.message}</p>
          {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <a 
            href="/"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}