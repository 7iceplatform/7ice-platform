import { describe, expect, it } from "vitest";

const DEAL_STAGES = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;

const VALID_DEAL_TRANSITIONS: Record<string, string[]> = {
  NEW: ["QUALIFIED", "LOST"],
  QUALIFIED: ["PROPOSAL", "LOST"],
  PROPOSAL: ["NEGOTIATION", "WON", "LOST"],
  NEGOTIATION: ["WON", "LOST"],
  WON: [],
  LOST: [],
};

function isValidDealTransition(from: string, to: string): boolean {
  return (VALID_DEAL_TRANSITIONS[from] ?? []).includes(to);
}

describe("Deal stage transitions", () => {
  it("allows NEW -> QUALIFIED", () => {
    expect(isValidDealTransition("NEW", "QUALIFIED")).toBe(true);
  });

  it("allows QUALIFIED -> PROPOSAL", () => {
    expect(isValidDealTransition("QUALIFIED", "PROPOSAL")).toBe(true);
  });

  it("allows PROPOSAL -> NEGOTIATION", () => {
    expect(isValidDealTransition("PROPOSAL", "NEGOTIATION")).toBe(true);
  });

  it("allows PROPOSAL -> WON (skip negotiation)", () => {
    expect(isValidDealTransition("PROPOSAL", "WON")).toBe(true);
  });

  it("allows NEGOTIATION -> WON", () => {
    expect(isValidDealTransition("NEGOTIATION", "WON")).toBe(true);
  });

  it("allows any active stage -> LOST", () => {
    for (const stage of ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION"]) {
      expect(isValidDealTransition(stage, "LOST")).toBe(true);
    }
  });

  it("rejects WON -> anything", () => {
    expect(isValidDealTransition("WON", "NEW")).toBe(false);
    expect(isValidDealTransition("WON", "LOST")).toBe(false);
  });

  it("rejects LOST -> anything", () => {
    expect(isValidDealTransition("LOST", "NEW")).toBe(false);
    expect(isValidDealTransition("LOST", "WON")).toBe(false);
  });

  it("rejects skipping stages", () => {
    expect(isValidDealTransition("NEW", "PROPOSAL")).toBe(false);
    expect(isValidDealTransition("NEW", "WON")).toBe(false);
    expect(isValidDealTransition("QUALIFIED", "NEGOTIATION")).toBe(false);
  });

  it("all stages are defined in transitions", () => {
    for (const stage of DEAL_STAGES) {
      expect(VALID_DEAL_TRANSITIONS[stage]).toBeDefined();
    }
  });
});
