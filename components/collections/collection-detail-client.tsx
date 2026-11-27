"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Film, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionFormDialog } from "@/components/collections/collection-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { CollectionMovieRelation } from "@/types/cinema";
import Image from "next/image";

interface CollectionDetailClientProps {
  collectionId: string;
  initialName: string;
  initialItems: CollectionMovieRelation[];
}

export function CollectionDetailClient({
  collectionId,
  initialName,
  initialItems,
}: CollectionDetailClientProps) {
  const [name, setName] = useState(initialName);
  const [items, setItems] = useState<CollectionMovieRelation[]>(initialItems);
  const [editOpen, setEditOpen] = useState(false);
  const [movieToRemove, setMovieToRemove] =
    useState<CollectionMovieRelation | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRename = async (cleanName: string) => {
    const res = await fetch(`/api/collections/${collectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to rename collection.");
    }
    setName(cleanName);
    toast.success("Collection renamed.");
  };

  const handleConfirmRemoveMovie = async () => {
    if (!movieToRemove) return;
    setRemoving(true);
    try {
      const res = await fetch(
        `/api/collections/${collectionId}/movies/${movieToRemove.movieId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to remove movie.");
        return;
      }
      setItems((prev) =>
        prev.filter((item) => item.movieId !== movieToRemove.movieId),
      );
      toast.success(
        `Removed "${movieToRemove.movie?.title || "movie"}" from collection.`,
      );
      setMovieToRemove(null);
    } catch {
      toast.error("Network error while removing movie.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/collections"
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#858B96] hover:text-[#F4F5F7]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Collections
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-[#292E37] bg-[#1B2027] p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F7] sm:text-3xl">
            {name}
          </h1>
          <p className="mt-1 text-sm text-[#858B96]">
            {items.length} {items.length === 1 ? "movie" : "movies"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setEditOpen(true)}
          className="border-[#292E37] bg-[#12151B] text-[#F4F5F7] hover:border-[#6F1BA5]"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-12 text-center">
          <Film className="mx-auto mb-3 h-9 w-9 text-[#858B96]" />
          <h2 className="text-lg font-semibold text-[#F4F5F7]">
            This Collection is Empty
          </h2>
          <p className="mt-1 text-sm text-[#858B96]">
            Browse movies and add them to this collection.
          </p>
          <Link href="/movies">
            <Button
              type="button"
              className="mt-4 bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1]"
            >
              Browse Movies
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => {
            const m = item.movie!;
            return (
              <div
                key={item.movieId}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#292E37] bg-[#1B2027] transition-colors hover:border-[#6F1BA5]"
              >
                <Link href={`/movies/${m.id}`} className="block">
                  <div className="relative aspect-2/3 w-full overflow-hidden bg-[#12151B]">
                    {m.coverUrl ? (
                      <Image
                        src={m.coverUrl}
                        alt={m.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#858B96]">
                        <Film className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 pb-1">
                    <h2 className="line-clamp-2 text-sm font-semibold text-[#F4F5F7] group-hover:text-[#E5C51A]">
                      {m.title}
                    </h2>
                  </div>
                </Link>

                <div className="p-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMovieToRemove(item)}
                    className="w-full border-[#292E37] bg-[#12151B] text-xs text-red-400 hover:border-red-500/60 hover:bg-red-500/10"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CollectionFormDialog
        open={editOpen}
        mode="edit"
        initialName={name}
        onClose={() => setEditOpen(false)}
        onSubmitName={handleRename}
      />

      <ConfirmDialog
        open={Boolean(movieToRemove)}
        title="Remove Movie from Collection"
        description={`Remove "${movieToRemove?.movie?.title}" from "${name}"?`}
        confirmLabel="Confirm Remove"
        loading={removing}
        onCancel={() => setMovieToRemove(null)}
        onConfirm={handleConfirmRemoveMovie}
      />
    </div>
  );
}
