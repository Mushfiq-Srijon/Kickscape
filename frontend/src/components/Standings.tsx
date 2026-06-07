import React, { useState, useEffect } from 'react';
import { getTeamStandings } from '../api';

export const Standings = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamStandings()
      .then((res) => setTeams(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Team Standings</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Team</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">P</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">W</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">D</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">L</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">GF</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">GA</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-400">Pts</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, idx) => (
                <tr
                  key={team.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4 font-semibold text-white">{team.name}</td>
                  <td className="px-6 py-4 text-center text-gray-300">{team.played}</td>
                  <td className="px-6 py-4 text-center text-green-400">{team.wins}</td>
                  <td className="px-6 py-4 text-center text-yellow-400">{team.draws}</td>
                  <td className="px-6 py-4 text-center text-red-400">{team.losses}</td>
                  <td className="px-6 py-4 text-center text-gray-300">{team.goals_for}</td>
                  <td className="px-6 py-4 text-center text-gray-300">{team.goals_against}</td>
                  <td className="px-6 py-4 text-center font-bold text-emerald-400 text-lg">
                    {team.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};