"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Film,
  FolderPlus,
  RefreshCw,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AddToCollectionDialog } from "@/components/collections/add-to-collection-dialog";
import type { Movie } from "@/types/cinema";
import Image from "next/image";

export function MovieListView() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

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
        toast.error(msg);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentCursor, reloadTick]);

  const handleNextPage = () => {
    if (!hasMore || !nextCursor) return;
    setLoading(true);
    setError(null);
    setCursorStack((prev) => {
      const copy = prev.slice(0, pageIndex + 1);
      copy.push(nextCursor);
      return copy;
    });
    setPageIndex((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (pageIndex === 0) return;
    setLoading(true);
    setError(null);
    setPageIndex((prev) => prev - 1);
  };

  const toggleMovie = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F7] sm:text-3xl">
            Movies Catalog
          </h1>
          <p className="mt-1 text-sm text-[#858B96]">
            Select movies to bulk add into your collections.
          </p>
        </div>

        <Button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={() => setBulkOpen(true)}
          className="bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1] disabled:opacity-40"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Bulk Add to Collection ({selectedIds.length})
        </Button>
      </div>

      {/* Loading Skeleton (5x2 on desktop) */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="h-72 animate-pulse rounded-xl border border-[#292E37] bg-[#1B2027]"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-[#1B2027] p-8 text-center"
        >
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <h2 className="text-lg font-semibold text-[#F4F5F7]">
            Unable to Load Movies
          </h2>
          <p className="mt-1 text-sm text-[#858B96]">{error}</p>
          <Button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadTick((t) => t + 1);
            }}
            className="mt-4 bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && movies.length === 0 && (
        <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-10 text-center">
          <Film className="mx-auto mb-3 h-9 w-9 text-[#858B96]" />
          <h2 className="text-lg font-semibold text-[#F4F5F7]">
            No Movies Found
          </h2>
          <p className="mt-1 text-sm text-[#858B96]">
            No movies have been added yet.
          </p>
        </div>
      )}

      {/* 5 cols desktop (5x2), 3 tablet, 2 mobile */}
      {!loading && !error && movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {movies.map((movie) => {
              const checked = selectedIds.includes(movie.id);
              const year = movie.releaseDate
                ? new Date(movie.releaseDate).getFullYear()
                : null;

              return (
                <div
                  key={movie.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-[#292E37] bg-[#1B2027] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6F1BA5]"
                >
                  {/* Selection Checkbox */}
                  <div className="absolute left-2.5 top-2.5 z-10 rounded bg-[#12151B]/85 p-1 backdrop-blur">
                    <Checkbox
                      aria-label={`Select ${movie.title}`}
                      checked={checked}
                      onCheckedChange={() => toggleMovie(movie.id)}
                      className="border-[#858B96] data-[state=checked]:border-[#6F1BA5] data-[state=checked]:bg-[#6F1BA5]"
                    />
                  </div>

                  {/* Clickable Card -> Detail */}
                  <Link
                    href={`/movies/${movie.id}`}
                    className="flex flex-1 flex-col"
                  >
                    <div className="aspect-2/3 w-full overflow-hidden bg-[#12151B]">
                      {movie.coverUrl ? (
                        <Image
                          src={movie.coverUrl}
                          alt={movie.title}
                          width={400}
                          height={600}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#858B96]">
                          <Film className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-3">
                      <h2 className="line-clamp-2 text-sm font-semibold text-[#F4F5F7] group-hover:text-[#E5C51A]">
                        {movie.title}
                      </h2>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        {typeof movie.rating === "number" ? (
                          <span className="flex items-center gap-1 font-semibold text-[#E5C51A]">
                            <Star className="h-3.5 w-3.5 fill-[#E5C51A]" />
                            {movie.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span />
                        )}
                        {year && !Number.isNaN(year) && (
                          <span className="text-[#858B96]">{year}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Cursor Pagination Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={pageIndex === 0}
              onClick={handlePrevPage}
              className="border-[#292E37] bg-[#1B2027] text-[#F4F5F7] hover:border-[#6F1BA5]"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-[#F4F5F7]">
              Page {pageIndex + 1}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={!hasMore}
              onClick={handleNextPage}
              className="border-[#292E37] bg-[#1B2027] text-[#F4F5F7] hover:border-[#6F1BA5]"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      <AddToCollectionDialog
        open={bulkOpen}
        movieIds={selectedIds}
        onClose={() => setBulkOpen(false)}
        onCompleted={() => setSelectedIds([])}
      />
    </div>
  );
}
