import { notFound, redirect } from "next/navigation";
import { DocumentForm } from "@/components/DocumentForm";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentById, getSubFileGroups } from "@/lib/documents";
import { canManage } from "@/lib/users";

export default async function EditOutgoingPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user || !canManage(user.role, "outgoing")) {
    redirect("/dashboard/outgoing");
  }

  const { id } = await params;
  const document = await getDocumentById("outgoing", id);

  if (!document) {
    notFound();
  }

  const subFileNames = (await getSubFileGroups("outgoing")).map((group) => group.name);

  return (
    <section>
      <h1 className="text-3xl font-extrabold">تعديل صادر</h1>
      <p className="mt-2 font-semibold text-slate-500">تحديث بيانات المستند والمرفق.</p>
      <div className="mt-6">
        <DocumentForm type="outgoing" document={document} subFileNames={subFileNames} />
      </div>
    </section>
  );
}
