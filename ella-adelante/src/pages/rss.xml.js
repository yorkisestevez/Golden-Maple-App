import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, TAGLINE } from '../i18n/ui.ts';

export async function GET(context) {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  return rss({
    title: SITE_NAME,
    description: `${TAGLINE.es} / ${TAGLINE.en}`,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.pubDate,
      author: post.data.author,
      categories: [post.data.pillar, post.data.language],
      link: `/articulo/${post.data.slug ?? post.id}/`,
    })),
    customData: `<language>es-do</language>`,
  });
}
