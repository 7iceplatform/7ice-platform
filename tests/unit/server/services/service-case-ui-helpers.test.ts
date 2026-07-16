import { describe, expect, it } from "vitest";

const TYPE_LABELS: Record<string, string> = {
  INCIDENT: "Инцидент",
  REQUEST: "Запрос",
  MAINTENANCE: "Обслуживание",
  WARRANTY: "Гарантия",
  COMPLAINT: "Жалоба",
};

const SEVERITY_TONES: Record<string, string> = {
  LOW: "info",
  MEDIUM: "default",
  HIGH: "warning",
  CRITICAL: "inverted",
};

describe("Service Case type labels", () => {
  it("maps all types to Russian labels", () => {
    expect(TYPE_LABELS.INCIDENT).toBe("Инцидент");
    expect(TYPE_LABELS.REQUEST).toBe("Запрос");
    expect(TYPE_LABELS.MAINTENANCE).toBe("Обслуживание");
    expect(TYPE_LABELS.WARRANTY).toBe("Гарантия");
    expect(TYPE_LABELS.COMPLAINT).toBe("Жалоба");
  });
});

describe("Service Case severity tones", () => {
  it("maps LOW to info tone", () => {
    expect(SEVERITY_TONES.LOW).toBe("info");
  });

  it("maps CRITICAL to inverted tone", () => {
    expect(SEVERITY_TONES.CRITICAL).toBe("inverted");
  });

  it("maps MEDIUM to default tone", () => {
    expect(SEVERITY_TONES.MEDIUM).toBe("default");
  });
});
