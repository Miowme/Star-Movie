import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing ID Token" }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const expiresIn = 60 * 60 * 24 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json(
      {
        status: "authenticated",
        uid: decodedToken.uid,
        role: decodedToken.role || "user",
      },
      { status: 200 },
    );

    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Invalid or expired Firebase ID Token" },
      { status: 401 },
    );
  }
}
