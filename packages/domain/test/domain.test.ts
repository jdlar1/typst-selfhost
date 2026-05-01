import { describe, expect, it } from "vitest";
import {
  assertRenderJobTransition,
  createDefaultProjectTree,
  parseTypstDiagnostics,
  projectSnapshotKey,
  renderArtifactKey,
  validateProjectTree,
} from "../src";

describe("object keys", () => {
  it("builds snapshot keys", () => {
    expect(projectSnapshotKey({ workspaceId: "w1", projectId: "p1", snapshotId: "s1" })).toBe(
      "workspaces/w1/projects/p1/snapshots/s1/tree.json",
    );
  });

  it("builds render artifact keys", () => {
    expect(
      renderArtifactKey({ workspaceId: "w1", projectId: "p1", renderId: "r1", format: "pdf" }),
    ).toBe("workspaces/w1/projects/p1/renders/r1/output.pdf");
  });
});

describe("render job transitions", () => {
  it("allows the happy path", () => {
    expect(() => assertRenderJobTransition("queued", "claimed")).not.toThrow();
    expect(() => assertRenderJobTransition("claimed", "running")).not.toThrow();
    expect(() => assertRenderJobTransition("running", "succeeded")).not.toThrow();
  });

  it("rejects invalid transitions", () => {
    expect(() => assertRenderJobTransition("queued", "succeeded")).toThrow();
  });
});

describe("project tree", () => {
  it("creates a valid default project", () => {
    expect(validateProjectTree(createDefaultProjectTree()).entrypoint).toBe("main.typ");
  });

  it("requires the entrypoint to exist", () => {
    expect(() => validateProjectTree({ entrypoint: "missing.typ", files: [] })).toThrow();
  });
});

describe("typst diagnostics", () => {
  it("parses stderr diagnostics", () => {
    expect(parseTypstDiagnostics("error: unknown variable\nhelp: ignored")).toEqual([
      { severity: "error", message: "unknown variable", raw: "error: unknown variable" },
    ]);
  });
});
