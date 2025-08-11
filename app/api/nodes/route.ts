import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { createNode } from '@/lib/firestore.nodes';
import { getAdminDbOrNull } from '@/lib/firebase.admin';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminDb = getAdminDbOrNull();
    if (adminDb) {
      const id = body.id || crypto.randomUUID();
      const node = { ...body, id, updatedAt: Date.now(), createdAt: body.createdAt ?? Date.now() };
      await adminDb.collection('nodes').doc(id).set(node);
      return NextResponse.json(node, { status: 201 });
    }
    const node = await createNode(body);
    return NextResponse.json(node, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to create node' }, { status: 400 });
  }
}

export async function GET() {
  try {
    const adminDb = getAdminDbOrNull();
    if (adminDb) {
      const snap = await adminDb.collection('nodes').get();
      const nodes = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      return NextResponse.json(nodes);
    }
    // Fallback to client SDK in server (works in Node runtime)
    const snap = await getDocs(collection(db, 'nodes'));
    const nodes = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    return NextResponse.json(nodes);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to list nodes' }, { status: 400 });
  }
}


