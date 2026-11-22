import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth/session";

type Role = "user" | "admin";

async function AuthGate({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: Role;
}) {
  const session = await getVerifiedSession();

  if (!session) redirect("/login");

  if (requiredRole && session.role !== requiredRole) {
    redirect(session.role === "admin" ? "/admin/dashboard" : "/dashboard");
  }

  return <>{children}</>;
}

export function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: Role;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#12151B] text-[#858B96]">
          Memuat...
        </div>
      }
    >
      <AuthGate requiredRole={requiredRole}>{children}</AuthGate>
    </Suspense>
  );
}
