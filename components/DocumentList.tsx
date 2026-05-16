import Link from "next/link";
import { Edit, FolderOpen, Layers3, Plus, Search, X } from "lucide-react";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { DeleteButton } from "@/components/DeleteButton";
import { getDocuments, getSubFileGroups } from "@/lib/documents";
import { canManage, type UserRole } from "@/lib/users";

type Props = {
  type: "incoming" | "outgoing";
  role: UserRole;
  query?: string;
  subFileName?: string;
};

function titleFor(type: "incoming" | "outgoing") {
  return type === "incoming" ? "الوارد" : "الصادر";
}

function listPath(type: "incoming" | "outgoing", params: Record<string, string | undefined> = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  const queryString = search.toString();
  return `/dashboard/${type}${queryString ? `?${queryString}` : ""}`;
}

export async function DocumentList({ type, role, query, subFileName }: Props) {
  const [docs, subFiles] = await Promise.all([
    getDocuments(type, { query, subFileName }),
    getSubFileGroups(type)
  ]);
  const canEdit = canManage(role, type);
  const isIncoming = type === "incoming";

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">{titleFor(type)}</h1>
          <p className="mt-2 font-semibold text-slate-500">
            {subFileName ? `مستندات الملف الفرعي: ${subFileName}` : "آخر 100 مستند في الأرشيف."}
          </p>
        </div>
        {canEdit ? (
          <Link
            href={`/dashboard/${type}/new`}
            className="inline-flex items-center gap-2 rounded-md bg-[#0f766e] px-4 py-3 font-extrabold text-white shadow-lg shadow-teal-900/10 transition hover:bg-[#115e59]"
          >
            <Plus size={18} />
            إضافة {titleFor(type)}
          </Link>
        ) : null}
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-200/60">
        <div className="mb-3 flex items-center gap-2 text-slate-900">
          <Layers3 size={19} className="text-[#0f766e]" />
          <h2 className="font-extrabold">الملفات الفرعية</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={listPath(type, { q: query })}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold transition ${
              !subFileName ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FolderOpen size={15} />
            كل الملفات
          </Link>
          {subFiles.map((subFile) => (
            <Link
              key={subFile.name}
              href={listPath(type, { q: query, subFileName: subFile.name })}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold transition ${
                subFileName === subFile.name
                  ? "bg-[#0f766e] text-white"
                  : "bg-[#eef8ff] text-[#075985] hover:bg-[#dff1ff]"
              }`}
            >
              {subFile.name}
              <span className="rounded bg-white/35 px-1.5 py-0.5 text-xs">{subFile.count}</span>
            </Link>
          ))}
          {subFileName ? (
            <Link
              href={listPath(type, { q: query })}
              className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-extrabold text-red-700 hover:bg-red-100"
            >
              <X size={15} />
              إلغاء التصفية
            </Link>
          ) : null}
        </div>
      </div>

      <form className="mt-6 grid gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm md:grid-cols-[1fr_260px_auto]">
        <input name="q" placeholder="بحث بالرقم أو العنوان أو المحتوى" defaultValue={query || ""} />
        <select name="subFileName" defaultValue={subFileName || ""} aria-label="الملف الفرعي">
          <option value="">كل الملفات الفرعية</option>
          {subFiles.map((subFile) => (
            <option key={subFile.name} value={subFile.name}>
              {subFile.name} ({subFile.count})
            </option>
          ))}
        </select>
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 font-extrabold text-white transition hover:bg-slate-700">
          <Search size={18} />
          بحث
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        <table className="w-full min-w-[940px] border-collapse text-right">
          <thead className="bg-gradient-to-l from-[#e7f7f4] via-[#eef8ff] to-[#fff7ed] text-sm text-slate-700">
            <tr>
              <th className="p-3">مسلسل</th>
              <th className="p-3">{isIncoming ? "رقم الوارد" : "رقم الصادر"}</th>
              <th className="p-3">التاريخ</th>
              <th className="p-3">العنوان</th>
              <th className="p-3">{isIncoming ? "الجهة الوارد منها" : "الجهة الصادر لها"}</th>
              <th className="p-3">الملف الفرعي</th>
              <th className="p-3">المستند</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc._id} className="border-t border-slate-100 align-top transition hover:bg-slate-50">
                <td className="p-3 font-extrabold text-[#0f766e]">{doc.serial}</td>
                <td className="p-3 font-bold">{doc.referenceNumber}</td>
                <td className="p-3 text-slate-600">{doc.documentDate.slice(0, 10)}</td>
                <td className="max-w-[260px] p-3">
                  <p className="font-extrabold text-slate-950">{doc.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-500">{doc.content}</p>
                </td>
                <td className="p-3">{isIncoming ? doc.incomingFrom : doc.outgoingTo.join("، ")}</td>
                <td className="p-3">
                  {doc.subFileName ? (
                    <Link
                      href={listPath(type, { q: query, subFileName: doc.subFileName })}
                      className="inline-flex items-center gap-1 rounded-md bg-[#f0fdfa] px-2.5 py-1.5 text-sm font-extrabold text-[#0f766e] hover:bg-[#ccfbf1]"
                    >
                      <FolderOpen size={14} />
                      {doc.subFileName}
                    </Link>
                  ) : (
                    <span className="text-sm font-bold text-slate-400">بدون ملف</span>
                  )}
                </td>
                <td className="p-3">
                  {doc.attachment ? (
                    <AttachmentPreview attachment={doc.attachment} />
                  ) : (
                    <span className="text-sm font-bold text-slate-400">لا يوجد</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {canEdit ? (
                      <Link
                        href={`/dashboard/${type}/${doc._id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Edit size={15} />
                        تعديل
                      </Link>
                    ) : null}
                    {role === "admin" ? <DeleteButton type={type} id={doc._id} /> : null}
                  </div>
                </td>
              </tr>
            ))}
            {docs.length === 0 ? (
              <tr>
                <td className="p-8 text-center font-bold text-slate-500" colSpan={8}>
                  لا توجد مستندات مطابقة.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
