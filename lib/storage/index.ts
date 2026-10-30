import fs from "fs";
import path from "path";

export interface UploadResult {
  url: string;
  key: string;
  contentType: string;
  size: number;
}

export interface UploadOptions {
  buffer: Buffer;
  filename: string;
  contentType: string;
  folder?: string;
}

export interface StorageProvider {
  upload(options: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<boolean>;
}

/**
 * Local / Mock storage provider for zero-configuration resilience.
 * Writes files to public/uploads or returns mock data URLs.
 */
class LocalMockStorageProvider implements StorageProvider {
  async upload(options: UploadOptions): Promise<UploadResult> {
    const sanitizedFilename = `${Date.now()}-${options.filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const uploadFolder = options.folder ? options.folder : "general";
    const publicUploadDir = path.join(process.cwd(), "public", "uploads", uploadFolder);

    try {
      if (!fs.existsSync(publicUploadDir)) {
        fs.mkdirSync(publicUploadDir, { recursive: true });
      }
      const filePath = path.join(publicUploadDir, sanitizedFilename);
      fs.writeFileSync(filePath, options.buffer);

      const url = `/uploads/${uploadFolder}/${sanitizedFilename}`;
      return {
        url,
        key: `${uploadFolder}/${sanitizedFilename}`,
        contentType: options.contentType,
        size: options.buffer.length,
      };
    } catch {
      // In serverless / read-only environment fallback to base64 data URI
      const base64 = options.buffer.toString("base64");
      const url = `data:${options.contentType};base64,${base64}`;
      return {
        url,
        key: `inline/${sanitizedFilename}`,
        contentType: options.contentType,
        size: options.buffer.length,
      };
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = path.join(process.cwd(), "public", "uploads", key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Storage Abstraction Singleton
 */
export const storage: StorageProvider = new LocalMockStorageProvider();

export async function uploadMedia(
  file: File,
  folder: "thumbnails" | "videos" | "pdfs" | "materials" = "materials"
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return storage.upload({
    buffer,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    folder,
  });
}
