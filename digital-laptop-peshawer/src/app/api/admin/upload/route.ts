import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  assertValidImage,
  ImageUploadError,
  isCloudinaryConfigured,
  MAX_UPLOAD_BYTES,
  uploadImage,
} from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-side image upload to Cloudinary.
 * Files go straight to Cloudinary with a signed request using the
 * secret API credentials — no public upload preset needed.
 */
export async function POST(request: Request) {
  if (!(await requireAdmin(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (or CLOUDINARY_API) to the environment.",
      },
      { status: 503 },
    );
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image is larger than 8 MB. Please compress it first." },
      { status: 400 },
    );
  }

  try {
    assertValidImage(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = (form.get("folder") as string) || "digital-laptop";
    const url = await uploadImage({
      buffer,
      mimeType: file.type,
      filename: file.name || "upload.jpg",
      folder,
    });
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    if (err instanceof ImageUploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
