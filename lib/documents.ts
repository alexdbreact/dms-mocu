import "server-only";
import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";

export type PlainDocument = {
  _id: string;
  type: "incoming" | "outgoing";
  serial: number;
  referenceNumber: string;
  documentDate: string;
  title: string;
  content: string;
  subFileName: string;
  attachment: {
    url: string;
    publicId: string;
    originalName: string;
    resourceType: string;
    size: number;
  } | null;
  incomingFrom: string;
  incomingEntities: string[];
  instruction: string;
  outgoingTo: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

type LeanDocumentRecord = {
  _id: unknown;
  type: "incoming" | "outgoing";
  serial: number;
  referenceNumber: string;
  documentDate?: Date;
  title: string;
  content?: string;
  subFileName?: string;
  attachment?: PlainDocument["attachment"];
  incomingFrom?: string;
  incomingEntities?: string[];
  instruction?: string;
  outgoingTo?: string[];
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

function serialize(doc: LeanDocumentRecord): PlainDocument {
  return {
    _id: String(doc._id),
    type: doc.type,
    serial: doc.serial,
    referenceNumber: doc.referenceNumber,
    documentDate: doc.documentDate?.toISOString() || "",
    title: doc.title,
    content: doc.content || "",
    subFileName: doc.subFileName || "",
    attachment: doc.attachment || null,
    incomingFrom: doc.incomingFrom || "",
    incomingEntities: doc.incomingEntities || [],
    instruction: doc.instruction || "",
    outgoingTo: doc.outgoingTo || [],
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy || "",
    createdAt: doc.createdAt?.toISOString() || "",
    updatedAt: doc.updatedAt?.toISOString() || ""
  };
}

type DocumentFilters = {
  query?: string;
  subFileName?: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getDocuments(type: "incoming" | "outgoing", filters: DocumentFilters = {}) {
  try {
    await connectToDatabase();
    const filter: Record<string, unknown> = { type };
    const query = filters.query?.trim();
    const subFileName = filters.subFileName?.trim();

    if (query) {
      filter.$or = [
        { title: new RegExp(query, "i") },
        { referenceNumber: new RegExp(query, "i") },
        { content: new RegExp(query, "i") },
        { incomingFrom: new RegExp(query, "i") },
        { outgoingTo: new RegExp(query, "i") }
      ];
    }

    if (subFileName) {
      filter.subFileName = new RegExp(`^${escapeRegExp(subFileName)}$`, "i");
    }

    const docs = await DocumentModel.find(filter).sort({ documentDate: -1, serial: -1 }).limit(100).lean();
    return docs.map(serialize);
  } catch {
    return [];
  }
}

export async function getDocumentById(type: "incoming" | "outgoing", id: string) {
  await connectToDatabase();
  const doc = await DocumentModel.findOne({ _id: id, type }).lean();
  return doc ? serialize(doc) : null;
}

export type SubFileGroup = {
  name: string;
  count: number;
};

export async function getSubFileGroups(type: "incoming" | "outgoing"): Promise<SubFileGroup[]> {
  try {
    await connectToDatabase();
    const groups = await DocumentModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          type,
          subFileName: { $nin: [null, ""] }
        }
      },
      {
        $group: {
          _id: "$subFileName",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return groups.map((group) => ({
      name: group._id,
      count: group.count
    }));
  } catch {
    return [];
  }
}
