import { z } from "zod";

export const wireTypeSchema = z.object({
  name: z
    .string({ message: "Wire metal/type name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type WireTypeInput = z.infer<typeof wireTypeSchema>;
