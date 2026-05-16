import { redirect } from "next/navigation";
import { DocumentForm } from "@/components/DocumentForm";
import { getCurrentUser } from "@/lib/auth";
import { getIncomingEntityNames, getSubFileGroups } from "@/lib/documents";
import { canManage } from "@/lib/users";

export default async function NewIncomingPage() {
  const user = await getCurrentUser();

  if (!user || !canManage(user.role, "incoming")) {
    redirect("/dashboard/incoming");
  }

  const [subFileGroups, incomingEntityNames] = await Promise.all([
    getSubFileGroups("incoming"),
    getIncomingEntityNames()
  ]);
  const subFileNames = subFileGroups.map((group) => group.name);

  return (
    <section>
      <h1 className="text-3xl font-extrabold">إضافة وارد</h1>
      <p className="mt-2 font-semibold text-slate-500">تسجيل مستند وارد جديد في الأرشيف.</p>
      <div className="mt-6">
        <DocumentForm type="incoming" subFileNames={subFileNames} incomingEntityNames={incomingEntityNames} />
      </div>
    </section>
  );
}
