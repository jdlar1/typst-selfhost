import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSuperuser, requireUser } from "./lib";

function createInviteToken(): string {
  return crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
}

async function hashToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperuser(ctx);
    return await ctx.db.query("invites").collect();
  },
});

export const create = mutation({
  args: {
    email: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("member")),
    workspaceId: v.optional(v.id("workspaces")),
    expiresInHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSuperuser(ctx);
    const token = createInviteToken();
    const now = Date.now();
    const expiresAt = now + (args.expiresInHours ?? 72) * 60 * 60 * 1000;
    await ctx.db.insert("invites", {
      tokenHash: await hashToken(token),
      email: args.email,
      role: args.role,
      workspaceId: args.workspaceId,
      invitedBy: userId,
      expiresAt,
      maxUses: 1,
      usedCount: 0,
      createdAt: now,
    });
    return { token, path: `/invite/${token}`, expiresAt };
  },
});

export const revoke = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, args) => {
    await requireSuperuser(ctx);
    await ctx.db.patch(args.inviteId, { revokedAt: Date.now() });
    return { ok: true };
  },
});

export const accept = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenHash = await hashToken(args.token);
    const invite = await ctx.db
      .query("invites")
      .withIndex("tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (
      !invite ||
      invite.revokedAt ||
      invite.expiresAt < Date.now() ||
      invite.usedCount >= invite.maxUses
    ) {
      throw new Error("Invite is invalid or expired");
    }
    const { userId } = await requireUser(ctx);
    await ctx.db.patch(userId, { role: invite.role });
    if (invite.workspaceId) {
      await ctx.db.insert("workspaceMembers", {
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
        createdAt: Date.now(),
      });
    }
    await ctx.db.patch(invite._id, {
      acceptedBy: userId,
      acceptedAt: Date.now(),
      usedCount: invite.usedCount + 1,
    });
    return { ok: true };
  },
});
