import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth/session";
import { getCollectionDetail } from "@/services/collection.service";
import { UserNavbar } from "@/components/shared/user-navbar";
import { CollectionDetailClient } from "@/components/collections/collection-detail-client";

async function CollectionDetailContent({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;

  const session = await getVerifiedSession();
  if (!session) redirect("/login");

  const detail = await getCollectionDetail(session.uid, collectionId);
  if (!detail) notFound();

  return (
    <>
      <UserNavbar role={session.role} />
      <CollectionDetailClient
        collectionId={detail.id}
        initialName={detail.name}
        initialItems={detail.items}
      />
    </>
  );
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#12151B] text-[#F4F5F7]">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center text-[#858B96]">
            Loading collection...
          </div>
        }
      >
        <CollectionDetailContent params={params} />
      </Suspense>
    </div>
  );
}
