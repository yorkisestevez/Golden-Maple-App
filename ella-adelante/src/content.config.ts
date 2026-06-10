import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The four editorial pillars. Keep these slugs in sync with the routes
// (/historias, /dinero, /voz, /herramientas) and public/admin/config.yml.
export const PILLARS = ['historias', 'dinero', 'voz', 'herramientas'] as const;
export const LANGUAGES = ['es', 'en', 'bilingual'] as const;

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Optional explicit slug. Falls back to the filename when omitted.
      slug: z.string().optional(),
      language: z.enum(LANGUAGES).default('es'),
      pillar: z.enum(PILLARS),
      heroImage: image().optional(),
      heroAlt: z.string().default(''),
      heroCredit: z.string().optional(),
      excerpt: z.string(),
      author: z.string().default('Redacción Ella Adelante'),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      featured: z.boolean().default(false),
      // Marks the seeded demo content so it is obvious before real posts land.
      sample: z.boolean().default(false),
      // Slug of an equivalent piece in the other language, for hreflang.
      translationOf: z.string().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { posts };
