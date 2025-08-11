import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbOrNull } from '@/lib/firebase.admin';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;
    
    const adminDb = getAdminDbOrNull();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get node by ID
    const doc = await adminDb.collection('nodes').doc(nodeId).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    const nodeData = doc.data();
    const assets = nodeData?.assets || [];

    return NextResponse.json(assets);
  } catch (error: any) {
    console.error('Error fetching node assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}
