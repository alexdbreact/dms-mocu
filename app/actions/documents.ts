"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { uploadDocument } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/db";
import { canManage } from "@/lib/users";
import { DocumentModel } from "@/models/Document";

export type DocumentState = {
  error?: string;
};

type DocumentType = "incoming" | "outgoing";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function list(formData: FormData, key: string) {
  return text(formData, key)
    .split(/[،,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function requireDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("يرجى إدخال تاريخ صحيح");
  }

  return date;
}

async function guard(type: DocumentType) {
  const user = await getCurrentUser();

  if (!user || !canManage(user.role, type)) {
    throw new Error("ليس لديك صلاحية تنفيذ هذه العملية");
  }

  return user;
}

export async function createDocumentAction(
  type: DocumentType,
  _state: DocumentState,
  formData: FormData
): Promise<DocumentState> {
  try {
    const user = await guard(type);
    const serial = Number(text(formData, "serial"));

    if (!Number.isInteger(serial) || serial <= 0) {
      return { error: "يرجى إدخال مسلسل صحيح" };
    }

    const title = text(formData, "title");
    const referenceNumber = text(formData, "referenceNumber");

    if (!title || !referenceNumber) {
      return { error: "رقم المستند والعنوان مطلوبان" };
    }

    await connectToDatabase();
    const uploaded = await uploadDocument(formData.get("attachment") as File);

    await DocumentModel.create({
      type,
      serial,
      referenceNumber,
      documentDate: requireDate(text(formData, "documentDate")),
      title,
      content: text(formData, "content"),
      subFileName: text(formData, "subFileName"),
      attachment: uploaded,
      incomingFrom: text(formData, "incomingFrom"),
      incomingEntities: list(formData, "incomingEntities"),
      instruction: text(formData, "instruction"),
      outgoingTo: list(formData, "outgoingTo"),
      createdBy: user.username,
      updatedBy: user.username
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر حفظ المستند";
    return { error: message.includes("E11000") ? "المسلسل مستخدم من قبل" : message };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${type}`);
}

export async function updateDocumentAction(
  type: DocumentType,
  id: string,
  _state: DocumentState,
  formData: FormData
): Promise<DocumentState> {
  try {
    const user = await guard(type);
    const serial = Number(text(formData, "serial"));

    if (!Number.isInteger(serial) || serial <= 0) {
      return { error: "يرجى إدخال مسلسل صحيح" };
    }

    await connectToDatabase();
    const existing = await DocumentModel.findOne({ _id: id, type });

    if (!existing) {
      return { error: "المستند غير موجود" };
    }

    const uploaded = await uploadDocument(formData.get("attachment") as File);

    existing.set({
      serial,
      referenceNumber: text(formData, "referenceNumber"),
      documentDate: requireDate(text(formData, "documentDate")),
      title: text(formData, "title"),
      content: text(formData, "content"),
      subFileName: text(formData, "subFileName"),
      incomingFrom: text(formData, "incomingFrom"),
      incomingEntities: list(formData, "incomingEntities"),
      instruction: text(formData, "instruction"),
      outgoingTo: list(formData, "outgoingTo"),
      updatedBy: user.username
    });

    if (uploaded) {
      existing.attachment = uploaded;
    }

    await existing.save();
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تحديث المستند";
    return { error: message.includes("E11000") ? "المسلسل مستخدم من قبل" : message };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${type}`);
}

export async function deleteDocumentAction(type: DocumentType, id: string) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    throw new Error("الحذف متاح للمدير فقط");
  }

  await connectToDatabase();
  await DocumentModel.deleteOne({ _id: id, type });
  revalidatePath("/dashboard");
  redirect(`/dashboard/${type}`);
}
