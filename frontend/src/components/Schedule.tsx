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

const getStatusStyle = (status: string): React.CSSProperties => {
  switch (status) {
    case 'FINISHED': return { background: 'rgba(74,222,128,0.1)', color: '#4ade80' };
    case 'IN_PLAY':
    case 'LIVE': return { background: 'rgba(248,113,113,0.12)', color: '#f87171' };
    case 'TIMED':
    case 'SCHEDULED': return { background: 'rgba(212,175,55,0.1)', color: '#d4af37' };
    default: return { background: 'rgba(255,255,255,0.06)', color: '#8b8b9e' };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'TIMED':
    case 'SCHEDULED': return 'Upcoming';
    case 'FINISHED': return 'FT';
    case 'IN_PLAY':
    case 'LIVE': return '● Live';
    default: return status;
  }
};

const TeamDisplay = ({ name, meta, align }: { name: string; meta: TeamMeta | undefined; align: 'left' | 'right' }) => {
  const [imgError, setImgError] = React.useState(false);
  const src = !imgError && meta?.crest ? meta.crest : meta?.flag ?? null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 10px)', flexDirection: align === 'right' ? 'row-reverse' : 'row', minWidth: 0, flex: 1, overflow: 'hidden' }}>
      {src ? (
        <img src={src} alt={name} style={{ width: 'clamp(20px, 5vw, 28px)', height: 'clamp(20px, 5vw, 28px)', objectFit: 'contain', flexShrink: 0 }}
          onError={() => setImgError(true)} />
      ) : (
        <div style={{
          width: 'clamp(20px, 5vw, 28px)', height: 'clamp(20px, 5vw, 28px)', borderRadius: '50%',
          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(8px, 1.5vw, 10px)', color: '#d4af37', fontWeight: 700, flexShrink: 0,
        }}>
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: 600, color: '#f0ede4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
    </div>
  );
};

export const Schedule = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamMeta, setTeamMeta] = useState<Record<string, TeamMeta>>({});
  const [viewMode, setViewMode] = useState<'group' | 'date'>('group');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMatches(''), getTeamStandings()])
      .then(([matchRes, teamRes]) => {
        const matches = Array.isArray(matchRes.data) ? matchRes.data : [];
        const teams = Array.isArray(teamRes.data) ? teamRes.data : [];
        setMatches(matches);
        const meta: Record<string, TeamMeta> = {};
        teams.forEach((t: TeamMeta) => { meta[t.name] = t; });
        setTeamMeta(meta);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groupByGroup = (ms: Match[]) => {
    const grouped: Record<string, Match[]> = {};
    ms.forEach((m) => {
      const key = m.group_stage || 'OTHER';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
    return Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)));
  };

  const groupByDate = (ms: Match[]) => {
    const grouped: Record<string, Match[]> = {};
    ms.forEach((m) => {
      const date = new Date(m.match_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(m);
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
      <div style={{
        background: 'rgba(16, 16, 26, 0.85)',
        border: '1px solid rgba(212, 175, 55, 0.12)',
        borderRadius: 12,
        padding: 'clamp(0.75rem, 3vw, 1.25rem)',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.12)')}
      >
        {/* Status row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            padding: '3px 10px', borderRadius: 20,
            ...getStatusStyle(match.status),
          }}>
            {getStatusLabel(match.status)}
          </span>
          {viewMode === 'group' && match.group_stage && (
            <span style={{ fontSize: 11, color: '#555566', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {match.group_stage.replace('GROUP_', 'Group ')}
            </span>
          )}
        </div>

        {/* Teams + Score - Stack on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)', flexDirection: window.innerWidth < 480 ? 'column' : 'row', width: '100%' }}>
          <div style={{ flex: 1, width: '100%', minWidth: 0, display: 'flex', alignItems: 'center' }}>
            <TeamDisplay name={match.home_team} meta={teamMeta[match.home_team]} align="left" />
          </div>

          <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 'max-content', order: window.innerWidth < 480 ? -1 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isFinished ? (
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(20px, 8vw, 32px)', letterSpacing: '0.05em', color: '#f0ede4', whiteSpace: 'nowrap' }}>
                {match.home_score} <span style={{ color: '#555566', fontSize: 'clamp(14px, 6vw, 22px)' }}>–</span> {match.away_score}
              </div>
            ) : isLive ? (
              <div style={{ color: '#f87171', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>LIVE</div>
            ) : (
              <div style={{ color: '#8b8b9e', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', width: '100%', minWidth: 0, alignItems: 'center' }}>
            <TeamDisplay name={match.away_team} meta={teamMeta[match.away_team]} align="right" />
          </div>
        </div>

        {/* Venue */}
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', gap: 16, flexWrap: 'wrap',
          fontSize: 'clamp(11px, 2vw, 12px)', color: '#555566',
        }}>
          <span>{new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          {match.stadium && <span>{match.stadium}{match.city ? `, ${match.city}` : ''}</span>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, flexDirection: window.innerWidth < 480 ? 'column' : 'row' }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px, 6vw, 30px)', letterSpacing: '0.1em', color: '#f0ede4' }}>
          Match Schedule
        </h2>

        {/* Toggle */}
        <div style={{
          background: 'rgba(16,16,26,0.9)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 8,
          padding: 3,
          display: 'flex',
          gap: 3,
        }}>
          {(['group', 'date'] as const).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              background: viewMode === mode ? '#d4af37' : 'none',
              border: 'none',
              borderRadius: 5,
              color: viewMode === mode ? '#08080e' : '#8b8b9e',
              cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(12px, 2vw, 14px)',
              letterSpacing: '0.08em',
              padding: '6px clamp(12px, 2vw, 16px)',
              transition: 'all 0.15s',
              fontWeight: viewMode === mode ? 700 : 400,
            }}>
              {mode === 'group' ? 'By Group' : 'By Date'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: '#d4af37',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          <p style={{ color: '#555566', fontSize: 'clamp(12px, 2vw, 14px)' }}>Loading matches...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(grouped).map(([key, groupMatches]) => (
            <div key={key}>
              <h3 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(14px, 3vw, 18px)',
                letterSpacing: '0.15em',
                color: '#d4af37',
                marginBottom: 10,
                textTransform: 'uppercase',
              }}>
                {key.startsWith('GROUP_') ? key.replace('GROUP_', 'Group ') : key}
              </h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {groupMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};