import { createBrowserClient } from '@supabase/ssr';

// During build-time static prerendering, NEXT_PUBLIC_* env vars may be absent.
// @supabase/ssr throws if URL/key are missing, which crashes the prerender of
// any client page that constructs a client at module/component scope. Fall back
// to inert placeholders so the build can prerender; at runtime the real
// NEXT_PUBLIC_* values (inlined at build when configured) are used.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
