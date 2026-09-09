import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string({ message: "Product name is required" })
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name cannot exceed 200 characters"),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  quantity: z
    .number({ message: "Quantity must be a valid number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  price: z
    .number({ message: "Price must be a valid number" })
    .min(0, "Price cannot be negative"),
  discount: z
    .number({ message: "Discount must be a valid number" })
    .min(0, "Discount cannot be less than 0%")
    .max(100, "Discount cannot exceed 100%"),
  category_id: z
    .string()
    .uuid("Please select a valid category"),
});

export type ProductInput = z.infer<typeof productSchema>;
