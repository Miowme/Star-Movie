import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth/session";
import { getPaginatedMovies } from "@/services/movie.service";

export async function GET(req: NextRequest) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const result = await getPaginatedMovies(cursor);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/movies error:", error);
    return NextResponse.json(
      { error: "Failed to load movies." },
      { status: 500 },
    );
  }
}
