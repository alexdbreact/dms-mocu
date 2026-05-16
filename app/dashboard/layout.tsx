import Link from "next/link";
import { redirect } from "next/navigation";
import { ArchiveRestore, Download, FileInput, FileOutput, LogOut, Plus, Shield } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { canManage, canViewDocumentType } from "@/lib/users";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="shell">
      <aside className="border-l border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-[#0f766e] to-[#2563eb] text-white shadow-lg shadow-teal-900/20">
            <ArchiveRestore size={23} />
          </span>
          <span>
            <strong className="block text-lg text-slate-950">إدارة الوثائق</strong>
            <small className="font-bold text-slate-500">الوارد والصادر</small>
          </span>
        </Link>

        <nav className="grid gap-2">
          {canViewDocumentType(user.role, "incoming") ? (
            <Link
              className="rounded-md px-3 py-2 font-extrabold text-slate-700 transition hover:bg-[#eef8ff] hover:text-[#075985]"
              href="/dashboard/incoming"
            >
              <span className="inline-flex items-center gap-2"><FileInput size={18} /> الوارد</span>
            </Link>
          ) : null}
          {canViewDocumentType(user.role, "outgoing") ? (
            <Link
              className="rounded-md px-3 py-2 font-extrabold text-slate-700 transition hover:bg-[#fff7ed] hover:text-[#b45309]"
              href="/dashboard/outgoing"
            >
              <span className="inline-flex items-center gap-2"><FileOutput size={18} /> الصادر</span>
            </Link>
          ) : null}
          {canManage(user.role, "incoming") ? (
            <Link
              className="rounded-md px-3 py-2 font-extrabold text-slate-700 transition hover:bg-[#ecfdf5] hover:text-[#047857]"
              href="/dashboard/incoming/new"
            >
              <span className="inline-flex items-center gap-2"><Plus size={18} /> إضافة وارد</span>
            </Link>
          ) : null}
          {canManage(user.role, "outgoing") ? (
            <Link
              className="rounded-md px-3 py-2 font-extrabold text-slate-700 transition hover:bg-[#ecfdf5] hover:text-[#047857]"
              href="/dashboard/outgoing/new"
            >
              <span className="inline-flex items-center gap-2"><Plus size={18} /> إضافة صادر</span>
            </Link>
          ) : null}
          {user.role === "admin" ? (
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
              <p className="mb-1 flex items-center gap-2 px-2 text-sm font-extrabold text-slate-600">
                <Download size={16} />
                النسخ الاحتياطي
              </p>
              <a
                className="block rounded-md px-3 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-white hover:text-[#2563eb]"
                href="/api/backup?scope=today"
              >
                نسخة اليوم
              </a>
              <a
                className="block rounded-md px-3 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-white hover:text-[#2563eb]"
                href="/api/backup?scope=month"
              >
                نسخة الشهر الحالي
              </a>
              <a
                className="block rounded-md px-3 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-white hover:text-[#2563eb]"
                href="/api/backup?scope=all"
              >
                كل مستندات النظام
              </a>
            </div>
          ) : null}
        </nav>

        <div className="mt-8 rounded-lg border border-slate-200 bg-gradient-to-br from-white to-[#f8fbff] p-4 shadow-sm">
          <p className="flex items-center gap-2 font-bold"><Shield size={16} /> {user.name}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">الصلاحية: {user.role}</p>
          <form action={logoutAction} className="mt-4">
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-white">
              <LogOut size={16} />
              خروج
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-8">{children}</main>
    </div>
  );
}
