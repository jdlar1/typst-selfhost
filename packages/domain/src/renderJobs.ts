import { z } from "zod";

export const renderJobStatusSchema = z.enum([
  "queued",
  "claimed",
  "running",
  "succeeded",
  "failed",
  "cancelled",
]);

export type RenderJobStatus = z.infer<typeof renderJobStatusSchema>;

const allowedTransitions: Record<RenderJobStatus, ReadonlySet<RenderJobStatus>> = {
  queued: new Set(["claimed", "cancelled"]),
  claimed: new Set(["running", "failed"]),
  running: new Set(["succeeded", "failed"]),
  succeeded: new Set(),
  failed: new Set(),
  cancelled: new Set(),
};

export function canTransitionRenderJob(from: RenderJobStatus, to: RenderJobStatus): boolean {
  return allowedTransitions[from].has(to);
}

export function assertRenderJobTransition(from: RenderJobStatus, to: RenderJobStatus): void {
  if (!canTransitionRenderJob(from, to)) {
    throw new Error(`Invalid render job transition: ${from} -> ${to}`);
  }
}
