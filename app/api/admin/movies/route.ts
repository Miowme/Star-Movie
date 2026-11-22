import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth/session";
import { createMoviePayloadSchema } from "@/lib/validations/movie";
import { createMovieRecord } from "@/services/movie.service";

export async function POST(req: NextRequest) {
  const session = await getVerifiedSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin privileges required." },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const parsed = createMoviePayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed." },
        { status: 400 },
      );
    }

    const createdMovie = await createMovieRecord({
      ...parsed.data,
      bannerUrl: parsed.data.bannerUrl || parsed.data.coverUrl,
      coverPath: parsed.data.coverPath ?? "",
      bannerPath: parsed.data.bannerPath ?? "",
    });

    return NextResponse.json({ movie: createdMovie }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create movie.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
