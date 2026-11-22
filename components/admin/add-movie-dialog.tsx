"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Film, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { movieFormSchema } from "@/lib/validations/movie";
import {
  uploadImageToCloudinary,
  validateMovieImageFile,
} from "@/lib/cloudinary/upload";
import type { Movie } from "@/types/cinema";

interface AddMovieDialogProps {
  open: boolean;
  cloudName: string;
  uploadPreset: string;
  onClose: () => void;
  onCreated: (movie: Movie) => void;
}

export function AddMovieDialog({
  open,
  cloudName,
  uploadPreset,
  onClose,
  onCreated,
}: AddMovieDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [genresText, setGenresText] = useState("");
  const [rating, setRating] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [director, setDirector] = useState("");
  const [castText, setCastText] = useState("");
  const [language, setLanguage] = useState("");
  const [ageRating, setAgeRating] = useState("");
  const [productionCompany, setProductionCompany] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const coverErr = validateMovieImageFile(coverFile, true);
    if (coverErr) {
      setFormError(coverErr);
      return;
    }

    const bannerErr = validateMovieImageFile(bannerFile, false);
    if (bannerErr) {
      setFormError(bannerErr);
      return;
    }

    const genres = genresText
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    const cast = castText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const parsed = movieFormSchema.safeParse({
      title,
      description,
      duration,
      genres,
      rating,
      releaseDate,
      director: director || undefined,
      cast: cast.length > 0 ? cast : undefined,
      language: language || undefined,
      ageRating: ageRating || undefined,
      productionCompany: productionCompany || undefined,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || "Invalid movie details.");
      return;
    }

    setSubmitting(true);
    try {
      const uploadedCover = await uploadImageToCloudinary({
        file: coverFile!,
        cloudName,
        uploadPreset,
        folder: "star-cinema/covers",
      });

      const uploadedBanner = bannerFile
        ? await uploadImageToCloudinary({
            file: bannerFile,
            cloudName,
            uploadPreset,
            folder: "star-cinema/banners",
          })
        : uploadedCover;

      const res = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          coverUrl: uploadedCover.url,
          coverPath: uploadedCover.publicId,
          bannerUrl: uploadedBanner.url,
          bannerPath: bannerFile ? uploadedBanner.publicId : "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to save movie.");
        return;
      }

      toast.success(`"${data.movie.title}" added to catalog.`);
      onCreated(data.movie);
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Error uploading image or saving movie.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add New Movie"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4"
    >
      <div className="my-8 w-full max-w-2xl rounded-xl border border-[#292E37] bg-[#1B2027] p-6 text-[#F4F5F7]">
        <div className="mb-4 flex items-center justify-between border-b border-[#292E37] pb-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-[#E5C51A]" />
            <h2 className="text-lg font-bold">Add New Movie</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#858B96] hover:bg-[#12151B] hover:text-[#F4F5F7]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {formError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dune: Part Two"
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description *</Label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Movie synopsis..."
                className="w-full rounded-md border border-[#292E37] bg-[#12151B] px-3 py-2 text-sm text-[#F4F5F7] focus:border-[#6F1BA5] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Cover Image (JPEG/PNG/WebP, max 5MB) *</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="border-[#292E37] bg-[#12151B] text-xs text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Banner Image (Optional)</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                className="border-[#292E37] bg-[#12151B] text-xs text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Duration (minutes) *</Label>
              <Input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="166"
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rating (0 - 10) *</Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={10}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="8.8"
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Genres (comma-separated) *</Label>
              <Input
                value={genresText}
                onChange={(e) => setGenresText(e.target.value)}
                placeholder="Sci-Fi, Adventure"
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Release Date *</Label>
              <Input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Director (Optional)</Label>
              <Input
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Denis Villeneuve"
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Language (Optional)</Label>
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English"
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Age Classification (Optional)</Label>
              <Input
                value={ageRating}
                onChange={(e) => setAgeRating(e.target.value)}
                placeholder="PG-13"
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Production Company (Optional)</Label>
              <Input
                value={productionCompany}
                onChange={(e) => setProductionCompany(e.target.value)}
                placeholder="Legendary Pictures"
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Cast (comma-separated, Optional)</Label>
              <Input
                value={castText}
                onChange={(e) => setCastText(e.target.value)}
                placeholder="Timothee Chalamet, Zendaya"
                className="border-[#292E37] bg-[#12151B] text-[#F4F5F7]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="border-[#292E37] bg-[#12151B] text-[#858B96]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Save Movie
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
