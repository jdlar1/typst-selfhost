import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isSetupComplete, requireUser } from "./lib";

export const status = query({
  args: {},
  handler: async (ctx) => ({ setupComplete: await isSetupComplete(ctx) }),
});

export const complete = mutation({
  args: { setupToken: v.string() },
  handler: async (ctx, args) => {
    if (await isSetupComplete(ctx)) {
      throw new Error("Setup is already complete");
    }
    const expectedToken = process.env.INITIAL_SETUP_TOKEN;
    if (!expectedToken || expectedToken === "change-me-before-first-boot") {
      throw new Error("INITIAL_SETUP_TOKEN must be configured before setup");
    }
    if (args.setupToken !== expectedToken) {
      throw new Error("Invalid setup token");
    }

    const { userId } = await requireUser(ctx);
    const now = Date.now();
    await ctx.db.patch(userId, { role: "superuser", setupSuperuser: true });
    await ctx.db.insert("settings", { key: "setupComplete", value: true, updatedAt: now });
    await ctx.db.insert("settings", { key: "publicSignupEnabled", value: false, updatedAt: now });
    return { ok: true };
  },
});
