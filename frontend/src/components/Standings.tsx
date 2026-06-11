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
      <div style={{
        width: 'clamp(24px, 5vw, 30px)', height: 'clamp(24px, 5vw, 30px)', borderRadius: '50%',
        background: 'rgba(212,175,55,0.12)',
        border: '1px solid rgba(212,175,55,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'clamp(9px, 2vw, 11px)', color: '#d4af37', fontWeight: 700, flexShrink: 0,
      }}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img src={src} alt={name} style={{ width: 'clamp(24px, 5vw, 30px)', height: 'clamp(24px, 5vw, 30px)', objectFit: 'contain', flexShrink: 0 }}
      onError={() => setImgError(true)} />
  );
};

const sectionHeader: React.CSSProperties = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: 'clamp(18px, 4vw, 22px)',
  letterSpacing: '0.12em',
  color: '#d4af37',
  marginBottom: '0.75rem',
};

export const Standings = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamStandings()
      .then((res) => {
        const teams = Array.isArray(res.data) ? res.data : [];
        setTeams(teams);
      })
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px, 6vw, 30px)', letterSpacing: '0.1em', color: '#f0ede4' }}>
        Group Standings
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#d4af37' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: '#d4af37',
            animation: 'spin 0.8s linear infinite', margin: '0 auto',
          }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sortedGroups.map((group) => (
            <div key={group}>
              <h3 style={{ ...sectionHeader, fontSize: 'clamp(18px, 4vw, 22px)' }}>
                {group.replace('GROUP_', 'Group ')}
              </h3>

              {/* For mobile, show cards; for desktop, show table */}
              {window.innerWidth < 1024 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {groupedTeams[group]
                    .sort((a, b) => b.points - a.points || (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against))
                    .map((team, index) => (
                      <div
                        key={team.id}
                        style={{
                          background: 'rgba(16, 16, 26, 0.85)',
                          border: '1px solid rgba(212, 175, 55, 0.15)',
                          borderRadius: 8,
                          padding: '12px',
                          borderLeft: index < 2 ? '3px solid rgba(212,175,55,0.5)' : '3px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#d4af37', minWidth: 24 }}>{index + 1}</span>
                          <TeamCrest crest={team.crest} flag={team.flag} name={team.name} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#f0ede4' }}>{team.name}</p>
                            {team.coach && <p style={{ fontSize: 10, color: '#555566' }}>{team.coach}</p>}
                          </div>
                          <p style={{ fontSize: 16, fontWeight: 700, color: '#d4af37' }}>{team.points}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#8b8b9e', flexWrap: 'wrap' }}>
                          <span>P: {team.played}</span>
                          <span style={{ color: '#4ade80' }}>W: {team.wins}</span>
                          <span style={{ color: '#facc15' }}>D: {team.draws}</span>
                          <span style={{ color: '#f87171' }}>L: {team.losses}</span>
                          <span>GF: {team.goals_for}</span>
                          <span>GA: {team.goals_against}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(16, 16, 26, 0.85)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  borderRadius: 12,
                  overflow: 'auto',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.12)', background: 'rgba(212,175,55,0.05)' }}>
                        {['#', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((h, i) => (
                          <th key={h} style={{
                            padding: 'clamp(6px, 1vw, 10px) clamp(8px, 1.5vw, 12px)',
                            textAlign: i <= 1 ? 'left' : 'center',
                            fontSize: 'clamp(10px, 1.5vw, 11px)',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            color: i === 9 ? '#d4af37' : '#555566',
                            textTransform: 'uppercase',
                            width: i === 0 ? 32 : i === 1 ? 'auto' : 44,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedTeams[group]
                        .sort((a, b) => b.points - a.points || (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against))
                        .map((team, index) => (
                          <tr
                            key={team.id}
                            style={{
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                              borderLeft: index < 2 ? '2px solid rgba(212,175,55,0.5)' : '2px solid transparent',
                            }}
                          >
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)', color: '#555566', fontSize: 'clamp(11px, 1.5vw, 13px)' }}>{index + 1}</td>
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <TeamCrest crest={team.crest} flag={team.flag} name={team.name} />
                                <div style={{ minWidth: 0 }}>
                                  <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, color: '#f0ede4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</p>
                                  {team.coach && (
                                    <p style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#555566', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.coach}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)', textAlign: 'center', fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#8b8b9e' }}>{team.played}</td>
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)', textAlign: 'center', fontSize: 'clamp(11px, 1.5vw, 13px)', fontWeight: 600, color: '#4ade80' }}>{team.wins}</td>
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)', textAlign: 'center', fontSize: 'clamp(11px, 1.5vw, 13px)', fontWeight: 600, color: '#facc15' }}>{team.draws}</td>
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)', textAlign: 'center', fontSize: 'clamp(11px, 1.5vw, 13px)', fontWeight: 600, color: '#f87171' }}>{team.losses}</td>
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)', textAlign: 'center', fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#8b8b9e' }}>{team.goals_for}</td>
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)', textAlign: 'center', fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#8b8b9e' }}>{team.goals_against}</td>
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)', textAlign: 'center', fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#8b8b9e' }}>
                              {team.goals_for - team.goals_against > 0 ? '+' : ''}{team.goals_for - team.goals_against}
                            </td>
                            <td style={{ padding: 'clamp(8px, 1.5vw, 14px) clamp(6px, 1vw, 12px)', textAlign: 'center', fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: 700, color: '#d4af37' }}>{team.points}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};