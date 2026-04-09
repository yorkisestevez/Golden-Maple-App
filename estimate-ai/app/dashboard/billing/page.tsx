'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Contractor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, ArrowUpCircle, Loader2, CheckCircle } from 'lucide-react';

const PLAN_DETAILS = {
  standard: { name: 'Standard', price: 97 },
  pro: { name: 'Pro', price: 197 },
  agency: { name: 'Agency', price: 497 },
};

const PLAN_ORDER = ['standard', 'pro', 'agency'] as const;

export default function BillingPage() {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) setContractor(data as Contractor);
      setLoading(false);
    }
    load();
  }, []);

  const handleManageSubscription = async () => {
    setActionLoading('portal');
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async (plan: string) => {
    setActionLoading(plan);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert('Failed to start checkout. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF63]" />
      </div>
    );
  }

  if (!contractor) return null;

  const plan = PLAN_DETAILS[contractor.plan];
  const isTrialing = contractor.plan_status === 'trialing';
  const trialEnd = contractor.trial_ends_at
    ? new Date(contractor.trial_ends_at).toLocaleDateString()
    : null;
  const currentPlanIndex = PLAN_ORDER.indexOf(contractor.plan);
  const upgradePlans = PLAN_ORDER.filter((_, i) => i > currentPlanIndex);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F2EEE7]">Billing</h1>
        <p className="text-[#A89F91] mt-1">Manage your subscription</p>
      </div>

      <Card variant="bordered" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#F2EEE7]">Current Plan</h2>
            <p className="text-3xl font-bold text-[#D4AF63] mt-1">{plan.name}</p>
            <p className="text-[#A89F91]">${plan.price}/month</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            contractor.plan_status === 'active' ? 'bg-green-500/10 text-green-400' :
            isTrialing ? 'bg-blue-500/10 text-blue-400' :
            contractor.plan_status === 'past_due' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {isTrialing ? 'Trial' : contractor.plan_status}
          </div>
        </div>

        {isTrialing && trialEnd && (
          <p className="text-sm text-[#A89F91]">
            Your trial ends on <strong className="text-[#F2EEE7]">{trialEnd}</strong>. Add a payment method to continue.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          {contractor.stripe_customer_id ? (
            <Button variant="primary" onClick={handleManageSubscription} disabled={actionLoading === 'portal'}>
              {actionLoading === 'portal' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              {isTrialing ? 'Add Payment Method' : 'Manage Subscription'}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => handleUpgrade(contractor.plan)} disabled={!!actionLoading}>
              {actionLoading === contractor.plan ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Add Payment Method
            </Button>
          )}
          {upgradePlans.length > 0 && (
            <Button variant="outline" onClick={() => setShowUpgrade(!showUpgrade)}>
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </Card>

      {showUpgrade && upgradePlans.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {upgradePlans.map((planKey) => {
            const p = PLAN_DETAILS[planKey];
            return (
              <Card key={planKey} variant="bordered" className="space-y-3">
                <h3 className="text-lg font-bold text-[#D4AF63]">{p.name}</h3>
                <p className="text-2xl font-bold text-[#F2EEE7]">${p.price}<span className="text-sm text-[#A89F91] font-normal">/month</span></p>
                <ul className="space-y-1 text-sm text-[#A89F91]">
                  {planKey === 'pro' && (
                    <>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> AI-powered design insights</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Webhook CRM integration</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> CSV export + unlimited leads</li>
                    </>
                  )}
                  {planKey === 'agency' && (
                    <>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Everything in Pro</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> White-label (remove branding)</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Unlimited embed domains</li>
                    </>
                  )}
                </ul>
                <Button
                  onClick={() => handleUpgrade(planKey)}
                  disabled={!!actionLoading}
                  className="w-full"
                >
                  {actionLoading === planKey ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Upgrade to {p.name}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      <Card variant="bordered">
        <h2 className="text-lg font-semibold text-[#F2EEE7] mb-2">Need Help?</h2>
        <p className="text-sm text-[#A89F91]">
          Contact us at support@estimateai.com for billing questions or plan changes.
        </p>
      </Card>
    </div>
  );
}
