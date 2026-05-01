import { Effect, Layer } from "effect";
import { ConfigLive, ObjectStorageLive, TypstCliLive } from "./live";
import { runOneRenderJob } from "./runner";
import { RenderJobs } from "./services";

const NotImplementedJobs = Layer.succeed(RenderJobs, {
  claimNext: () => Effect.succeed(null),
  markRunning: () => Effect.void,
  markSucceeded: () => Effect.void,
  markFailed: () => Effect.void,
});

const Live = Layer.mergeAll(ConfigLive, NotImplementedJobs, ObjectStorageLive, TypstCliLive);

Effect.runPromise(runOneRenderJob.pipe(Effect.provide(Live))).then((result) => {
  console.log(JSON.stringify(result));
});
