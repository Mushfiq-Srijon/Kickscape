import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
  onSelectPlayer: (id: number) => void;
}

interface Player {
  id: number;
  name: string;
  team: string;
  country: string;
  position: string;
  age: number;
  national_kit_number: number;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(16, 16, 26, 0.9)',
  border: '1px solid rgba(212, 175, 55, 0.2)',
  borderRadius: 8,
  color: '#f0ede4',
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export const PlayerSearch = ({ onSelectPlayer }: Props) => {
  const [query, setQuery] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/players/teams`)
      .then((res) => setTeams(res.data.teams))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (selectedTeam) params.append('team', selectedTeam);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/players/search?${params}`);
        setResults(res.data.players);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selectedTeam]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px, 6vw, 30px)', letterSpacing: '0.1em', color: '#f0ede4' }}>
        Player Search
      </h2>

      {/* Search + Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="text"
          placeholder="Search player name (min 2 chars)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#d4af37')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)')}
        />
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer', fontSize: 'clamp(12px, 2vw, 14px)', padding: 'clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#d4af37')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)')}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team} style={{ background: '#10101a' }}>{team}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: '#d4af37',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12, color: '#555566', letterSpacing: '0.05em' }}>
            {results.length} player{results.length !== 1 ? 's' : ''} found
          </p>

          {results.map((player) => (
            <div
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              style={{
                padding: 'clamp(10px, 2vw, 14px) clamp(12px, 3vw, 16px)',
                background: 'rgba(16, 16, 26, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.12)',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'border-color 0.15s, background 0.15s',
                gap: 12,
                flexWrap: 'wrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                e.currentTarget.style.background = 'rgba(212,175,55,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.12)';
                e.currentTarget.style.background = 'rgba(16,16,26,0.85)';
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 600, color: '#f0ede4', marginBottom: 3, wordBreak: 'break-word' }}>{player.name}</p>
                <p style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#8b8b9e' }}>
                  {player.team} · {player.position}
                  {player.age ? <span style={{ color: '#555566' }}> · Age {player.age}</span> : null}
                </p>
              </div>
              {player.national_kit_number && (
                <div style={{
                  width: 32, height: 38,
                  background: 'linear-gradient(135deg, #d4af37, #a88b28)',
                  borderRadius: 5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 16, color: '#08080e',
                  flexShrink: 0,
                }}>
                  {player.national_kit_number}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && query.length >= 2 && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#555566', fontSize: 14 }}>
          No players found for "{query}"
        </div>
      )}

      {/* Empty */}
      {query.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#555566' }}>
          <div style={{
            fontSize: 'clamp(28px, 10vw, 40px)', marginBottom: 12,
            fontFamily: "'Bebas Neue', sans-serif",
            color: 'rgba(212,175,55,0.15)',
            letterSpacing: '0.1em',
          }}>
            SEARCH PLAYERS
          </div>
          <p style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}>Start typing to find players from all 48 nations</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};