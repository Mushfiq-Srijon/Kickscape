import React, { useState } from 'react';
import { Schedule } from './components/Schedule';
import { Standings } from './components/Standings';
import { Chatbot } from './components/Chatbot';

function App() {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              ⚽ Kickscape
            </h1>
            <p className="text-xs text-emerald-400 mt-0.5">World Cup 2026 Hub</p>
          </div>
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${
                activeTab === 'schedule'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${
                activeTab === 'standings'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Standings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8">
          {activeTab === 'schedule' && <Schedule />}
          {activeTab === 'standings' && <Standings />}
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default App;