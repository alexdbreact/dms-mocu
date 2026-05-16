import { DocumentList } from "@/components/DocumentList";
import { getCurrentUser } from "@/lib/auth";
import { canViewDocumentType } from "@/lib/users";
import { redirect } from "next/navigation";

export default async function IncomingPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; subFileName?: string }>;
}) {
  const user = await getCurrentUser();
  const { q, subFileName } = await searchParams;

  if (!user || !canViewDocumentType(user.role, "incoming")) {
    redirect("/dashboard");
  }

  return <DocumentList type="incoming" role={user!.role} query={q} subFileName={subFileName} />;
}
