import Link from "next/link";
import { ArrowDown, ArrowUp, Edit, FolderOpen, Layers3, Plus, Search, X } from "lucide-react";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { DeleteButton } from "@/components/DeleteButton";
import { TextPreview } from "@/components/TextPreview";
import { getDocuments, getSubFileGroups, type DocumentSort, type SortDirection } from "@/lib/documents";
import { canManage, type UserRole } from "@/lib/users";

type Props = {
  type: "incoming" | "outgoing";
  role: UserRole;
  query?: string;
  subFileName?: string;
  sort?: DocumentSort;
  direction?: SortDirection;
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

function SortLink({
  type,
  activeSort,
  activeDirection,
  sort,
  label,
  query,
  subFileName
}: {
  type: "incoming" | "outgoing";
  activeSort: DocumentSort;
  activeDirection: SortDirection;
  sort: DocumentSort;
  label: string;
  query?: string;
  subFileName?: string;
}) {
  const active = activeSort === sort;
  const nextDirection: SortDirection = active && activeDirection === "desc" ? "asc" : "desc";

  return (
    <Link
      href={listPath(type, { q: query, subFileName, sort, direction: nextDirection })}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 transition hover:bg-white ${
        active ? "text-[#0f766e]" : "text-slate-700"
      }`}
    >
      {label}
      {active && activeDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
    </Link>
  );
}

export async function DocumentList({
  type,
  role,
  query,
  subFileName,
  sort = "date",
  direction = "desc"
}: Props) {
  const [docs, subFiles] = await Promise.all([
    getDocuments(type, { query, subFileName, sort, direction }),
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
            href={listPath(type, { q: query, sort, direction })}
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
              href={listPath(type, { q: query, subFileName: subFile.name, sort, direction })}
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
              href={listPath(type, { q: query, sort, direction })}
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
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="direction" value={direction} />
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
        <table className="w-full min-w-[1100px] border-collapse text-right">
          <thead className="bg-gradient-to-l from-[#e7f7f4] via-[#eef8ff] to-[#fff7ed] text-sm text-slate-700">
            <tr>
              <th className="p-3 ">
                <SortLink type={type} activeSort={sort} activeDirection={direction} sort="serial" label="م" query={query} subFileName={subFileName} />
              </th>
              <th className="p-3">
                <div className="grid gap-1">
                  <SortLink
                    type={type}
                    activeSort={sort}
                    activeDirection={direction}
                    sort="number"
                    label={isIncoming ? "رقم الوارد" : "رقم الصادر"}
                    query={query}
                    subFileName={subFileName}
                  />
                  <SortLink type={type} activeSort={sort} activeDirection={direction} sort="date" label="التاريخ" query={query} subFileName={subFileName} />
                </div>
              </th>
               <th className="p-3">{isIncoming ? "الجهة الوارد منها" : "الجهة الصادر لها"}</th>
              <th className="p-3">العنوان ووصف المحتوى</th>
             
              {isIncoming ? <th className="p-3">الجهات</th> : null}
              <th className="p-3">الملف الفرعي</th>
              <th className="p-3">المستند</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc._id} className="border-t border-slate-100 align-top transition hover:bg-slate-50">
                <td className="p-3 font-extrabold text-[#0f766e]">{doc.serial}</td>
                <td className="p-3">
                  <p className="font-extrabold text-slate-950">{doc.referenceNumber}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{doc.documentDate.slice(0, 10)}</p>
                </td>
                <td className="p-3">{isIncoming ? doc.incomingFrom : doc.outgoingTo.join("، ")}</td>
                <td className="max-w-[280px] p-3">
                  <p className="font-extrabold text-slate-950">{doc.title}</p>
                  <div className="mt-2">
                    <TextPreview title={doc.title} content={doc.content} />
                  </div>
                </td>
                
                {isIncoming ? (
                  <td className="max-w-[220px] p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {doc.incomingEntities.length > 0 ? (
                        doc.incomingEntities.map((entity) => (
                          <span key={entity} className="rounded-md bg-[#eef8ff] px-2 py-1 text-xs font-extrabold text-[#075985]">
                            {entity}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-bold text-slate-400">لا يوجد</span>
                      )}
                    </div>
                  </td>
                ) : null}
                <td className="p-3">
                  {doc.subFileName ? (
                    <Link
                      href={listPath(type, { q: query, subFileName: doc.subFileName, sort, direction })}
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
                <td className="p-8 text-center font-bold text-slate-500" colSpan={isIncoming ? 8 : 7}>
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
