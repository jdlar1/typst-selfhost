import { z } from "zod";
import { idSchema } from "./ids";

export const projectPathSchema = z
  .string()
  .min(1)
  .max(512)
  .refine((path) => !path.startsWith("/"), "Paths must be relative")
  .refine((path) => !path.includes(".."), "Paths cannot traverse parents")
  .refine((path) => !path.includes("//"), "Paths cannot contain empty segments");

export const projectFileSchema = z.object({
  id: idSchema,
  path: projectPathSchema,
  kind: z.enum(["text", "binary"]),
  content: z.string().optional(),
  objectKey: z.string().optional(),
  updatedAt: z.number(),
});

export const projectFolderSchema = z.object({
  id: idSchema,
  path: projectPathSchema,
  updatedAt: z.number(),
});

export const projectTreeSchema = z.object({
  entrypoint: projectPathSchema.default("main.typ"),
  folders: z.array(projectFolderSchema).default([]),
  files: z.array(projectFileSchema).min(1),
});

export type ProjectTree = z.infer<typeof projectTreeSchema>;

export function validateProjectTree(input: unknown): ProjectTree {
  const tree = projectTreeSchema.parse(input);
  const filePaths = new Set<string>();
  for (const file of tree.files) {
    if (filePaths.has(file.path)) {
      throw new Error(`Duplicate file path: ${file.path}`);
    }
    filePaths.add(file.path);
  }
  if (!filePaths.has(tree.entrypoint)) {
    throw new Error(`Entrypoint does not exist: ${tree.entrypoint}`);
  }
  return tree;
}

export function createDefaultProjectTree(now = Date.now()): ProjectTree {
  return {
    entrypoint: "main.typ",
    folders: [],
    files: [
      {
        id: "main",
        path: "main.typ",
        kind: "text",
        content: "= Hello from Typst Self-Host\n\nStart writing your document here.\n",
        updatedAt: now,
      },
    ],
  };
}
