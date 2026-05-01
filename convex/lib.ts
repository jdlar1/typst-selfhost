import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireUser(ctx: Ctx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("Authenticated user not found");
  }
  return { userId, user };
}

export async function requireSuperuser(ctx: Ctx) {
  const session = await requireUser(ctx);
  if (session.user.role !== "superuser") {
    throw new Error("Superuser access required");
  }
  return session;
}

export async function isSetupComplete(ctx: Ctx): Promise<boolean> {
  const setting = await ctx.db
    .query("settings")
    .withIndex("key", (q) => q.eq("key", "setupComplete"))
    .unique();
  return setting?.value === true;
}

export async function requireWorkspaceMember(ctx: Ctx, workspaceId: string) {
  const session = await requireUser(ctx);
  if (session.user.role === "superuser") {
    return session;
  }
  const membership = await ctx.db
    .query("workspaceMembers")
    .withIndex("userId", (q) => q.eq("userId", session.userId))
    .filter((q) => q.eq(q.field("workspaceId"), workspaceId))
    .first();
  if (!membership) {
    throw new Error("Workspace access denied");
  }
  return session;
}
