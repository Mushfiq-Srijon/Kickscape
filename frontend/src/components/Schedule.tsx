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

const TeamDisplay = ({
  name,
  meta,
  align,
}: {
  name: string;
  meta: TeamMeta | undefined;
  align: 'left' | 'right';
}) => {
  const [imgError, setImgError] = React.useState(false);
  const src = !imgError && meta?.crest ? meta.crest : meta?.flag ?? null;

  return (
    <div className={`sch-team sch-team--${align}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="sch-team__crest"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="sch-team__fallback">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className="sch-team__name">{name}</span>
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
    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    );
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
      Object.entries(grouped).sort(
        ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
      )
    );
  };

  const grouped = viewMode === 'group' ? groupByGroup(matches) : groupByDate(matches);

  const MatchCard = ({ match }: { match: Match }) => {
    const isFinished = match.status === 'FINISHED';
    const isLive = match.status === 'IN_PLAY' || match.status === 'LIVE';

    return (
      <div className="sch-card">
        {/* Status row */}
        <div className="sch-card__top">
          <span
            className="sch-card__status"
            style={getStatusStyle(match.status)}
          >
            {getStatusLabel(match.status)}
          </span>
          {viewMode === 'group' && match.group_stage && (
            <span className="sch-card__group">
              {match.group_stage.replace('GROUP_', 'Group ')}
            </span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="sch-card__matchrow">
          <div className="sch-card__side sch-card__side--home">
            <TeamDisplay name={match.home_team} meta={teamMeta[match.home_team]} align="left" />
          </div>

          <div className="sch-card__score">
            {isFinished ? (
              <span className="sch-card__score-finished">
                {match.home_score}
                <span className="sch-card__score-sep"> – </span>
                {match.away_score}
              </span>
            ) : isLive ? (
              <span className="sch-card__score-live">LIVE</span>
            ) : (
              <span className="sch-card__score-time">
                {new Date(match.match_date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          <div className="sch-card__side sch-card__side--away">
            <TeamDisplay name={match.away_team} meta={teamMeta[match.away_team]} align="right" />
          </div>
        </div>

        {/* Venue */}
        <div className="sch-card__venue">
          <span>
            {new Date(match.match_date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
          {match.stadium && (
            <span>{match.stadium}{match.city ? `, ${match.city}` : ''}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header row */}
      <div className="sch-header">
        <h2 className="sch-title">Match Schedule</h2>
        <div className="sch-toggle">
          {(['group', 'date'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`sch-toggle__btn${viewMode === mode ? ' sch-toggle__btn--active' : ''}`}
            >
              {mode === 'group' ? 'By Group' : 'By Date'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div className="sch-spinner" />
          <p style={{ color: '#555566', fontSize: 'clamp(12px, 2vw, 14px)', marginTop: '1rem' }}>
            Loading matches...
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(grouped).map(([key, groupMatches]) => (
            <div key={key}>
              <h3 className="sch-group-heading">
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Header ── */
        .sch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .sch-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(24px, 6vw, 30px);
          letter-spacing: 0.1em;
          color: #f0ede4;
        }

        /* ── Toggle ── */
        .sch-toggle {
          background: rgba(16,16,26,0.9);
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 8px;
          padding: 3px;
          display: flex;
          gap: 3px;
        }
        .sch-toggle__btn {
          background: none;
          border: none;
          border-radius: 5px;
          color: #8b8b9e;
          cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(12px, 2vw, 14px);
          letter-spacing: 0.08em;
          padding: 6px clamp(12px, 2vw, 16px);
          transition: all 0.15s;
        }
        .sch-toggle__btn--active {
          background: #d4af37;
          color: #08080e;
          font-weight: 700;
        }

        /* ── Group heading ── */
        .sch-group-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(14px, 3vw, 18px);
          letter-spacing: 0.15em;
          color: #d4af37;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        /* ── Match card ── */
        .sch-card {
          background: rgba(16, 16, 26, 0.85);
          border: 1px solid rgba(212, 175, 55, 0.12);
          border-radius: 12px;
          padding: clamp(0.75rem, 3vw, 1.25rem);
          transition: border-color 0.15s;
        }
        .sch-card:hover { border-color: rgba(212,175,55,0.3); }

        .sch-card__top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .sch-card__status {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .sch-card__group {
          font-size: 11px;
          color: #555566;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Match row — always a single row with home | score | away */
        .sch-card__matchrow {
          display: flex;
          align-items: center;
          gap: clamp(8px, 2vw, 12px);
        }
        .sch-card__side {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
        }
        .sch-card__side--away {
          justify-content: flex-end;
        }
        .sch-card__score {
          flex-shrink: 0;
          text-align: center;
          min-width: 60px;
        }
        .sch-card__score-finished {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(20px, 5vw, 32px);
          letter-spacing: 0.05em;
          color: #f0ede4;
          white-space: nowrap;
        }
        .sch-card__score-sep {
          color: #555566;
          font-size: clamp(14px, 4vw, 22px);
        }
        .sch-card__score-live {
          color: #f87171;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }
        .sch-card__score-time {
          color: #8b8b9e;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }

        /* On very small screens, shrink team name font */
        @media (max-width: 360px) {
          .sch-card__score { min-width: 44px; }
        }

        .sch-card__venue {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          font-size: clamp(11px, 2vw, 12px);
          color: #555566;
        }

        /* ── Team display ── */
        .sch-team {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1.5vw, 10px);
          min-width: 0;
          overflow: hidden;
        }
        .sch-team--right { flex-direction: row-reverse; }
        .sch-team__crest {
          width: clamp(20px, 5vw, 28px);
          height: clamp(20px, 5vw, 28px);
          object-fit: contain;
          flex-shrink: 0;
        }
        .sch-team__fallback {
          width: clamp(20px, 5vw, 28px);
          height: clamp(20px, 5vw, 28px);
          border-radius: 50%;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(8px, 1.5vw, 10px);
          color: #d4af37;
          font-weight: 700;
          flex-shrink: 0;
        }
        .sch-team__name {
          font-size: clamp(11px, 2.5vw, 14px);
          font-weight: 600;
          color: #f0ede4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Spinner ── */
        .sch-spinner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #d4af37;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};