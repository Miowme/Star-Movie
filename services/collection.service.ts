import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import {
  collectionFormSchema,
  normalizeCollectionName,
  sanitizeCollectionDisplayName,
} from "@/lib/validations/collection";
import { getMovieById } from "@/services/movie.service";
import type { CollectionMovieRelation, UserCollection } from "@/types/cinema";

async function computeCollectionCoverAndCount(
  uid: string,
  collectionId: string,
): Promise<{ coverUrl: string | null; movieCount: number }> {
  const moviesColRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("collections")
    .doc(collectionId)
    .collection("movies");

  const allSnap = await moviesColRef.orderBy("addedAt", "asc").get();
  const movieCount = allSnap.size;

  if (movieCount === 0) {
    return { coverUrl: null, movieCount: 0 };
  }

  for (const relDoc of allSnap.docs) {
    const movieId = String(relDoc.data().movieId || relDoc.id);
    const movie = await getMovieById(movieId);
    if (movie && (movie.coverUrl || movie.bannerUrl)) {
      return {
        coverUrl: movie.coverUrl || movie.bannerUrl,
        movieCount,
      };
    }
  }

  return { coverUrl: null, movieCount };
}

export async function getUserCollections(
  uid: string,
): Promise<UserCollection[]> {
  const colsSnap = await adminDb
    .collection("users")
    .doc(uid)
    .collection("collections")
    .orderBy("createdAt", "desc")
    .get();

  const results = await Promise.all(
    colsSnap.docs.map(async (doc) => {
      const d = doc.data();
      const { coverUrl, movieCount } = await computeCollectionCoverAndCount(
        uid,
        doc.id,
      );
      return {
        id: doc.id,
        name: String(d.name ?? ""),
        normalizedName: String(d.normalizedName ?? ""),
        coverUrl,
        movieCount,
        createdAt:
          d.createdAt instanceof Timestamp
            ? d.createdAt.toDate().toISOString()
            : null,
        updatedAt:
          d.updatedAt instanceof Timestamp
            ? d.updatedAt.toDate().toISOString()
            : null,
      };
    }),
  );

  return results;
}

export async function getUserCollectionsContainingMovie(
  uid: string,
  movieId: string,
): Promise<Array<{ id: string; name: string }>> {
  const colsSnap = await adminDb
    .collection("users")
    .doc(uid)
    .collection("collections")
    .orderBy("createdAt", "desc")
    .get();

  const matches: Array<{ id: string; name: string }> = [];

  await Promise.all(
    colsSnap.docs.map(async (colDoc) => {
      const relSnap = await colDoc.ref.collection("movies").doc(movieId).get();
      if (relSnap.exists) {
        matches.push({
          id: colDoc.id,
          name: String(colDoc.data().name ?? ""),
        });
      }
    }),
  );

  return matches;
}

