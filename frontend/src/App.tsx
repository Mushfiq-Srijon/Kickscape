import React, { useState } from 'react';
import { Schedule } from './components/Schedule';
import { Standings } from './components/Standings';
import { Chatbot } from './components/Chatbot';
import { PlayerSearch } from './components/PlayerSearch';
import { PlayerDetail } from './components/PlayerDetail';

function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-400">⚽ Kickscape</h1>
          <p className="text-sm text-gray-400">World Cup 2026 Hub</p>
        </div>
      </header>

      {/* Show Player Detail if selected */}
      {selectedPlayerId ? (
        <main className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedPlayerId(null)}
            className="text-emerald-400 hover:text-emerald-300 transition text-sm mb-4"
          >
            ← Back
          </button>
          <PlayerDetail id={selectedPlayerId} />
        </main>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="sticky top-16 z-40 bg-black/20 backdrop-blur border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto">
              {[
                { id: 'schedule', label: '📅 Schedule' },
                { id: 'standings', label: '🏆 Standings' },
                { id: 'players', label: '👥 Players' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-8">
            {activeTab === 'schedule' && <Schedule />}
            {activeTab === 'standings' && <Standings />}
            {activeTab === 'players' && (
              <PlayerSearch onSelectPlayer={setSelectedPlayerId} />
            )}
          </main>
        </>
      )}

      {/* Chatbot Floating Button */}
      <Chatbot />
    </div>
  );
}

export default App;