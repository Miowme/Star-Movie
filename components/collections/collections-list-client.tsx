"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Film, FolderHeart, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionFormDialog } from "@/components/collections/collection-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { UserCollection } from "@/types/cinema";
import Image from "next/image";

interface CollectionsListClientProps {
  initialCollections: UserCollection[];
}

function CollectionCover({
  coverUrl,
  name,
}: {
  coverUrl: string | null;
  name: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!coverUrl || imgFailed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-[#12151B] text-[#858B96]">
        <Film className="h-9 w-9" />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[#12151B]">
      <Image
        src={coverUrl}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={() => setImgFailed(true)}
        className="object-cover transition-transform duration-200 group-hover:scale-105"
      />
    </div>
  );
}

export function CollectionsListClient({
  initialCollections,
}: CollectionsListClientProps) {
  const [collections, setCollections] =
    useState<UserCollection[]>(initialCollections);
  const [addOpen, setAddOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<UserCollection | null>(null);
  const [removingCol, setRemovingCol] = useState<UserCollection | null>(null);
  const [removing, setRemoving] = useState(false);

  const reloadCollections = async () => {
    const res = await fetch("/api/collections", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setCollections(data.collections || []);
    }
  };

  const handleCreate = async (cleanName: string) => {
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create collection.");
    }
    toast.success("Collection created.");
    await reloadCollections();
  };

  const handleRename = async (cleanName: string) => {
    if (!editingCol) return;
    const res = await fetch(`/api/collections/${editingCol.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to rename collection.");
    }
    toast.success("Collection updated.");
    await reloadCollections();
  };

  const handleConfirmRemove = async () => {
    if (!removingCol) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/collections/${removingCol.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete collection.");
        return;
      }
      toast.success(`Removed "${removingCol.name}".`);
      setCollections((prev) => prev.filter((c) => c.id !== removingCol.id));
      setRemovingCol(null);
    } catch {
      toast.error("Network error while removing collection.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F7] sm:text-3xl">
            My Collections
          </h1>
          <p className="mt-1 text-sm text-[#858B96]">
            Organize your saved movies into custom lists.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1]"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Add a Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-12 text-center">
          <FolderHeart className="mx-auto mb-3 h-10 w-10 text-[#858B96]" />
          <h2 className="text-lg font-semibold text-[#F4F5F7]">
            No Collections Yet
          </h2>
          <p className="mt-1 text-sm text-[#858B96]">
            Create your first collection to start saving movies.
          </p>
          <Button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-4 bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1]"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Add a Collection
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#292E37] bg-[#1B2027] transition-colors hover:border-[#6F1BA5]"
            >
              <Link href={`/collections/${col.id}`} className="block">
                <div className="overflow-hidden border-b border-[#292E37]">
                  <CollectionCover coverUrl={col.coverUrl} name={col.name} />
                </div>
                <div className="p-4 pb-2">
                  <h2 className="line-clamp-1 text-lg font-semibold text-[#F4F5F7] group-hover:text-[#E5C51A]">
                    {col.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#858B96]">
                    {col.movieCount} {col.movieCount === 1 ? "movie" : "movies"}
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-end gap-2 px-4 pb-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCol(col)}
                  className="border-[#292E37] bg-[#12151B] text-xs text-[#F4F5F7] hover:border-[#6F1BA5]"
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRemovingCol(col)}
                  className="border-[#292E37] bg-[#12151B] text-xs text-red-400 hover:border-red-500/60 hover:bg-red-500/10"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CollectionFormDialog
        open={addOpen}
        mode="create"
        onClose={() => setAddOpen(false)}
        onSubmitName={handleCreate}
      />

      <CollectionFormDialog
        open={Boolean(editingCol)}
        mode="edit"
        initialName={editingCol?.name}
        onClose={() => setEditingCol(null)}
        onSubmitName={handleRename}
      />

      <ConfirmDialog
        open={Boolean(removingCol)}
        title="Remove Collection"
        description={`Are you sure you want to remove "${removingCol?.name}"? This will delete the collection and its movie associations.`}
        confirmLabel="Confirm Remove"
        loading={removing}
        onCancel={() => setRemovingCol(null)}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
