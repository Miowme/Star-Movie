import "server-only";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { Movie } from "@/types/cinema";

const PAGE_SIZE = 10;

function mapDocToMovie(
  doc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
): Movie {
  const d = doc.data()!;
  return {
    id: doc.id,
    title: String(d.title ?? ""),
    coverUrl: String(d.coverUrl ?? ""),
    bannerUrl: String(d.bannerUrl ?? d.coverUrl ?? ""),
    coverPath: String(d.coverPath ?? ""),
    bannerPath: String(d.bannerPath ?? ""),
    description: String(d.description ?? ""),
    duration: Number(d.duration ?? 0),
    genres: Array.isArray(d.genres) ? d.genres.map(String) : [],
    rating: Number(d.rating ?? 0),
    releaseDate: String(d.releaseDate ?? ""),
    ...(d.director ? { director: String(d.director) } : {}),
    ...(Array.isArray(d.cast) && d.cast.length > 0
      ? { cast: d.cast.map(String) }
      : {}),
    ...(d.language ? { language: String(d.language) } : {}),
    ...(d.ageRating ? { ageRating: String(d.ageRating) } : {}),
    ...(d.productionCompany
      ? { productionCompany: String(d.productionCompany) }
      : {}),
    createdAt:
      d.createdAt instanceof Timestamp
        ? d.createdAt.toDate().toISOString()
        : null,
    updatedAt:
      d.updatedAt instanceof Timestamp
        ? d.updatedAt.toDate().toISOString()
        : null,
  };
}

export async function getPaginatedMovies(cursor?: string | null) {
  let query = adminDb
    .collection("movies")
    .orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId(), "desc")
    .limit(PAGE_SIZE + 1);

  if (cursor) {
    const cursorSnap = await adminDb.collection("movies").doc(cursor).get();
    if (cursorSnap.exists) {
      query = query.startAfter(cursorSnap);
    }
  }

  const snap = await query.get();
  const hasMore = snap.docs.length > PAGE_SIZE;
  const pageDocs = hasMore ? snap.docs.slice(0, PAGE_SIZE) : snap.docs;
  const movies = pageDocs.map(mapDocToMovie);
  const nextCursor = hasMore ? pageDocs[pageDocs.length - 1].id : null;

  return { movies, nextCursor, hasMore };
}

export async function getMovieById(movieId: string): Promise<Movie | null> {
  const snap = await adminDb.collection("movies").doc(movieId).get();
  if (!snap.exists) return null;
  return mapDocToMovie(snap);
}

export async function deleteMovieCascade(movieId: string) {
  const movieRef = adminDb.collection("movies").doc(movieId);
  const movieSnap = await movieRef.get();

  if (!movieSnap.exists) {
    throw new Error("MOVIE_NOT_FOUND");
  }

  let deletedRelationsCount = 0;
  const warnings: string[] = [];

  try {
    const relationSnap = await adminDb
      .collectionGroup("movies")
      .where("movieId", "==", movieId)
      .get();

    const CHUNK_SIZE = 450;
    for (let i = 0; i < relationSnap.docs.length; i += CHUNK_SIZE) {
      const chunk = relationSnap.docs.slice(i, i + CHUNK_SIZE);
      const batch = adminDb.batch();
      for (const relDoc of chunk) {
        batch.delete(relDoc.ref);
      }
      await batch.commit();
      deletedRelationsCount += chunk.length;
    }
  } catch (err) {
    console.error("Collection-group cleanup warning during movie delete:", err);
    warnings.push(
      "Could not clean up collection references automatically (check Firestore collectionGroup index).",
    );
  }

  await movieRef.delete();

  return {
    deletedRelationsCount,
    storageWarnings: warnings,
  };
}

export async function createMovieRecord(
  payload: Omit<Movie, "id" | "createdAt" | "updatedAt">,
) {
  const now = FieldValue.serverTimestamp();
  const docRef = await adminDb.collection("movies").add({
    ...payload,
    createdAt: now,
    updatedAt: now,
  });

  const createdSnap = await docRef.get();
  return mapDocToMovie(createdSnap);
}
