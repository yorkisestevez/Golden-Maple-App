'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, CheckCircle, Shield, Clock } from 'lucide-react';

interface LeadCaptureFormProps {
  contractorId: string;
  estimateData: Record<string, unknown>;
  source: 'website' | 'embed' | 'direct';
}

export function LeadCaptureForm({ contractorId, estimateData, source }: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone number are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/webhook/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: contractorId,
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim(),
          notes: notes.trim() || null,
          source,
          ...estimateData,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[2.5rem] border border-emerald-100 bg-white shadow-xl p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
          Neural Pulse Sent.
        </h3>
        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
          We've received your data. A senior project manager will reach out within 2 hours to finalize your scope.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          Average Response: 42 Minutes
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] bg-white border border-slate-100 p-8 sm:p-12 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-30" />
      
      <div className="relative text-center mb-10">
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
          Ready to Start?
        </h3>
        <p className="text-slate-500 font-medium">
          Lock in your free consultation and secure your project spot.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            id="lead-name"
            label="Name *"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-slate-50"
          />
          <Input
            id="lead-phone"
            label="Phone *"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="bg-slate-50"
          />
        </div>
        <Input
          id="lead-email"
          label="Email (optional)"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-50"
        />
        <Textarea
          id="lead-notes"
          label="Project Vision (optional)"
          placeholder="Any details about your space, timeline, or specific ideas..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-slate-50"
        />

        {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

        <Button 
          type="submit" 
          size="lg" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-16 rounded-2xl shadow-xl shadow-blue-500/20" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              SECURE MY FREE CONSULTATION
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Zero Obligation
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span>Professional Visit</span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span>Detailed Bid</span>
        </div>
      </form>
    </div>
  );
}
