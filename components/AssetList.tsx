"use client";
import { useStudioStore } from '@/state/useStudioStore';
import { useEffect, useState } from 'react';

export function AssetList({ readonly = false, nodeId }: { readonly?: boolean; nodeId?: string }) {
  const store = useStudioStore();
  const selectedId = nodeId ?? store.selectedNodeId;
  const [publicAssets, setPublicAssets] = useState<any[]>([]);
  
  // For readonly mode, fetch assets from public API
  useEffect(() => {
    if (readonly && nodeId) {
      fetch(`/api/public/assets/${nodeId}`)
        .then(res => res.json())
        .then(assets => setPublicAssets(assets))
        .catch(err => console.error('Failed to fetch public assets:', err));
    }
  }, [readonly, nodeId]);

  const node = store.nodes.find((n) => n.id === selectedId);
  if (!node && !readonly) return null;

  const assets = readonly ? publicAssets : (node?.assets ?? []);
  const images = assets.filter((a) => a.kind === 'image');
  const audios = assets.filter((a) => a.kind === 'audio');

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Assets</h3>
        {!readonly && <div className="text-xs text-muted">{assets.length} total</div>}
      </div>
      {!!images.length && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={`${img.url}-${i}`} className="relative group">
              <img src={img.url} alt={img.title ?? 'image'} className="w-full h-28 object-cover rounded" />
            </div>
          ))}
        </div>
      )}
      {!!audios.length && (
        <div className="mt-3 space-y-2">
          {audios.map((au, i) => (
            <div key={`${au.url}-${i}`} className="bg-black/30 p-2 rounded">
              <div className="text-xs mb-1">{au.title ?? 'Narration'}</div>
              <audio controls src={au.url} className="w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


