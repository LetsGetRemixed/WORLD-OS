import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getAdminDbOrNull } from '@/lib/firebase.admin';
import { createNode } from '@/lib/firestore.nodes';

async function seedOnce() {
  const starter = [
    { type: 'place', title: 'Aether Spire', tags: ['ancient', 'stormy'], props: { era: 'mythic' } },
    { type: 'place', title: 'Rust Harbor', tags: ['industrial', 'rainy'], props: { climate: 'wet' } },
    { type: 'character', title: 'Mira the Cartographer', tags: ['scholar'], props: { faction: 'Guild' } },
    { type: 'character', title: 'Kade Ironbound', tags: ['mercenary'], props: { weapon: 'glaive' } },
    { type: 'item', title: 'Star Compass', tags: ['artifact'], props: { material: 'orichalcum' } },
    { type: 'faction', title: 'Lantern Order', tags: ['secretive'], props: { motto: 'Light in Shadow' } },
  ] as any[];

  const adminDb = getAdminDbOrNull();
  const created = [] as any[];
  if (adminDb) {
    for (const s of starter) {
      const id = crypto.randomUUID();
      const doc = { id, ...s, slug: (s.title as string).toLowerCase().replace(/\s+/g, '-'), assets: [], edges: [], tags: s.tags ?? [], props: s.props ?? {}, createdAt: Date.now(), updatedAt: Date.now() };
      await adminDb.collection('nodes').doc(id).set(doc);
      created.push(doc);
    }
  } else {
    for (const s of starter) created.push(await createNode(s));
  }
  return { created };
}

export async function POST() {
  const result = await seedOnce();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await seedOnce();
  return NextResponse.json(result);
}


