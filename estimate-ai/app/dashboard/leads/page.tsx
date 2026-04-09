import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LeadsPageClient } from './client';

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  return <LeadsPageClient leads={leads || []} />;
}
