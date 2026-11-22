import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth/session";
import {
  deleteUserCollection,
  getCollectionDetail,
  renameUserCollection,
} from "@/services/collection.service";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ collectionId: string }> },
) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collectionId } = await context.params;
  const detail = await getCollectionDetail(session.uid, collectionId);

  if (!detail) {
    return NextResponse.json(
      { error: "Collection not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ collection: detail });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ collectionId: string }> },
) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { collectionId } = await context.params;
    const body = await req.json();
    const updated = await renameUserCollection(
      session.uid,
      collectionId,
      String(body?.name ?? ""),
    );
    return NextResponse.json({ collection: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Rename failed";
    if (msg === "DUPLICATE_COLLECTION_NAME") {
      return NextResponse.json(
        { error: "A collection with this name already exists." },
        { status: 409 },
      );
    }
    if (msg === "COLLECTION_NOT_FOUND") {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ collectionId: string }> },
) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { collectionId } = await context.params;
    await deleteUserCollection(session.uid, collectionId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Delete failed";
    if (msg === "COLLECTION_NOT_FOUND") {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
