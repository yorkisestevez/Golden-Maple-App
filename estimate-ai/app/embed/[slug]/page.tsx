import { createServiceClient } from '@/lib/supabase/server';
import { EstimatorShell } from '@/components/estimator/EstimatorShell';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Project Estimator',
  robots: 'noindex',
};

export default async function EmbedEstimatorPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServiceClient();

  const { data: contractor } = await supabase
    .from('contractors')
    .select('*')
    .eq('slug', slug)
    .in('plan_status', ['active', 'trialing'])
    .single();

  if (!contractor) {
    notFound();
  }

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('contractor_id', contractor.id)
    .eq('is_active', true)
    .order('display_order');

  const { data: config } = await supabase
    .from('pricing_config')
    .select('*')
    .eq('contractor_id', contractor.id)
    .single();

  if (!services?.length || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0E0A] text-[#F2EEE7]">
        <p className="text-gray-400">Estimator not configured.</p>
      </div>
    );
  }

  const fonts = [contractor.headline_font, contractor.body_font].filter(Boolean);
  const fontLink = fonts.length > 0
    ? `https://fonts.googleapis.com/css2?${fonts.map((f: string) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`).join('&')}&display=swap`
    : null;

  return (
    <html>
      <head>
        {fontLink && <link rel="stylesheet" href={fontLink} />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Notify parent of height changes for auto-resize
              const observer = new ResizeObserver(() => {
                window.parent.postMessage({
                  type: 'estimateai-resize',
                  height: document.body.scrollHeight
                }, '*');
              });
              observer.observe(document.body);
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        <EstimatorShell
          contractor={contractor}
          services={services}
          config={config}
          source="embed"
        />
      </body>
    </html>
  );
}
