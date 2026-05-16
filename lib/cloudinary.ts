import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export type UploadedFile = {
  url: string;
  publicId: string;
  originalName: string;
  resourceType: string;
  size: number;
};

export async function uploadDocument(file: File): Promise<UploadedFile | null> {
  if (!file || file.size === 0) {
    return null;
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const encoded = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(encoded, {
    folder: "dms-documents",
    resource_type: "auto",
    use_filename: true,
    unique_filename: true
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalName: file.name,
    resourceType: result.resource_type,
    size: file.size
  };
}
