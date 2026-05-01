import { z } from "zod";

export const idSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/, "IDs may contain only letters, numbers, underscores, and dashes");

export type EntityId = z.infer<typeof idSchema>;

export function parseEntityId(value: string): EntityId {
  return idSchema.parse(value);
}
