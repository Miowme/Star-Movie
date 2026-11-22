import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Film, FolderHeart, User } from "lucide-react";
import { getVerifiedSession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin";

type UserProfile = { username?: string; email?: string; role?: string };

async function DashboardContent() {
  const session = await getVerifiedSession();
  if (!session) redirect("/login");

  const userDoc = await adminDb.collection("users").doc(session.uid).get();
  const profile: UserProfile = userDoc.exists
    ? (userDoc.data() as UserProfile)
    : { email: session.email, role: session.role };

  return (
    <div className="min-h-screen bg-[#12151B] text-[#F4F5F7]">
      <header className="border-b border-[#292E37] bg-[#1B2027]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold tracking-wider">
            STAR <span className="text-[#E5C51A]">CINEMA</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-[#6F1BA5]/40 bg-[#6F1BA5]/20 px-3 py-1 text-xs font-medium capitalize">
              Role: {session.role}
            </span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-[#292E37] bg-[#12151B] px-3 py-1.5 text-sm text-[#858B96] transition-colors hover:border-[#6F1BA5] hover:text-[#F4F5F7]"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-6">
          <h1 className="text-2xl font-bold">
            Welcome back,{" "}
            <span className="text-[#E5C51A]">
              {profile.username || profile.email}
            </span>
          </h1>
          <p className="mt-1 text-sm text-[#858B96]">
            Browse movies and manage your collections.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Link
              href="/movies"
              className="rounded-lg border border-[#292E37] bg-[#12151B] p-4 transition-colors hover:border-[#6F1BA5]"
            >
              <Film className="h-5 w-5 text-[#6F1BA5]" />
              <p className="mt-3 font-medium">Movies</p>
              <p className="text-sm text-[#858B96]">Browse all movies</p>
            </Link>
            <Link
              href="/collections"
              className="rounded-lg border border-[#292E37] bg-[#12151B] p-4 transition-colors hover:border-[#6F1BA5]"
            >
              <FolderHeart className="h-5 w-5 text-[#6F1BA5]" />
              <p className="mt-3 font-medium">My Collections</p>
              <p className="text-sm text-[#858B96]">View your collections</p>
            </Link>
            <div className="rounded-lg border border-[#292E37] bg-[#12151B] p-4">
              <User className="h-5 w-5 text-[#6F1BA5]" />
              <p className="mt-3 text-sm text-[#858B96]">Account Email</p>
              <p className="truncate text-sm font-medium">{profile.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#12151B] text-[#858B96]">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
