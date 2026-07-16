import { describe, expect, it } from "vitest";

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

function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

describe("Media MIME type allowlist", () => {
  it("allows common image types", () => {
    expect(isAllowedMimeType("image/jpeg")).toBe(true);
    expect(isAllowedMimeType("image/png")).toBe(true);
    expect(isAllowedMimeType("image/gif")).toBe(true);
    expect(isAllowedMimeType("image/webp")).toBe(true);
  });

  it("allows PDF", () => {
    expect(isAllowedMimeType("application/pdf")).toBe(true);
  });

  it("allows video types", () => {
    expect(isAllowedMimeType("video/mp4")).toBe(true);
    expect(isAllowedMimeType("video/webm")).toBe(true);
  });

  it("allows document types", () => {
    expect(isAllowedMimeType("application/msword")).toBe(true);
    expect(isAllowedMimeType("text/plain")).toBe(true);
  });

  it("rejects executable types", () => {
    expect(isAllowedMimeType("application/x-executable")).toBe(false);
    expect(isAllowedMimeType("application/x-msdownload")).toBe(false);
  });

  it("rejects script types", () => {
    expect(isAllowedMimeType("text/javascript")).toBe(false);
    expect(isAllowedMimeType("application/x-sh")).toBe(false);
  });

  it("rejects archive types", () => {
    expect(isAllowedMimeType("application/zip")).toBe(false);
    expect(isAllowedMimeType("application/x-rar-compressed")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isAllowedMimeType("")).toBe(false);
  });
});
