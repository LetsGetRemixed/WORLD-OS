import 'server-only';
import admin from 'firebase-admin';
import fs from 'node:fs';

let initialized = false;

function loadServiceAccountJson(): string | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson && rawJson.trim()) return rawJson;
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (b64 && b64.trim()) {
    try {
      return Buffer.from(b64, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    try {
      return fs.readFileSync(path, 'utf8');
    } catch {
      return null;
    }
  }
  return null;
}

export function ensureAdminApp(): admin.app.App | null {
  if (initialized) return admin.apps[0] ?? null;
  const json = loadServiceAccountJson();
  if (!json) return null;
  const creds = JSON.parse(json);
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${creds.project_id}.appspot.com`;
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: creds.project_id,
        clientEmail: creds.client_email,
        privateKey: String(creds.private_key).replace(/\\n/g, '\n'),
      }),
      storageBucket: bucket,
    });
  }
  initialized = true;
  return admin.apps[0] ?? null;
}

export function getAdminDbOrNull(): admin.firestore.Firestore | null {
  const app = ensureAdminApp();
  return app ? admin.firestore(app) : null;
}

export function getAdminBucketOrNull(): import('@google-cloud/storage').Bucket | null {
  const app = ensureAdminApp();
  return app ? (admin.storage(app).bucket() as any) : null;
}
