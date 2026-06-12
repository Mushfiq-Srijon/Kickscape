import React, { useState } from 'react';
import { Schedule } from './components/Schedule';
import { Standings } from './components/Standings';
import { Chatbot } from './components/Chatbot';
import { PlayerSearch } from './components/PlayerSearch';
import { PlayerDetail } from './components/PlayerDetail';

const tabs = [
  { id: 'schedule', label: 'Schedule', icon: '◷' },
  { id: 'standings', label: 'Standings', icon: '⬡' },
  { id: 'players', label: 'Players', icon: '◈' },
];

function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo">
            <span className="app-logo__title">KICKSCAPE</span>
            <span className="app-logo__sub">WC 2026</span>
          </div>
        </div>
      </header>

      {selectedPlayerId ? (
        <main className="app-main">
          <button
            onClick={() => setSelectedPlayerId(null)}
            className="app-back-btn"
          >
            ← Back to Players
          </button>
          <PlayerDetail id={selectedPlayerId} />
        </main>
      ) : (
        <>
          {/* ── Nav Tabs ── */}
          <div className="app-tabs-wrap">
            <div className="app-tabs">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`app-tab${active ? ' app-tab--active' : ''}`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Main ── */}
          <main className="app-main">
            {activeTab === 'schedule' && <Schedule />}
            {activeTab === 'standings' && <Standings />}
            {activeTab === 'players' && (
              <PlayerSearch onSelectPlayer={setSelectedPlayerId} />
            )}
          </main>
        </>
      )}

      <Chatbot />

      <style>{`
        /* ── Header ── */
        .app-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(8, 8, 14, 0.88);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          width: 100%;
          overflow-x: hidden;
        }
        .app-header__inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(0.75rem, 2vw, 1rem);
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }
        .app-logo {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .app-logo__title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(20px, 5vw, 32px);
          letter-spacing: 0.06em;
          color: #d4af37;
          line-height: 1;
        }
        .app-logo__sub {
          font-size: clamp(9px, 2vw, 11px);
          color: rgba(212, 175, 55, 0.55);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 500;
        }

        /* ── Tabs ── */
        .app-tabs-wrap {
          position: sticky;
          top: 64px;
          z-index: 40;
          background: rgba(8, 8, 14, 0.7);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          overflow-x: auto;
          overflow-y: hidden;
          width: 100%;
          /* Hide scrollbar but keep functionality */
          scrollbar-width: none;
        }
        .app-tabs-wrap::-webkit-scrollbar { display: none; }

        .app-tabs {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(0.75rem, 2vw, 1rem);
          display: flex;
          gap: 0;
          min-width: min-content;
          box-sizing: border-box;
        }
        .app-tab {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #555566;
          cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(13px, 3vw, 17px);
          letter-spacing: 0.1em;
          padding: clamp(10px, 2vh, 14px) clamp(12px, 3vw, 20px);
          transition: color 0.15s, border-color 0.15s;
          white-space: nowrap;
        }
        .app-tab--active {
          color: #d4af37;
          border-bottom-color: #d4af37;
        }

        /* ── Main content ── */
        .app-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(0.75rem, 3vw, 2rem) clamp(0.75rem, 2vw, 1rem);
          width: 100%;
          box-sizing: border-box;
        }

        /* ── Back button ── */
        .app-back-btn {
          background: none;
          border: none;
          color: #d4af37;
          cursor: pointer;
          font-size: clamp(12px, 3vw, 14px);
          font-weight: 500;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.85;
          font-family: Inter, sans-serif;
          padding: 0;
          transition: opacity 0.15s;
        }
        .app-back-btn:hover { opacity: 1; }
      `}</style>
    </div>
  );
}

export default App;