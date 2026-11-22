import "server-only";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { connection } from "next/server";

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "__session";

export async function getVerifiedSession() {
  await connection();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const role = userDoc.exists ? userDoc.data()?.role : "user";

    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      role: role === "admin" ? ("admin" as const) : ("user" as const),
    };
  } catch (err) {
    console.error("[session] verify failed:", err);
    return null;
  }
}
