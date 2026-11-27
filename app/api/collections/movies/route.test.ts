/** @jest-environment node */

import { NextRequest } from "next/server";
import { POST } from "./route";
import { getVerifiedSession } from "@/lib/auth/session";
import { bulkAddMoviesToUserCollections } from "@/services/collection.service";

jest.mock("@/lib/auth/session", () => ({
  getVerifiedSession: jest.fn(),
}));

jest.mock("@/services/collection.service", () => ({
  bulkAddMoviesToUserCollections: jest.fn(),
}));

const mockedGetVerifiedSession = jest.mocked(getVerifiedSession);
const mockedBulkAddMovies = jest.mocked(bulkAddMoviesToUserCollections);

function createJsonRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/collections/movies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/collections/movies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockedGetVerifiedSession.mockResolvedValueOnce(null);

    const req = createJsonRequest({
      movieIds: ["movie-1"],
      collectionIds: ["col-1"],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
    expect(mockedBulkAddMovies).not.toHaveBeenCalled();
  });

  it("returns 400 when request payload fails schema validation", async () => {
    mockedGetVerifiedSession.mockResolvedValueOnce({
      uid: "user-123",
      role: "user",
    } as never);

    const req = createJsonRequest({});
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(typeof data.error).toBe("string");
    expect(mockedBulkAddMovies).not.toHaveBeenCalled();
  });

  it("returns 200 with addedCount and skippedCount on success", async () => {
    mockedGetVerifiedSession.mockResolvedValueOnce({
      uid: "user-123",
      role: "user",
    } as never);
    mockedBulkAddMovies.mockResolvedValueOnce({
      addedCount: 2,
      skippedCount: 1,
    });

    const payload = {
      movieIds: ["m-1", "m-2", "m-3"],
      collectionIds: ["c-1"],
      newCollectionName: "Weekend Watchlist",
    };

    const req = createJsonRequest(payload);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      success: true,
      addedCount: 2,
      skippedCount: 1,
    });
    expect(mockedBulkAddMovies).toHaveBeenCalledWith({
      uid: "user-123",
      movieIds: payload.movieIds,
      collectionIds: payload.collectionIds,
      newCollectionName: payload.newCollectionName,
    });
  });

  it("returns 409 when collection name already exists", async () => {
    mockedGetVerifiedSession.mockResolvedValueOnce({
      uid: "user-123",
      role: "user",
    } as never);
    mockedBulkAddMovies.mockRejectedValueOnce(
      new Error("DUPLICATE_COLLECTION_NAME"),
    );

    const req = createJsonRequest({
      movieIds: ["m-1"],
      newCollectionName: "Existing Name",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data).toEqual({
      error: "A collection with this name already exists.",
    });
  });

  it("returns 404 when collection is not found or unauthorized", async () => {
    mockedGetVerifiedSession.mockResolvedValueOnce({
      uid: "user-123",
      role: "user",
    } as never);
    mockedBulkAddMovies.mockRejectedValueOnce(
      new Error("COLLECTION_NOT_FOUND"),
    );

    const req = createJsonRequest({
      movieIds: ["m-1"],
      collectionIds: ["unknown-col"],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({
      error: "Collection not found or access denied.",
    });
  });

  it("returns 400 when no collection is selected or created", async () => {
    mockedGetVerifiedSession.mockResolvedValueOnce({
      uid: "user-123",
      role: "user",
    } as never);
    mockedBulkAddMovies.mockRejectedValueOnce(
      new Error("NO_COLLECTION_SELECTED"),
    );

    const req = createJsonRequest({
      movieIds: ["m-1"],
      collectionIds: [],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({
      error: "Select at least one collection or create a new one.",
    });
  });
});
