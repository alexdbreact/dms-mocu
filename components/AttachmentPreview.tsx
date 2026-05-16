"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, Eye, FileText, X } from "lucide-react";

type Attachment = {
  url: string;
  originalName: string;
  resourceType: string;
  size: number;
};

type Props = {
  attachment: Attachment;
};

function hasExtension(file: Attachment, extensions: string[]) {
  const source = `${file.originalName} ${file.url}`.toLowerCase();
  return extensions.some((extension) => source.includes(`.${extension}`));
}

function isPdf(file: Attachment) {
  return hasExtension(file, ["pdf"]);
}

function isImage(file: Attachment) {
  return hasExtension(file, ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"]);
}

function canEmbed(file: Attachment) {
  return isImage(file) || isPdf(file) || hasExtension(file, ["txt"]);
}

function fileSize(size: number) {
  if (!size) {
    return "";
  }

  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} ك.ب`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} م.ب`;
}

export function AttachmentPreview({ attachment }: Props) {
  const [open, setOpen] = useState(false);
  const previewable = useMemo(() => canEmbed(attachment), [attachment]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md bg-[#eef8ff] px-3 py-2 text-sm font-extrabold text-[#075985] transition hover:bg-[#dff1ff]"
      >
        <Eye size={15} />
        معاينة
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-3 backdrop-blur-sm">
          <section className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#f8fbff] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-slate-950">{attachment.originalName}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{fileSize(attachment.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-white"
                >
                  <ExternalLink size={16} />
                  فتح خارجي
                </a>
                <a
                  href={attachment.url}
                  download
                  className="inline-flex items-center gap-2 rounded-md bg-[#0f766e] px-3 py-2 text-sm font-extrabold text-white hover:bg-[#115e59]"
                >
                  <Download size={16} />
                  تحميل
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700 hover:bg-white"
                  aria-label="إغلاق"
                >
                  <X size={20} />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 bg-slate-100">
              {isPdf(attachment) ? (
                <object
                  data={`${attachment.url}#toolbar=1&navpanes=0`}
                  type="application/pdf"
                  className="h-full w-full bg-white"
                >
                  <iframe
                    title={attachment.originalName}
                    src={`${attachment.url}#toolbar=1&navpanes=0`}
                    className="h-full w-full border-0 bg-white"
                  />
                </object>
              ) : isImage(attachment) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={attachment.url} alt={attachment.originalName} className="h-full w-full object-contain p-4" />
              ) : previewable ? (
                <iframe title={attachment.originalName} src={attachment.url} className="h-full w-full border-0 bg-white" />
              ) : (
                <div className="grid h-full place-items-center p-6 text-center">
                  <div>
                    <FileText className="mx-auto mb-4 text-[#0f766e]" size={54} />
                    <h2 className="text-2xl font-extrabold text-slate-950">لا يمكن عرض هذا النوع داخل المتصفح</h2>
                    <p className="mt-2 max-w-xl text-slate-600">
                      يمكنك فتح الملف في نافذة خارجية أو تحميله على الجهاز لمراجعته.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
