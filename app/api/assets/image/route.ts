import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getNodeById, pushAssetToNode } from '@/lib/firestore.nodes';
import { composeImagePrompt } from '@/lib/prompt';
import { ensureOpenAIClient } from '@/lib/openai';
import { downloadAndUploadImage } from '@/lib/storage';
import { getAdminDbOrNull } from '@/lib/firebase.admin';

export async function POST(req: NextRequest) {
  try {
    let nodeId: string | undefined;
    try {
      const body = await req.json();
      nodeId = body?.nodeId;
    } catch {}
    if (!nodeId || typeof nodeId !== 'string') {
      return NextResponse.json({ error: 'nodeId required' }, { status: 400 });
    }
    
    const adminDb = getAdminDbOrNull();
    const node = adminDb
      ? (() => {
          return adminDb
            .collection('nodes')
            .doc(nodeId)
            .get()
            .then((d) => (d.exists ? ({ id: d.id, ...(d.data() as any) } as any) : null));
        })()
      : getNodeById(nodeId);
    const resolved = await node;
    if (!resolved) return NextResponse.json({ error: 'Node not found' }, { status: 404 });

    const openai = ensureOpenAIClient();
    const prompt = composeImagePrompt(resolved);

    // Generate image with OpenAI
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
    } as any);

    const first = (image as any).data?.[0];
    if (!first?.url) throw new Error('Image generation failed: no URL in response');
    
    // Download from OpenAI and upload to Firebase Storage
    const path = `images/${nodeId}/${Date.now()}.png`;
    const firebaseUrl = await downloadAndUploadImage(first.url, path);

    // Add asset to node
    if (adminDb) {
      const ref = adminDb.collection('nodes').doc(nodeId);
      const d = await ref.get();
      if (!d.exists) throw new Error('Node not found during update');
      const data = d.data() as any;
      const newAsset = { 
        kind: 'image', 
        url: firebaseUrl, 
        title: `${resolved.title} image`, 
        meta: { path, source: 'firebase' } 
      };
      const assets = [...(data.assets || []), newAsset];
      console.log('Adding asset to node (Admin SDK):', { nodeId, asset: newAsset, totalAssets: assets.length });
      await ref.set({ ...data, assets, updatedAt: Date.now() });
    } else {
      const asset = { 
        kind: 'image', 
        url: firebaseUrl, 
        title: `${resolved.title} image`, 
        meta: { path, source: 'firebase' } 
      };
      console.log('Adding asset via client SDK (fallback):', { nodeId, asset });
      await pushAssetToNode(nodeId, asset);
    }

    return NextResponse.json({ url: firebaseUrl });
  } catch (err: any) {
    const code = err?.code === 'NO_OPENAI_KEY' ? 501 : 400;
    const msg = err?.message ?? 'Failed to generate image';
    return NextResponse.json({ error: msg }, { status: code });
  }
}
