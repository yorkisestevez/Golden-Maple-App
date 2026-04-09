import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendLeadNotification } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contractor_id,
      name,
      email,
      phone,
      notes,
      selected_features,
      tier,
      site_condition,
      estimate_low,
      estimate_high,
      estimate_mid,
      breakdown,
      ai_insight,
      source = 'website',
    } = body;

    if (!contractor_id || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Get contractor info
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', contractor_id)
      .single();

    if (contractorError || !contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Save lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        contractor_id,
        name,
        email: email || null,
        phone,
        notes: notes || null,
        selected_features,
        tier,
        site_condition,
        estimate_low,
        estimate_high,
        estimate_mid,
        breakdown,
        ai_insight: ai_insight || null,
        source,
        referrer: request.headers.get('referer') || null,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      })
      .select()
      .single();

    if (leadError) {
      console.error('Lead insert error:', leadError);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    // Log usage
    await supabase.from('usage_logs').insert({
      contractor_id,
      event_type: 'lead_submit',
      metadata: { lead_id: lead.id, source },
    });

    // Send email notification
    const notificationEmail = contractor.notification_email || contractor.email;
    try {
      await sendLeadNotification({
        contractorEmail: notificationEmail,
        contractorName: contractor.company_name,
        leadName: name,
        leadEmail: email || null,
        leadPhone: phone,
        leadNotes: notes || null,
        features: selected_features,
        tier,
        estimateLow: estimate_low,
        estimateHigh: estimate_high,
        currency: 'CAD',
        leadId: lead.id,
      });
    } catch (emailErr) {
      console.error('Email notification error:', emailErr);
      // Don't fail the request if email fails
    }

    // Webhook to CRM if configured (Pro+ only)
    if (contractor.webhook_url && ['pro', 'agency'].includes(contractor.plan)) {
      try {
        await fetch(contractor.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'new_lead',
            lead: {
              id: lead.id,
              name,
              email,
              phone,
              notes,
              selected_features,
              tier,
              site_condition,
              estimate_low,
              estimate_high,
              estimate_mid,
              source,
              created_at: lead.created_at,
            },
          }),
        });
      } catch (webhookErr) {
        console.error('Webhook error:', webhookErr);
      }
    }

    return NextResponse.json({ success: true, lead_id: lead.id });
  } catch (err) {
    console.error('Lead webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
