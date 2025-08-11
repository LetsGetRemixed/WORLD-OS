import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getNodeById, pushAssetToNode } from '@/lib/firestore.nodes';
import { composeNarrationText } from '@/lib/prompt';
import { ensureOpenAIClient } from '@/lib/openai';
import { uploadBuffer } from '@/lib/storage';
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
      ? (() => adminDb.collection('nodes').doc(nodeId).get().then((d) => (d.exists ? ({ id: d.id, ...(d.data() as any) } as any) : null)))()
      : await getNodeById(nodeId);
    if (!node) return NextResponse.json({ error: 'Node not found' }, { status: 404 });

    const openai = ensureOpenAIClient();
    const text = composeNarrationText(node);

    const tts = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text,
      format: 'mp3',
    } as any);

    const buffer = Buffer.from(await tts.arrayBuffer());
    const path = `audio/${nodeId}/${Date.now()}.mp3`;
    const url = await uploadBuffer(path, buffer, 'audio/mpeg');

    if (adminDb) {
      const ref = adminDb.collection('nodes').doc(nodeId);
      const d = await ref.get();
      if (!d.exists) throw new Error('Node not found during update');
      const data = d.data() as any;
      const assets = [...(data.assets || []), { kind: 'audio', url, title: `${node.title} narration`, meta: { path } }];
      await ref.set({ ...data, assets, updatedAt: Date.now() });
    } else {
      await pushAssetToNode(nodeId, {
        kind: 'audio',
        url,
        title: `${node.title} narration`,
        meta: { path },
      });
    }

    return NextResponse.json({ url });
  } catch (err: any) {
    const code = err?.code === 'NO_OPENAI_KEY' ? 501 : 400;
    const msg = err?.message ?? 'Failed to generate voiceover';
    return NextResponse.json({ error: msg }, { status: code });
  }
}


