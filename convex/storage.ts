"use node";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v } from "convex/values";
import { action } from "./_generated/server";

function s3Client() {
  return new S3Client({
    endpoint: process.env.RUSTFS_ENDPOINT,
    forcePathStyle: true,
    region: process.env.RUSTFS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.RUSTFS_ACCESS_KEY ?? "",
      secretAccessKey: process.env.RUSTFS_SECRET_KEY ?? "",
    },
  });
}

export const createUploadUrl = action({
  args: { objectKey: v.string(), contentType: v.optional(v.string()) },
  handler: async (_, args) => {
    const command = new PutObjectCommand({
      Bucket: process.env.RUSTFS_BUCKET,
      Key: args.objectKey,
      ContentType: args.contentType ?? "application/octet-stream",
    });
    return await getSignedUrl(s3Client(), command, { expiresIn: 15 * 60 });
  },
});

export const createDownloadUrl = action({
  args: { objectKey: v.string() },
  handler: async (_, args) => {
    const command = new GetObjectCommand({
      Bucket: process.env.RUSTFS_BUCKET,
      Key: args.objectKey,
    });
    return await getSignedUrl(s3Client(), command, { expiresIn: 15 * 60 });
  },
});
