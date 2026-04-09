'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, CheckCircle } from 'lucide-react';

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
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[var(--brand-text,#F2EEE7)] mb-2">
          Request Sent!
        </h3>
        <p className="text-[var(--brand-muted,#A89F91)]">
          We&apos;ll be in touch shortly to discuss your project. Thank you!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--brand-card,#1A1814)] p-6">
      <h3 className="text-lg font-semibold text-[var(--brand-text,#F2EEE7)] mb-1">
        Ready to bring this to life?
      </h3>
      <p className="text-sm text-[var(--brand-muted,#A89F91)] mb-4">
        Share your contact info and we&apos;ll reach out to schedule a free consultation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
      </form>
    </div>
  );
}
