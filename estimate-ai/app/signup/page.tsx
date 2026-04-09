'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const slug = generateSlug(companyName);
      const { error: insertError } = await supabase.from('contractors').insert({
        id: authData.user.id,
        email,
        company_name: companyName,
        slug,
        notification_email: email,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (insertError) {
        setError('Account created but profile setup failed. Please contact support.');
        setLoading(false);
        return;
      }

      try {
        await fetch('/api/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractor_id: authData.user.id }),
        });
      } catch {
        // Non-critical
      }

      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#D4AF63]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-md w-full text-center glass-strong rounded-2xl p-10 relative">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gradient mb-4">Check Your Email</h2>
          <p className="text-white/40 font-light">
            We&apos;ve sent a confirmation link to <strong className="text-white/70">{email}</strong>.
            Click it to activate your account and start your 14-day free trial.
          </p>
          <Link href="/login">
            <Button variant="outline" className="mt-6">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#D4AF63]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gradient tracking-tight">
              EstimateAI
            </h1>
          </Link>
          <p className="text-white/40 mt-2 font-light">Start your 14-day free trial</p>
          <p className="text-white/20 text-sm font-light">No credit card required</p>
        </div>

        <Card variant="bordered">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              id="company"
              label="Company Name"
              placeholder="Golden Maple Landscaping"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-white/30 mt-4 font-light">
            Already have an account?{' '}
            <Link href="/login" className="text-[#D4AF63] hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
