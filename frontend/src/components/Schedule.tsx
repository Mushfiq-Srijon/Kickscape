import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Match {
  id: number;
  home_team: string;
  away_team: string;
  user_time: string;
  status?: string;
  home_score?: number | null;
  away_score?: number | null;
}

export const Schedule = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/matches?timezone=${timezone}`)
      .then(res => setMatches(res.data));
  }, [timezone]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Match Schedule</h2>
      <select 
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="UTC">UTC</option>
        <option value="Asia/Dhaka">Asia/Dhaka (BD)</option>
        <option value="America/New_York">America/New_York</option>
        <option value="Europe/London">Europe/London</option>
      </select>

      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="border p-4 rounded-lg bg-white shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{match.home_team} vs {match.away_team}</h3>
                <p className="text-gray-600">{new Date(match.user_time).toLocaleString()}</p>
              </div>
              {match.status === 'completed' && (
                <div className="text-2xl font-bold">{(match.home_score ?? 0)} - {(match.away_score ?? 0)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};