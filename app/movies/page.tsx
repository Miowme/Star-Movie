import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth/session";
import { UserNavbar } from "@/components/shared/user-navbar";
import { MovieListView } from "@/components/movies/movie-list-view";

async function MoviesContent() {
  const session = await getVerifiedSession();
  if (!session) redirect("/login");

  return (
    <>
      <UserNavbar role={session.role} />
      <MovieListView />
    </>
  );
}

export default function MoviesPage() {
  return (
    <div className="min-h-screen bg-[#12151B] text-[#F4F5F7]">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center text-[#858B96]">
            Loading movies...
          </div>
        }
      >
        <MoviesContent />
      </Suspense>
    </div>
  );
}
