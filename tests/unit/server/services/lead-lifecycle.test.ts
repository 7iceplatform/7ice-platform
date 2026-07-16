import { describe, expect, it } from "vitest";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "DISCARDED"] as const;

const VALID_LEAD_TRANSITIONS: Record<string, string[]> = {
  NEW: ["CONTACTED", "QUALIFIED", "DISCARDED"],
  CONTACTED: ["QUALIFIED", "DISCARDED"],
  QUALIFIED: ["CONVERTED", "DISCARDED"],
  CONVERTED: [],
  DISCARDED: [],
};

function isValidLeadTransition(from: string, to: string): boolean {
  return (VALID_LEAD_TRANSITIONS[from] ?? []).includes(to);
}

describe("Lead lifecycle transitions", () => {
  it("allows NEW -> CONTACTED", () => {
    expect(isValidLeadTransition("NEW", "CONTACTED")).toBe(true);
  });

  it("allows NEW -> QUALIFIED (skip contacted)", () => {
    expect(isValidLeadTransition("NEW", "QUALIFIED")).toBe(true);
  });

  it("allows QUALIFIED -> CONVERTED", () => {
    expect(isValidLeadTransition("QUALIFIED", "CONVERTED")).toBe(true);
  });

  it("allows any active -> DISCARDED", () => {
    for (const status of ["NEW", "CONTACTED", "QUALIFIED"]) {
      expect(isValidLeadTransition(status, "DISCARDED")).toBe(true);
    }
  });

  it("rejects CONVERTED -> anything", () => {
    expect(isValidLeadTransition("CONVERTED", "NEW")).toBe(false);
    expect(isValidLeadTransition("CONVERTED", "DISCARDED")).toBe(false);
  });

  it("rejects DISCARDED -> anything", () => {
    expect(isValidLeadTransition("DISCARDED", "NEW")).toBe(false);
    expect(isValidLeadTransition("DISCARDED", "CONVERTED")).toBe(false);
  });

  it("rejects skipping to CONVERTED from NEW", () => {
    expect(isValidLeadTransition("NEW", "CONVERTED")).toBe(false);
  });

  it("all statuses are defined", () => {
    for (const status of LEAD_STATUSES) {
      expect(VALID_LEAD_TRANSITIONS[status]).toBeDefined();
    }
  });
});
