import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing Firebase ID Token" },
        { status: 401 },
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    const body = await req.json();
    const rawUsername = String(body.username || "").trim();
    const normalizedUsername = rawUsername.toLowerCase();

    if (!normalizedUsername || normalizedUsername.length < 3) {
      return NextResponse.json(
        { error: "Invalid username provided" },
        { status: 400 },
      );
    }

    const usernameRef = adminDb.collection("usernames").doc(normalizedUsername);
    const userRef = adminDb.collection("users").doc(uid);

    await adminDb.runTransaction(async (transaction) => {
      const usernameDoc = await transaction.get(usernameRef);
      if (usernameDoc.exists) {
        throw new Error("USERNAME_TAKEN");
      }

      transaction.set(usernameRef, {
        uid,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.set(userRef, {
        uid,
        email,
        username: rawUsername,
        usernameLower: normalizedUsername,
        role: "user", // Default role
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await adminAuth.setCustomUserClaims(uid, { role: "user" });

    const expiresIn = 60 * 60 * 24 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json(
      { message: "Registration completed successfully", role: "user" },
      { status: 201 },
    );

    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "USERNAME_TAKEN") {
      return NextResponse.json(
        { error: "Username is already taken. Please choose another one." },
        { status: 409 },
      );
    }

    console.error("Registration API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 },
    );
  }
}
