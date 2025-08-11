### World Studio

Author a universe (places, characters, items, factions), generate assets (images, narration audio), and view a simple 3D “universe view.” Built with Next.js 14 (app router), TypeScript, Tailwind, R3F/drei, Zustand, Firebase (Firestore + Storage), Tone.js, and OpenAI (server-side).

### Tech stack
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS
- @react-three/fiber (R3F) + @react-three/drei
- Zustand
- Firebase Web SDK (client) + Firebase Admin SDK (server)
- Tone.js (client-side ambient sound)
- OpenAI Images + TTS (server-side)

### Prerequisites
- Node 18+
- A Firebase project with Firestore and Storage enabled
- An OpenAI API key (optional; routes return 501 if missing)

### Quick start
1) Install dependencies
```bash
npm install
```

2) Configure environment
Create `.env.local` in the project root. Required vars:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
OPENAI_API_KEY=sk-...

# Prefer this for server-side admin (do NOT prefix with NEXT_PUBLIC_)
FIREBASE_SERVICE_ACCOUNT_PATH=C:\\absolute\\path\\to\\service-account.json
# Alternatives (use one of path/JSON/base64):
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# FIREBASE_SERVICE_ACCOUNT_BASE64=base64_of_the_entire_json
```
Notes:
- Use your Firebase “Web app” config for the NEXT_PUBLIC_* vars.
- For Windows paths in env files, use backslashes as normal (no quoting required).
- The app auto-normalizes `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` if you paste a download domain (e.g., `project.firebasestorage.app`).
- Never expose admin creds with `NEXT_PUBLIC_`.

3) Run dev server
```bash
npm run dev
```
Open `http://localhost:3000/studio`.

4) Seed starter data
- In your browser: open `http://localhost:3000/api/seed`
- PowerShell alternative:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/seed -Method GET | Out-String
```

### Using the Studio
- Three-pane layout at `/studio`:
  - Left: GraphPanel – filter/search nodes, create new node
  - Center: NodeEditor – edit node fields, Save Node, Generate Image, Generate Voiceover, Delete
  - Right: Preview3D – click a dot to select a node
- Assets: images show as thumbnails; audio has a player
- Ambient sounds: toggle in the left pane (Tone.js)
- Public page: click “Open public page” after saving, or visit `/world/[slug]`

### Data model
```
type NodeType = 'place' | 'character' | 'item' | 'faction';
interface NodeAsset { kind: 'image' | 'audio' | 'doc' | 'other'; url: string; title?: string; meta?: Record<string, any>; }
interface NodeEdge { toId: string; label?: string; }
interface WorldNode {
  id: string; slug: string; type: NodeType; title: string; summary?: string;
  tags: string[]; props: Record<string, any>; edges: NodeEdge[]; assets: NodeAsset[];
  createdAt: number; updatedAt: number;
}
```

### How saving and assets work
- CRUD and asset generation go through server routes (Node.js runtime) and use Firebase Admin when `FIREBASE_SERVICE_ACCOUNT_PATH` (or JSON/base64) is set. This avoids client SDK connectivity and security rule issues.
- Image generation uploads to `images/{nodeId}/{timestamp}.png` in Storage, then appends the asset to the node.
- Voiceover does similarly to `audio/{nodeId}/{timestamp}.mp3`.

### API routes (App Router)
- `GET /api/nodes` – list nodes
- `POST /api/nodes` – create node (body: partial `WorldNode`)
- `GET /api/nodes/:id` – read node
- `PATCH /api/nodes/:id` – update node
- `DELETE /api/nodes/:id` – delete node
- `POST /api/assets/image` – body `{ nodeId: string }`, generates image
- `POST /api/assets/voiceover` – body `{ nodeId: string }`, generates narration
- `GET|POST /api/seed` – create starter nodes

### Windows PowerShell tips
- PowerShell’s `curl` is `Invoke-WebRequest`. Use:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/seed -Method GET | Out-String
```
- Don’t pass `--port` directly to `npm run dev` in PowerShell; it may be misinterpreted.

### Troubleshooting
- “Client is offline” / Firestore INVALID_ARGUMENT logs: safe to ignore; server routes handle save/load using Admin when configured.
- 501 from asset routes: set `OPENAI_API_KEY` and restart dev server.
- 400 from image route about response_format: fixed in code; we handle both URL and b64 responses.
- Permission errors on save: confirm `FIREBASE_SERVICE_ACCOUNT_PATH` points to a valid service account for your project, and restart.
- Nothing happens when hitting seed from terminal: add `| Out-String`, or open the URL in your browser.

### Production
```bash
npm run build
npm run start
```

### Stretch goals (not implemented yet)
- Auth protection for `/studio`
- Visual graph view
- Import/export JSON
- Version history per node
- Batch “generate from selection”
- Theming (dark mode)

### Project structure
```
/app
  /studio/page.tsx           # Studio UI
  /world/[slug]/page.tsx     # Public node page
  /api/...                   # Server routes (Node.js runtime)
/components                  # GraphPanel, NodeEditor, Preview3D, AssetList, SoundToggles
/lib                         # Firebase client/admin, storage, prompts, model, slug
/state                       # Zustand store
/styles                      # Tailwind globals
```

### Notes
- TypeScript is strict across the app; some three-fiber intrinsic types are suppressed for pragmatic DX.
- Firebase Storage bucket is normalized internally if you paste the `*.firebasestorage.app` domain.


