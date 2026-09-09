import { z } from "zod";

export const requestStatusEnum = z.enum([
  "pending",
  "contacted",
  "completed",
  "cancelled",
]);

export const updateRequestStatusSchema = z.object({
  status: requestStatusEnum,
});

export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
