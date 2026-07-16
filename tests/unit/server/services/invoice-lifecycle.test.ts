import { describe, expect, it } from "vitest";

const VALID_INVOICE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ISSUED", "CANCELLED"],
  ISSUED: ["PAID", "OVERDUE", "CANCELLED"],
  PAID: [],
  OVERDUE: ["PAID", "CANCELLED"],
  CANCELLED: [],
};

function isValidInvoiceTransition(from: string, to: string): boolean {
  return (VALID_INVOICE_TRANSITIONS[from] ?? []).includes(to);
}

describe("Invoice lifecycle transitions", () => {
  it("allows DRAFT -> ISSUED", () => {
    expect(isValidInvoiceTransition("DRAFT", "ISSUED")).toBe(true);
  });

  it("allows DRAFT -> CANCELLED", () => {
    expect(isValidInvoiceTransition("DRAFT", "CANCELLED")).toBe(true);
  });

  it("allows ISSUED -> PAID", () => {
    expect(isValidInvoiceTransition("ISSUED", "PAID")).toBe(true);
  });

  it("allows ISSUED -> OVERDUE", () => {
    expect(isValidInvoiceTransition("ISSUED", "OVERDUE")).toBe(true);
  });

  it("allows OVERDUE -> PAID", () => {
    expect(isValidInvoiceTransition("OVERDUE", "PAID")).toBe(true);
  });

  it("allows OVERDUE -> CANCELLED", () => {
    expect(isValidInvoiceTransition("OVERDUE", "CANCELLED")).toBe(true);
  });

  it("rejects PAID -> anything", () => {
    expect(isValidInvoiceTransition("PAID", "DRAFT")).toBe(false);
    expect(isValidInvoiceTransition("PAID", "CANCELLED")).toBe(false);
  });

  it("rejects CANCELLED -> anything", () => {
    expect(isValidInvoiceTransition("CANCELLED", "DRAFT")).toBe(false);
    expect(isValidInvoiceTransition("CANCELLED", "ISSUED")).toBe(false);
  });

  it("rejects skipping DRAFT", () => {
    expect(isValidInvoiceTransition("ISSUED", "DRAFT")).toBe(false);
  });
});
