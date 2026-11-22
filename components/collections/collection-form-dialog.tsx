"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  collectionFormSchema,
  type CollectionFormInput,
} from "@/lib/validations/collection";

interface CollectionFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialName?: string;
  onClose: () => void;
  onSubmitName: (cleanName: string) => Promise<void>;
}

function CollectionFormDialogBody({
  mode,
  initialName = "",
  onClose,
  onSubmitName,
}: Omit<CollectionFormDialogProps, "open">) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormInput>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: { name: initialName },
  });

  const handleFormSubmit = async (values: CollectionFormInput) => {
    setServerError(null);
    try {
      await onSubmitName(values.name);
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to save collection.",
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "Add a Collection" : "Edit Collection"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
    >
      <div className="w-full max-w-md rounded-xl border border-[#292E37] bg-[#1B2027] p-6 text-[#F4F5F7]">
        <div className="mb-4 flex items-center justify-between border-b border-[#292E37] pb-3">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-[#E5C51A]" />
            <h2 className="text-lg font-bold">
              {mode === "create" ? "Add a Collection" : "Edit Collection"}
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

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="collection-name" className="text-sm text-[#F4F5F7]">
              Collection Name
            </Label>
            <Input
              id="collection-name"
              type="text"
              placeholder="e.g. Weekend Sci Fi Marathon"
              disabled={isSubmitting}
              className="h-11 border-[#292E37] bg-[#12151B] text-[#F4F5F7] placeholder:text-[#858B96] focus-visible:border-[#6F1BA5] focus-visible:ring-[#6F1BA5]"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
            {serverError && (
              <p className="text-xs text-red-400">{serverError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-[#292E37] bg-[#12151B] text-[#858B96] hover:bg-[#292E37] hover:text-[#F4F5F7]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#6F1BA5] text-[#F4F5F7] hover:bg-[#8B2FC1]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Create Collection"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CollectionFormDialog({
  open,
  mode,
  initialName,
  onClose,
  onSubmitName,
}: CollectionFormDialogProps) {
  if (!open) return null;
  return (
    <CollectionFormDialogBody
      key={`${mode}-${initialName ?? ""}`}
      mode={mode}
      initialName={initialName}
      onClose={onClose}
      onSubmitName={onSubmitName}
    />
  );
}
