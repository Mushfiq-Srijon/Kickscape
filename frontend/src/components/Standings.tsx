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

const TeamCrest = ({
  crest,
  flag,
  name,
}: {
  crest: string | null;
  flag: string | null;
  name: string;
}) => {
  const [imgError, setImgError] = React.useState(false);
  const src = !imgError && crest ? crest : flag ?? null;

  if (!src) {
    return (
      <div className="st-crest st-crest--fallback">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="st-crest"
      onError={() => setImgError(true)}
    />
  );
};

export const Standings = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamStandings()
      .then((res) => {
        setTeams(Array.isArray(res.data) ? res.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groupedTeams = teams.reduce((acc: Record<string, Team[]>, team) => {
    const group = team.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(team);
    return acc;
  }, {});

  const sortedGroups = Object.keys(groupedTeams).sort();

  const sortTeams = (ts: Team[]) =>
    [...ts].sort(
      (a, b) =>
        b.points - a.points ||
        b.goals_for - b.goals_against - (a.goals_for - a.goals_against)
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 className="st-page-title">Group Standings</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div className="st-spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ── Mobile cards (hidden on desktop) ── */}
          <div className="st-cards-section">
            {sortedGroups.map((group) => (
              <div key={group} style={{ marginBottom: '1.5rem' }}>
                <h3 className="st-group-heading">
                  {group.replace('GROUP_', 'Group ')}
                </h3>
                <div className="st-cards">
                  {sortTeams(groupedTeams[group]).map((team, index) => (
                    <div
                      key={team.id}
                      className={`st-card${index < 2 ? ' st-card--qualify' : ''}`}
                    >
                      <div className="st-card__header">
                        <span className="st-card__rank">{index + 1}</span>
                        <TeamCrest crest={team.crest} flag={team.flag} name={team.name} />
                        <div className="st-card__info">
                          <p className="st-card__name">{team.name}</p>
                          {team.coach && (
                            <p className="st-card__coach">{team.coach}</p>
                          )}
                        </div>
                        <p className="st-card__pts">{team.points}</p>
                      </div>
                      <div className="st-card__stats">
                        <span>P: {team.played}</span>
                        <span className="st-stat--w">W: {team.wins}</span>
                        <span className="st-stat--d">D: {team.draws}</span>
                        <span className="st-stat--l">L: {team.losses}</span>
                        <span>GF: {team.goals_for}</span>
                        <span>GA: {team.goals_against}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: ONE table for all groups (hidden on mobile) ── */}
          <div className="st-table-wrap">
            <table className="st-table">
              {/* colgroup pins column widths once, shared by every tbody */}
              <colgroup>
                <col className="st-col--rank" />
                <col className="st-col--team" />
                <col className="st-col--num" />
                <col className="st-col--num" />
                <col className="st-col--num" />
                <col className="st-col--num" />
                <col className="st-col--num" />
                <col className="st-col--num" />
                <col className="st-col--num" />
                <col className="st-col--pts" />
              </colgroup>

              <thead>
                <tr className="st-table__head-row">
                  {['#', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`st-th${i === 9 ? ' st-th--pts' : ''}${i <= 1 ? ' st-th--left' : ''}`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              {sortedGroups.map((group) => (
                <tbody key={group}>
                  {/* Group label row */}
                  <tr className="st-table__group-row">
                    <td colSpan={10} className="st-td--group-label">
                      {group.replace('GROUP_', 'Group ')}
                    </td>
                  </tr>

                  {/* Team rows */}
                  {sortTeams(groupedTeams[group]).map((team, index) => (
                    <tr
                      key={team.id}
                      className={`st-table__row${index < 2 ? ' st-table__row--qualify' : ''}`}
                    >
                      <td className="st-td st-td--rank">{index + 1}</td>
                      <td className="st-td">
                        <div className="st-team-cell">
                          <TeamCrest crest={team.crest} flag={team.flag} name={team.name} />
                          <div style={{ minWidth: 0 }}>
                            <p className="st-team-cell__name">{team.name}</p>
                            {team.coach && (
                              <p className="st-team-cell__coach">{team.coach}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="st-td st-td--num">{team.played}</td>
                      <td className="st-td st-td--num st-td--w">{team.wins}</td>
                      <td className="st-td st-td--num st-td--d">{team.draws}</td>
                      <td className="st-td st-td--num st-td--l">{team.losses}</td>
                      <td className="st-td st-td--num">{team.goals_for}</td>
                      <td className="st-td st-td--num">{team.goals_against}</td>
                      <td className="st-td st-td--num">
                        {team.goals_for - team.goals_against > 0 ? '+' : ''}
                        {team.goals_for - team.goals_against}
                      </td>
                      <td className="st-td st-td--num st-td--pts">{team.points}</td>
                    </tr>
                  ))}

                  {/* Spacer row between groups (except after last) */}
                  <tr className="st-table__group-spacer">
                    <td colSpan={10} />
                  </tr>
                </tbody>
              ))}
            </table>
          </div>

        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .st-page-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(24px, 6vw, 30px);
          letter-spacing: 0.1em;
          color: #f0ede4;
        }
        .st-group-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(18px, 4vw, 22px);
          letter-spacing: 0.12em;
          color: #d4af37;
          margin-bottom: 0.75rem;
        }
        .st-spinner {
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #d4af37;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }

        /* ── Crest ── */
        .st-crest {
          width: clamp(24px, 5vw, 30px);
          height: clamp(24px, 5vw, 30px);
          object-fit: contain;
          flex-shrink: 0;
        }
        .st-crest--fallback {
          border-radius: 50%;
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(9px, 2vw, 11px);
          color: #d4af37;
          font-weight: 700;
        }

        /* ── Mobile cards (default) ── */
        .st-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .st-card {
          background: rgba(16, 16, 26, 0.85);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 8px;
          padding: 12px;
          border-left: 3px solid transparent;
        }
        .st-card--qualify { border-left-color: rgba(212,175,55,0.5); }

        .st-card__header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .st-card__rank {
          font-size: 14px;
          font-weight: 700;
          color: #d4af37;
          min-width: 24px;
        }
        .st-card__info { flex: 1; min-width: 0; }
        .st-card__name {
          font-size: 13px;
          font-weight: 600;
          color: #f0ede4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .st-card__coach { font-size: 10px; color: #555566; margin-top: 1px; }
        .st-card__pts { font-size: 16px; font-weight: 700; color: #d4af37; }

        .st-card__stats {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: #8b8b9e;
          flex-wrap: wrap;
        }
        .st-stat--w { color: #4ade80; }
        .st-stat--d { color: #facc15; }
        .st-stat--l { color: #f87171; }

        /* Hide desktop table on mobile */
        .st-table-wrap { display: none; }

        /* ── Desktop ── */
        @media (min-width: 768px) {
          .st-cards-section { display: none; }

          .st-table-wrap {
            display: block;
            background: rgba(16, 16, 26, 0.85);
            border: 1px solid rgba(212, 175, 55, 0.15);
            border-radius: 12px;
            overflow: auto;
          }

          /* Single table — colgroup controls all column widths */
          .st-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 620px;
            table-layout: fixed;
          }

          .st-col--rank { width: 40px; }
          .st-col--team { width: auto; }   /* stretches to fill remaining space */
          .st-col--num  { width: 48px; }
          .st-col--pts  { width: 54px; }

          .st-table__head-row {
            border-bottom: 1px solid rgba(212,175,55,0.12);
            background: rgba(212,175,55,0.05);
          }
          .st-th {
            padding: clamp(6px, 1vw, 10px) clamp(8px, 1.5vw, 12px);
            text-align: center;
            font-size: clamp(10px, 1.5vw, 11px);
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #555566;
            text-transform: uppercase;
          }
          .st-th--left { text-align: left; }
          .st-th--pts  { color: #d4af37; }

          /* Group label row */
          .st-table__group-row {
            background: rgba(212,175,55,0.06);
          }
          .st-td--group-label {
            padding: 6px clamp(8px, 1.5vw, 14px);
            font-family: 'Bebas Neue', sans-serif;
            font-size: clamp(13px, 1.8vw, 15px);
            letter-spacing: 0.12em;
            color: #d4af37;
            border-top: 1px solid rgba(212,175,55,0.12);
          }

          /* Spacer between groups */
          .st-table__group-spacer td {
            height: 10px;
            background: transparent;
          }

          .st-table__row { border-bottom: 1px solid rgba(255,255,255,0.04); }
          .st-table__row--qualify { border-left: 2px solid rgba(212,175,55,0.5); }

          .st-td {
            padding: clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px);
            color: #8b8b9e;
            font-size: clamp(11px, 1.5vw, 13px);
          }
          .st-td--rank { color: #555566; text-align: center; }
          .st-td--num  { text-align: center; }
          .st-td--w    { color: #4ade80; font-weight: 600; }
          .st-td--d    { color: #facc15; font-weight: 600; }
          .st-td--l    { color: #f87171; font-weight: 600; }
          .st-td--pts  {
            font-size: clamp(13px, 2vw, 16px);
            font-weight: 700;
            color: #d4af37;
            text-align: center;
          }

          .st-team-cell {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .st-team-cell__name {
            font-size: clamp(12px, 2vw, 14px);
            font-weight: 600;
            color: #f0ede4;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .st-team-cell__coach {
            font-size: clamp(10px, 1.5vw, 11px);
            color: #555566;
            margin-top: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};