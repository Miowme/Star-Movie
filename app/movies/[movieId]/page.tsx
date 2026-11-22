import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth/session";
import { getMovieById } from "@/services/movie.service";
import { getUserCollectionsContainingMovie } from "@/services/collection.service";
import { UserNavbar } from "@/components/shared/user-navbar";
import { MovieDetailClient } from "@/components/movies/movie-detail-client";

async function MovieDetailContent({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;

  const session = await getVerifiedSession();
  if (!session) redirect("/login");

  const movie = await getMovieById(movieId);
  if (!movie) notFound();

  const initialCollections = await getUserCollectionsContainingMovie(
    session.uid,
    movieId,
  );

  return (
    <>
      <UserNavbar role={session.role} />
      <MovieDetailClient
        movie={movie}
        initialCollections={initialCollections}
      />
    </>
  );
}

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#12151B] text-[#F4F5F7]">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center text-[#858B96]">
            Loading movie...
          </div>
        }
      >
        <MovieDetailContent params={params} />
      </Suspense>
    </div>
  );
}
