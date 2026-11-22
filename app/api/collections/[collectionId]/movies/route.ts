import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth/session";
import { bulkAddSchema } from "@/lib/validations/collection";
import { bulkAddMoviesToUserCollections } from "@/services/collection.service";

export async function POST(req: NextRequest) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await req.json();
    const parsed = bulkAddSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid payload" },
        { status: 400 },
      );
    }

    const { addedCount, skippedCount } = await bulkAddMoviesToUserCollections({
      uid: session.uid,
      movieIds: parsed.data.movieIds,
      collectionIds: parsed.data.collectionIds,
      newCollectionName: parsed.data.newCollectionName,
    });

    return NextResponse.json({
      success: true,
      addedCount,
      skippedCount,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Operation failed";
    if (msg === "DUPLICATE_COLLECTION_NAME") {
      return NextResponse.json(
        { error: "A collection with this name already exists." },
        { status: 409 },
      );
    }
    if (msg === "COLLECTION_NOT_FOUND") {
      return NextResponse.json(
        { error: "Collection not found or access denied." },
        { status: 404 },
      );
    }
    if (msg === "NO_COLLECTION_SELECTED") {
      return NextResponse.json(
        { error: "Select at least one collection or create a new one." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
