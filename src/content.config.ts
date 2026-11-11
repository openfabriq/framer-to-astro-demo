import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			category: z.string(),
			author: z.string(),
			authorImage: image().optional(),
			authorImageAlt: z.string().optional(),
			readTime: z.string(),
			image: image(),
			imageAlt: z.string().optional(),
			intro: z.string(),
		}),
});

export const collections = { blog };