export async function createUserCollection(
  uid: string,
  rawName: string,
): Promise<UserCollection> {
  const parsed = collectionFormSchema.safeParse({ name: rawName });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "INVALID_NAME");
  }

  const displayName = sanitizeCollectionDisplayName(parsed.data.name);
  const normalizedName = normalizeCollectionName(displayName);

  const userRef = adminDb.collection("users").doc(uid);
  const nameIndexRef = userRef
    .collection("collectionNames")
    .doc(normalizedName);
  const newColRef = userRef.collection("collections").doc();

  await adminDb.runTransaction(async (tx) => {
    const existingName = await tx.get(nameIndexRef);
    if (existingName.exists) {
      throw new Error("DUPLICATE_COLLECTION_NAME");
    }

    tx.set(nameIndexRef, { collectionId: newColRef.id });
    tx.set(newColRef, {
      name: displayName,
      normalizedName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return {
    id: newColRef.id,
    name: displayName,
    normalizedName,
    coverUrl: null,
    movieCount: 0,
  };
}

export async function renameUserCollection(
  uid: string,
  collectionId: string,
  rawNewName: string,
) {
  const parsed = collectionFormSchema.safeParse({ name: rawNewName });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "INVALID_NAME");
  }

  const displayName = sanitizeCollectionDisplayName(parsed.data.name);
  const newNormalized = normalizeCollectionName(displayName);

  const userRef = adminDb.collection("users").doc(uid);
  const colRef = userRef.collection("collections").doc(collectionId);

  await adminDb.runTransaction(async (tx) => {
    const colSnap = await tx.get(colRef);
    if (!colSnap.exists) {
      throw new Error("COLLECTION_NOT_FOUND");
    }

    const oldNormalized = String(colSnap.data()!.normalizedName);

    if (oldNormalized !== newNormalized) {
      const newNameRef = userRef
        .collection("collectionNames")
        .doc(newNormalized);
      const newNameSnap = await tx.get(newNameRef);
      if (newNameSnap.exists) {
        throw new Error("DUPLICATE_COLLECTION_NAME");
      }

      const oldNameRef = userRef
        .collection("collectionNames")
        .doc(oldNormalized);
      tx.delete(oldNameRef);
      tx.set(newNameRef, { collectionId });
    }

    tx.update(colRef, {
      name: displayName,
      normalizedName: newNormalized,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return { id: collectionId, name: displayName, normalizedName: newNormalized };
}

export async function deleteUserCollection(uid: string, collectionId: string) {
  const userRef = adminDb.collection("users").doc(uid);
  const colRef = userRef.collection("collections").doc(collectionId);
  const colSnap = await colRef.get();

  if (!colSnap.exists) {
    throw new Error("COLLECTION_NOT_FOUND");
  }

  const normalizedName = String(colSnap.data()!.normalizedName);
  const nameRef = userRef.collection("collectionNames").doc(normalizedName);
  const moviesSnap = await colRef.collection("movies").get();

  const CHUNK_SIZE = 450;
  for (let i = 0; i < moviesSnap.docs.length; i += CHUNK_SIZE) {
    const chunk = moviesSnap.docs.slice(i, i + CHUNK_SIZE);
    const batch = adminDb.batch();
    for (const mDoc of chunk) {
      batch.delete(mDoc.ref);
    }
    await batch.commit();
  }

  const finalBatch = adminDb.batch();
  finalBatch.delete(nameRef);
  finalBatch.delete(colRef);
  await finalBatch.commit();
}

export async function bulkAddMoviesToUserCollections(params: {
  uid: string;
  movieIds: string[];
  collectionIds: string[];
  newCollectionName?: string;
}) {
  const { uid, movieIds, collectionIds, newCollectionName } = params;
  const uniqueMovieIds = Array.from(new Set(movieIds));
  const targetIds = new Set(collectionIds);

  if (newCollectionName && newCollectionName.trim()) {
    const created = await createUserCollection(uid, newCollectionName);
    targetIds.add(created.id);
  }

  if (targetIds.size === 0) {
    throw new Error("NO_COLLECTION_SELECTED");
  }

  const userRef = adminDb.collection("users").doc(uid);
  let addedCount = 0;
  let skippedCount = 0;

  for (const colId of targetIds) {
    const colRef = userRef.collection("collections").doc(colId);
    const colSnap = await colRef.get();
    if (!colSnap.exists) {
      throw new Error("COLLECTION_NOT_FOUND");
    }

    const batch = adminDb.batch();
    let colAdded = 0;

    for (const movieId of uniqueMovieIds) {
      const relRef = colRef.collection("movies").doc(movieId);
      const relSnap = await relRef.get();
      if (relSnap.exists) {
        skippedCount += 1;
      } else {
        batch.set(relRef, {
          movieId,
          addedAt: FieldValue.serverTimestamp(),
        });
        addedCount += 1;
        colAdded += 1;
      }
    }

    if (colAdded > 0) {
      batch.update(colRef, { updatedAt: FieldValue.serverTimestamp() });
    }
    await batch.commit();
  }

  return { addedCount, skippedCount };
}

export async function getCollectionDetail(uid: string, collectionId: string) {
  const colRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("collections")
    .doc(collectionId);

  const colSnap = await colRef.get();
  if (!colSnap.exists) {
    return null;
  }

  const relSnap = await colRef
    .collection("movies")
    .orderBy("addedAt", "asc")
    .get();

  const items: CollectionMovieRelation[] = await Promise.all(
    relSnap.docs.map(async (doc) => {
      const d = doc.data();
      const movieId = String(d.movieId || doc.id);
      const movie = await getMovieById(movieId);
      return {
        movieId,
        addedAt:
          d.addedAt instanceof Timestamp
            ? d.addedAt.toDate().toISOString()
            : null,
        movie,
      };
    }),
  );

  // Filter out any deleted movies cleanly
  const validItems = items.filter((item) => item.movie !== null);
  const coverUrl =
    validItems.length > 0
      ? validItems[0].movie!.coverUrl || validItems[0].movie!.bannerUrl || null
      : null;

  return {
    id: colSnap.id,
    name: String(colSnap.data()!.name ?? ""),
    normalizedName: String(colSnap.data()!.normalizedName ?? ""),
    coverUrl,
    items: validItems,
  };
}

export async function removeMovieFromCollection(
  uid: string,
  collectionId: string,
  movieId: string,
) {
  const colRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("collections")
    .doc(collectionId);

  const colSnap = await colRef.get();
  if (!colSnap.exists) {
    throw new Error("COLLECTION_NOT_FOUND");
  }

  const relRef = colRef.collection("movies").doc(movieId);
  await relRef.delete();
  await colRef.update({ updatedAt: FieldValue.serverTimestamp() });
}
