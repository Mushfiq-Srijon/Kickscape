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

const StatRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) => (
  <div className="pd-stat-row">
    <span className="pd-stat-row__label">{label}</span>
    <span className="pd-stat-row__value">{value ?? 'N/A'}</span>
  </div>
);

const CardBadge = ({
  count,
  type,
}: {
  count: number;
  type: 'yellow' | 'red';
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div
      style={{
        width: 14,
        height: 18,
        borderRadius: 2,
        background: type === 'yellow' ? '#facc15' : '#f87171',
      }}
    />
    <span className="pd-badge-count">{count}</span>
  </div>
);

const positionLabel = (pos: string | null) => {
  const map: Record<string, string> = {
    GK: 'Goalkeeper',
    CB: 'Centre-Back',
    LB: 'Left-Back',
    RB: 'Right-Back',
    CM: 'Central Midfielder',
    LM: 'Left Midfielder',
    RM: 'Right Midfielder',
    CAM: 'Attacking Midfielder',
    CDM: 'Defensive Midfielder',
    LW: 'Left Winger',
    RW: 'Right Winger',
    ST: 'Striker',
    CF: 'Centre-Forward',
  };
  return pos ? (map[pos] ?? pos) : 'N/A';
};

export const PlayerDetail = ({ id }: Props) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [wiki, setWiki] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/players/${id}`)
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
        <div className="pd-spinner" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!player) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#555566' }}>
        Player not found
      </div>
    );
  }

  const formatHeight = (h: number | null) => (h ? `${h.toFixed(2)} m` : 'N/A');
  const formatDOB = (dob: string | null) => {
    if (!dob) return 'N/A';
    return new Date(dob).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="pd-root">
      {/* Header */}
      <div className="pd-card pd-header">
        <div className="pd-header__main">
          <h1 className="pd-header__name">{player.name}</h1>
          <p className="pd-header__team">{player.team}</p>
          {player.club_name && (
            <p className="pd-header__club">Club: {player.club_name}</p>
          )}
        </div>

        {player.national_kit_number && (
          <div className="pd-header__kit">
            <p className="pd-header__kit-label">Kit No.</p>
            <div className="pd-header__kit-number">
              {player.national_kit_number}
            </div>
          </div>
        )}
      </div>

      {/* Wikipedia Bio */}
      {wiki && wiki.extract && (
        <div className="pd-card">
          <p className="pd-section-label">About</p>
          <div className="pd-wiki">
            {wiki.image && (
              <img
                src={wiki.image}
                alt={player.name}
                className="pd-wiki__img"
              />
            )}
            <div className="pd-wiki__body">
              <p className="pd-wiki__extract">{wiki.extract}</p>
              {wiki.url && (
                <a
                  href={wiki.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-wiki__link"
                >
                  Full biography on Wikipedia →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info + Stats grid */}
      <div className="pd-grid">
        {/* Player Info */}
        <div className="pd-card">
          <p className="pd-section-label">Player Info</p>
          <StatRow label="Position" value={positionLabel(player.position)} />
          <StatRow label="Date of Birth" value={formatDOB(player.date_of_birth)} />
          <StatRow label="Age" value={player.age} />
          <StatRow label="Height" value={formatHeight(player.height)} />
          <StatRow
            label="Strong Foot"
            value={
              player.strong_foot
                ? player.strong_foot.charAt(0).toUpperCase() +
                  player.strong_foot.slice(1)
                : null
            }
          />
        </div>

        {/* WC Stats */}
        <div className="pd-card">
          <p className="pd-section-label">FIFA World Cup 2026</p>
          <StatRow label="Appearances" value={player.appearances} />
          <StatRow label="Goals" value={player.goals} />
          <StatRow label="Assists" value={player.assists} />

          <div className="pd-card-row">
            <span className="pd-stat-row__label">Yellow Cards</span>
            <CardBadge count={player.yellow_cards} type="yellow" />
          </div>
          <div className="pd-card-row pd-card-row--last">
            <span className="pd-stat-row__label">Red Cards</span>
            <CardBadge count={player.red_cards} type="red" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .pd-root {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 900px;
          margin: 0 auto;
        }

        /* ── Card base ── */
        .pd-card {
          background: rgba(16, 16, 26, 0.85);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 12px;
          padding: clamp(1rem, 3vw, 1.5rem);
        }
        .pd-section-label {
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #d4af37;
          text-transform: uppercase;
          margin-bottom: 16px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(13px, 2vw, 15px);
        }

        /* ── Header card ── */
        .pd-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }
        .pd-header__main { flex: 1; min-width: 0; }
        .pd-header__name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(32px, 8vw, 48px);
          letter-spacing: 0.05em;
          color: #f0ede4;
          line-height: 1;
          margin-bottom: 6px;
          word-break: break-word;
        }
        .pd-header__team {
          color: #d4af37;
          font-size: clamp(14px, 3vw, 16px);
          font-weight: 600;
          margin-bottom: 4px;
        }
        .pd-header__club { color: #555566; font-size: clamp(11px, 2vw, 13px); }

        .pd-header__kit { text-align: center; flex-shrink: 0; }
        .pd-header__kit-label {
          font-size: 10px;
          color: #555566;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .pd-header__kit-number {
          width: clamp(40px, 15vw, 60px);
          height: clamp(48px, 20vw, 72px);
          background: linear-gradient(135deg, #d4af37, #a88b28);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(24px, 6vw, 34px);
          color: #08080e;
        }

        /* ── Wiki ── */
        .pd-wiki {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .pd-wiki__img {
          width: clamp(80px, 25vw, 100px);
          height: clamp(80px, 25vw, 100px);
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .pd-wiki__body { flex: 1; min-width: 200px; }
        .pd-wiki__extract {
          font-size: clamp(12px, 2vw, 14px);
          color: #8b8b9e;
          line-height: 1.7;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pd-wiki__link {
          color: #d4af37;
          font-size: clamp(11px, 2vw, 13px);
          display: inline-block;
          margin-top: 10px;
          text-decoration: none;
          opacity: 0.85;
        }
        .pd-wiki__link:hover { opacity: 1; }

        /* ── Stats grid ── */
        .pd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: 1.25rem;
        }

        /* ── Stat rows ── */
        .pd-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .pd-stat-row__label {
          font-size: clamp(11px, 2vw, 13px);
          color: #555566;
        }
        .pd-stat-row__value {
          font-size: clamp(12px, 2vw, 14px);
          font-weight: 600;
          color: #f0ede4;
        }
        .pd-badge-count {
          font-size: clamp(12px, 3vw, 16px);
          font-weight: 700;
          color: #f0ede4;
        }
        .pd-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .pd-card-row--last { border-bottom: none; }

        /* ── Spinner ── */
        .pd-spinner {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #d4af37;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};