import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const script = `
(function() {
  var container = document.createElement('div');
  container.id = 'estimateai-widget';

  var iframe = document.createElement('iframe');
  iframe.src = '${appUrl}/embed/${slug}';
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.minHeight = '700px';
  iframe.style.borderRadius = '12px';
  iframe.style.overflow = 'hidden';
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('title', 'Project Estimator');

  // Auto-resize iframe
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'estimateai-resize') {
      iframe.style.height = e.data.height + 'px';
    }
  });

  container.appendChild(iframe);

  // Insert after the script tag
  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];
  currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
})();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
