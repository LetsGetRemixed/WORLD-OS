import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbOrNull } from '@/lib/firebase.admin';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const adminDb = getAdminDbOrNull();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Query for node with matching slug
    const snapshot = await adminDb
      .collection('nodes')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const node = { id: doc.id, ...doc.data() };

    return NextResponse.json(node);
  } catch (error: any) {
    console.error('Error fetching public node:', error);
    return NextResponse.json(
      { error: 'Failed to fetch node' },
      { status: 500 }
    );
  }
}
