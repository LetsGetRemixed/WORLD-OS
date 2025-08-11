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

export function createBlankNode(): WorldNode {
  const now = Date.now();
  const id = crypto.randomUUID();
  return {
    id,
    slug: `untitled-node-${id.slice(0, 4)}`,
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


