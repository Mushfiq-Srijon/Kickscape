import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Player {
  id: number;
  name: string;
  team: string;
  position: string;
  age: number | null;
  height: number | null;
  strong_foot: string | null;
  national_kit_number: number | null;
  club_name: string | null;
  date_of_birth: string | null;
  goals: number;
  assists: number;
  appearances: number;
  yellow_cards: number;
  red_cards: number;
  bio: string | null;
}

interface WikiData {
  title: string;
  extract: string;
  image: string | null;
  url: string | null;
}

interface Props {
  id: number;
}

const StatRow = ({ label, value }: { label: string; value: string | number | null }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#555566' }}>{label}</span>
    <span style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, color: '#f0ede4' }}>{value ?? 'N/A'}</span>
  </div>
);

const CardBadge = ({ count, type }: { count: number; type: 'yellow' | 'red' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{
      width: 14, height: 18, borderRadius: 2,
      background: type === 'yellow' ? '#facc15' : '#f87171',
    }} />
    <span style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 700, color: '#f0ede4' }}>{count}</span>
  </div>
);

const card: React.CSSProperties = {
  background: 'rgba(16, 16, 26, 0.85)',
  border: '1px solid rgba(212, 175, 55, 0.15)',
  borderRadius: 12,
  padding: 'clamp(1rem, 3vw, 1.5rem)',
};

const sectionLabel: React.CSSProperties = {
  fontWeight: 700,
  letterSpacing: '0.15em',
  color: '#d4af37',
  textTransform: 'uppercase',
  marginBottom: 16,
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: 'clamp(13px, 2vw, 15px)',
};

const positionLabel = (pos: string | null) => {
  const map: Record<string, string> = {
    GK: 'Goalkeeper', CB: 'Centre-Back', LB: 'Left-Back',
    RB: 'Right-Back', CM: 'Central Midfielder', LM: 'Left Midfielder',
    RM: 'Right Midfielder', CAM: 'Attacking Midfielder',
    CDM: 'Defensive Midfielder', LW: 'Left Winger', RW: 'Right Winger',
    ST: 'Striker', CF: 'Centre-Forward',
  };
  return pos ? (map[pos] ?? pos) : 'N/A';
};

export const PlayerDetail = ({ id }: Props) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [wiki, setWiki] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/players/${id}`)
      .then((res) => {
        setPlayer(res.data.player);
        setWiki(res.data.wiki ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '2px solid transparent', borderTopColor: '#d4af37',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!player) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: '#555566' }}>Player not found</div>;
  }

  const formatHeight = (h: number | null) => h ? `${h.toFixed(2)} m` : 'N/A';
  const formatDOB = (dob: string | null) => {
    if (!dob) return 'N/A';
    return new Date(dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexDirection: window.innerWidth < 480 ? 'column' : 'row' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(32px, 8vw, 48px)', letterSpacing: '0.05em',
              color: '#f0ede4', lineHeight: 1, marginBottom: 6,
            }}>
              {player.name}
            </h1>
            <p style={{ color: '#d4af37', fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: 600, marginBottom: 4 }}>{player.team}</p>
            {player.club_name && (
              <p style={{ color: '#555566', fontSize: 'clamp(11px, 2vw, 13px)' }}>Club: {player.club_name}</p>
            )}
          </div>

          {player.national_kit_number && (
            <div style={{ textAlign: 'center', flexShrink: 0, alignSelf: 'flex-start' }}>
              <p style={{ fontSize: 10, color: '#555566', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                Kit No.
              </p>
              <div style={{
                width: 'clamp(40px, 15vw, 60px)', height: 'clamp(48px, 20vw, 72px)',
                background: 'linear-gradient(135deg, #d4af37, #a88b28)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(24px, 6vw, 34px)', color: '#08080e', fontWeight: 400,
              }}>
                {player.national_kit_number}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wikipedia Bio */}
      {wiki && wiki.extract && (
        <div style={card}>
          <p style={sectionLabel}>About</p>
          <div style={{ display: 'flex', gap: 16, flexDirection: window.innerWidth < 480 ? 'column' : 'row' }}>
            {wiki.image && (
              <img src={wiki.image} alt={player.name}
                style={{ width: 'clamp(80px, 30vw, 100px)', height: 'clamp(80px, 30vw, 100px)', objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            )}
            <div>
              <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#8b8b9e', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {wiki.extract}
              </p>
              {wiki.url && (
                <a href={wiki.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#d4af37', fontSize: 'clamp(11px, 2vw, 13px)', display: 'inline-block', marginTop: 10, textDecoration: 'none', opacity: 0.85 }}>
                  Full biography on Wikipedia →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 100%, 300px), 1fr))', gap: '1.25rem' }}>

        {/* Player Info */}
        <div style={card}>
          <p style={sectionLabel}>Player Info</p>
          <StatRow label="Position" value={positionLabel(player.position)} />
          <StatRow label="Date of Birth" value={formatDOB(player.date_of_birth)} />
          <StatRow label="Age" value={player.age} />
          <StatRow label="Height" value={formatHeight(player.height)} />
          <StatRow label="Strong Foot" value={player.strong_foot ? player.strong_foot.charAt(0).toUpperCase() + player.strong_foot.slice(1) : null} />
        </div>

        {/* WC Stats */}
        <div style={card}>
          <p style={sectionLabel}>FIFA World Cup 2026</p>
          <StatRow label="Appearances" value={player.appearances} />
          <StatRow label="Goals" value={player.goals} />
          <StatRow label="Assists" value={player.assists} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 13, color: '#555566' }}>Yellow Cards</span>
            <CardBadge count={player.yellow_cards} type="yellow" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: 13, color: '#555566' }}>Red Cards</span>
            <CardBadge count={player.red_cards} type="red" />
          </div>
        </div>
      </div>
    </div>
  );
};