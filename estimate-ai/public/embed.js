(function() {
  'use strict';

  var scripts = document.querySelectorAll('script[data-estimateai-slug]');
  var script = scripts[scripts.length - 1];
  if (!script) return;

  var slug = script.getAttribute('data-estimateai-slug');
  if (!slug) return;

  var host = script.getAttribute('data-estimateai-host') || 'https://estimateai.com';
  var container = document.createElement('div');
  container.id = 'estimateai-widget-' + slug;

  var iframe = document.createElement('iframe');
  iframe.src = host + '/embed/' + slug;
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.minHeight = '600px';
  iframe.style.colorScheme = 'normal';
  iframe.setAttribute('title', 'Project Estimator');
  iframe.setAttribute('loading', 'lazy');

  // Auto-resize based on content height
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'estimateai-resize' && event.data.slug === slug) {
      iframe.style.height = event.data.height + 'px';
    }
  });

  container.appendChild(iframe);
  script.parentNode.insertBefore(container, script.nextSibling);
})();
