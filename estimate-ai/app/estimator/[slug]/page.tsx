import { createServiceClient } from '@/lib/supabase/server';
import { EstimatorShell } from '@/components/estimator/EstimatorShell';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServiceClient();
  const { data: contractor } = await supabase
    .from('contractors')
    .select('company_name')
    .eq('slug', slug)
    .in('plan_status', ['active', 'trialing'])
    .single();

  return {
    title: contractor ? `${contractor.company_name} — Project Estimator` : 'Project Estimator',
    description: 'Get an instant estimate for your outdoor living project.',
  };
}

export default async function EstimatorPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServiceClient();

  // Fetch contractor
  const { data: contractor, error: contractorError } = await supabase
    .from('contractors')
    .select('*')
    .eq('slug', slug)
    .in('plan_status', ['active', 'trialing'])
    .single();

  if (contractorError || !contractor) {
    notFound();
  }

  // Fetch services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('contractor_id', contractor.id)
    .eq('is_active', true)
    .order('display_order');

  // Fetch pricing config
  const { data: config } = await supabase
    .from('pricing_config')
    .select('*')
    .eq('contractor_id', contractor.id)
    .single();

  if (!services?.length || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0E0A] text-[#F2EEE7]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Estimator Not Ready</h1>
          <p className="text-gray-400">This estimator is being set up. Please check back soon.</p>
        </div>
      </div>
    );
  }

  // Load Google Fonts
  const fonts = [contractor.headline_font, contractor.body_font].filter(Boolean);
  const fontLink = fonts.length > 0
    ? `https://fonts.googleapis.com/css2?${fonts.map((f: string) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`).join('&')}&display=swap`
    : null;

  return (
    <>
      {fontLink && (
        <link rel="stylesheet" href={fontLink} />
      )}
      <EstimatorShell
        contractor={contractor}
        services={services}
        config={config}
        source="website"
      />
    </>
  );
}
