'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function EmbedPage() {
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('contractors')
        .select('slug')
        .eq('id', user.id)
        .single();

      if (data) setSlug(data.slug);
    }
    load();
  }, []);

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const scriptTag = `<script src="${appUrl}/api/embed/${slug}"></script>`;
  const iframeTag = `<iframe src="${appUrl}/embed/${slug}" style="width:100%;min-height:700px;border:none;border-radius:12px;" title="Project Estimator"></iframe>`;
  const directLink = `${appUrl}/estimator/${slug}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F2EEE7]">Embed Your Estimator</h1>
        <p className="text-[#A89F91] mt-1">Add your estimator to any website</p>
      </div>

      {/* Direct Link */}
      <Card variant="bordered" className="space-y-3">
        <h2 className="text-lg font-semibold text-[#F2EEE7]">Direct Link</h2>
        <p className="text-sm text-[#A89F91]">Share this link directly with homeowners</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 p-3 bg-[#0F0E0A] rounded-lg text-sm text-[#D4AF63] overflow-x-auto">
            {directLink}
          </code>
          <Button size="sm" variant="outline" onClick={() => copyToClipboard(directLink, 'link')}>
            {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <a href={directLink} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </Card>

      {/* Script Tag */}
      <Card variant="bordered" className="space-y-3">
        <h2 className="text-lg font-semibold text-[#F2EEE7]">Script Tag (Recommended)</h2>
        <p className="text-sm text-[#A89F91]">
          Paste this anywhere on your website. It automatically creates a responsive estimator widget.
        </p>
        <div className="relative">
          <pre className="p-4 bg-[#0F0E0A] rounded-lg text-sm text-[#A89F91] overflow-x-auto whitespace-pre-wrap break-all">
            {scriptTag}
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(scriptTag, 'script')}
          >
            {copied === 'script' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* iframe */}
      <Card variant="bordered" className="space-y-3">
        <h2 className="text-lg font-semibold text-[#F2EEE7]">iframe Embed</h2>
        <p className="text-sm text-[#A89F91]">
          Use this if you prefer direct iframe control. Adjust width/height as needed.
        </p>
        <div className="relative">
          <pre className="p-4 bg-[#0F0E0A] rounded-lg text-sm text-[#A89F91] overflow-x-auto whitespace-pre-wrap break-all">
            {iframeTag}
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(iframeTag, 'iframe')}
          >
            {copied === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
