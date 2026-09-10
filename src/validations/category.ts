import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({ message: "Category name is required" })
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  wire_type_id: z
    .string()
    .uuid("Please select a valid wire metal/type")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
