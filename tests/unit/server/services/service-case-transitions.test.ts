import { describe, expect, it } from "vitest";

const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ["TRIAGED"],
  TRIAGED: ["AWAITING_CUSTOMER", "PLANNED"],
  AWAITING_CUSTOMER: ["TRIAGED", "PLANNED"],
  PLANNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CONFIRMED"],
  CONFIRMED: ["CLOSED"],
  CLOSED: [],
};

function isValidTransition(from: string, to: string): boolean {
  return (VALID_TRANSITIONS[from] ?? []).includes(to);
}

describe("Service Case status transitions", () => {
  it("allows NEW -> TRIAGED", () => {
    expect(isValidTransition("NEW", "TRIAGED")).toBe(true);
  });

  it("allows TRIAGED -> PLANNED", () => {
    expect(isValidTransition("TRIAGED", "PLANNED")).toBe(true);
  });

  it("allows TRIAGED -> AWAITING_CUSTOMER", () => {
    expect(isValidTransition("TRIAGED", "AWAITING_CUSTOMER")).toBe(true);
  });

  it("allows full lifecycle", () => {
    const lifecycle = ["NEW", "TRIAGED", "PLANNED", "IN_PROGRESS", "RESOLVED", "CONFIRMED", "CLOSED"];
    for (let i = 0; i < lifecycle.length - 1; i++) {
      expect(isValidTransition(lifecycle[i], lifecycle[i + 1])).toBe(true);
    }
  });

  it("rejects NEW -> IN_PROGRESS", () => {
    expect(isValidTransition("NEW", "IN_PROGRESS")).toBe(false);
  });

  it("rejects CLOSED -> anything", () => {
    expect(isValidTransition("CLOSED", "NEW")).toBe(false);
    expect(isValidTransition("CLOSED", "TRIAGED")).toBe(false);
  });

  it("rejects invalid source status", () => {
    expect(isValidTransition("UNKNOWN", "NEW")).toBe(false);
  });

  it("allows RESOLVED -> CONFIRMED", () => {
    expect(isValidTransition("RESOLVED", "CONFIRMED")).toBe(true);
  });

  it("allows CONFIRMED -> CLOSED", () => {
    expect(isValidTransition("CONFIRMED", "CLOSED")).toBe(true);
  });
});
