import { notFound } from 'next/navigation';
import { AssetList } from '@/components/AssetList';
import dynamic from 'next/dynamic';

const MiniPreview3D = dynamic(() => import('@/components/Preview3D').then(m => m.Preview3D), {
  ssr: false,
});

interface PageProps {
  params: { slug: string };
}

export default async function WorldNodePage({ params }: PageProps) {
  // Fetch node data from our public API route
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/public/nodes/${params.slug}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    return notFound();
  }
  
  const node = await response.json();

  return (
    <div className="grid gap-3 xl:grid-cols-[1fr,420px]">
      <div className="pane p-4">
        <h1 className="text-2xl font-semibold">{node.title}</h1>
        <div className="text-sm text-muted">{node.type}</div>
        {node.summary && <p className="mt-3 text-base leading-relaxed">{node.summary}</p>}
        {!!node.tags?.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {node.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded bg-white/10">#{t}</span>
            ))}
          </div>
        )}
        {!!Object.keys(node.props || {}).length && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Properties</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {Object.entries(node.props).map(([k, v]) => (
                <div key={k} className="text-sm flex items-center justify-between gap-4 bg-black/20 p-2 rounded">
                  <span className="text-muted">{k}</span>
                  <span className="text-right">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6">
          <AssetList readonly nodeId={node.id} />
        </div>
      </div>
      <div className="pane p-0 h-[60dvh] xl:h-[82dvh]">
        <MiniPreview3D focusNodeId={node.id} />
      </div>
    </div>
  );
}


