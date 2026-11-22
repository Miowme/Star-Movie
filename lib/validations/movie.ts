import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 1 * 1024 * 1024;

export const movieFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().min(1, "Description is required").max(2000),
  duration: z.coerce
    .number({ error: "Duration must be a number" })
    .int("Duration must be an integer")
    .positive("Duration must be a positive number"),
  genres: z
    .array(z.string().trim().min(1))
    .min(1, "Select or enter at least 1 genre"),
  rating: z.coerce
    .number({ error: "Duration must be a number" })
    .min(0, "Rating must be at least 0")
    .max(10, "Rating cannot exceed 10"),
  releaseDate: z
    .string()
    .trim()
    .min(1, "Release date is required")
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid release date"),
  director: z.string().trim().optional(),
  cast: z.array(z.string().trim().min(1)).optional(),
  language: z.string().trim().optional(),
  ageRating: z.string().trim().optional(),
  productionCompany: z.string().trim().optional(),
});

export const createMoviePayloadSchema = movieFormSchema.extend({
  coverUrl: z.string().url("Valid cover image URL is required"),
  bannerUrl: z.string().url("Valid banner image URL is required"),
  coverPath: z.string().optional().default(""),
  bannerPath: z.string().optional().default(""),
});

export type MovieFormInput = z.infer<typeof movieFormSchema>;
