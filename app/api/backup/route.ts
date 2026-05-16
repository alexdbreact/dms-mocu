import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BackupDocument = {
  type: "incoming" | "outgoing";
  referenceNumber: string;
  attachment?: {
    url: string;
    originalName: string;
  } | null;
  createdAt?: Date;
};

type BackupScope = "today" | "month" | "all";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfTomorrow() {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
}

function startOfCurrentMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function backupScope(value: string | null): BackupScope {
  if (value === "month" || value === "all") {
    return value;
  }

  return "today";
}

function scopeLabel(scope: BackupScope) {
  if (scope === "month") {
    return "الشهر الحالي";
  }

  if (scope === "all") {
    return "كل مستندات النظام";
  }

  return "اليوم";
}

function scopeQuery(scope: BackupScope) {
  const query: Record<string, unknown> = {
    attachment: { $ne: null },
    "attachment.url": { $exists: true, $ne: "" }
  };

  if (scope === "today") {
    query.createdAt = { $gte: startOfToday(), $lt: startOfTomorrow() };
  }

  if (scope === "month") {
    query.createdAt = { $gte: startOfCurrentMonth(), $lt: startOfNextMonth() };
  }

  return query;
}

function backupFileName(scope: BackupScope, today: string) {
  if (scope === "month") {
    return `dms-backup-month-${formatMonth(new Date())}.zip`;
  }

  if (scope === "all") {
    return `dms-backup-all-${today}.zip`;
  }

  return `dms-backup-today-${today}.zip`;
}

function safeName(value: string) {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function extensionFromName(name?: string) {
  const match = name?.match(/\.([a-z0-9]{1,12})$/i);
  return match ? `.${match[1].toLowerCase()}` : "";
}

async function fileBuffer(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  await connectToDatabase();
  const url = new URL(request.url);
  const scope = backupScope(url.searchParams.get("scope"));

  const documents = await DocumentModel.find(scopeQuery(scope))
    .sort({ createdAt: 1, type: 1, referenceNumber: 1 })
    .lean<BackupDocument[]>();

  const zip = new JSZip();
  const today = formatDate(new Date());
  let added = 0;
  let skipped = 0;

  for (const document of documents) {
    if (!document.attachment?.url) {
      continue;
    }

    const createdAt = document.createdAt ? new Date(document.createdAt) : new Date();
    const dayFolder = zip.folder(formatDate(createdAt));
    const prefix = document.type === "incoming" ? "وارد" : "صادر";
    const referenceNumber = safeName(document.referenceNumber || "بدون-رقم");
    const extension = extensionFromName(document.attachment.originalName) || ".bin";
    const fileName = `${prefix}-${referenceNumber}${extension}`;

    try {
      const buffer = await fileBuffer(document.attachment.url);
      dayFolder?.file(fileName, buffer);
      added += 1;
    } catch {
      skipped += 1;
    }
  }

  const summary = [
    `تاريخ النسخة: ${today}`,
    `النطاق: ${scopeLabel(scope)}`,
    `عدد الملفات: ${added}`,
    `ملفات لم يتم تحميلها: ${skipped}`,
    ""
  ].join("\n");

  zip.file("backup-info.txt", summary);

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });

  const fileName = backupFileName(scope, today);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store"
    }
  });
}
