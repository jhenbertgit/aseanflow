import { z } from "zod";

// Update user profile schema
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// User query schema
export const queryUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(["USER", "ADMIN", "MODERATOR"]).optional(),
});

export type QueryUsersDto = z.infer<typeof queryUsersSchema>;
