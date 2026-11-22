import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validations/movie";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export function validateMovieImageFile(
  file: File | null,
  required: boolean,
): string | null {
  if (!file) {
    return required ? "Cover image is required." : null;
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, or WebP images are allowed.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image file size must be 5MB or less.";
  }
  return null;
}

export async function uploadImageToCloudinary(params: {
  file: File;
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}): Promise<CloudinaryUploadResult> {
  const {
    file,
    cloudName,
    uploadPreset,
    folder = "star-cinema/movies",
  } = params;

  const validationError = validateMovieImageFile(file, true);
  if (validationError) {
    throw new Error(validationError);
  }

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing.");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.secure_url) {
    throw new Error(
      data?.error?.message || "Failed to upload image to Cloudinary.",
    );
  }

  return {
    url: String(data.secure_url),
    publicId: String(data.public_id ?? ""),
  };
}
