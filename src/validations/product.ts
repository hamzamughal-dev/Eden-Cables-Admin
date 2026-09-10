import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string({ message: "Product name is required" })
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name cannot exceed 200 characters"),
  dimension: z
    .string()
    .trim()
    .min(1, "Dimension is required (e.g. 3/29, 7/29, 7/36)")
    .max(50, "Dimension cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  image_url: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),
  price: z
    .number({ message: "Price must be a valid number" })
    .min(0, "Price cannot be negative"),
  category_id: z
    .string()
    .uuid("Please select a valid category"),
  quantity: z
    .number()
    .optional(),
  discount: z
    .number()
    .optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
