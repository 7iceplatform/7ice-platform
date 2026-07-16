import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { stat } from "fs/promises";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = join(process.cwd(), "uploads");
const SIGNING_SECRET = process.env.MEDIA_SIGNING_SECRET ?? "media-signing-dev-secret";

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const filename = path.join("/");

  if (!filename || filename.includes("..")) {
    return NextResponse.json({ error: "Invalid path." }, { status: 403 });
  }

  const url = new URL(request.url);
  const expiresParam = url.searchParams.get("expires");
  const signatureParam = url.searchParams.get("signature");

  if (expiresParam && signatureParam) {
    const expires = Number(expiresParam);
    if (Number.isNaN(expires) || expires < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ error: "Signed URL expired." }, { status: 403 });
    }

    const mediaId = filename.split("/")[0]?.replace(/\.[^.]+$/, "") ?? "";
    const payload = `${mediaId}:${expires}`;
    const expectedSignature = createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");

    if (signatureParam !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
    }
  }

  const filePath = join(UPLOAD_DIR, filename);

  try {
    await stat(filePath);
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const buffer = await readFile(filePath);
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_MAP[ext] ?? "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
