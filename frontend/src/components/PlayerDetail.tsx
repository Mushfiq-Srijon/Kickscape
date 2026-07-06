import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Player {
  id: number;
  name: string;
  team: string;
  position: string;
  age: number | null;
  national_kit_number: number | null;
  club_name: string | null;
  date_of_birth: string | null;
  goals: number;
  assists: number;
  appearances: number;
  yellow_cards: number;
  red_cards: number;
}

interface WikiStructured {
  nationality: string | null;
  place_of_birth: string | null;
  height_cm: string | null;
  foot: string | null;
  current_club: string | null;
  clubs: string[];
  honours: string[];
  intl_caps: number | null;
  intl_goals: number | null;
}

interface WikiData {
  title: string;
  extract: string;
  image: string | null;
  full_image: string | null;
  structured: WikiStructured | null;
}

interface Props { id: number; }

const gold = '#d4af37';

const StatRow = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className="pd-stat-row">
    <span className="pd-label">{label}</span>
    <span className="pd-value">{value ?? 'N/A'}</span>
  </div>
);

const CardBadge = ({ count, type }: { count: number; type: 'yellow' | 'red' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 14, height: 18, borderRadius: 2, background: type === 'yellow' ? '#facc15' : '#f87171' }} />
    <span className="pd-badge-count">{count}</span>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="pd-section-label">{children}</p>
);

const WikiSkeleton = () => (
  <div className="pd-card" style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}>
    <div style={{ height: 14, width: 100, background: 'rgba(212,175,55,0.15)', borderRadius: 4, marginBottom: 16 }} />
    {[100, 90, 85, 70, 60, 75].map((w, i) => (
      <div key={i} style={{ height: 11, width: `${w}%`, background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: 8 }} />
    ))}
  </div>
);

const positionLabel = (pos: string | null) => {
  const map: Record<string, string> = {
    GK: 'Goalkeeper', CB: 'Centre-Back', LB: 'Left-Back', RB: 'Right-Back',
    CM: 'Central Midfielder', LM: 'Left Midfielder', RM: 'Right Midfielder',
    CAM: 'Attacking Midfielder', CDM: 'Defensive Midfielder',
    LW: 'Left Winger', RW: 'Right Winger', ST: 'Striker', CF: 'Centre-Forward',
    Offence: 'Forward', Defence: 'Defender', Midfield: 'Midfielder',
  };
  return pos ? (map[pos] ?? pos) : null;
};

