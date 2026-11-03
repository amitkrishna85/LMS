import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { uploadMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

function isUploadFolder(
  folder: string
): folder is "thumbnails" | "videos" | "pdfs" | "materials" {
  return ["thumbnails", "videos", "pdfs", "materials"].includes(folder);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folderValue = formData.get("folder");
    const folder =
      typeof folderValue === "string" ? folderValue : "materials";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isUploadFolder(folder)) {
      return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const videoExtensions = ["mp4", "m4v", "mov", "webm", "avi", "mkv"];
    const materialExtensions = [
      ...videoExtensions,
      "pdf",
      "ppt",
      "pptx",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "txt",
      "rtf",
      "mp3",
      "wav",
      "m4a",
      "aac",
      "ogg",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
    ];
    if (
      (folder === "videos" && !videoExtensions.includes(extension)) ||
      (["materials", "pdfs"].includes(folder) &&
        !materialExtensions.includes(extension))
    ) {
      return NextResponse.json(
        { error: "This file format is not supported for course content." },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 100MB limit" },
        { status: 400 }
      );
    }

    const uploadResult = await uploadMedia(file, folder);

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
      size: uploadResult.size,
      contentType: uploadResult.contentType,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
