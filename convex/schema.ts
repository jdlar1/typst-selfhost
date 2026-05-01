import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("superuser"), v.literal("admin"), v.literal("member"))),
    setupSuperuser: v.optional(v.boolean()),
  }).index("email", ["email"]),
  settings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  }).index("key", ["key"]),
  invites: defineTable({
    tokenHash: v.string(),
    email: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("member")),
    workspaceId: v.optional(v.id("workspaces")),
    invitedBy: v.id("users"),
    expiresAt: v.number(),
    maxUses: v.number(),
    usedCount: v.number(),
    revokedAt: v.optional(v.number()),
    acceptedBy: v.optional(v.id("users")),
    acceptedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("tokenHash", ["tokenHash"])
    .index("invitedBy", ["invitedBy"]),
  workspaces: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("createdBy", ["createdBy"]),
  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    createdAt: v.number(),
  })
    .index("workspaceId", ["workspaceId"])
    .index("userId", ["userId"])
    .index("workspaceUser", ["workspaceId", "userId"]),
  projects: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    entrypoint: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("workspaceId", ["workspaceId"])
    .index("createdBy", ["createdBy"]),
  projectFiles: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    parentPath: v.optional(v.string()),
    path: v.string(),
    kind: v.union(v.literal("folder"), v.literal("text"), v.literal("binary")),
    content: v.optional(v.string()),
    objectKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("projectId", ["projectId"])
    .index("projectPath", ["projectId", "path"]),
  projectSnapshots: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    objectKey: v.string(),
    entrypoint: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("projectId", ["projectId"])
    .index("createdBy", ["createdBy"]),
  renderJobs: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    snapshotId: v.id("projectSnapshots"),
    requestedBy: v.id("users"),
    status: v.union(
      v.literal("queued"),
      v.literal("claimed"),
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    outputFormat: v.union(v.literal("pdf"), v.literal("svg")),
    diagnostics: v.optional(
      v.array(v.object({ severity: v.string(), message: v.string(), raw: v.string() })),
    ),
    workerId: v.optional(v.string()),
    retryCount: v.number(),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("status", ["status"])
    .index("projectId", ["projectId"]),
  renderArtifacts: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    renderJobId: v.id("renderJobs"),
    objectKey: v.string(),
    format: v.union(v.literal("pdf"), v.literal("svg")),
    byteSize: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("renderJobId", ["renderJobId"])
    .index("projectId", ["projectId"]),
  activityEvents: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    actorId: v.optional(v.id("users")),
    type: v.string(),
    message: v.string(),
    createdAt: v.number(),
  })
    .index("workspaceId", ["workspaceId"])
    .index("projectId", ["projectId"]),
});
