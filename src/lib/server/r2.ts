import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
    if (!s3Client) {
        const accountId = env.R2_ACCOUNT_ID;
        const accessKeyId = env.R2_ACCESS_KEY_ID;
        const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

        if (!accountId || !accessKeyId || !secretAccessKey) {
            throw new Error('R2 credentials not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.');
        }

        s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    return s3Client;
}

/**
 * Uploads an audio file to Cloudflare R2 storage.
 * @param buffer - The audio file buffer to upload
 * @param key - The object key (path) in the bucket
 * @param contentType - The MIME type of the file (e.g., 'audio/mpeg')
 * @returns The public URL of the uploaded file
 */
export async function uploadAudio(
    buffer: Buffer,
    key: string,
    contentType: string = 'audio/mpeg'
): Promise<string> {
    const bucketName = env.R2_BUCKET_NAME;
    const publicDomain = env.R2_PUBLIC_DOMAIN;

    if (!bucketName) {
        throw new Error('R2_BUCKET_NAME is not configured.');
    }

    if (!publicDomain) {
        throw new Error('R2_PUBLIC_DOMAIN is not configured.');
    }

    const client = getS3Client();

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await client.send(command);

    // Construct the public URL
    const normalizedDomain = publicDomain.replace(/\/$/, '');
    const normalizedKey = key.replace(/^\//, '');
    
    return `${normalizedDomain}/${normalizedKey}`;
}
