import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DeckingEstimatorShell } from '@/components/estimator/decking/DeckingEstimatorShell';
import { DEFAULT_DECKING_SETTINGS } from '@/lib/decking/seed-settings';

export default async function DeckingEstimatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: contractor } = await supabase
    .from('contractors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!contractor) return notFound();

  const { data: deckingSettings } = await supabase
    .from('decking_settings')
    .select('*')
    .eq('contractor_id', contractor.id)
    .eq('is_enabled', true)
    .single();

  // Use stored settings or defaults
  const settings = deckingSettings
    ? {
        materials: deckingSettings.materials,
        crewRates: deckingSettings.crew_rates,
        permitFees: deckingSettings.permit_fees,
        engineeringFee: deckingSettings.engineering_fee,
        railingCosts: deckingSettings.railing_costs,
        stairTreadCosts: deckingSettings.stair_tread_costs,
        wasteFactors: deckingSettings.waste_factors,
        isEnabled: deckingSettings.is_enabled,
      }
    : DEFAULT_DECKING_SETTINGS;

  return (
    <DeckingEstimatorShell
      contractor={contractor}
      settings={settings}
      source="website"
    />
  );
}
