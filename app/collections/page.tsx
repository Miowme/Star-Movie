import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth/session";
import { getUserCollections } from "@/services/collection.service";
import { UserNavbar } from "@/components/shared/user-navbar";
import { CollectionsListClient } from "@/components/collections/collections-list-client";

async function CollectionsContent() {
  const session = await getVerifiedSession();
  if (!session) redirect("/login");

  const collections = await getUserCollections(session.uid);

  return (
    <>
      <UserNavbar role={session.role} />
      <CollectionsListClient initialCollections={collections} />
    </>
  );
}

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-[#12151B] text-[#F4F5F7]">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center text-[#858B96]">
            Loading collections...
          </div>
        }
      >
        <CollectionsContent />
      </Suspense>
    </div>
  );
}
