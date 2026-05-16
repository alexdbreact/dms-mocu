import { DocumentList } from "@/components/DocumentList";
import { getCurrentUser } from "@/lib/auth";
import { canViewDocumentType } from "@/lib/users";
import { redirect } from "next/navigation";

export default async function OutgoingPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; subFileName?: string }>;
}) {
  const user = await getCurrentUser();
  const { q, subFileName } = await searchParams;

  if (!user || !canViewDocumentType(user.role, "outgoing")) {
    redirect("/dashboard");
  }

  return <DocumentList type="outgoing" role={user!.role} query={q} subFileName={subFileName} />;
}
