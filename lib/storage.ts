import { storage } from './firebase.client';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getAdminBucketOrNull } from './firebase.admin';

export async function uploadBuffer(path: string, buffer: Buffer, contentType: string): Promise<string> {
  // Try client SDK first
  try {
    const r = ref(storage, path);
    const metadata = { contentType };
    const uint8 = new Uint8Array(buffer);
    const blob = new Blob([uint8], { type: contentType });
    await uploadBytes(r, blob, metadata as any);
    return await getDownloadURL(r);
  } catch (clientError) {
    console.log('Client SDK upload failed, trying Admin SDK:', clientError.message);
    
    // Fallback to Firebase Admin
    const adminBucket = getAdminBucketOrNull();
    if (adminBucket) {
      try {
        const file = adminBucket.file(path);
        await file.save(buffer, { contentType, resumable: false, public: true });
        // Construct Firebase Storage URL
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (bucketName && bucketName.includes('firebasestorage.app')) {
          return `https://${bucketName}/${path}`;
        } else {
          const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
          return `https://storage.googleapis.com/${projectId}.appspot.com/${path}`;
        }
      } catch (adminError) {
        console.error('Admin SDK upload also failed:', adminError.message);
        throw new Error(`Upload failed: Client SDK: ${clientError.message}, Admin SDK: ${adminError.message}`);
      }
    } else {
      throw clientError;
    }
  }
}

export async function downloadAndUploadImage(openaiUrl: string, path: string): Promise<string> {
  // Download the image from OpenAI
  const response = await fetch(openaiUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Upload to Firebase Storage
  return await uploadBuffer(path, buffer, 'image/png');
}
