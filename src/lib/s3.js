import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

export async function uploadFileToS3(file, fileName, contentType) {
  try {
    const key = `nsutstats/${fileName}`;

    // Support passing either a Buffer or a Blob/File-like object
    let body = file;
    let resolvedContentType = contentType;
    if (typeof Blob !== 'undefined' && file instanceof Blob) {
      const bytes = await file.arrayBuffer();
      body = Buffer.from(bytes);
      resolvedContentType = contentType || file.type || 'application/octet-stream';
    } else if (!Buffer.isBuffer(file)) {
      // Fallback: if it's not a Buffer or Blob, try to create a Buffer
      body = Buffer.from(file);
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: resolvedContentType || 'application/octet-stream',
      ACL: 'public-read',
    });

    await s3Client.send(command);

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

export async function deleteFileFromS3(fileName) {
  try {
    const key = `nsutstats/${fileName}`;
    
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}

export function generateFileName(originalName) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
}

// Upload inline images (for pasted/inserted editor images) into attachments/inline-images/
export async function uploadInlineImageToS3(file, imageId) {
  try {
    const sanitizedOriginal = (file?.name || 'image').replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `attachments/inline-images/${imageId}-${sanitizedOriginal}`;

    const fileUrl = await uploadFileToS3(file, fileName, file?.type || 'application/octet-stream');

    return {
      imageId,
      fileName,
      originalName: file?.name || 'image',
      fileUrl,
      fileSize: file?.size ?? 0,
      fileType: file?.type || 'application/octet-stream',
    };
  } catch (error) {
    console.error('Inline image S3 upload error:', error);
    throw error;
  }
}
