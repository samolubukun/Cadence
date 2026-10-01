import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

const s3Endpoint = env.S3_ENDPOINT 
  ? env.S3_ENDPOINT
  : env.R2_ACCOUNT_ID 
    ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined;

const accessKeyId = env.S3_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = env.S3_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY || "";
const bucketName = env.S3_BUCKET_NAME || env.R2_BUCKET_NAME || "cadence";
const forcePathStyle = env.S3_FORCE_PATH_STYLE === "true" || !!env.S3_ENDPOINT;

const s3Client = new S3Client({
  region: env.S3_REGION || "auto",
  endpoint: s3Endpoint,
  forcePathStyle,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

type UploadAudioOptions = {
  buffer: Buffer;
  key: string;
  contentType?: string;
};

export async function uploadAudio({
  buffer,
  key,
  contentType = "audio/wav",
}: UploadAudioOptions): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
};

export async function deleteAudio(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
};

export async function getSignedAudioUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
};
