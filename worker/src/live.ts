import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, normalize, relative } from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { validateProjectTree } from "@typst-selfhost/domain";
import { Effect, Layer } from "effect";
import { ObjectStorage, TypstCli, type TypstRenderResult, WorkerConfig } from "./services";

type S3Config = {
  readonly endpoint: string;
  readonly region: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly bucket: string;
};

export const ConfigLive = Layer.succeed(WorkerConfig, {
  workerId: process.env.WORKER_ID ?? "worker-dev",
  renderTimeoutMs: Number(process.env.WORKER_RENDER_TIMEOUT_MS ?? "30000"),
});

export const ObjectStorageLive = Layer.succeed(ObjectStorage, createObjectStorage());

export const TypstCliLive = Layer.succeed(TypstCli, {
  renderPdf: renderProjectSnapshotPdf,
});

function createObjectStorage() {
  const config = readS3Config();
  const client = new S3Client({
    endpoint: config.endpoint,
    forcePathStyle: true,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return {
    download: (objectKey: string) =>
      Effect.tryPromise({
        try: async () => {
          const response = await client.send(
            new GetObjectCommand({ Bucket: config.bucket, Key: objectKey }),
          );
          if (!response.Body) {
            throw new Error(`Object has no body: ${objectKey}`);
          }
          return response.Body.transformToByteArray();
        },
        catch: (error) => error,
      }),
    upload: (objectKey: string, bytes: Uint8Array, contentType: string) =>
      Effect.tryPromise({
        try: async () => {
          await client.send(
            new PutObjectCommand({
              Bucket: config.bucket,
              Key: objectKey,
              Body: bytes,
              ContentType: contentType,
            }),
          );
        },
        catch: (error) => error,
      }),
  };
}

function readS3Config(): S3Config {
  return {
    endpoint: requireEnv("RUSTFS_ENDPOINT"),
    region: process.env.RUSTFS_REGION ?? "us-east-1",
    accessKeyId: requireEnv("RUSTFS_ACCESS_KEY"),
    secretAccessKey: requireEnv("RUSTFS_SECRET_KEY"),
    bucket: requireEnv("RUSTFS_BUCKET"),
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function renderProjectSnapshotPdf(snapshot: Uint8Array): Effect.Effect<TypstRenderResult, unknown> {
  return Effect.tryPromise({
    try: async () => {
      const tree = validateProjectTree(JSON.parse(new TextDecoder().decode(snapshot)));
      const root = await mkdtemp(join(tmpdir(), "typst-selfhost-"));
      const outputPath = join(root, "output.pdf");

      try {
        for (const folder of tree.folders) {
          await mkdir(safeProjectPath(root, folder.path), { recursive: true });
        }

        for (const file of tree.files) {
          if (file.kind !== "text") {
            throw new Error(`Binary snapshot file is not available to the worker: ${file.path}`);
          }
          const filePath = safeProjectPath(root, file.path);
          await mkdir(dirname(filePath), { recursive: true });
          await writeFile(filePath, file.content ?? "", "utf8");
        }

        const result = await execTypstCompile(root, tree.entrypoint, outputPath);
        const pdf = await readFile(outputPath);
        return { pdf: new Uint8Array(pdf), stderr: result.stderr };
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
    catch: (error) => error,
  });
}

function safeProjectPath(root: string, projectPath: string): string {
  const target = normalize(join(root, projectPath));
  const relativePath = relative(root, target);
  if (relativePath.startsWith("..") || relativePath === "") {
    throw new Error(`Invalid project path: ${projectPath}`);
  }
  return target;
}

function execTypstCompile(
  cwd: string,
  entrypoint: string,
  outputPath: string,
): Promise<{ stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(
      process.env.TYPST_BIN ?? "typst",
      ["compile", entrypoint, outputPath],
      { cwd, maxBuffer: 1024 * 1024 * 4 },
      (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolve({ stderr });
      },
    );
  });
}
