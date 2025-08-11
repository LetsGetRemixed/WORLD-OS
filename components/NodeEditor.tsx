"use client";
import { useEffect, useMemo, useState } from 'react';
import { useStudioStore } from '@/state/useStudioStore';

export function NodeEditor() {
  const store = useStudioStore();
  const node = useMemo(() => store.nodes.find((n) => n.id === store.selectedNodeId) ?? null, [store.nodes, store.selectedNodeId]);

  const [local, setLocal] = useState(() => node ?? store.createBlankNode());
  // Sync when selection changes
  useEffect(() => {
    if (node) setLocal(node);
  }, [node?.id]);

  const update = (k: string, v: any) => setLocal((prev) => ({ ...prev, [k]: v, updatedAt: Date.now() }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Editor</h2>
        <div className="flex gap-2">
          <button className="btn" onClick={() => store.generateImage(local.id)}>Generate Image</button>
          <button className="btn" onClick={() => store.generateVoiceover(local.id)}>Generate Voiceover</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Title</label>
          <input className="input" value={local.title} onChange={(e) => update('title', e.target.value)} />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={local.type} onChange={(e) => update('type', e.target.value)}>
            {(['place', 'character', 'item', 'faction'] as const).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Summary</label>
          <textarea className="input min-h-[120px]" value={local.summary ?? ''} onChange={(e) => update('summary', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Tags (comma-separated)</label>
          <input className="input" value={local.tags.join(', ')} onChange={(e) => update('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <PropsEditor value={local.props} onChange={(v) => update('props', v)} />
        <EdgesEditor value={local.edges} onChange={(v) => update('edges', v)} />
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn" onClick={() => store.saveNode(local)}>Save Node</button>
        <button
          className="ml-2 px-3 py-2 rounded-md bg-red-500 text-white hover:brightness-110"
          onClick={() => {
            if (!local.id) return;
            if (confirm('Delete this node? This cannot be undone.')) {
              store.deleteNode(local.id);
            }
          }}
        >
          Delete
        </button>
        {store.nodes.find((n) => n.id === local.id) && (
          <a className="text-sm text-muted underline ml-2" href={`/world/${store.nodes.find((n) => n.id === local.id)?.slug}`} target="_blank" rel="noreferrer">Open public page</a>
        )}
      </div>
    </div>
  );
}

function PropsEditor({ value, onChange }: { value: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  const entries = Object.entries(value ?? {});
  const [k, setK] = useState('');
  const [v, setV] = useState('');
  return (
    <div>
      <div className="font-medium mb-2">Properties</div>
      <div className="space-y-2">
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-2 items-center">
            <div className="text-xs text-muted w-24">{key}</div>
            <input className="input flex-1" value={String(val)} onChange={(e) => onChange({ ...value, [key]: e.target.value })} />
            <button className="px-2 py-1 rounded bg-white/10" onClick={() => { const copy = { ...value }; delete copy[key]; onChange(copy); }}>Delete</button>
          </div>
        ))}
        <div className="flex gap-2 items-center">
          <input className="input w-28" placeholder="key" value={k} onChange={(e) => setK(e.target.value)} />
          <input className="input flex-1" placeholder="value" value={v} onChange={(e) => setV(e.target.value)} />
          <button className="px-2 py-1 rounded bg-white/10" onClick={() => { if (!k) return; onChange({ ...value, [k]: v }); setK(''); setV(''); }}>Add</button>
        </div>
      </div>
    </div>
  );
}

function EdgesEditor({ value, onChange }: { value: { toId: string; label?: string }[]; onChange: (v: { toId: string; label?: string }[]) => void }) {
  const store = useStudioStore();
  const [toId, setToId] = useState('');
  const [label, setLabel] = useState('');
  return (
    <div>
      <div className="font-medium mb-2">Edges</div>
      <div className="space-y-2">
        {(value ?? []).map((e, i) => (
          <div key={`${e.toId}-${i}`} className="flex gap-2 items-center">
            <select className="input flex-1" value={e.toId} onChange={(ev) => { const next = [...value]; next[i] = { ...e, toId: ev.target.value }; onChange(next); }}>
              <option value="">Select node...</option>
              {store.nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
            <input className="input flex-1" placeholder="label (ally, located-in...)" value={e.label ?? ''} onChange={(ev) => { const next = [...value]; next[i] = { ...e, label: ev.target.value }; onChange(next); }} />
            <button className="px-2 py-1 rounded bg-white/10" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>Delete</button>
          </div>
        ))}
        <div className="flex gap-2 items-center">
          <select className="input flex-1" value={toId} onChange={(e) => setToId(e.target.value)}>
            <option value="">Select node...</option>
            {store.nodes.map((n) => (
              <option key={n.id} value={n.id}>{n.title}</option>
            ))}
          </select>
          <input className="input flex-1" placeholder="label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <button className="px-2 py-1 rounded bg-white/10" onClick={() => { if (!toId) return; onChange([...(value ?? []), { toId, label }]); setToId(''); setLabel(''); }}>Add</button>
        </div>
      </div>
    </div>
  );
}


