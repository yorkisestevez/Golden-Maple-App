import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PLANS } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: contractor } = await supabase
      .from('contractors')
      .select('id, email, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Look up or create Stripe customer
    let customerId = contractor.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: contractor.email,
        metadata: { contractor_id: contractor.id },
      });
      customerId = customer.id;

      await supabase
        .from('contractors')
        .update({ stripe_customer_id: customerId })
        .eq('id', contractor.id);
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { contractor_id: contractor.id, plan },
      },
      metadata: { contractor_id: contractor.id, plan },
      success_url: `${appUrl}/dashboard/billing?success=true`,
      cancel_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
