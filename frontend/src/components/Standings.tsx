import React, { useState, useEffect } from 'react';
import { getTeamStandings } from '../api';

interface Team {
  id: number;
  name: string;
  tla: string | null;
  crest: string | null;
  flag: string | null;
  coach: string | null;
  group: string;
  group_position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

const TeamCrest = ({ crest, flag, name }: { crest: string | null; flag: string | null; name: string }) => {
  const [imgError, setImgError] = React.useState(false);

  const src = !imgError && crest ? crest : flag ?? null;

  if (!src) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 font-bold flex-shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="w-8 h-8 object-contain flex-shrink-0"
      onError={() => setImgError(true)}
    />
  );
};

export const Standings = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamStandings()
      .then((res) => setTeams(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const groupedTeams = teams.reduce((acc: Record<string, Team[]>, team) => {
    const group = team.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(team);
    return acc;
  }, {});

  const sortedGroups = Object.keys(groupedTeams).sort();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Group Standings</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroups.map((group) => (
            <div key={group}>
              <h3 className="text-lg font-bold text-emerald-400 mb-3 uppercase tracking-wider">
                {group.replace('GROUP_', 'Group ')}
              </h3>

              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-6">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">P</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">W</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">D</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">L</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">GF</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">GA</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">GD</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-emerald-400 uppercase tracking-wider">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedTeams[group]
                      .sort((a, b) => b.points - a.points || (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against))
                      .map((team, index) => (
                        <tr
                          key={team.id}
                          className={`border-b border-white/5 hover:bg-white/5 transition ${
                            index < 2 ? 'border-l-2 border-l-emerald-500/40' : ''
                          }`}
                        >
                          <td className="px-4 py-4 text-gray-500 text-sm">{index + 1}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <TeamCrest crest={team.crest} flag={team.flag} name={team.name} />
                              <div>
                                <p className="font-semibold text-white text-sm">{team.name}</p>
                                {team.coach && (
                                  <p className="text-xs text-gray-500 mt-0.5">⚽ {team.coach}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-gray-300 text-sm">{team.played}</td>
                          <td className="px-4 py-4 text-center text-green-400 text-sm font-medium">{team.wins}</td>
                          <td className="px-4 py-4 text-center text-yellow-400 text-sm font-medium">{team.draws}</td>
                          <td className="px-4 py-4 text-center text-red-400 text-sm font-medium">{team.losses}</td>
                          <td className="px-4 py-4 text-center text-gray-300 text-sm">{team.goals_for}</td>
                          <td className="px-4 py-4 text-center text-gray-300 text-sm">{team.goals_against}</td>
                          <td className="px-4 py-4 text-center text-gray-400 text-sm">
                            {team.goals_for - team.goals_against > 0 ? '+' : ''}
                            {team.goals_for - team.goals_against}
                          </td>
                          <td className="px-4 py-4 text-center font-bold text-emerald-400 text-base">{team.points}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};