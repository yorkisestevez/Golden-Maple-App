import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@i18n/ui';

export type Post = CollectionEntry<'posts'>;

/** Resolve a post's URL slug (explicit frontmatter slug wins, else file id). */
export function postSlug(post: Post): string {
  return post.data.slug ?? post.id;
}

/** Canonical path for a post. All articles live under /articulo for a clean,
 *  language-agnostic permalink (each post stays in its native language). */
export function postPath(post: Post): string {
  return `/articulo/${postSlug(post)}`;
}

/** Words-per-minute estimate. Spanish and English land close enough at 200. */
export function readingTimeMinutes(body: string | undefined): number {
  if (!body) return 1;
  const words = body
    .replace(/```[\s\S]*?```/g, ' ') // drop code blocks
    .replace(/[#>*_`~\-!\[\]()]/g, ' ') // drop markdown punctuation
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** All published posts, newest first. (No draft flag in content — Decap's
 *  editorial workflow keeps drafts out of the repo's published branch.) */
export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

/** Whether a post should appear in a given UI language view. A post written
 *  in `es` shows in the Spanish view; `en` in English; `bilingual` in both. */
export function matchesLang(post: Post, lang: Lang): boolean {
  if (post.data.language === 'bilingual') return true;
  return post.data.language === lang;
}

export async function getPostsByLang(lang: Lang): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => matchesLang(p, lang));
}

export async function getPostsByPillar(
  pillar: string,
  lang?: Lang,
): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter(
    (p) => p.data.pillar === pillar && (!lang || matchesLang(p, lang)),
  );
}

export async function getFeaturedPost(lang: Lang): Promise<Post | undefined> {
  const posts = await getPostsByLang(lang);
  return posts.find((p) => p.data.featured) ?? posts[0];
}

/** Related posts: same pillar first, prefer same language, never the post
 *  itself. Falls back to filling from the same language pool. */
export async function getRelatedPosts(
  post: Post,
  lang: Lang,
  limit = 3,
): Promise<Post[]> {
  const all = await getPostsByLang(lang);
  const others = all.filter((p) => p.id !== post.id);
  const samePillar = others.filter((p) => p.data.pillar === post.data.pillar);
  const rest = others.filter((p) => p.data.pillar !== post.data.pillar);
  return [...samePillar, ...rest].slice(0, limit);
}

const dateFmt: Record<Lang, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat('es-DO', { dateStyle: 'long' }),
  en: new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }),
};

export function formatDate(date: Date, lang: Lang): string {
  return dateFmt[lang].format(date);
}
