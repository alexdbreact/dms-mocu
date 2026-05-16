import { redirect } from "next/navigation";
import { DocumentForm } from "@/components/DocumentForm";
import { getCurrentUser } from "@/lib/auth";
import { getSubFileGroups } from "@/lib/documents";
import { canManage } from "@/lib/users";

export default async function NewOutgoingPage() {
  const user = await getCurrentUser();

  if (!user || !canManage(user.role, "outgoing")) {
    redirect("/dashboard/outgoing");
  }

  const subFileNames = (await getSubFileGroups("outgoing")).map((group) => group.name);

  return (
    <section>
      <h1 className="text-3xl font-extrabold">إضافة صادر</h1>
      <p className="mt-2 font-semibold text-slate-500">تسجيل مستند صادر جديد في الأرشيف.</p>
      <div className="mt-6">
        <DocumentForm type="outgoing" subFileNames={subFileNames} />
      </div>
    </section>
  );
}
