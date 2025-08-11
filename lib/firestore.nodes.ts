import { db } from './firebase.client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { createSlug } from './slug';

export type NodeType = 'place' | 'character' | 'item' | 'faction';

export interface NodeAsset {
  kind: 'image' | 'audio' | 'doc' | 'other';
  url: string;
  title?: string;
  meta?: Record<string, any>;
}

export interface NodeEdge {
  toId: string;
  label?: string;
}

export interface WorldNode {
  id: string;
  slug: string;
  type: NodeType;
  title: string;
  summary?: string;
  tags: string[];
  props: Record<string, any>;
  edges: NodeEdge[];
  assets: NodeAsset[];
  createdAt: number;
  updatedAt: number;
}

const NODES = collection(db, 'nodes');

export function createBlankNode(): WorldNode {
  const now = Date.now();
  const id = crypto.randomUUID();
  return {
    id,
    slug: createSlug('Untitled Node ' + id.slice(0, 4)),
    type: 'place',
    title: 'Untitled Node',
    summary: '',
    tags: [],
    props: {},
    edges: [],
    assets: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function listNodes(): Promise<WorldNode[]> {
  const snap = await getDocs(NODES);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function getNodeById(id: string): Promise<WorldNode | null> {
  const d = await getDoc(doc(NODES, id));
  return d.exists() ? ({ id: d.id, ...(d.data() as any) } as WorldNode) : null;
}

export async function getNodeBySlug(slug: string): Promise<WorldNode | null> {
  const q = query(NODES, where('slug', '==', slug));
  const snap = await getDocs(q);
  const d = snap.docs[0];
  return d ? ({ id: d.id, ...(d.data() as any) } as WorldNode) : null;
}

export async function createNode(partial: Partial<WorldNode>): Promise<WorldNode> {
  const id = partial.id ?? crypto.randomUUID();
  const now = Date.now();
  const node: WorldNode = {
    id,
    slug: partial.slug ?? createSlug(partial.title || 'untitled-' + id.slice(0, 6)),
    type: (partial.type as any) ?? 'place',
    title: partial.title || 'Untitled',
    summary: partial.summary || '',
    tags: partial.tags || [],
    props: partial.props || {},
    edges: partial.edges || [],
    assets: partial.assets || [],
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(NODES, id), node as any);
  return node;
}

export async function updateNode(id: string, partial: Partial<WorldNode>): Promise<WorldNode> {
  const existing = await getNodeById(id);
  if (!existing) throw new Error('Node not found');
  const updated: WorldNode = { ...existing, ...partial, updatedAt: Date.now() } as WorldNode;
  await updateDoc(doc(NODES, id), updated as any);
  return updated;
}

export async function pushAssetToNode(id: string, asset: NodeAsset): Promise<void> {
  const existing = await getNodeById(id);
  if (!existing) throw new Error('Node not found');
  const updated = { ...existing, assets: [...(existing.assets || []), asset], updatedAt: Date.now() };
  await updateDoc(doc(NODES, id), updated as any);
}


