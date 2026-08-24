import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.enum(['websites', 'search', 'consulting', 'ads']),
    targetKeyword: z.string(),
    draft: z.boolean().default(false),
    author: z.string().default('Pasadena Works'),
    tags: z.array(z.string()).min(1).max(3),
    heroImage: z.string().url().optional(),
    heroAlt: z.string().optional(),
    heroCredit: z.string().optional(),
  }),
});

export const collections = { blog };
