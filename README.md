# NEXUS AI — Retell Voice Agent Dashboard

A production-ready, visually stunning Retell AI voice call agent frontend built with React + Vite + TypeScript + Tailwind CSS. Features a retro-futuristic mission-control aesthetic with real-time transcript, animated orb, and full call history management.

## ✨ Features

- **Dynamic Username Flow** — Username collected via animated modal before each call; pre-filled from localStorage for returning users
- **Live Voice Calls** — Powered by Retell AI Web SDK with full event handling
- **Real-Time Transcript** — Animated message bubbles with auto-scroll, copy & download
- **Animated AI Orb** — State-reactive orb: breathing (idle), spinner (connecting), pulse rings (agent speaking), violet aura (user speaking)
- **Call History** — Auto-saved to localStorage with auto-generated titles like `"Ravi call 21-05-2026 09:30 PM"`
- **Collapsible Sidebar** — Searchable call history with transcript viewer modal
- **Toast Notifications** — Bottom-right toasts for errors and success events
- **Glassmorphism UI** — Deep space dark theme with electric cyan, violet, and amber accents

## 📁 Project Structure

```
src/
├── api/
│   └── retell.ts          # Retell API client (getAccessToken)
├── components/
│   ├── AIOrb.tsx           # Animated central orb
│   ├── CallTimer.tsx       # MM:SS call duration counter
│   ├── LiveTranscript.tsx  # Real-time transcript panel
│   ├── Navbar.tsx          # Top bar with status & live clock
│   ├── Sidebar.tsx         # Call history panel
│   ├── UsernameModal.tsx   # Name collection modal
│   ├── VoiceCall.tsx       # (reference - logic in App.tsx)
│   └── WaveformBar.tsx     # Animated waveform visualization
├── hooks/
│   ├── useCallHistory.ts   # localStorage history management
│   └── useRetellCall.ts    # Retell SDK lifecycle hook
├── types/
│   └── index.ts            # TypeScript definitions
├── utils/
│   └── storage.ts          # localStorage utilities
├── App.tsx                 # Root component & call orchestration
├── main.tsx                # React entry point
└── index.css               # Global design system & animations
```

## 🚀 Installation

```bash
npm install
```

## ⚙️ Configuration

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
VITE_RETELL_API_KEY=your_retell_api_key_here
VITE_RETELL_AGENT_ID=your_retell_agent_id_here
```

> **Note:** No username is needed in `.env` — it is collected dynamically from the user before each call via an animated modal.

## 🔑 Where to get credentials

1. Log in to [Retell AI Dashboard](https://beta.retellai.com)
2. **API Key**: Settings → API Keys → Copy your key
3. **Agent ID**: Agents → Select your agent → Copy the Agent ID

## 💻 Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

## 📦 Production Build

```bash
npm run build
npm run preview
```

## 🌐 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in the Vercel dashboard under **Settings → Environment Variables**:
- `VITE_RETELL_API_KEY`
- `VITE_RETELL_AGENT_ID`

## 🎨 Design System

| Variable | Value | Usage |
|---|---|---|
| `--bg-void` | `#03040a` | Page background |
| `--accent-cyan` | `#00f5ff` | Primary accent, AI speaking |
| `--accent-violet` | `#7b2fff` | User speaking, secondary |
| `--accent-amber` | `#ffb400` | Connecting state |
| `--text-primary` | `#e8f4f8` | Body text |
| `--text-muted` | `#4a6080` | Dimmed labels |

**Fonts:**
- `Orbitron` — Headings, buttons, labels
- `Rajdhani` — Body text, subtitles
- `IBM Plex Mono` — Transcript, timestamps, code

## 📞 Call Flow

1. User clicks **Start Voice Call**
2. `UsernameModal` opens → user types name (pre-filled if returning)
3. User clicks **BEGIN SESSION** → name saved to state + `localStorage`
4. Retell call starts → `callStartTime = new Date()` recorded
5. Live transcript updates in real time via `update` events
6. User clicks **End Call** or `call_ended` fires
7. `saveCall()` auto-triggers with username, startTime, duration, transcript
8. Title generated: `"Ravi call 21-05-2026 09:30 PM"`
9. Record appears in sidebar history instantly

## 🧠 Architecture Notes

- The Retell SDK hook (`useRetellCall`) is instantiated **once** in `App.tsx` and passed down to avoid double-initialization
- `callStartTime` is captured on the `call_started` event (not on button click)
- Auto-retry fires once on first error during connecting phase
- All localStorage operations are wrapped in try/catch for resilience

## 📄 License

MIT — Use freely for personal and commercial projects.
