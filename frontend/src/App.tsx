import React, { useState, useEffect } from 'react';
import { Schedule } from './components/Schedule';
import { Standings } from './components/Standings';
import { Chatbot } from './components/Chatbot';
import { PlayerSearch } from './components/PlayerSearch';
import { PlayerDetail } from './components/PlayerDetail';
import { Bracket } from './components/Bracket';

const tabs = [
  { id: 'schedule', label: 'Schedule', icon: '◷' },
  { id: 'standings', label: 'Standings', icon: '⬡' },
  { id: 'players', label: 'Players', icon: '◈' },
  { id: 'bracket', label: 'Bracket', icon: '⚽' }
];

const TAB_STORAGE_KEY = 'kickscape_active_tab';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="back-to-top"
    >
      ↑
    </button>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY);
    return tabs.some(t => t.id === saved) ? saved! : 'schedule';
  });
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
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
          {/* Tabs */}
          <div className="app-tabs-wrap">
            <div className="app-tabs">

              {tabs.map((tab) => {

                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`app-tab ${active ? 'app-tab--active' : ''
                      }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                );

              })}

            </div>
          </div>


          {/* Content */}
          <main className="app-main">

            {activeTab === 'schedule' && <Schedule />}

            {activeTab === 'standings' && <Standings />}

            {activeTab === 'players' && (
              <PlayerSearch
                onSelectPlayer={setSelectedPlayerId}
              />
            )}

            {activeTab === 'bracket' && <Bracket />}

          </main>

        </>
      )}


      <Chatbot />
      <BackToTop />


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
          max-width: 1400px;
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
          scrollbar-width: none;
        }
        .app-tabs-wrap::-webkit-scrollbar { display: none; }

        .app-tabs {
          max-width: 1400px;
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
          max-width: 1400px;
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

        /* ── Back to top ── */
        .back-to-top {
          position: fixed;
          bottom: clamp(16px, 4vw, 28px);
          left: clamp(16px, 4vw, 28px);
          z-index: 45;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(16, 16, 26, 0.9);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #d4af37;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transition: opacity 0.2s, transform 0.15s;
          animation: fadeIn 0.2s ease;
        }
        .back-to-top:hover {
          border-color: rgba(212, 175, 55, 0.6);
          transform: translateY(-2px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;