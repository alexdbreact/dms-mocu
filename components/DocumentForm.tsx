"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import {
  createDocumentAction,
  updateDocumentAction,
  type DocumentState
} from "@/app/actions/documents";

type DocumentType = "incoming" | "outgoing";

type FormDocument = {
  _id?: string;
  serial?: number;
  referenceNumber?: string;
  documentDate?: string;
  title?: string;
  content?: string;
  subFileName?: string;
  incomingFrom?: string;
  incomingEntities?: string[];
  instruction?: string;
  outgoingTo?: string[];
  attachment?: {
    originalName: string;
    url: string;
  } | null;
};

type Props = {
  type: DocumentType;
  document?: FormDocument;
  subFileNames?: string[];
};

const initialState: DocumentState = {};

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function DocumentForm({ type, document, subFileNames = [] }: Props) {
  const action = document?._id
    ? updateDocumentAction.bind(null, type, document._id)
    : createDocumentAction.bind(null, type);
  const [state, formAction, pending] = useActionState(action, initialState);
  const isIncoming = type === "incoming";

  return (
    <form action={formAction} className="grid gap-5" encType="multipart/form-data">
      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/60 md:grid-cols-2">
        <label>
          مسلسل
          <input name="serial" type="number" min="1" required defaultValue={document?.serial || ""} />
        </label>
        <label>
          {isIncoming ? "رقم الوارد" : "رقم الصادر"}
          <input name="referenceNumber" required defaultValue={document?.referenceNumber || ""} />
        </label>
        <label>
          {isIncoming ? "تاريخ الوارد" : "تاريخ الصادر"}
          <input name="documentDate" type="date" required defaultValue={formatDate(document?.documentDate)} />
        </label>
        <label>
          اسم الملف الفرعي
          <input name="subFileName" list={`${type}-sub-files`} defaultValue={document?.subFileName || ""} />
          <datalist id={`${type}-sub-files`}>
            {subFileNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label className="md:col-span-2">
          عنوان المستند
          <input name="title" required defaultValue={document?.title || ""} />
        </label>
        <label className="md:col-span-2">
          {isIncoming ? "وصف محتوى المستند" : "المحتوى"}
          <textarea name="content" defaultValue={document?.content || ""} />
        </label>
      </div>

      {isIncoming ? (
        <div className="grid gap-4 rounded-lg border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/60 md:grid-cols-2">
          <label>
            الجهة الوارد منها
            <input name="incomingFrom" defaultValue={document?.incomingFrom || ""} />
          </label>
          <label>
            الجهات
            <input
              name="incomingEntities"
              placeholder="افصل بين الجهات بفاصلة"
              defaultValue={document?.incomingEntities?.join("، ") || ""}
            />
          </label>
          <label className="md:col-span-2">
            التأشيرة
            <textarea name="instruction" defaultValue={document?.instruction || ""} />
          </label>
        </div>
      ) : (
        <div className="grid gap-4 rounded-lg border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/60">
          <label>
            الجهة الصادر لها
            <input
              name="outgoingTo"
              placeholder="يمكن إدخال أكثر من جهة بفاصلة"
              defaultValue={document?.outgoingTo?.join("، ") || ""}
            />
          </label>
        </div>
      )}

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/60">
        <label>
          المستند
          <input name="attachment" type="file" />
        </label>
        {document?.attachment ? (
          <a className="text-sm font-bold text-[#0f766e]" href={document.attachment.url} target="_blank">
            الملف الحالي: {document.attachment.originalName}
          </a>
        ) : null}
      </div>

      {state.error ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-fit items-center gap-2 rounded-md bg-gradient-to-l from-[#0f766e] to-[#2563eb] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/10 transition hover:brightness-105 disabled:opacity-60"
      >
        <Save size={18} />
        {pending ? "جاري الحفظ..." : "حفظ المستند"}
      </button>
    </form>
  );
}
