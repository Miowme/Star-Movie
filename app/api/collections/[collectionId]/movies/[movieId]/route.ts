import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth/session";
import { removeMovieFromCollection } from "@/services/collection.service";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ collectionId: string; movieId: string }> },
) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { collectionId, movieId } = await context.params;
    await removeMovieFromCollection(session.uid, collectionId, movieId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Remove failed";
    if (msg === "COLLECTION_NOT_FOUND") {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
