"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";

type Props = {
  title: string;
  content: string;
};

export function TextPreview({ title, content }: Props) {
  const [open, setOpen] = useState(false);
  const hasContent = content.trim().length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!hasContent}
        className="inline-flex items-center gap-1 rounded-md bg-[#fff7ed] px-3 py-2 text-sm font-extrabold text-[#b45309] transition hover:bg-[#ffedd5] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        <FileText size={15} />
        عرض الوصف
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-3 backdrop-blur-sm">
          <section className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-[#f8fbff] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-slate-950">{title}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">وصف محتوى المستند</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700 hover:bg-white"
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </header>
            <div className="overflow-auto p-5">
              <p className="whitespace-pre-wrap leading-8 text-slate-800">{content}</p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
