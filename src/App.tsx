// ============================================================
// NEXUS AI — App.tsx
// Root application component — layout and state coordination
// ============================================================

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VoiceCall from './components/VoiceCall';
import { useRetellCall } from './hooks/useRetellCall';

const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Single instantiation of the Retell hook — lifted here so both
  // Navbar (status) and VoiceCall (full control) share the same state
  const retell = useRetellCall();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Animated background */}
      <div className="bg-nexus" aria-hidden="true">
        <div className="bg-nexus-radial" />
      </div>

      {/* Top navigation */}
      <Navbar connectionState={retell.connectionState} username={username} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Collapsible sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          username={username}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 relative">
          {/* Corner decorations */}
          <div
            className="absolute top-4 left-4 w-12 h-12 pointer-events-none"
            style={{
              borderTop: '1px solid rgba(0, 245, 255, 0.12)',
              borderLeft: '1px solid rgba(0, 245, 255, 0.12)',
              borderRadius: '8px 0 0 0',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-4 right-4 w-12 h-12 pointer-events-none"
            style={{
              borderBottom: '1px solid rgba(0, 245, 255, 0.08)',
              borderRight: '1px solid rgba(0, 245, 255, 0.08)',
              borderRadius: '0 0 8px 0',
            }}
            aria-hidden="true"
          />

          {/* Ambient glow behind orb */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(0,245,255,0.03) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          {/* Voice Call — receives the shared retell hook */}
          <VoiceCall
            retell={retell}
            username={username}
            onUsernameUpdate={setUsername}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
