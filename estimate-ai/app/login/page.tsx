'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              EstimateAI<span className="text-blue-600">.</span>
            </h1>
          </Link>
          <p className="text-slate-500 mt-2 font-medium uppercase tracking-widest text-[10px]">Neural Control Center</p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-2xl shadow-blue-500/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              id="email"
              label="Email Address"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-xl shadow-xl shadow-blue-500/10" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'AUTHENTICATE'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8 font-medium">
            New contractor?{' '}
            <Link href="/signup" className="text-blue-600 font-black hover:underline uppercase tracking-widest text-[10px]">
              Initialize Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
