'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0F0E0A] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-[#D4AF63] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#F2EEE7] mb-2">Something went wrong</h2>
        <p className="text-[#A89F91] mb-6 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
