import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, Clapperboard, ArrowLeft } from "lucide-react";
import { getVerifiedSession } from "@/lib/auth/session";

async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await getVerifiedSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  return <>{children}</>;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#12151B] text-[#F4F5F7]">
      {/* Sidebar (statis, ikut static shell) */}
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-[#292E37] bg-[#1B2027] p-5">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <Film className="h-6 w-6 text-[#E5C51A]" />
            <span className="text-lg font-bold tracking-wider">
              STAR <span className="text-[#E5C51A]">ADMIN</span>
            </span>
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 rounded-lg border border-[#6F1BA5]/40 bg-[#6F1BA5]/20 px-3 py-2.5 text-sm font-medium text-[#F4F5F7]"
            >
              <Clapperboard className="h-4 w-4 text-[#E5C51A]" />
              Movie Management
            </Link>
          </nav>
        </div>

        <div className="space-y-3 border-t border-[#292E37] pt-4">
          <Link
            href="/movies"
            className="flex items-center gap-2 text-xs text-[#858B96] hover:text-[#F4F5F7]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to User App
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full rounded-lg border border-[#292E37] bg-[#12151B] px-3 py-2 text-xs text-[#858B96] hover:border-[#6F1BA5] hover:text-[#F4F5F7]"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main content: dinamis, dibungkus Suspense */}
      <main className="flex-1 overflow-x-auto p-6 sm:p-8">
        <Suspense
          fallback={<p className="text-sm text-[#858B96]">Loading...</p>}
        >
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}
