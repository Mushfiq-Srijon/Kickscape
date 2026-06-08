import React, { useState, useEffect, useCallback } from 'react';
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
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/players/teams');
        setTeams(res.data.teams);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };

    fetchTeams();
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('q', query);
        if (selectedTeam) {
          params.append('team', selectedTeam);
        }

        const res = await axios.get(
          `http://localhost:8000/api/players/search?${params.toString()}`
        );
        setResults(res.data.players);
      } catch (err) {
        console.error('Error searching players:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedTeam]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Player Search</h2>

      {/* Search & Filter */}
      <div className="space-y-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search player name (min 2 chars)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
        />

        {/* Team Filter */}
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Found {results.length} players</p>

          <div className="space-y-2">
            {results.map((player) => (
              <div
                key={player.id}
                onClick={() => onSelectPlayer(player.id)}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-emerald-500 transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{player.name}</h3>
                    <p className="text-sm text-gray-400">
                      {player.team} • {player.position}
                    </p>
                    {player.age && (
                      <p className="text-xs text-gray-500">Age: {player.age}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {player.national_kit_number && (
                      <div className="w-8 h-10 bg-emerald-500 text-white text-xs flex items-center justify-center rounded font-bold">
                        {player.national_kit_number}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No players found for "{query}"
        </div>
      )}

      {/* Empty State */}
      {query.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Start typing to search for players...
        </div>
      )}

      {/* Selected Player Detail (Preview) */}
      {selectedPlayer && (
        <PlayerDetailPreview playerId={selectedPlayer} />
      )}
    </div>
  );
};

// Player Detail Preview Component
function PlayerDetailPreview({ playerId }: { playerId: number }) {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/players/${playerId}`
        );
        setPlayer(res.data.player);
      } catch (err) {
        console.error('Error fetching player:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!player) return null;

  return (
    <div className="p-6 bg-white/5 border border-emerald-500/30 rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white">{player.name}</h3>
          <p className="text-emerald-400">{player.team}</p>
        </div>
        {player.national_kit_number && (
          <div className="w-12 h-16 bg-emerald-500 text-white text-lg flex items-center justify-center rounded font-bold">
            {player.national_kit_number}
          </div>
        )}
      </div>

      {/* Player Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/5 p-2 rounded">
          <p className="text-gray-400">Position</p>
          <p className="text-white font-semibold">{player.position}</p>
        </div>
        <div className="bg-white/5 p-2 rounded">
          <p className="text-gray-400">Age</p>
          <p className="text-white font-semibold">{player.age || 'N/A'}</p>
        </div>
        <div className="bg-white/5 p-2 rounded">
          <p className="text-gray-400">Height</p>
          <p className="text-white font-semibold">
            {player.height ? `${player.height}m` : 'N/A'}
          </p>
        </div>
        <div className="bg-white/5 p-2 rounded">
          <p className="text-gray-400">Club Kit #</p>
          <p className="text-white font-semibold">
            {player.club_kit_number || 'N/A'}
          </p>
        </div>
      </div>

      {/* Stats Preview */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400">Player Stats</p>
        <div className="space-y-1">
          {['striking', 'defending', 'speed', 'passing', 'dribbling', 'physical'].map(
            (stat) => (
              <div key={stat} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-20 capitalize">
                  {stat}
                </span>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${(player[stat] / 100) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-white w-8 text-right">
                  {player[stat]}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}