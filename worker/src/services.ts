import { Context, type Effect } from "effect";

export type ClaimedRenderJob = {
  id: string;
  workspaceId: string;
  projectId: string;
  snapshotId: string;
  snapshotObjectKey: string;
};

export type TypstRenderResult = {
  pdf: Uint8Array;
  stderr: string;
};

export class WorkerConfig extends Context.Tag("WorkerConfig")<
  WorkerConfig,
  {
    readonly workerId: string;
    readonly renderTimeoutMs: number;
  }
>() {}

export class RenderJobs extends Context.Tag("RenderJobs")<
  RenderJobs,
  {
    readonly claimNext: (workerId: string) => Effect.Effect<ClaimedRenderJob | null, unknown>;
    readonly markRunning: (jobId: string, workerId: string) => Effect.Effect<void, unknown>;
    readonly markSucceeded: (
      jobId: string,
      artifactObjectKey: string,
      byteSize: number,
    ) => Effect.Effect<void, unknown>;
    readonly markFailed: (
      jobId: string,
      reason: string,
      diagnostics: unknown[],
    ) => Effect.Effect<void, unknown>;
  }
>() {}

export class ObjectStorage extends Context.Tag("ObjectStorage")<
  ObjectStorage,
  {
    readonly download: (objectKey: string) => Effect.Effect<Uint8Array, unknown>;
    readonly upload: (
      objectKey: string,
      bytes: Uint8Array,
      contentType: string,
    ) => Effect.Effect<void, unknown>;
  }
>() {}

export class TypstCli extends Context.Tag("TypstCli")<
  TypstCli,
  {
    readonly renderPdf: (snapshot: Uint8Array) => Effect.Effect<TypstRenderResult, unknown>;
  }
>() {}
