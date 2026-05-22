// ============================================================
// NEXUS AI — App.tsx
// Root layout — uses detected name from retell hook automatically
// ============================================================

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VoiceCall from './components/VoiceCall';
import { useRetellCall } from './hooks/useRetellCall';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const retell = useRetellCall();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Animated background */}
      <div className="bg-nexus" aria-hidden="true">
        <div className="bg-nexus-radial" />
      </div>

      {/* Navbar — shows detected username automatically */}
      <Navbar
        connectionState={retell.connectionState}
        username={retell.detectedUsername}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Collapsible sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          username={retell.detectedUsername}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 relative">
          <VoiceCall retell={retell} />
        </main>
      </div>
    </div>
  );
};

export default App;
