"use client";
import { useMemo, useState } from 'react';
import { useStudioStore } from '@/state/useStudioStore';

export function GraphPanel() {
  const { nodes, filters, selectNode, setFilters, createNode } = useStudioStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return nodes
      .filter((n) => (filters.type ? n.type === filters.type : true))
      .filter((n) => (filters.tag ? n.tags?.includes(filters.tag) : true))
      .filter((n) => (search ? n.title.toLowerCase().includes(search.toLowerCase()) : true))
      .slice(0, 200);
  }, [nodes, filters, search]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input className="input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="flex gap-2 text-sm">
        {(['', 'place', 'character', 'item', 'faction'] as const).map((t) => (
          <button
            key={t || 'all'}
            className={`px-2 py-1 rounded ${filters.type === t ? 'bg-primary text-black' : 'bg-white/10'}`}
            onClick={() => setFilters({ ...filters, type: (t as any) || undefined })}
          >
            {t || 'all'}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs text-muted">{filtered.length} results</div>
        <button className="btn" onClick={() => createNode()}>
          + New Node
        </button>
      </div>
      <ul className="mt-2 divide-y divide-white/10">
        {filtered.map((n) => (
          <li key={n.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-medium leading-tight">
                <button className="hover:text-primary" onClick={() => selectNode(n.id)}>
                  {n.title}
                </button>
              </div>
              <div className="text-xs text-muted">{n.type} · {n.tags?.slice(0, 3).join(', ')}</div>
            </div>
            <div className="text-xs text-muted">{n.edges?.length ?? 0} edges</div>
          </li>
        ))}
      </ul>
    </div>
  );
}


