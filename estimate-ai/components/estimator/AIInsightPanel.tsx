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
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <div className="absolute inset-0 backdrop-blur-md bg-white/60 flex flex-col items-center justify-center z-10">
          <Lock className="w-8 h-8 text-slate-300 mb-3" />
          <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Neural Intel Locked</p>
          <p className="text-slate-400 text-[10px] mt-1 font-bold">Pro & Agency Subscriptions Only</p>
        </div>
        <div className="opacity-10 grayscale">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-black text-slate-900 uppercase tracking-tighter">AI Neural Perspective</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed font-bold italic">
            Get personalized design tips and expert advice tailored to your specific project combination, materials, and budget range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] border border-blue-100 bg-blue-50/30 p-8 sm:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-16 h-16 text-blue-600" />
      </div>
      
      <div className="flex items-center gap-2 mb-4 relative">
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-black text-slate-900 tracking-tight uppercase text-[10px] tracking-[0.2em] italic">AI Neural Perspective</span>
      </div>

      {insight ? (
        <p className="text-slate-900 text-base leading-relaxed font-medium italic relative">"{insight}"</p>
      ) : (
        <div className="space-y-6 relative">
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Run our neural design model to generate architectural insights optimized for this project scope.
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onGenerate} 
            disabled={loading}
            className="bg-white border-blue-200 hover:border-blue-600 text-blue-600 font-black tracking-widest text-[10px] uppercase rounded-full px-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Pulse...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Initialize AI Pulse
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
