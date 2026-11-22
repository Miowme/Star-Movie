import Link from "next/link";
import { Film, FolderHeart, LayoutDashboard, ShieldCheck } from "lucide-react";

interface UserNavbarProps {
  role?: string;
}

export function UserNavbar({ role }: UserNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#292E37] bg-[#1B2027]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/movies" className="flex items-center gap-2">
            <Film className="h-5 w-5 text-[#E5C51A]" />
            <span className="text-lg font-bold tracking-wider text-[#F4F5F7]">
              STAR <span className="text-[#E5C51A]">CINEMA</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/movies"
              className="text-[#858B96] transition-colors hover:text-[#F4F5F7]"
            >
              Movies
            </Link>
            <Link
              href="/collections"
              className="flex items-center gap-1.5 text-[#858B96] transition-colors hover:text-[#F4F5F7]"
            >
              <FolderHeart className="h-4 w-4 text-[#E5C51A]" />
              My Collections
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-[#858B96] transition-colors hover:text-[#F4F5F7]"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            {role === "admin" && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 font-medium text-[#E5C51A] hover:underline"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="rounded-lg border border-[#292E37] bg-[#12151B] px-3 py-1.5 text-xs font-medium text-[#858B96] transition-colors hover:border-[#6F1BA5] hover:text-[#F4F5F7]"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