const formatDOB = (dob: string | null) => {
  if (!dob) return null;
  return new Date(dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatHeight = (cm: string | null) => {
  if (!cm) return null;
  const n = parseFloat(cm);
  if (isNaN(n) || n <= 0) return null;
  return `${(n / 100).toFixed(2)} m`;
};

export const PlayerDetail = ({ id }: Props) => {
  const [player, setPlayer]               = useState<Player | null>(null);
  const [wiki, setWiki]                   = useState<WikiData | null>(null);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [wikiLoading, setWikiLoading]     = useState(true);
  const [bioExpanded, setBioExpanded]     = useState(false);

  useEffect(() => {
    setPlayerLoading(true);
    setWikiLoading(true);
    setPlayer(null);
    setWiki(null);
    setBioExpanded(false);

    // Instant: basic player data
    axios.get(`${process.env.REACT_APP_API_URL}/api/players/${id}/basic`)
      .then((res) => setPlayer(res.data.player))
      .catch(console.error)
      .finally(() => setPlayerLoading(false));

    // Background: wiki data
    axios.get(`${process.env.REACT_APP_API_URL}/api/players/${id}/wiki`)
      .then((res) => setWiki(res.data.wiki ?? null))
      .catch(console.error)
      .finally(() => setWikiLoading(false));
  }, [id]);

  if (playerLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
      <div className="pd-spinner" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!player) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#555566' }}>Player not found</div>
  );

  const s = wiki?.structured;

  // Height: prefer wikidata, fallback nothing (we removed height from DB earlier)
  const height = formatHeight(s?.height_cm ?? null);

  // Club: prefer wikidata current_club, fallback DB club_name, exclude if same as team
  const clubDisplay = (() => {
    const c = s?.current_club ?? player.club_name;
    if (!c || c === player.team) return null;
    return c;
  })();

  return (
    <div className="pd-root">

      {/* ── HERO ── */}
      <div className="pd-card pd-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', margin: '0 0 4px', fontWeight: 500 }}>
              {player.team}
            </p>
            <h1 className="pd-name">{player.name}</h1>
            {clubDisplay && (
              <p style={{ color: '#555566', fontSize: 'clamp(11px,2vw,13px)', marginTop: 4 }}>
                {clubDisplay}
              </p>
            )}
          </div>
          {player.national_kit_number && (
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: 10, color: '#555566', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Kit No.</p>
              <div className="pd-kit-number">{player.national_kit_number}</div>
            </div>
          )}
        </div>

        {/* Facts strip — only show facts we actually have */}
        <div className="pd-facts-strip">
          {formatDOB(player.date_of_birth) && <span className="pd-fact">🎂 {formatDOB(player.date_of_birth)}</span>}
          {player.age && <span className="pd-fact">Age {player.age}</span>}
          {height && <span className="pd-fact">📏 {height}</span>}
          {positionLabel(player.position) && <span className="pd-fact">⚽ {positionLabel(player.position)}</span>}
          {!wikiLoading && s?.nationality && <span className="pd-fact">🏳️ {s.nationality}</span>}
          {!wikiLoading && s?.place_of_birth && <span className="pd-fact">📍 {s.place_of_birth}</span>}
          {!wikiLoading && s?.foot && <span className="pd-fact">👟 {s.foot} foot</span>}
        </div>
      </div>

      {/* ── BIOGRAPHY ── */}
      {wikiLoading ? <WikiSkeleton /> : wiki?.extract ? (
        <div className="pd-card">
          <SectionLabel>Biography</SectionLabel>
          {/* Only show image here, NOT in hero */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {wiki.image && (
              <img src={wiki.image} alt={player.name}
                style={{ width: 90, height: 110, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid rgba(212,175,55,0.2)' }} />
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{
                fontSize: 'clamp(12px,2vw,14px)', color: '#8b8b9e', lineHeight: 1.75,
                ...(bioExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' })
              }}>
                {wiki.extract}
              </p>
              <button onClick={() => setBioExpanded(!bioExpanded)}
                style={{ marginTop: 8, background: 'none', border: 'none', color: gold, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>
                {bioExpanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#2a2a3a', marginTop: 10 }}>Source: Wikipedia</p>
        </div>
      ) : null}

      {/* ── TWO COLUMN: Player Info + WC 2026 ── */}
      <div className="pd-grid">
        <div className="pd-card">
          <SectionLabel>Player Info</SectionLabel>
          <StatRow label="Position" value={positionLabel(player.position)} />
          <StatRow label="Nationality" value={!wikiLoading ? (s?.nationality ?? null) : '...'} />
          <StatRow label="Date of Birth" value={formatDOB(player.date_of_birth)} />
          <StatRow label="Age" value={player.age} />
          <StatRow label="Place of Birth" value={!wikiLoading ? (s?.place_of_birth ?? null) : '...'} />
          <StatRow label="Height" value={!wikiLoading ? (height ?? null) : '...'} />
          <StatRow label="Preferred Foot" value={!wikiLoading ? (s?.foot ?? null) : '...'} />
          {clubDisplay && <StatRow label="Current Club" value={clubDisplay} />}
        </div>

        <div className="pd-card">
          <SectionLabel>FIFA World Cup 2026</SectionLabel>
          <StatRow label="Appearances" value={player.appearances} />
          <StatRow label="Goals" value={player.goals} />
          <StatRow label="Assists" value={player.assists} />
          <div className="pd-stat-row">
            <span className="pd-label">Yellow Cards</span>
            <CardBadge count={player.yellow_cards} type="yellow" />
          </div>
          <div className="pd-stat-row" style={{ borderBottom: 'none' }}>
            <span className="pd-label">Red Cards</span>
            <CardBadge count={player.red_cards} type="red" />
          </div>
        </div>
      </div>

      {/* ── INTERNATIONAL CAREER ── */}
      {!wikiLoading && s && (s.intl_caps || s.intl_goals) && (
        <div className="pd-card">
          <SectionLabel>International Career</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 12 }}>
            {s.intl_caps ? (
              <div className="pd-stat-big">
                <span className="pd-stat-big__num">{s.intl_caps}</span>
                <span className="pd-stat-big__label">Caps</span>
              </div>
            ) : null}
            {s.intl_goals ? (
              <div className="pd-stat-big">
                <span className="pd-stat-big__num">{s.intl_goals}</span>
                <span className="pd-stat-big__label">Goals</span>
              </div>
            ) : null}
          </div>
          <p style={{ fontSize: 11, color: '#2a2a3a' }}>Source: Wikidata</p>
        </div>
      )}

      {/* ── CLUB CAREER ── */}
      {!wikiLoading && s?.clubs && s.clubs.length > 0 && (
        <div className="pd-card">
          <SectionLabel>Club Career</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {s.clubs.map((club, i) => (
              <span key={i} className="pd-tag">{club}</span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#2a2a3a' }}>Source: Wikidata</p>
        </div>
      )}

      {/* ── HONOURS ── */}
      {!wikiLoading && s?.honours && s.honours.length > 0 && (
        <div className="pd-card">
          <SectionLabel>Honours & Awards</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {s.honours.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: gold, fontSize: 14, flexShrink: 0 }}>🏆</span>
                <span className="pd-tag pd-tag--gold" style={{ flex: 1 }}>{h}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#2a2a3a' }}>Source: Wikidata</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.7} }

        .pd-root { display: flex; flex-direction: column; gap: 1.25rem; max-width: 900px; margin: 0 auto; }
        .pd-card { background: rgba(16,16,26,0.85); border: 1px solid rgba(212,175,55,0.15); border-radius: 12px; padding: clamp(1rem,3vw,1.5rem); }
        .pd-hero { background: linear-gradient(135deg,rgba(20,16,30,0.95),rgba(16,16,26,0.9)); border-color: rgba(212,175,55,0.25); }
        .pd-section-label { font-family: 'Bebas Neue', sans-serif; font-size: clamp(13px,2vw,16px); letter-spacing: 0.15em; color: ${gold}; text-transform: uppercase; margin-bottom: 16px; }
        .pd-name { font-family: 'Bebas Neue', sans-serif; font-size: clamp(30px,8vw,52px); letter-spacing: 0.05em; color: #f0ede4; line-height: 1; margin: 0 0 4px; word-break: break-word; }
        .pd-kit-number { width: clamp(44px,15vw,62px); height: clamp(52px,20vw,76px); background: linear-gradient(135deg,#d4af37,#a88b28); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: clamp(26px,7vw,38px); color: #08080e; }
        .pd-facts-strip { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.05); }
        .pd-fact { font-size: clamp(11px,2vw,12px); color: #8b8b9e; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 4px 10px; }
        .pd-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,260px),1fr)); gap: 1.25rem; }
        .pd-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .pd-label { font-size: clamp(11px,2vw,13px); color: #555566; }
        .pd-value { font-size: clamp(12px,2vw,14px); font-weight: 600; color: #f0ede4; }
        .pd-badge-count { font-size: clamp(12px,3vw,16px); font-weight: 700; color: #f0ede4; }
        .pd-stat-big { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 20px 16px; text-align: center; }
        .pd-stat-big__num { display: block; font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px,8vw,56px); color: ${gold}; line-height: 1; }
        .pd-stat-big__label { font-size: clamp(10px,2vw,12px); color: #555566; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 6px; display: block; }
        .pd-tag { font-size: clamp(11px,2vw,12px); color: #8b8b9e; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 5px 12px; }
        .pd-tag--gold { color: ${gold}; background: rgba(212,175,55,0.07); border-color: rgba(212,175,55,0.2); }
        .pd-spinner { width: 44px; height: 44px; border-radius: 50%; border: 2px solid transparent; border-top-color: ${gold}; animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
};