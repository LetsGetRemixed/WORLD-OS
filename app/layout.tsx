import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'World Studio',
  description: 'Author a universe: places, characters, items, and factions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh">
          <header className="p-4 border-b border-white/10 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-wide">World Studio</a>
            <nav className="text-sm text-muted flex gap-4">
              <a href="/studio" className="hover:text-primary">Studio</a>
            </nav>
          </header>
          <main className="p-3">{children}</main>
        </div>
      </body>
    </html>
  );
}


