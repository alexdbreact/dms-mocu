import { DocumentList } from "@/components/DocumentList";
import { getCurrentUser } from "@/lib/auth";
import type { DocumentSort, SortDirection } from "@/lib/documents";
import { canViewDocumentType } from "@/lib/users";
import { redirect } from "next/navigation";

export default async function IncomingPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; subFileName?: string; sort?: DocumentSort; direction?: SortDirection }>;
}) {
  const user = await getCurrentUser();
  const { q, subFileName, sort, direction } = await searchParams;

  if (!user || !canViewDocumentType(user.role, "incoming")) {
    redirect("/dashboard");
  }

  return (
    <DocumentList
      type="incoming"
      role={user!.role}
      query={q}
      subFileName={subFileName}
      sort={sort}
      direction={direction}
    />
  );
}
