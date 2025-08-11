import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getNodeById, updateNode } from '@/lib/firestore.nodes';
import { getAdminDbOrNull } from '@/lib/firebase.admin';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const adminDb = getAdminDbOrNull();
    if (adminDb) {
      const d = await adminDb.collection('nodes').doc(params.id).get();
      const node = d.exists ? { id: d.id, ...(d.data() as any) } : null;
      if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(node);
    }
    const node = await getNodeById(params.id);
    if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(node);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to get node' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const adminDb = getAdminDbOrNull();
    if (adminDb) {
      const d = await adminDb.collection('nodes').doc(params.id).get();
      if (!d.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const merged = { id: params.id, ...(d.data() as any), ...body, updatedAt: Date.now() };
      await adminDb.collection('nodes').doc(params.id).set(merged);
      return NextResponse.json(merged);
    }
    const node = await updateNode(params.id, body);
    return NextResponse.json(node);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to update node' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const adminDb = getAdminDbOrNull();
    if (adminDb) {
      await adminDb.collection('nodes').doc(params.id).delete();
      return NextResponse.json({ ok: true });
    }
    await deleteDoc(doc(collection(db, 'nodes'), params.id));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to delete node' }, { status: 400 });
  }
}


