import Link from "next/link";
import { FileInput, FileOutput } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { canViewDocumentType } from "@/lib/users";
import { DocumentModel } from "@/models/Document";

async function getCounts() {
  try {
    await connectToDatabase();
    const [incoming, outgoing] = await Promise.all([
      DocumentModel.countDocuments({ type: "incoming" }),
      DocumentModel.countDocuments({ type: "outgoing" })
    ]);
    return { incoming, outgoing };
  } catch {
    return { incoming: 0, outgoing: 0 };
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const counts = await getCounts();

  return (
    <section>
      <h1 className="text-3xl font-extrabold">لوحة التحكم</h1>
      <p className="mt-2 font-semibold text-slate-500">اختر نوع الأرشيف للعرض أو التسجيل.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {canViewDocumentType(user!.role, "incoming") ? (
          <Link href="/dashboard/incoming" className="rounded-lg border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-[#0f766e]">
            <FileInput className="mb-4 text-[#0f766e]" size={34} />
            <h2 className="text-2xl font-extrabold">الوارد</h2>
            <p className="mt-2 font-semibold text-slate-500">{counts.incoming} مستند محفوظ</p>
          </Link>
        ) : null}
        {canViewDocumentType(user!.role, "outgoing") ? (
          <Link href="/dashboard/outgoing" className="rounded-lg border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-[#2563eb]">
            <FileOutput className="mb-4 text-[#2563eb]" size={34} />
            <h2 className="text-2xl font-extrabold">الصادر</h2>
            <p className="mt-2 font-semibold text-slate-500">{counts.outgoing} مستند محفوظ</p>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
