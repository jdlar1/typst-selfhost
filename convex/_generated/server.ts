// Temporary local stubs so `convex typecheck` can run before a deployment is configured.
// Running `convex dev` or `convex codegen` will replace these with generated bindings.
export { actionGeneric as action, mutationGeneric as mutation, queryGeneric as query } from "convex/server";
import type { GenericActionCtx, GenericMutationCtx, GenericQueryCtx } from "convex/server";

export type ActionCtx = GenericActionCtx<any>;
export type MutationCtx = GenericMutationCtx<any>;
export type QueryCtx = GenericQueryCtx<any>;
