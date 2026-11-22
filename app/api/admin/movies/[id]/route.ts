import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth/session";
import { deleteMovieCascade } from "@/services/movie.service";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id?: string; movieId?: string }> },
) {
  const session = await getVerifiedSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin privileges required." },
      { status: 403 },
    );
  }

  try {
    const resolvedParams = await context.params;
    const movieId = (resolvedParams.movieId ?? resolvedParams.id)?.trim();

    if (!movieId) {
      return NextResponse.json({ error: "Missing movieId." }, { status: 400 });
    }

    const result = await deleteMovieCascade(movieId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("DELETE /api/admin/movies/[id] error:", error);
    const msg =
      error instanceof Error
        ? error.message
        : "Failed to delete movie completely.";

    if (msg === "MOVIE_NOT_FOUND") {
      return NextResponse.json({ error: "Movie not found." }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete movie completely." },
      { status: 500 },
    );
  }
}
