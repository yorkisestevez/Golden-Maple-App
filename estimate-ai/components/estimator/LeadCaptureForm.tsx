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
      <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-[var(--brand-text,#F2EEE7)] mb-2">
          You&apos;re All Set!
        </h3>
        <p className="text-[var(--brand-muted,#A89F91)] max-w-sm mx-auto">
          We&apos;ve received your project details and will be in touch shortly to schedule your free consultation.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--brand-muted,#A89F91)]">
          <Clock className="w-3.5 h-3.5" />
          Most clients hear back within 2 hours during business hours
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--brand-accent,#D4AF63)]/20 bg-gradient-to-br from-[var(--brand-accent,#D4AF63)]/5 via-[var(--brand-card,#1A1814)] to-[var(--brand-card,#1A1814)] p-6 sm:p-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-[var(--brand-text,#F2EEE7)] mb-1"
          style={{ fontFamily: 'var(--brand-headline-font)' }}
        >
          Like What You See?
        </h3>
        <p className="text-sm text-[var(--brand-muted,#A89F91)]">
          Lock in your free consultation and get a detailed, on-site quote.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="lead-name"
            label="Name *"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="lead-phone"
            label="Phone *"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <Input
          id="lead-email"
          label="Email (optional)"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Textarea
          id="lead-notes"
          label="Tell us about your project (optional)"
          placeholder="Any details about your space, timeline, or specific ideas..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Get My Free Consultation
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-4 text-xs text-[var(--brand-muted,#A89F91)]/60 pt-1">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            No obligation
          </span>
          <span>&bull;</span>
          <span>Free site visit</span>
          <span>&bull;</span>
          <span>Detailed quote</span>
        </div>
      </form>
    </div>
  );
}
