"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Film, FolderPlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  collectionFormSchema,
  normalizeCollectionName,
} from "@/lib/validations/collection";
import type { UserCollection } from "@/types/cinema";

interface AddToCollectionDialogProps {
  open: boolean;
  movieIds: string[];
  onClose: () => void;
  onCompleted?: () => void;
}

function AddToCollectionDialogBody({
  movieIds,
  onClose,
  onCompleted,
}: Omit<AddToCollectionDialogProps, "open">) {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/collections", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const list: UserCollection[] = data?.collections || [];
        setCollections(list);
        if (list.length === 0) {
          setShowNewInput(true);
        }
      })
      .catch(() => {
        if (active) toast.error("Could not load your collections.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleCollection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const validateNewName = (raw: string): boolean => {
    if (!raw.trim()) {
      setNameError(null);
      return true;
    }

    const parsed = collectionFormSchema.safeParse({ name: raw });
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message || "Invalid name");
      return false;
    }

    const norm = normalizeCollectionName(parsed.data.name);
    const duplicate = collections.some(
      (c) => (c.normalizedName || normalizeCollectionName(c.name)) === norm,
    );
    if (duplicate) {
      setNameError("A collection with this name already exists.");
      return false;
    }

    setNameError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (movieIds.length === 0) {
      toast.error("Select at least one movie first.");
      return;
    }

    if (showNewInput && newName.trim() && !validateNewName(newName)) {
      return;
    }

    const hasNewName = Boolean(showNewInput && newName.trim());
    if (selectedIds.length === 0 && !hasNewName) {
      toast.error("Pick an existing collection or create a new one.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/collections/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieIds,
          collectionIds: selectedIds,
          newCollectionName: hasNewName ? newName.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setNameError(data.error || "Duplicate collection name.");
        } else {
          toast.error(data.error || "Failed to add movies.");
        }
        return;
      }

      const added = Number(data.addedCount ?? 0);
      const skipped = Number(data.skippedCount ?? 0);
      toast.success(
        skipped > 0
          ? `Added ${added} movie(s), skipped ${skipped} already in collection.`
          : `Added ${added} movie(s) to collection.`,
      );
      onCompleted?.();
      onClose();
    } catch {
      toast.error("Network error while updating collections.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add to Collection"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
    >
      <div className="w-full max-w-md rounded-xl border border-[#292E37] bg-[#1B2027] p-6 text-[#F4F5F7]">
        <div className="mb-4 flex items-center justify-between border-b border-[#292E37] pb-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-[#E5C51A]" />
            <h2 className="text-lg font-bold">
              Add {movieIds.length} {movieIds.length === 1 ? "Movie" : "Movies"}{" "}
              to Collection
            </h2>
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-[#858B96]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading collections...
            </div>
          ) : (
            <>
              {collections.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-[#F4F5F7]">
                    Select Existing Collections
                  </Label>
                  <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-[#292E37] bg-[#12151B] p-3">
                    {collections.map((col) => (
                      <div
                        key={col.id}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            id={`pick-col-${col.id}`}
                            checked={selectedIds.includes(col.id)}
                            onCheckedChange={() => toggleCollection(col.id)}
                            className="border-[#858B96] data-[state=checked]:border-[#6F1BA5] data-[state=checked]:bg-[#6F1BA5]"
                          />
                          <Label
                            htmlFor={`pick-col-${col.id}`}
                            className="cursor-pointer text-sm font-normal text-[#F4F5F7]"
                          >
                            {col.name}
                          </Label>
                        </div>
                        <span className="text-xs text-[#858B96]">
                          {col.movieCount} movies
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!showNewInput && collections.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewInput(true)}
                  className="w-full border-[#292E37] bg-[#12151B] text-xs text-[#E5C51A] hover:border-[#6F1BA5]"
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create New Collection Instead
                </Button>
              )}

              {showNewInput && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="new-collection-input"
                    className="flex items-center gap-1.5 text-sm text-[#F4F5F7]"
                  >
                    <FolderPlus className="h-4 w-4 text-[#E5C51A]" />
                    New Collection Name
                  </Label>
                  <Input
                    id="new-collection-input"
                    type="text"
                    placeholder="e.g. Action Night 2026"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (nameError) validateNewName(e.target.value);
                    }}
                    onBlur={() => validateNewName(newName)}
                    className="h-10 border-[#292E37] bg-[#12151B] text-[#F4F5F7] placeholder:text-[#858B96] focus-visible:border-[#6F1BA5] focus-visible:ring-[#6F1BA5]"
                  />
                  {nameError && (
                    <p className="text-xs text-red-400">{nameError}</p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="border-[#292E37] bg-[#12151B] text-[#858B96] hover:bg-[#292E37] hover:text-[#F4F5F7]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || loading}
              className="bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddToCollectionDialog({
  open,
  movieIds,
  onClose,
  onCompleted,
}: AddToCollectionDialogProps) {
  if (!open) return null;
  return (
    <AddToCollectionDialogBody
      key={movieIds.join(",")}
      movieIds={movieIds}
      onClose={onClose}
      onCompleted={onCompleted}
    />
  );
}
