import { idSchema } from "./ids";

const safePathSegment = /^[a-zA-Z0-9._ -]+$/;

export function projectSnapshotKey(input: {
  workspaceId: string;
  projectId: string;
  snapshotId: string;
}): string {
  const workspaceId = idSchema.parse(input.workspaceId);
  const projectId = idSchema.parse(input.projectId);
  const snapshotId = idSchema.parse(input.snapshotId);
  return `workspaces/${workspaceId}/projects/${projectId}/snapshots/${snapshotId}/tree.json`;
}

export function projectFileSnapshotKey(input: {
  workspaceId: string;
  projectId: string;
  snapshotId: string;
  fileId: string;
}): string {
  const workspaceId = idSchema.parse(input.workspaceId);
  const projectId = idSchema.parse(input.projectId);
  const snapshotId = idSchema.parse(input.snapshotId);
  const fileId = idSchema.parse(input.fileId);
  return `workspaces/${workspaceId}/projects/${projectId}/snapshots/${snapshotId}/files/${fileId}`;
}

export function projectAssetKey(input: {
  workspaceId: string;
  projectId: string;
  assetId: string;
  filename: string;
}): string {
  const workspaceId = idSchema.parse(input.workspaceId);
  const projectId = idSchema.parse(input.projectId);
  const assetId = idSchema.parse(input.assetId);
  const filename = parseSafeFilename(input.filename);
  return `workspaces/${workspaceId}/projects/${projectId}/assets/${assetId}/${filename}`;
}

export function renderArtifactKey(input: {
  workspaceId: string;
  projectId: string;
  renderId: string;
  format: "pdf" | "svg";
}): string {
  const workspaceId = idSchema.parse(input.workspaceId);
  const projectId = idSchema.parse(input.projectId);
  const renderId = idSchema.parse(input.renderId);
  return `workspaces/${workspaceId}/projects/${projectId}/renders/${renderId}/output.${input.format}`;
}

function parseSafeFilename(filename: string): string {
  if (filename.includes("/") || filename.includes("\\") || filename === "..") {
    throw new Error("Filename cannot contain path separators");
  }
  if (!safePathSegment.test(filename)) {
    throw new Error("Filename contains unsupported characters");
  }
  return filename;
}
