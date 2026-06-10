import React, { useState, useEffect } from 'react';
import { getMatches, getTeamStandings } from '../api';

interface Match {
  id: number;
  home_team: string;
  away_team: string;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  group_stage: string;
  stadium: string | null;
  city: string | null;
}

interface TeamMeta {
  name: string;
  crest: string | null;
  flag: string | null;
  tla: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'FINISHED': return 'bg-emerald-500/20 text-emerald-400';
    case 'IN_PLAY':
    case 'LIVE':    return 'bg-red-500/20 text-red-400';
    case 'TIMED':
    case 'SCHEDULED': return 'bg-blue-500/20 text-blue-400';
    default:        return 'bg-gray-500/20 text-gray-400';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'TIMED':
    case 'SCHEDULED': return 'Upcoming';
    case 'FINISHED':  return 'Finished';
    case 'IN_PLAY':
    case 'LIVE':      return '● Live';
    default:          return status;
  }
};

const TeamDisplay = ({ name, meta, align }: { name: string; meta: TeamMeta | undefined; align: 'left' | 'right' }) => {
  const [imgError, setImgError] = React.useState(false);
  const src = !imgError && meta?.crest ? meta.crest : meta?.flag ?? null;

  return (
    <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      {src ? (
        <img src={src} alt={name} className="w-8 h-8 object-contain flex-shrink-0" onError={() => setImgError(true)} />
      ) : (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 font-bold flex-shrink-0">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className="font-semibold text-white text-sm leading-tight">{name}</span>
    </div>
  );
};

export const Schedule = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamMeta, setTeamMeta] = useState<Record<string, TeamMeta>>({});
  const [viewMode, setViewMode] = useState<'group' | 'date'>('group');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMatches(''),
      getTeamStandings(),
    ])
      .then(([matchRes, teamRes]) => {
        setMatches(matchRes.data);
        // Build a name-keyed map of team meta
        const meta: Record<string, TeamMeta> = {};
        (teamRes.data as TeamMeta[]).forEach((t) => {
          meta[t.name] = t;
        });
        setTeamMeta(meta);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const groupByGroup = (matches: Match[]) => {
    const grouped: Record<string, Match[]> = {};
    matches.forEach((match) => {
      const key = match.group_stage || 'OTHER';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(match);
    });
    return Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)));
  };

  const groupByDate = (matches: Match[]) => {
    const grouped: Record<string, Match[]> = {};
    matches.forEach((match) => {
      const date = new Date(match.match_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(match);
    });
    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    );
  };

  const grouped = viewMode === 'group' ? groupByGroup(matches) : groupByDate(matches);

  const MatchCard = ({ match }: { match: Match }) => {
    const isFinished = match.status === 'FINISHED';
    const isLive = match.status === 'IN_PLAY' || match.status === 'LIVE';

    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 transition hover:bg-white/[0.07]">

        {/* Status row */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(match.status)}`}>
            {getStatusLabel(match.status)}
          </span>
          {viewMode === 'group' && match.group_stage && (
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {match.group_stage.replace('GROUP_', 'Group ')}
            </span>
          )}
        </div>

        {/* Teams + Score row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <TeamDisplay name={match.home_team} meta={teamMeta[match.home_team]} align="left" />
          </div>

          <div className="text-center flex-shrink-0 min-w-[80px]">
            {isFinished ? (
              <div className="text-3xl font-black text-white">
                {match.home_score} <span className="text-gray-500 text-xl">-</span> {match.away_score}
              </div>
            ) : isLive ? (
              <div className="text-red-400 text-sm font-bold animate-pulse">LIVE</div>
            ) : (
              <div className="text-gray-400 text-sm font-medium">
                {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          <div className="flex-1 flex justify-end">
            <TeamDisplay name={match.away_team} meta={teamMeta[match.away_team]} align="right" />
          </div>
        </div>

        {/* Venue + Date row */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>📅 {new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          {match.stadium && (
            <span>🏟️ {match.stadium}{match.city ? `, ${match.city}` : ''}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Match Schedule</h2>
        <div className="bg-white/5 border border-white/10 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setViewMode('group')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              viewMode === 'group' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            By Group
          </button>
          <button
            onClick={() => setViewMode('date')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              viewMode === 'date' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            By Date
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          <p className="text-gray-400 mt-4">Loading matches...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([key, groupMatches]) => (
            <div key={key}>
              <h3 className="text-base font-bold text-emerald-400 mb-3 uppercase tracking-wider">
                {key.startsWith('GROUP_') ? key.replace('GROUP_', 'Group ') : key}
              </h3>
              <div className="grid gap-3">
                {groupMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};