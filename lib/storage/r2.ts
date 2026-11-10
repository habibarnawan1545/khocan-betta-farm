import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicDomain = process.env.R2_PUBLIC_DOMAIN;

export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucketName);
}

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null;

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
}

/**
 * Uploads a file buffer to Cloudflare R2
 * @param buffer File buffer
 * @param fileName Target filename
 * @param contentType MIME type (e.g., image/webp, image/jpeg)
 * @returns Public URL of the uploaded image
 */
export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  if (!client || !bucketName) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const safeKey = `betta-fish/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: safeKey,
      Body: buffer,
      ContentType: contentType,
    })
  );

  if (publicDomain) {
    const cleanDomain = publicDomain.replace(/\/+$/, '');
    return `${cleanDomain}/${safeKey}`;
  }

  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${safeKey}`;
}
