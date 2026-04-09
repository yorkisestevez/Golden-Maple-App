'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Contractor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';

const PLAN_DETAILS = {
  standard: { name: 'Standard', price: 97 },
  pro: { name: 'Pro', price: 197 },
  agency: { name: 'Agency', price: 497 },
};

export default function BillingPage() {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);

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
          <Button variant="primary">
            <CreditCard className="w-4 h-4 mr-2" />
            {isTrialing ? 'Add Payment Method' : 'Manage Subscription'}
          </Button>
          {contractor.plan !== 'agency' && (
            <Button variant="outline">
              Upgrade Plan
            </Button>
          )}
        </div>
      </Card>

      <Card variant="bordered">
        <h2 className="text-lg font-semibold text-[#F2EEE7] mb-2">Need Help?</h2>
        <p className="text-sm text-[#A89F91]">
          Contact us at support@estimateai.com for billing questions or plan changes.
        </p>
      </Card>
    </div>
  );
}
