import { z } from "zod";

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationDto = z.infer<typeof paginationSchema>;

// Sort schema
export const sortSchema = z.object({
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type SortDto = z.infer<typeof sortSchema>;

// ID param schema
export const idParamSchema = z.object({
  id: z.string().cuid("Invalid ID format"),
});

export type IdParamDto = z.infer<typeof idParamSchema>;
