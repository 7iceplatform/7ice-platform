import { describe, expect, it } from "vitest";

function isInQuietHours(
  currentTime: string,
  start: string,
  end: string,
): boolean {
  if (start <= end) {
    return currentTime >= start && currentTime < end;
  }
  return currentTime >= start || currentTime < end;
}

function generateDedupKey(type: string, id: string, extra?: string): string {
  return extra ? `${type}:${id}:${extra}` : `${type}:${id}`;
}

describe("Notification quiet hours", () => {
  it("detects time within quiet hours (same day)", () => {
    expect(isInQuietHours("22:30", "22:00", "08:00")).toBe(true);
  });

  it("detects time outside quiet hours (same day)", () => {
    expect(isInQuietHours("12:00", "22:00", "08:00")).toBe(false);
  });

  it("detects time within quiet hours (crossing midnight)", () => {
    expect(isInQuietHours("03:00", "22:00", "08:00")).toBe(true);
  });

  it("detects time at quiet hours start boundary", () => {
    expect(isInQuietHours("22:00", "22:00", "08:00")).toBe(true);
  });

  it("detects time at quiet hours end boundary (exclusive)", () => {
    expect(isInQuietHours("08:00", "22:00", "08:00")).toBe(false);
  });

  it("handles non-crossing quiet hours", () => {
    expect(isInQuietHours("13:00", "12:00", "14:00")).toBe(true);
    expect(isInQuietHours("11:00", "12:00", "14:00")).toBe(false);
    expect(isInQuietHours("15:00", "12:00", "14:00")).toBe(false);
  });
});

describe("Notification dedup keys", () => {
  it("generates simple dedup key", () => {
    expect(generateDedupKey("work_order_created", "abc123")).toBe("work_order_created:abc123");
  });

  it("generates dedup key with extra context", () => {
    expect(generateDedupKey("work_order_status", "abc123", "DRAFT:PLANNED")).toBe(
      "work_order_status:abc123:DRAFT:PLANNED",
    );
  });

  it("generates unique keys for different transitions", () => {
    const key1 = generateDedupKey("deal_stage", "d1", "NEW:QUALIFIED");
    const key2 = generateDedupKey("deal_stage", "d1", "QUALIFIED:PROPOSAL");
    expect(key1).not.toBe(key2);
  });

  it("generates same key for same transition", () => {
    const key1 = generateDedupKey("deal_stage", "d1", "NEW:QUALIFIED");
    const key2 = generateDedupKey("deal_stage", "d1", "NEW:QUALIFIED");
    expect(key1).toBe(key2);
  });
});
