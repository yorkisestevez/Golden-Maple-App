import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateInsight } from '@/lib/ai-insight';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractor_id, features, tier, site, estimate, currency } = body;

    if (!contractor_id || !features || !tier || !estimate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof contractor_id !== 'string') {
      return NextResponse.json({ error: 'Invalid contractor_id' }, { status: 400 });
    }

    if (!Array.isArray(features) || features.length === 0) {
      return NextResponse.json({ error: 'Features must be a non-empty array' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Check contractor plan
    const { data: contractor } = await supabase
      .from('contractors')
      .select('plan, ai_insights_enabled')
      .eq('id', contractor_id)
      .single();

    if (!contractor || !contractor.ai_insights_enabled) {
      return NextResponse.json({ error: 'AI insights not enabled' }, { status: 403 });
    }

    // Rate limiting: check usage today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('contractor_id', contractor_id)
      .eq('event_type', 'ai_insight')
      .gte('created_at', today.toISOString());

    const limit = contractor.plan === 'agency' ? 200 : 50;
    if ((count || 0) >= limit) {
      return NextResponse.json({ error: 'Daily AI insight limit reached' }, { status: 429 });
    }

    // Generate insight
    const insight = await generateInsight(features, tier, site, estimate, currency);

    // Log usage
    await supabase.from('usage_logs').insert({
      contractor_id,
      event_type: 'ai_insight',
      metadata: { features_count: features.length, tier: tier.label },
    });

    return NextResponse.json({ insight });
  } catch (err) {
    console.error('AI insight error:', err);
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
}
