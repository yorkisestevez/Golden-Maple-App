import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { DEFAULT_SERVICES, DEFAULT_PRICING_CONFIG } from '@/lib/seed-data';

export async function POST(request: NextRequest) {
  try {
    const { contractor_id } = await request.json();
    if (!contractor_id) {
      return NextResponse.json({ error: 'Missing contractor_id' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Insert default services
    const servicesWithContractor = DEFAULT_SERVICES.map((s) => ({
      ...s,
      contractor_id,
    }));

    await supabase.from('services').insert(servicesWithContractor);

    // Insert default pricing config
    await supabase.from('pricing_config').insert({
      contractor_id,
      ...DEFAULT_PRICING_CONFIG,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
}
