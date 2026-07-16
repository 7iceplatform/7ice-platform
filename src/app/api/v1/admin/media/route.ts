import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";
import { tenantWhere, tenantCreate } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "video/mp4", "video/webm",
  "audio/mpeg", "audio/wav",
  "text/plain", "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_MEDIA_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const mimeType = url.searchParams.get("mimeType") ?? "";
  const includeDeleted = url.searchParams.get("includeDeleted") === "true";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = tenantWhere(actor);
  if (!includeDeleted) where.deletedAt = null;
  if (search) {
    where.OR = [
      { filename: { contains: search, mode: "insensitive" } },
      { alt: { contains: search, mode: "insensitive" } },
    ];
  }
  if (mimeType) {
    where.mimeType = { contains: mimeType, mode: "insensitive" };
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.media.count({ where }),
  ]);

  return NextResponse.json({
    data: media.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
      mimeType: m.mimeType,
      size: m.size,
      alt: m.alt,
      rights: m.rights,
      license: m.license,
      isLegalHold: m.isLegalHold,
      retentionUntil: m.retentionUntil?.toISOString() ?? null,
      deletedAt: m.deletedAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_MEDIA_MANAGE)) {
    throw errors.forbidden();
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const alt = (formData.get("alt") as string) || null;
  const rights = (formData.get("rights") as string) || null;
  const license = (formData.get("license") as string) || null;

  if (!file || file.size === 0) {
    throw errors.forbidden("No file provided.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw errors.forbidden("File too large (max 10MB).");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw errors.forbidden(`File type not allowed: ${file.type}`);
  }

  const virusScanResult = await simulateVirusScan(file);
  if (!virusScanResult.clean) {
    throw errors.forbidden("File failed malware scan.");
  }

  const ext = file.name.split(".").pop() ?? "";
  const filename = ext ? `${randomUUID()}.${ext}` : randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(join(UPLOAD_DIR, filename), buffer);

  const media = await prisma.media.create({
    data: tenantCreate(actor, {
      filename: file.name,
      url: `/uploads/${filename}`,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      alt,
      rights,
      license,
      uploadedBy: actor.id,
    }),
  });

  await auditService.record({
    action: "media.uploaded",
    actorId: actor.id,
    metadata: { filename: file.name, mimeType: file.type, size: file.size },
    requestId,
    resourceId: media.id,
    resourceType: "media",
  });

  return NextResponse.json({
    data: {
      id: media.id,
      filename: media.filename,
      url: media.url,
      mimeType: media.mimeType,
      size: media.size,
      alt: media.alt,
    },
    requestId,
  });
});

async function simulateVirusScan(file: File): Promise<{ clean: boolean }> {
  void file;
  await new Promise((r) => setTimeout(r, 10));
  return { clean: true };
}
