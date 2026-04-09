'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIInsightPanelProps {
  enabled: boolean;
  insight: string | null;
  loading: boolean;
  onGenerate: () => void;
}

export function AIInsightPanel({ enabled, insight, loading, onGenerate }: AIInsightPanelProps) {
  if (!enabled) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-white/10 p-6">
        <div className="absolute inset-0 backdrop-blur-sm bg-[var(--brand-card,#1A1814)]/80 flex flex-col items-center justify-center z-10">
          <Lock className="w-8 h-8 text-[var(--brand-muted,#A89F91)] mb-2" />
          <p className="text-[var(--brand-muted,#A89F91)] text-sm font-medium">AI Insights — Pro Plan</p>
          <p className="text-[var(--brand-muted,#A89F91)]/60 text-xs mt-1">Available on Pro & Agency plans</p>
        </div>
        <div className="opacity-30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[var(--brand-accent,#D4AF63)]" />
            <span className="font-semibold text-[var(--brand-text,#F2EEE7)]">Expert Design Insight</span>
          </div>
          <p className="text-[var(--brand-muted,#A89F91)] text-sm leading-relaxed">
            Get personalized design tips and expert advice tailored to your specific project combination, materials, and budget range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--brand-accent,#D4AF63)]/30 bg-[var(--brand-accent,#D4AF63)]/5 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-[var(--brand-accent,#D4AF63)]" />
        <span className="font-semibold text-[var(--brand-text,#F2EEE7)]">Expert Design Insight</span>
      </div>

      {insight ? (
        <p className="text-[var(--brand-text,#F2EEE7)] text-sm leading-relaxed">{insight}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-[var(--brand-muted,#A89F91)] text-sm">
            Get AI-powered design tips and expert advice tailored to your project.
          </p>
          <Button variant="outline" size="sm" onClick={onGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing your project...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Expert Insight
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
