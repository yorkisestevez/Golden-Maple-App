import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const contractorId = session.metadata?.contractor_id;
      const plan = session.metadata?.plan;

      if (contractorId && plan) {
        await supabase
          .from('contractors')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan,
            plan_status: 'active',
            ai_insights_enabled: plan !== 'standard',
            updated_at: new Date().toISOString(),
          })
          .eq('id', contractorId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: contractor } = await supabase
        .from('contractors')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (contractor) {
        const status = subscription.status === 'active' ? 'active' :
                       subscription.status === 'past_due' ? 'past_due' :
                       subscription.status === 'trialing' ? 'trialing' : 'canceled';

        await supabase
          .from('contractors')
          .update({
            plan_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contractor.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: contractor } = await supabase
        .from('contractors')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (contractor) {
        await supabase
          .from('contractors')
          .update({
            plan_status: 'canceled',
            ai_insights_enabled: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contractor.id);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from('contractors')
        .update({
          plan_status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
