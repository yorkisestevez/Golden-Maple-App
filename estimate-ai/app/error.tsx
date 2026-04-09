'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#FAFAF9] mb-2">Something went wrong</h2>
        <p className="text-white/40 font-light mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF63] to-[#C49B4A] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-white/10 text-white/50 rounded-lg text-sm hover:text-white/70 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
