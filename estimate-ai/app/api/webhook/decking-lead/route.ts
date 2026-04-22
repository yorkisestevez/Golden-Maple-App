import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contractor_id,
      name,
      email,
      phone,
      notes,
      selected_features,
      estimate_low,
      estimate_high,
      estimate_mid,
      breakdown,
      decking_data,
      site_condition,
      source,
    } = body;

    if (!contractor_id || !name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Insert lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        contractor_id,
        name: name || '',
        email,
        phone: phone || '',
        notes: notes || '',
        selected_features: selected_features || [],
        tier: 'custom',
        site_condition: site_condition || 'standard',
        estimate_low: estimate_low || 0,
        estimate_high: estimate_high || 0,
        estimate_mid: estimate_mid || 0,
        breakdown: breakdown || [],
        estimator_type: 'decking',
        decking_data: decking_data || null,
        source: source || 'website',
      })
      .select()
      .single();

    if (error) {
      console.error('Lead insert error:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    // Log usage
    await supabase.from('usage_logs').insert({
      contractor_id,
      event_type: 'decking_lead_submitted',
      metadata: { lead_id: lead.id, source },
    });

    // Fire webhook if configured
    const { data: contractor } = await supabase
      .from('contractors')
      .select('webhook_url')
      .eq('id', contractor_id)
      .single();

    if (contractor?.webhook_url) {
      fetch(contractor.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'decking_lead_submitted',
          lead: { id: lead.id, name, email, phone, estimate_mid },
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, lead_id: lead.id });
  } catch (err) {
    console.error('Decking lead webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
