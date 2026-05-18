import { z } from "zod";

// Create post schema
export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z
    .string()
    .max(300, "Excerpt must not exceed 300 characters")
    .optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).max(5, "Maximum 5 tags allowed").optional(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;

// Update post schema
export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .optional(),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .optional(),
  excerpt: z
    .string()
    .max(300, "Excerpt must not exceed 300 characters")
    .optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).max(5, "Maximum 5 tags allowed").optional(),
});

export type UpdatePostDto = z.infer<typeof updatePostSchema>;

// Query posts schema
export const queryPostsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  tag: z.string().optional(),
  authorId: z.string().optional(),
  published: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "title", "viewCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type QueryPostsDto = z.infer<typeof queryPostsSchema>;

// Post slug schema
export const postSlugSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
});

export type PostSlugDto = z.infer<typeof postSlugSchema>;
