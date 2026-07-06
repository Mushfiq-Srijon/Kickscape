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

export const PlayerSearch = ({ onSelectPlayer }: Props) => {
  const [query, setQuery] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/players/teams`)
      .then((res) =>
        setTeams(Array.isArray(res.data.teams) ? res.data.teams : [])
      )
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (selectedTeam) params.append('team', selectedTeam);
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/players/search?${params}`
        );
        setResults(Array.isArray(res.data.players) ? res.data.players : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selectedTeam]);

  useEffect(() => {
    if (query.length > 0 || selectedTeam) return;
    const loadPopular = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/players/popular`
        );
        setResults(Array.isArray(res.data.players) ? res.data.players : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPopular();
  }, [query, selectedTeam]);

  useEffect(() => {
    if (!selectedTeam || query.length >= 2) return;
    const loadTeamPlayers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ team: selectedTeam });
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/players/search?${params}`
        );
        setResults(Array.isArray(res.data.players) ? res.data.players : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTeamPlayers();
  }, [selectedTeam, query]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 className="ps-title">Player Search</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="text"
          placeholder="Search player name (min 2 chars)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ps-input"
          onFocus={(e) => (e.currentTarget.style.borderColor = '#d4af37')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)')}
        />
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="ps-input ps-select"
          onFocus={(e) => (e.currentTarget.style.borderColor = '#d4af37')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)')}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team} style={{ background: '#10101a' }}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div className="ps-spinner" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="ps-count">
            {results.length} player{results.length !== 1 ? 's' : ''} found
          </p>
          {results.map((player) => (
            <div
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className="ps-player-row"
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="ps-player-row__name">{player.name}</p>
                <p className="ps-player-row__meta">
                  {player.team} · {player.position}
                  {player.age ? <span className="ps-player-row__age"> · Age {player.age}</span> : null}
                </p>
              </div>
              {player.national_kit_number && (
                <div className="ps-player-row__kit">{player.national_kit_number}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="ps-empty">No players found for "{query}"</div>
      )}

      {query.length === 0 && !loading && results.length === 0 && (
        <div className="ps-idle">
          <div className="ps-idle__heading">SEARCH PLAYERS</div>
          <p className="ps-idle__sub">Start typing to find players from all 48 nations</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ps-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(24px, 6vw, 30px); letter-spacing: 0.1em; color: #f0ede4; }
        .ps-input { width: 100%; padding: clamp(10px,2vw,12px) clamp(12px,3vw,16px); background: rgba(16,16,26,0.9); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; color: #f0ede4; font-size: clamp(12px,2vw,14px); font-family: Inter, sans-serif; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .ps-select { cursor: pointer; }
        .ps-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; border-top-color: #d4af37; animation: spin 0.8s linear infinite; }
        .ps-count { font-size: 12px; color: #555566; letter-spacing: 0.05em; }
        .ps-player-row { padding: clamp(10px,2vw,14px) clamp(12px,3vw,16px); background: rgba(16,16,26,0.85); border: 1px solid rgba(212,175,55,0.12); border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: border-color 0.15s, background 0.15s; gap: 12px; }
        .ps-player-row:hover { border-color: rgba(212,175,55,0.4); background: rgba(212,175,55,0.06); }
        .ps-player-row__name { font-size: clamp(13px,3vw,15px); font-weight: 600; color: #f0ede4; margin-bottom: 3px; word-break: break-word; }
        .ps-player-row__meta { font-size: clamp(11px,2vw,13px); color: #8b8b9e; }
        .ps-player-row__age { color: #555566; }
        .ps-player-row__kit { width: 32px; height: 38px; background: linear-gradient(135deg,#d4af37,#a88b28); border-radius: 5px; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: #08080e; flex-shrink: 0; }
        .ps-empty { text-align: center; padding: 3rem 1rem; color: #555566; font-size: 14px; }
        .ps-idle { text-align: center; padding: 2rem 1rem; color: #555566; }
        .ps-idle__heading { font-size: clamp(28px,10vw,40px); margin-bottom: 12px; font-family: 'Bebas Neue', sans-serif; color: rgba(212,175,55,0.15); letter-spacing: 0.1em; }
        .ps-idle__sub { font-size: clamp(12px,2vw,14px); }
      `}</style>
    </div>
  );
};