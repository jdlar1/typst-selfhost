import { Effect, Layer } from "effect";
import { runOneRenderJob } from "./runner";
import { ObjectStorage, RenderJobs, TypstCli, WorkerConfig } from "./services";

const ConfigLive = Layer.succeed(WorkerConfig, {
  workerId: process.env.WORKER_ID ?? "worker-dev",
  renderTimeoutMs: Number(process.env.WORKER_RENDER_TIMEOUT_MS ?? "30000"),
});

const NotImplementedJobs = Layer.succeed(RenderJobs, {
  claimNext: () => Effect.succeed(null),
  markRunning: () => Effect.void,
  markSucceeded: () => Effect.void,
  markFailed: () => Effect.void,
});

const NotImplementedStorage = Layer.succeed(ObjectStorage, {
  download: () => Effect.fail(new Error("Live RustFS adapter is not wired yet")),
  upload: () => Effect.void,
});

const NotImplementedTypst = Layer.succeed(TypstCli, {
  renderPdf: () => Effect.fail(new Error("Live Typst CLI adapter is not wired yet")),
});

const Live = Layer.mergeAll(
  ConfigLive,
  NotImplementedJobs,
  NotImplementedStorage,
  NotImplementedTypst,
);

Effect.runPromise(runOneRenderJob.pipe(Effect.provide(Live))).then((result) => {
  console.log(JSON.stringify(result));
});
