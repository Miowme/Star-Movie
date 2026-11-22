"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Film,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddMovieDialog } from "@/components/admin/add-movie-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Movie } from "@/types/cinema";
import Image from "next/image";

interface AdminMovieManagementProps {
  cloudName: string;
  uploadPreset: string;
}

export function AdminMovieManagement({
  cloudName,
  uploadPreset,
}: AdminMovieManagementProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [deleting, setDeleting] = useState(false);

  const currentCursor = cursorStack[pageIndex] ?? null;

  useEffect(() => {
    let active = true;
    const url = currentCursor
      ? `/api/movies?cursor=${encodeURIComponent(currentCursor)}`
      : "/api/movies";

    fetch(url, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load movies.");
        return data;
      })
      .then((data) => {
        if (!active) return;
        setMovies(data.movies || []);
        setNextCursor(data.nextCursor ?? null);
        setHasMore(Boolean(data.hasMore));
      })
      .catch((err) => {
        if (!active) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load movies.";
        setError(msg);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentCursor, reloadTick]);

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/movies/${movieToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete movie.");
        return;
      }

      if (
        Array.isArray(data.storageWarnings) &&
        data.storageWarnings.length > 0
      ) {
        toast.warning(
          `Movie deleted, but storage cleanup reported: ${data.storageWarnings.join(", ")}`,
        );
      } else {
        toast.success(
          `Deleted "${movieToDelete.title}" and removed ${data.deletedRelationsCount ?? 0} collection reference(s).`,
        );
      }

      setMovies((prev) => prev.filter((m) => m.id !== movieToDelete.id));
      setMovieToDelete(null);
    } catch {
      toast.error("Network error while deleting movie.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F7]">
            Movie Management
          </h1>
          <p className="mt-1 text-sm text-[#858B96]">
            Add new releases or remove movies from the STAR Cinema catalog.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Movie
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="h-64 animate-pulse rounded-xl border border-[#292E37] bg-[#1B2027]" />
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-[#1B2027] p-8 text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <Button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadTick((t) => t + 1);
            }}
            className="mt-4 bg-[#6F1BA5] text-[#F4F5F7]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && movies.length === 0 && (
        <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-12 text-center">
          <Film className="mx-auto mb-3 h-9 w-9 text-[#858B96]" />
          <p className="text-sm text-[#858B96]">
            No movies found in the catalog.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && movies.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[#292E37] bg-[#1B2027]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#292E37] hover:bg-transparent">
                <TableHead className="text-[#858B96]">Poster</TableHead>
                <TableHead className="text-[#858B96]">Title</TableHead>
                <TableHead className="text-[#858B96]">Description</TableHead>
                <TableHead className="text-[#858B96]">Duration</TableHead>
                <TableHead className="text-[#858B96]">Genres</TableHead>
                <TableHead className="text-[#858B96]">Rating</TableHead>
                <TableHead className="text-[#858B96]">Release Date</TableHead>
                <TableHead className="text-right text-[#858B96]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movies.map((movie) => (
                <TableRow
                  key={movie.id}
                  className="border-[#292E37] hover:bg-[#12151B]/60"
                >
                  <TableCell>
                    {movie.coverUrl ? (
                      <Image
                        src={movie.coverUrl}
                        alt={movie.title}
                        width={40}
                        height={56}
                        className="h-14 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-10 items-center justify-center rounded bg-[#12151B] text-[#858B96]">
                        <Film className="h-4 w-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-[#F4F5F7]">
                    {movie.title}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-[#858B96]">
                    {movie.description}
                  </TableCell>
                  <TableCell className="text-sm text-[#F4F5F7]">
                    {movie.duration}m
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.map((g) => (
                        <Badge
                          key={g}
                          variant="secondary"
                          className="border border-[#292E37] bg-[#12151B] text-[11px] text-[#F4F5F7]"
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm font-semibold text-[#E5C51A]">
                      <Star className="h-3.5 w-3.5 fill-[#E5C51A]" />
                      {movie.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-[#858B96]">
                    {movie.releaseDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMovieToDelete(movie)}
                      className="border-[#292E37] bg-[#12151B] text-xs text-red-400 hover:border-red-500/60 hover:bg-red-500/10"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cursor Pagination */}
      {!loading && !error && movies.length > 0 && (
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={pageIndex === 0}
            onClick={() => {
              setLoading(true);
              setPageIndex((p) => p - 1);
            }}
            className="border-[#292E37] bg-[#1B2027] text-[#F4F5F7]"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-[#F4F5F7]">Page {pageIndex + 1}</span>
          <Button
            type="button"
            variant="outline"
            disabled={!hasMore}
            onClick={() => {
              if (!nextCursor) return;
              setLoading(true);
              setCursorStack((prev) => {
                const copy = prev.slice(0, pageIndex + 1);
                copy.push(nextCursor);
                return copy;
              });
              setPageIndex((p) => p + 1);
            }}
            className="border-[#292E37] bg-[#1B2027] text-[#F4F5F7]"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      <AddMovieDialog
        open={addOpen}
        cloudName={cloudName}
        uploadPreset={uploadPreset}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setPageIndex(0);
          setCursorStack([null]);
          setLoading(true);
          setReloadTick((t) => t + 1);
        }}
      />

      <ConfirmDialog
        open={Boolean(movieToDelete)}
        title={`Remove "${movieToDelete?.title}"`}
        description="Are you sure you want to permanently delete this movie?"
        warning="This movie will also be removed from all user collections."
        confirmLabel="Confirm Remove"
        loading={deleting}
        onCancel={() => setMovieToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
