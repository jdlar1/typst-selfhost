import { parseTypstDiagnostics, renderArtifactKey } from "@typst-selfhost/domain";
import { Effect } from "effect";
import { ObjectStorage, RenderJobs, TypstCli, WorkerConfig } from "./services";

export const runOneRenderJob = Effect.gen(function* () {
  const config = yield* WorkerConfig;
  const jobs = yield* RenderJobs;
  const storage = yield* ObjectStorage;
  const typst = yield* TypstCli;

  const job = yield* jobs.claimNext(config.workerId);
  if (job === null) {
    return { status: "idle" as const };
  }

  yield* jobs.markRunning(job.id, config.workerId);

  const artifactObjectKey = renderArtifactKey({
    workspaceId: job.workspaceId,
    projectId: job.projectId,
    renderId: job.id,
    format: "pdf",
  });

  const program = Effect.gen(function* () {
    const snapshot = yield* storage.download(job.snapshotObjectKey);
    const result = yield* typst
      .renderPdf(snapshot)
      .pipe(Effect.timeout(`${config.renderTimeoutMs} millis`));
    yield* storage.upload(artifactObjectKey, result.pdf, "application/pdf");
    yield* jobs.markSucceeded(job.id, artifactObjectKey, result.pdf.byteLength);
    return { status: "rendered" as const, jobId: job.id, artifactObjectKey };
  });

  return yield* program.pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        const reason = error instanceof Error ? error.message : String(error);
        yield* jobs.markFailed(job.id, reason, parseTypstDiagnostics(reason));
        return { status: "failed" as const, jobId: job.id, reason };
      }),
    ),
  );
});
