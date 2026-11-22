import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth/session";
import {
  createUserCollection,
  getUserCollections,
  getUserCollectionsContainingMovie,
} from "@/services/collection.service";

export async function GET(req: NextRequest) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("movieId");

    if (movieId) {
      const matching = await getUserCollectionsContainingMovie(
        session.uid,
        movieId,
      );
      return NextResponse.json({ collections: matching });
    }

    const collections = await getUserCollections(session.uid);
    return NextResponse.json({ collections });
  } catch (error) {
    console.error("GET /api/collections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const created = await createUserCollection(
      session.uid,
      String(body?.name ?? ""),
    );
    return NextResponse.json({ collection: created }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create";
    if (msg === "DUPLICATE_COLLECTION_NAME") {
      return NextResponse.json(
        { error: "A collection with this name already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
