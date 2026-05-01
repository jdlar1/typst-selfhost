import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireWorkspaceMember } from "./lib";

export const commitSnapshot = mutation({
  args: { projectId: v.id("projects"), objectKey: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    const { userId } = await requireWorkspaceMember(ctx, project.workspaceId);
    return await ctx.db.insert("projectSnapshots", {
      workspaceId: project.workspaceId,
      projectId: args.projectId,
      objectKey: args.objectKey,
      entrypoint: project.entrypoint,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const enqueue = mutation({
  args: { projectId: v.id("projects"), snapshotId: v.id("projectSnapshots") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!project || !snapshot || snapshot.projectId !== args.projectId) {
      throw new Error("Project snapshot not found");
    }
    const { userId } = await requireWorkspaceMember(ctx, project.workspaceId);
    return await ctx.db.insert("renderJobs", {
      workspaceId: project.workspaceId,
      projectId: args.projectId,
      snapshotId: args.snapshotId,
      requestedBy: userId,
      status: "queued",
      outputFormat: "pdf",
      retryCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const listArtifacts = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    await requireWorkspaceMember(ctx, project.workspaceId);
    return await ctx.db
      .query("renderArtifacts")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const claimNext = mutation({
  args: { workerId: v.string() },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("renderJobs")
      .withIndex("status", (q) => q.eq("status", "queued"))
      .first();
    if (!job) {
      return null;
    }
    await ctx.db.patch(job._id, {
      status: "claimed",
      workerId: args.workerId,
      updatedAt: Date.now(),
    });
    return { ...job, status: "claimed" as const, workerId: args.workerId };
  },
});

export const markRunning = mutation({
  args: { renderJobId: v.id("renderJobs"), workerId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.renderJobId, {
      status: "running",
      workerId: args.workerId,
      updatedAt: Date.now(),
    });
  },
});

export const markSucceeded = mutation({
  args: {
    renderJobId: v.id("renderJobs"),
    objectKey: v.string(),
    format: v.union(v.literal("pdf"), v.literal("svg")),
    byteSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.renderJobId);
    if (!job) {
      throw new Error("Render job not found");
    }
    await ctx.db.insert("renderArtifacts", {
      workspaceId: job.workspaceId,
      projectId: job.projectId,
      renderJobId: args.renderJobId,
      objectKey: args.objectKey,
      format: args.format,
      byteSize: args.byteSize,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.renderJobId, { status: "succeeded", updatedAt: Date.now() });
  },
});

export const markFailed = mutation({
  args: {
    renderJobId: v.id("renderJobs"),
    failureReason: v.string(),
    diagnostics: v.optional(
      v.array(v.object({ severity: v.string(), message: v.string(), raw: v.string() })),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.renderJobId, {
      status: "failed",
      failureReason: args.failureReason,
      diagnostics: args.diagnostics,
      updatedAt: Date.now(),
    });
  },
});

export const mine = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.db
      .query("renderJobs")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});
