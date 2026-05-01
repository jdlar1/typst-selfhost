import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { runOneRenderJob } from "../src/runner";
import { ObjectStorage, RenderJobs, TypstCli, WorkerConfig } from "../src/services";

const ConfigTest = Layer.succeed(WorkerConfig, { workerId: "test-worker", renderTimeoutMs: 1000 });

describe("worker render runner", () => {
  it("renders and records success", async () => {
    const events: string[] = [];
    const JobsTest = Layer.succeed(RenderJobs, {
      claimNext: () =>
        Effect.succeed({
          id: "r1",
          workspaceId: "w1",
          projectId: "p1",
          snapshotId: "s1",
          snapshotObjectKey: "snapshot/tree.json",
        }),
      markRunning: () => Effect.sync(() => events.push("running")),
      markSucceeded: () => Effect.sync(() => events.push("succeeded")),
      markFailed: () => Effect.sync(() => events.push("failed")),
    });
    const StorageTest = Layer.succeed(ObjectStorage, {
      download: () => Effect.succeed(new TextEncoder().encode("{}")),
      upload: () => Effect.sync(() => events.push("uploaded")),
    });
    const TypstTest = Layer.succeed(TypstCli, {
      renderPdf: () => Effect.succeed({ pdf: new Uint8Array([1, 2, 3]), stderr: "" }),
    });

    const result = await Effect.runPromise(
      runOneRenderJob.pipe(
        Effect.provide(Layer.mergeAll(ConfigTest, JobsTest, StorageTest, TypstTest)),
      ),
    );

    expect(result.status).toBe("rendered");
    expect(events).toEqual(["running", "uploaded", "succeeded"]);
  });

  it("records failure diagnostics", async () => {
    const events: string[] = [];
    const JobsTest = Layer.succeed(RenderJobs, {
      claimNext: () =>
        Effect.succeed({
          id: "r1",
          workspaceId: "w1",
          projectId: "p1",
          snapshotId: "s1",
          snapshotObjectKey: "snapshot/tree.json",
        }),
      markRunning: () => Effect.sync(() => events.push("running")),
      markSucceeded: () => Effect.sync(() => events.push("succeeded")),
      markFailed: () => Effect.sync(() => events.push("failed")),
    });
    const StorageTest = Layer.succeed(ObjectStorage, {
      download: () => Effect.fail(new Error("error: missing input")),
      upload: () => Effect.void,
    });
    const TypstTest = Layer.succeed(TypstCli, {
      renderPdf: () => Effect.succeed({ pdf: new Uint8Array(), stderr: "" }),
    });

    const result = await Effect.runPromise(
      runOneRenderJob.pipe(
        Effect.provide(Layer.mergeAll(ConfigTest, JobsTest, StorageTest, TypstTest)),
      ),
    );

    expect(result.status).toBe("failed");
    expect(events).toEqual(["running", "failed"]);
  });
});
