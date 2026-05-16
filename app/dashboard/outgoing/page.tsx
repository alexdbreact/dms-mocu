import { DocumentList } from "@/components/DocumentList";
import { getCurrentUser } from "@/lib/auth";
import type { DocumentSort, SortDirection } from "@/lib/documents";
import { canViewDocumentType } from "@/lib/users";
import { redirect } from "next/navigation";

export default async function OutgoingPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; subFileName?: string; sort?: DocumentSort; direction?: SortDirection }>;
}) {
  const user = await getCurrentUser();
  const { q, subFileName, sort, direction } = await searchParams;

  if (!user || !canViewDocumentType(user.role, "outgoing")) {
    redirect("/dashboard");
  }

  return (
    <DocumentList
      type="outgoing"
      role={user!.role}
      query={q}
      subFileName={subFileName}
      sort={sort}
      direction={direction}
    />
  );
}
