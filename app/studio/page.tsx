"use client";
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { GraphPanel } from '@/components/GraphPanel';
import { NodeEditor } from '@/components/NodeEditor';
import { AssetList } from '@/components/AssetList';
import { SoundToggles } from '@/components/SoundToggles';
import { useStudioStore } from '@/state/useStudioStore';

const Preview3D = dynamic(() => import('@/components/Preview3D').then(m => m.Preview3D), {
  ssr: false,
});

export default function StudioPage() {
  const loadNodes = useStudioStore(s => s.loadNodes);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  return (
    <div className="grid gap-3 md:grid-cols-1 xl:grid-cols-[280px,1fr,380px]">
      <div className="pane p-3 order-1 xl:order-none">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Nodes</h2>
          <SoundToggles />
        </div>
        <GraphPanel />
      </div>
      <div className="pane p-3 order-3 xl:order-none">
        <NodeEditor />
        <div className="mt-4">
          <AssetList />
        </div>
      </div>
      <div className="pane p-0 h-[60dvh] xl:h-[82dvh] order-2 xl:order-none">
        <Preview3D />
      </div>
    </div>
  );
}


