import React, { useState, useEffect } from 'react';
import { getMatches } from '../api';

export const Schedule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMatches(timezone)
      .then((res) => setMatches(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [timezone]);

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'Asia/Dhaka', label: 'Dhaka (BD)' },
    { value: 'America/New_York', label: 'New York' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Asia/Dubai', label: 'Dubai' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Match Schedule</h2>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition text-sm"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-gray-400 mt-4">Loading matches...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      {match.group_stage}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      {match.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {match.home_team} <span className="text-gray-500">vs</span> {match.away_team}
                  </h3>
                  
                  <p className="text-sm text-gray-400">
                    📅 {new Date(match.match_date).toLocaleString()}
                  </p>
                </div>

                {match.status === 'completed' && (
                  <div className="text-4xl font-black text-emerald-400">
                    {match.home_score} - {match.away_score}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};