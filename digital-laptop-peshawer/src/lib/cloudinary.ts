import { createHash } from "crypto";

/**
 * Cloudinary credentials resolution.
 *
 * Supported environment shapes (first match wins):
 *  1. CLOUDINARY_API="cloudinary://<api_key>:<api_secret>@<cloud_name>"
 *  2. CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET
 *  3. CLOUDINARY_CLOUD_NAME + CLOUDINARY_API (api key) + CLOUDINARY_API_SECRET
 *  4. CLOUDINARY_URL="cloudinary://..." (Cloudinary's own standard name)
 */

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function parseCloudinaryUrl(value: string): CloudinaryConfig | null {
  const match = /^cloudinary:\/\/([^:@/]+):([^@/]+)@([^/]+)\/?$/.exec(
    value.trim(),
  );
  if (!match) return null;
  const [, apiKey, apiSecret, cloudName] = match;
  if (!apiKey || !apiSecret || !cloudName) return null;
  return { apiKey, apiSecret, cloudName };
}

function envValue(name: string): string | null {
  const raw = process.env[name];
  const value = raw?.trim();
  return value ? value : null;
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const combined = envValue("CLOUDINARY_API") ?? envValue("CLOUDINARY_URL");
  if (combined) {
    const parsed = parseCloudinaryUrl(combined);
    if (parsed) return parsed;
  }

  const cloudName = envValue("CLOUDINARY_CLOUD_NAME");
  const apiSecret = envValue("CLOUDINARY_API_SECRET");
  const apiKey =
    envValue("CLOUDINARY_API_KEY") ??
    (combined && !parseCloudinaryUrl(combined) ? combined : null);

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }
  return null;
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig() !== null;
}

/* ------------------------------------------------------------------ *
 * Upload
 * ------------------------------------------------------------------ */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/gif",
];

export class ImageUploadError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ImageUploadError";
    this.status = status;
  }
}

type UploadOptions = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  folder?: string;
};

/** Uploads an image buffer to Cloudinary using a signed request. */
export async function uploadImage({
  buffer,
  mimeType,
  filename,
  folder = "digital-laptop",
}: UploadOptions): Promise<string> {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new ImageUploadError(
      "Cloudinary is not configured. Add CLOUDINARY_API (or CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) to the environment.",
      503,
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${config.apiSecret}`)
    .digest("hex");

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: mimeType }),
    filename,
  );
  form.append("api_key", config.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  let response: Response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      { method: "POST", body: form },
    );
  } catch {
    throw new ImageUploadError(
      "Could not reach Cloudinary. Check your connection and try again.",
      502,
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const message = detail.includes('"message"')
      ? safeCloudinaryMessage(detail)
      : "Cloudinary rejected the upload. Check your API key and secret.";
    throw new ImageUploadError(message, 502);
  }

  const payload = (await response.json().catch(() => null)) as {
    secure_url?: string;
    url?: string;
  } | null;
  const url = payload?.secure_url ?? payload?.url;
  if (!url) {
    throw new ImageUploadError("Cloudinary did not return an image URL.", 502);
  }
  return url;
}

function safeCloudinaryMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    return parsed.error?.message ?? "Cloudinary rejected the upload.";
  } catch {
    return "Cloudinary rejected the upload.";
  }
}

/** Validates an incoming file before it is sent to Cloudinary. */
export function assertValidImage(file: File): void {
  if (!file.type || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageUploadError(
      "Unsupported file type. Upload a PNG, JPG, WebP, AVIF or GIF image.",
    );
  }
  if (file.size <= 0) {
    throw new ImageUploadError("The selected file is empty.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageUploadError(
      "Image is larger than 8 MB. Please compress it first.",
    );
  }
}
