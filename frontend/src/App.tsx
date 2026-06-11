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
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 8, 14, 0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        width: '100%',
        overflowX: 'hidden',
      }}>
        <div style={{
          maxWidth: '100%',
          margin: '0 auto',
          padding: '0 clamp(0.75rem, 2vw, 1rem)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
          boxSizing: 'border-box',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(20px, 5vw, 32px)',
              letterSpacing: '0.06em',
              color: '#d4af37',
              lineHeight: 1,
            }}>
              KICKSCAPE
            </span>
            <span style={{
              fontSize: 'clamp(9px, 2vw, 11px)',
              color: 'rgba(212, 175, 55, 0.55)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>
              WC 2026
            </span>
          </div>


        </div>
      </header>

      {selectedPlayerId ? (
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(0.75rem, 3vw, 2rem) clamp(0.75rem, 2vw, 1rem)', width: '100%', boxSizing: 'border-box' }}>
          <button
            onClick={() => setSelectedPlayerId(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af37',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: 500,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: 0.85,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ← Back to Players
          </button>
          <PlayerDetail id={selectedPlayerId} />
        </main>
      ) : (
        <>
          {/* ── Nav Tabs ── */}
          <div style={{
            position: 'sticky',
            top: 64,
            zIndex: 40,
            background: 'rgba(8, 8, 14, 0.7)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            overflowX: 'auto',
            overflowY: 'hidden',
            width: '100%',
          }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(0.75rem, 2vw, 1rem)', display: 'flex', gap: 0, minWidth: 'min-content', boxSizing: 'border-box' }}>
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: active ? '2px solid #d4af37' : '2px solid transparent',
                      color: active ? '#d4af37' : '#555566',
                      cursor: 'pointer',
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 'clamp(13px, 3vw, 17px)',
                      letterSpacing: '0.1em',
                      padding: 'clamp(10px, 2vh, 14px) clamp(12px, 3vw, 20px)',
                      transition: 'color 0.15s, border-color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Main ── */}
          <main style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(0.75rem, 3vw, 2rem) clamp(0.75rem, 2vw, 1rem)', width: '100%', boxSizing: 'border-box' }}>
            {activeTab === 'schedule' && <Schedule />}
            {activeTab === 'standings' && <Standings />}
            {activeTab === 'players' && (
              <PlayerSearch onSelectPlayer={setSelectedPlayerId} />
            )}
          </main>
        </>
      )}

      <Chatbot />
    </div>
  );
}

export default App;