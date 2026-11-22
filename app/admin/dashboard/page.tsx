import { AdminMovieManagement } from "@/components/admin/admin-movie-management";

export default function AdminDashboardPage() {
  const cloudName = process.env.NEXT_CLOUDINARY_CLOUD_NAME ?? "";
  const uploadPreset = process.env.NEXT_CLOUDINARY_UPLOAD_PRESET ?? "";

  return (
    <AdminMovieManagement cloudName={cloudName} uploadPreset={uploadPreset} />
  );
}
