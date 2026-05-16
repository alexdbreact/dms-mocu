import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const uploadedFileSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
    resourceType: { type: String, required: true },
    size: { type: Number, required: true }
  },
  { _id: false }
);

const documentSchema = new Schema(
  {
    type: { type: String, enum: ["incoming", "outgoing"], required: true, index: true },
    serial: { type: Number, required: true },
    referenceNumber: { type: String, required: true },
    documentDate: { type: Date, required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    subFileName: { type: String, default: "" },
    attachment: { type: uploadedFileSchema, default: null },
    incomingFrom: { type: String, default: "" },
    incomingEntities: { type: [String], default: [] },
    instruction: { type: String, default: "" },
    outgoingTo: { type: [String], default: [] },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, default: "" }
  },
  {
    timestamps: true
  }
);

documentSchema.index({ type: 1, serial: 1 }, { unique: true });
documentSchema.index({ type: 1, referenceNumber: 1 });
documentSchema.index({ title: "text", content: "text", referenceNumber: "text" });

export type DocumentRecord = InferSchemaType<typeof documentSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const DocumentModel =
  (mongoose.models.Document as Model<DocumentRecord>) ||
  mongoose.model<DocumentRecord>("Document", documentSchema);
