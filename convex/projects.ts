import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireWorkspaceMember } from "./lib";

export const createWorkspace = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const now = Date.now();
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId,
      role: "admin",
      createdAt: now,
    });
    return workspaceId;
  },
});

export const listWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const { userId, user } = await requireUser(ctx);
    if (user.role === "superuser") {
      return await ctx.db.query("workspaces").collect();
    }
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    return await Promise.all(memberships.map((member) => ctx.db.get(member.workspaceId)));
  },
});

export const createProject = mutation({
  args: { workspaceId: v.id("workspaces"), name: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await requireWorkspaceMember(ctx, args.workspaceId);
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      workspaceId: args.workspaceId,
      name: args.name,
      entrypoint: "main.typ",
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("projectFiles", {
      workspaceId: args.workspaceId,
      projectId,
      path: "main.typ",
      kind: "text",
      content: "= Hello from Typst Self-Host\n\nStart writing your document here.\n",
      createdAt: now,
      updatedAt: now,
    });
    return projectId;
  },
});

export const listProjects = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireWorkspaceMember(ctx, args.workspaceId);
    return await ctx.db
      .query("projects")
      .withIndex("workspaceId", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    await requireWorkspaceMember(ctx, project.workspaceId);
    const files = await ctx.db
      .query("projectFiles")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
    return { project, files };
  },
});

export const upsertFile = mutation({
  args: {
    projectId: v.id("projects"),
    path: v.string(),
    kind: v.union(v.literal("folder"), v.literal("text"), v.literal("binary")),
    content: v.optional(v.string()),
    objectKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    await requireWorkspaceMember(ctx, project.workspaceId);
    const now = Date.now();
    const existing = await ctx.db
      .query("projectFiles")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("path"), args.path))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        kind: args.kind,
        content: args.content,
        objectKey: args.objectKey,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("projectFiles", {
      workspaceId: project.workspaceId,
      projectId: args.projectId,
      path: args.path,
      kind: args.kind,
      content: args.content,
      objectKey: args.objectKey,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("projectFiles") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      return { ok: true };
    }
    await requireWorkspaceMember(ctx, file.workspaceId);
    await ctx.db.delete(args.fileId);
    return { ok: true };
  },
});
