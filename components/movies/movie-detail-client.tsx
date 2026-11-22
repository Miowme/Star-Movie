"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FolderHeart,
  FolderPlus,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToCollectionDialog } from "@/components/collections/add-to-collection-dialog";
import type { Movie } from "@/types/cinema";
import Image from "next/image";

interface MovieDetailClientProps {
  movie: Movie;
  initialCollections: Array<{ id: string; name: string }>;
}

export function MovieDetailClient({
  movie,
  initialCollections,
}: MovieDetailClientProps) {
  const [addedCollections, setAddedCollections] = useState(initialCollections);
  const [modalOpen, setModalOpen] = useState(false);

  const refreshCollections = () => {
    fetch(`/api/collections?movieId=${encodeURIComponent(movie.id)}`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.collections) {
          setAddedCollections(data.collections);
        }
      })
      .catch(() => {});
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/movies"
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#858B96] hover:text-[#F4F5F7]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Movies
      </Link>

      {/* Banner */}
      {movie.bannerUrl && (
        <div className="relative mb-6 h-56 w-full overflow-hidden rounded-xl border border-[#292E37] bg-[#1B2027] sm:h-72">
          <Image
            src={movie.bannerUrl}
            alt={`${movie.title} banner`}
            fill
            sizes="(max-width: 768px) 100vw, 960px"
            className="object-cover"
          />
        </div>
      )}

      <div className="grid gap-8 rounded-xl border border-[#292E37] bg-[#1B2027] p-6 md:grid-cols-3">
        {/* Poster */}
        <div className="overflow-hidden rounded-lg border border-[#292E37] bg-[#12151B]">
          {movie.coverUrl ? (
            <Image
              src={movie.coverUrl}
              alt={movie.title}
              width={400}
              height={600}
              className="aspect-2/3 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-2/3 items-center justify-center text-sm text-[#858B96]">
              No Poster
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-5 md:col-span-2">
          <div>
            <h1 className="text-2xl font-bold text-[#F4F5F7] sm:text-3xl">
              {movie.title}
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-sm text-[#858B96]">
              <span className="flex items-center gap-1 font-semibold text-[#E5C51A]">
                <Star className="h-4 w-4 fill-[#E5C51A]" />
                {movie.rating.toFixed(1)} / 10
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {movie.duration} mins
              </span>
              {movie.releaseDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {movie.releaseDate}
                </span>
              )}
              {movie.ageRating && (
                <Badge
                  variant="outline"
                  className="border-[#292E37] text-xs text-[#F4F5F7]"
                >
                  {movie.ageRating}
                </Badge>
              )}
            </div>
          </div>

          {/* Genre Badges */}
          {movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <Badge
                  key={genre}
                  className="border border-[#6F1BA5]/50 bg-[#6F1BA5]/20 text-[#F4F5F7]"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#858B96]">
              Description
            </h2>
            <p className="mt-1.5 leading-relaxed text-[#F4F5F7]">
              {movie.description}
            </p>
          </div>

          {/* Only-if-present optional metadata */}
          {(movie.director ||
            (movie.cast && movie.cast.length > 0) ||
            movie.language ||
            movie.productionCompany) && (
            <div className="grid gap-4 border-t border-[#292E37] pt-4 text-sm sm:grid-cols-2">
              {movie.director && (
                <div>
                  <span className="text-xs text-[#858B96]">Director</span>
                  <p className="mt-0.5 font-medium text-[#F4F5F7]">
                    {movie.director}
                  </p>
                </div>
              )}
              {movie.language && (
                <div>
                  <span className="text-xs text-[#858B96]">Language</span>
                  <p className="mt-0.5 font-medium text-[#F4F5F7]">
                    {movie.language}
                  </p>
                </div>
              )}
              {movie.productionCompany && (
                <div>
                  <span className="text-xs text-[#858B96]">
                    Production Company
                  </span>
                  <p className="mt-0.5 font-medium text-[#F4F5F7]">
                    {movie.productionCompany}
                  </p>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-[#858B96]">Cast</span>
                  <p className="mt-0.5 font-medium text-[#F4F5F7]">
                    {movie.cast.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Add to Collection Button */}
          <div className="border-t border-[#292E37] pt-4">
            <Button
              type="button"
              onClick={() => setModalOpen(true)}
              className="bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1]"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Add to Collection
            </Button>
          </div>

          {/* Added to Collections Section */}
          <div className="rounded-lg border border-[#292E37] bg-[#12151B] p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#F4F5F7]">
              <FolderHeart className="h-4 w-4 text-[#E5C51A]" />
              Added to Collections
            </h2>

            {addedCollections.length === 0 ? (
              <p className="mt-1.5 text-xs text-[#858B96]">
                Not added to any of your collections yet.
              </p>
            ) : (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {addedCollections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="rounded-md border border-[#292E37] bg-[#1B2027] px-3 py-1.5 text-xs font-medium text-[#E5C51A] transition-colors hover:border-[#6F1BA5]"
                  >
                    {col.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddToCollectionDialog
        open={modalOpen}
        movieIds={[movie.id]}
        onClose={() => setModalOpen(false)}
        onCompleted={refreshCollections}
      />
    </div>
  );
}
