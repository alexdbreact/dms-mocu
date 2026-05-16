"use client";

import { Trash2 } from "lucide-react";
import { deleteDocumentAction } from "@/app/actions/documents";

type Props = {
  type: "incoming" | "outgoing";
  id: string;
};

export function DeleteButton({ type, id }: Props) {
  return (
    <form action={deleteDocumentAction.bind(null, type, id)}>
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
        onClick={(event) => {
          if (!confirm("هل تريد حذف هذا المستند؟")) {
            event.preventDefault();
          }
        }}
      >
        <Trash2 size={15} />
        حذف
      </button>
    </form>
  );
}
