"use client";
import { create } from 'zustand';
import { WorldNode, createBlankNode } from '@/lib/model';

type Filters = { type?: WorldNode['type']; tag?: string };

interface StudioState {
  nodes: WorldNode[];
  selectedNodeId?: string;
  filters: Filters;
  loadNodes: () => Promise<void>;
  selectNode: (id?: string) => void;
  createBlankNode: typeof createBlankNode;
  createNode: () => Promise<void>;
  saveNode: (node: WorldNode) => Promise<void>;
  setFilters: (f: Filters) => void;
  generateImage: (id: string) => Promise<void>;
  generateVoiceover: (id: string) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  nodes: [],
  filters: {},
  selectedNodeId: undefined,
  createBlankNode,

  async loadNodes() {
    try {
      const nodes = await fetch('/api/nodes').then((r) => r.json());
      console.log('Loaded nodes:', nodes.length, 'nodes');
      set({ nodes });
      if (!get().selectedNodeId && nodes[0]) set({ selectedNodeId: nodes[0].id });
    } catch (error) {
      console.error('Failed to load nodes:', error);
    }
  },

  selectNode(id) {
    set({ selectedNodeId: id });
  },

  async createNode() {
    try {
      const blank = createBlankNode();
      const saved = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blank),
      }).then((r) => r.json());
      set((s) => ({ nodes: [saved, ...s.nodes], selectedNodeId: saved.id }));
    } catch (error) {
      console.error('Failed to create node:', error);
    }
  },

  async saveNode(node) {
    try {
      const saved = await fetch(`/api/nodes/${node.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(node),
      }).then((r) => r.json());
      set((s) => ({ nodes: s.nodes.map((n) => (n.id === saved.id ? saved : n)) }));
    } catch (error) {
      console.error('Failed to save node:', error);
    }
  },

  setFilters(f) {
    set({ filters: f });
  },

  async generateImage(id) {
    try {
      const node = get().nodes.find((n) => n.id === id);
      if (node) {
        await fetch(`/api/nodes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(node) });
      }
      const response = await fetch('/api/assets/image', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ nodeId: id }) 
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }
      await get().loadNodes(); // Refresh the nodes list
    } catch (e: any) {
      console.error('Failed to generate image:', e);
      alert(e.message);
    }
  },

  async generateVoiceover(id) {
    try {
      const node = get().nodes.find((n) => n.id === id);
      if (node) {
        await fetch(`/api/nodes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(node) });
      }
      const response = await fetch('/api/assets/voiceover', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ nodeId: id }) 
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate voiceover');
      }
      await get().loadNodes(); // Refresh the nodes list
    } catch (e: any) {
      console.error('Failed to generate voiceover:', e);
      alert(e.message);
    }
  },

  async deleteNode(id) {
    try {
      await fetch(`/api/nodes/${id}`, { method: 'DELETE' })
        .then(async (r) => {
          if (!r.ok) throw new Error((await r.json()).error || 'Failed');
        })
        .then(() => set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id), selectedNodeId: s.nodes[0]?.id })))
        .catch((e) => alert(e.message));
    } catch (error) {
      console.error('Failed to delete node:', error);
    }
  },
}));
