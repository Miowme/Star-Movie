import { z } from "zod";

const COLLECTION_NAME_REGEX = /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;

export function normalizeCollectionName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export function sanitizeCollectionDisplayName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export const collectionFormSchema = z.object({
  name: z
    .string()
    .transform((val) => sanitizeCollectionDisplayName(val))
    .pipe(
      z
        .string()
        .min(1, "Collection name is required")
        .max(50, "Collection name must be 50 characters or fewer")
        .regex(
          COLLECTION_NAME_REGEX,
          "Only letters (A-Z), numbers (0-9), and single spaces between words are allowed",
        ),
    ),
});

export type CollectionFormInput = z.infer<typeof collectionFormSchema>;

export const bulkAddSchema = z.object({
  movieIds: z.array(z.string().min(1)).min(1, "Select at least one movie"),
  collectionIds: z.array(z.string().min(1)).optional().default([]),
  newCollectionName: z.string().optional(),
});
