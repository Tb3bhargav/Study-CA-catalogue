import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Question } from "./types";
import { filterQuestions, ensureSearchIndex } from "./questions";

let qs: Question[] = [];
beforeAll(() => {
  const p = path.resolve("public/data/questions.json");
  qs = JSON.parse(fs.readFileSync(p, "utf-8"));
  ensureSearchIndex(qs);
});

describe("filter + search (real dataset)", () => {
  it("search Depreciation returns multiple attempts", () => {
    const r = filterQuestions(qs, { subject: null, attempt: null, chapter: null, source: null, searchQuery: "Depreciation" });
    expect(r.length).toBeGreaterThan(1);
    expect(new Set(r.map((x) => x.attempt)).size).toBeGreaterThan(1);
  });
  it("Cost + Material Cost + All Attempts returns >0 and All Sources inclusive", () => {
    const r = filterQuestions(qs, { subject: "Cost and Management Accounting", attempt: null, chapter: "Material Cost", source: null, searchQuery: "" });
    expect(r.length).toBeGreaterThan(0);
  });
  it("narrow with RTP yields 0 (source authoritative)", () => {
    const r = filterQuestions(qs, { subject: "Cost and Management Accounting", attempt: "May 2024", chapter: "Material Cost", source: "RTP", searchQuery: "" });
    expect(r.length).toBe(0);
  });
  it("search marginal costing via derived chapter returns hits", () => {
    const r = filterQuestions(qs, { subject: null, attempt: null, chapter: null, source: null, searchQuery: "marginal costing" });
    expect(r.length).toBeGreaterThan(0);
  });
  it("preserve valid selections: chapter cleared only when invalid", async () => {
    const { getChaptersForSubject } = await import("./chapters");
    const allowed = getChaptersForSubject("Cost and Management Accounting");
    expect(allowed).toContain("Material Cost");
    const notAllowed = getChaptersForSubject("Auditing and Ethics");
    expect(notAllowed).not.toContain("Material Cost");
  });
});
