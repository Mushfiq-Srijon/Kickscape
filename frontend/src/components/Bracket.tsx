import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';

interface BracketTeam {
  name: string | null;
  label: string;
  crest: string | null;
  flag: string | null;
  qualified: boolean;
  points?: number;
  played?: number;
}

interface BracketMatch {
  home: BracketTeam;
  away: BracketTeam;
  match: number;
  venue: string;
  date: string;
  home_score?: number | null;
  away_score?: number | null;
  status?: string;
}

interface BracketData {
  group_standings: Record<string, any[]>;
  qualified_third: any[];
  r32: BracketMatch[];
  r16: BracketMatch[];
  qf: BracketMatch[];
  sf: BracketMatch[];
  final: BracketMatch | null;
  third_place?: BracketMatch | null;
}

const gold = '#d4af37';
const goldDim = 'rgba(212,175,55,0.12)';
const goldBorder = 'rgba(212,175,55,0.3)';
const surface = 'rgba(255,255,255,0.03)';
const border = 'rgba(255,255,255,0.07)';
const bronze = '#cd7f32';
const bronzeDim = 'rgba(205,127,50,0.12)';
const bronzeBorder = 'rgba(205,127,50,0.35)';

const CARD_W = 104;
const CARD_H = 50;
const GAP0 = 12;
const COL_GAP = 22;
const TITLE_H = 26;
const FLAG_SIZE = 16;
const MOBILE_BREAKPOINT = 640;

const ROUND_TITLES = ['R32', 'R16', 'QF', 'SF'];
const MOBILE_ROUND_NAMES = ['Round of 32', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Final'];

const NAME_SHORT: Record<string, string> = {
  'Mexico': 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR', 'Czechia': 'CZE',
  'Canada': 'CAN', 'Switzerland': 'SUI', 'Bosnia-Herzegovina': 'BIH', 'Qatar': 'QAT',
  'United States': 'USA', 'Paraguay': 'PAR', 'Australia': 'AUS', 'Turkey': 'TUR',
  'Brazil': 'BRA', 'Morocco': 'MAR', 'Scotland': 'SCO', 'Haiti': 'HAI',
  'Germany': 'GER', 'Ivory Coast': 'CIV', 'Ecuador': 'ECU', 'Curaçao': 'CUW',
  'Netherlands': 'NED', 'Japan': 'JPN', 'Sweden': 'SWE', 'Tunisia': 'TUN',
  'Spain': 'ESP', 'Cape Verde Islands': 'CPV', 'Uruguay': 'URU', 'Saudi Arabia': 'KSA',
  'Belgium': 'BEL', 'Egypt': 'EGY', 'Iran': 'IRN', 'New Zealand': 'NZL',
  'France': 'FRA', 'Norway': 'NOR', 'Senegal': 'SEN', 'Iraq': 'IRQ',
  'Argentina': 'ARG', 'Austria': 'AUT', 'Algeria': 'ALG', 'Jordan': 'JOR',
  'Colombia': 'COL', 'Portugal': 'POR', 'Congo DR': 'COD', 'Uzbekistan': 'UZB',
  'England': 'ENG', 'Croatia': 'CRO', 'Ghana': 'GHA', 'Panama': 'PAN',
};
const shortName = (name: string) => NAME_SHORT[name] ?? name.slice(0, 3).toUpperCase();

const formatDate = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const makeTbd = (label: string): BracketTeam => ({ name: null, label, crest: null, flag: null, qualified: false });

const padRound = (matches: BracketMatch[], expected: number): BracketMatch[] => {
  if (matches.length >= expected) return matches.slice(0, expected);
  const filler = Array.from({ length: expected - matches.length }, () => ({
    home: makeTbd('TBD'), away: makeTbd('TBD'), match: 0, venue: '', date: '',
  }));
  return [...matches, ...filler];
};

function sideCenters(firstRoundCount: number, rounds: number): number[][] {
  const centers: number[][] = [];
  centers[0] = Array.from(
    { length: firstRoundCount },
    (_, i) => i * (CARD_H + GAP0) + CARD_H / 2
  );
  for (let r = 1; r < rounds; r++) {
    const prev = centers[r - 1];
    centers[r] = Array.from({ length: prev.length / 2 }, (_, j) => (prev[2 * j] + prev[2 * j + 1]) / 2);
  }
  return centers;
}

interface PositionedCard {
  match: BracketMatch;
  x: number;
  y: number;
}

interface Segment { x1: number; y1: number; x2: number; y2: number; }

function buildSide(
  rounds: BracketMatch[][],
  colFor: (roundIdx: number) => number,
  direction: 'right' | 'left'
) {
  const counts = rounds.map(r => r.length);
  const centers = sideCenters(counts[0], counts.length);
  const cards: PositionedCard[] = [];
  const segments: Segment[] = [];

  rounds.forEach((roundMatches, r) => {
    const x = colFor(r) * (CARD_W + COL_GAP);
    roundMatches.forEach((m, i) => {
      cards.push({ match: m, x, y: centers[r][i] - CARD_H / 2 });
    });
  });

  for (let r = 0; r < rounds.length - 1; r++) {
    const colSrc = colFor(r);
    const colTgt = colFor(r + 1);
    const xSrcEdge = direction === 'right' ? colSrc * (CARD_W + COL_GAP) + CARD_W : colSrc * (CARD_W + COL_GAP);
    const xTgtEdge = direction === 'right' ? colTgt * (CARD_W + COL_GAP) : colTgt * (CARD_W + COL_GAP) + CARD_W;
    const midX = (xSrcEdge + xTgtEdge) / 2;

    for (let j = 0; j < centers[r + 1].length; j++) {
      const y0 = centers[r][2 * j];
      const y1 = centers[r][2 * j + 1];
      const yTgt = centers[r + 1][j];
      segments.push({ x1: xSrcEdge, y1: y0, x2: midX, y2: y0 });
      segments.push({ x1: xSrcEdge, y1: y1, x2: midX, y2: y1 });
      segments.push({ x1: midX, y1: y0, x2: midX, y2: y1 });
      segments.push({ x1: midX, y1: yTgt, x2: xTgtEdge, y2: yTgt });
    }
  }

  const lastCenter = centers[centers.length - 1][0];
  const totalHeight = counts[0] * CARD_H + (counts[0] - 1) * GAP0;
  return { cards, segments, lastCenter, totalHeight };
}

const FlagCircle = ({ team, size = FLAG_SIZE }: { team: BracketTeam; size?: number }) => {
  const [imgErr, setImgErr] = useState(false);
  const confirmed = !!team.name;
  const src = !imgErr && (team.flag ?? team.crest) ? (team.flag ?? team.crest) : null;

  if (!confirmed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
      </div>
    );
  }

  return src ? (
    <img src={src} alt={team.name!} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
      border: `1px solid ${border}`,
    }} onError={() => setImgErr(true)} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
  );
};

const TeamSlot = ({ team, winner, mobile = false }: { team: BracketTeam; winner?: boolean; mobile?: boolean }) => {
  const confirmed = !!team.name;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: mobile ? 8 : 5, padding: mobile ? '6px 8px' : '2px 6px',
      background: confirmed ? (winner ? 'rgba(212,175,55,0.1)' : surface) : 'rgba(255,255,255,0.02)',
      minWidth: 0,
    }}>
      <FlagCircle team={team} size={mobile ? 20 : FLAG_SIZE} />
      <span style={{
        fontSize: mobile ? 12.5 : 10.5, fontWeight: confirmed ? 700 : 400,
        color: confirmed ? (winner ? gold : '#f0ede4') : '#3a3a4a',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        fontStyle: confirmed ? 'normal' : 'italic', letterSpacing: '0.02em',
      }}>
        {confirmed ? shortName(team.name!) : 'TBD'}
      </span>
      {winner && <span style={{ marginLeft: 'auto', fontSize: mobile ? 10 : 8, color: gold, flexShrink: 0 }}>✓</span>}
    </div>
  );
};

const MatchCard = ({ pos }: { pos: PositionedCard }) => {
  const { match, x, y } = pos;
  const finished = match.status === 'FINISHED';
  const homeWin = finished && match.home_score != null && match.away_score != null && match.home_score > match.away_score!;
  const awayWin = finished && match.home_score != null && match.away_score != null && match.away_score! > match.home_score;
  const dateLabel = formatDate(match.date);

  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H,
      border: `1px solid ${goldBorder}`, borderRadius: 5, overflow: 'hidden',
      background: '#0d1117', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <TeamSlot team={match.home} winner={homeWin} />
      <div style={{ height: 1, background: border }} />
      <TeamSlot team={match.away} winner={awayWin} />
      {dateLabel && (
        <div style={{ position: 'absolute', top: 2, right: 4, fontSize: 7.5, color: 'rgba(255,255,255,0.3)' }}>
          {dateLabel}
        </div>
      )}
    </div>
  );
};

// ── Mobile: absolute-positioned linear tree (R32→R16→QF→SF→Final), same math as desktop's buildSide ──

const M_CARD_W = 148;
const M_CARD_H = 58;
const M_GAP0 = 14;
const M_COL_GAP = 60;

function buildMobileTree(rounds: BracketMatch[][]) {
  const counts = rounds.map(r => r.length);
  const centers: number[][] = [];
  centers[0] = Array.from({ length: counts[0] }, (_, i) => i * (M_CARD_H + M_GAP0) + M_CARD_H / 2);
  for (let r = 1; r < rounds.length; r++) {
    const prev = centers[r - 1];
    centers[r] = Array.from({ length: prev.length / 2 }, (_, j) => (prev[2 * j] + prev[2 * j + 1]) / 2);
  }

  const cards: PositionedCard[] = [];
  const segments: Segment[] = [];

  rounds.forEach((roundMatches, r) => {
    const x = r * (M_CARD_W + M_COL_GAP);
    roundMatches.forEach((m, i) => {
      cards.push({ match: m, x, y: centers[r][i] - M_CARD_H / 2 });
    });
  });

  for (let r = 0; r < rounds.length - 1; r++) {
    const xSrcEdge = r * (M_CARD_W + M_COL_GAP) + M_CARD_W;
    const xTgtEdge = (r + 1) * (M_CARD_W + M_COL_GAP);
    const midX = (xSrcEdge + xTgtEdge) / 2;
    for (let j = 0; j < centers[r + 1].length; j++) {
      const y0 = centers[r][2 * j];
      const y1 = centers[r][2 * j + 1];
      const yTgt = centers[r + 1][j];
      segments.push({ x1: xSrcEdge, y1: y0, x2: midX, y2: y0 });
      segments.push({ x1: xSrcEdge, y1: y1, x2: midX, y2: y1 });
      segments.push({ x1: midX, y1: y0, x2: midX, y2: y1 });
      segments.push({ x1: midX, y1: yTgt, x2: xTgtEdge, y2: yTgt });
    }
  }

  const totalWidth = rounds.length * (M_CARD_W + M_COL_GAP) - M_COL_GAP;
  const totalHeight = counts[0] * M_CARD_H + (counts[0] - 1) * M_GAP0;

  // x-position marking where each round "starts" (used for scroll-snap + active-round tracking)
  const roundStartX = rounds.map((_, r) => r * (M_CARD_W + M_COL_GAP));

  return { cards, segments, totalWidth, totalHeight, roundStartX };
}

const MobileMatchCard = ({ pos }: { pos: PositionedCard }) => {
  const { match, x, y } = pos;
  const finished = match.status === 'FINISHED';
  const homeWin = finished && match.home_score != null && match.away_score != null && match.home_score > match.away_score!;
  const awayWin = finished && match.home_score != null && match.away_score != null && match.away_score! > match.home_score;
  const dateLabel = formatDate(match.date);

  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: M_CARD_W, height: M_CARD_H,
      border: `1px solid ${goldBorder}`, borderRadius: 8, overflow: 'hidden',
      background: '#0d1117', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <TeamSlot team={match.home} winner={homeWin} mobile />
      <div style={{ height: 1, background: border }} />
      <TeamSlot team={match.away} winner={awayWin} mobile />
      {dateLabel && (
        <div style={{ position: 'absolute', top: 4, right: 6, fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
          {dateLabel}
        </div>
      )}
    </div>
  );
};

// Third place rendered as its own small tree node just below Final, connected by a short dashed line (not a bracket outcome, just visually grouped)
const MobileThirdPlaceNode = ({ x, y, match }: { x: number; y: number; match: BracketMatch | null | undefined }) => {
  const m: BracketMatch = match ?? {
    home: makeTbd('TBD'), away: makeTbd('TBD'), match: 0, venue: '', date: '2026-07-18', status: 'TIMED',
  };
  const finished = m.status === 'FINISHED';
  const homeWin = finished && m.home_score != null && m.away_score != null && m.home_score > m.away_score!;
  const awayWin = finished && m.home_score != null && m.away_score != null && m.away_score! > m.home_score;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: M_CARD_W }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, color: bronze, marginBottom: 6, textAlign: 'center' }}>
        🥉 3rd Place
      </div>
      <div style={{ border: `1px solid ${bronzeBorder}`, borderRadius: 8, overflow: 'hidden', background: '#0d1117' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: homeWin ? bronzeDim : surface }}>
          <FlagCircle team={m.home} size={20} />
          <span style={{ fontSize: 12.5, fontWeight: m.home.name ? 700 : 400, color: m.home.name ? (homeWin ? bronze : '#f0ede4') : '#3a3a4a', fontStyle: m.home.name ? 'normal' : 'italic' }}>
            {m.home.name ? shortName(m.home.name) : 'TBD'}
          </span>
        </div>
        <div style={{ height: 1, background: border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: awayWin ? bronzeDim : surface }}>
          <FlagCircle team={m.away} size={20} />
          <span style={{ fontSize: 12.5, fontWeight: m.away.name ? 700 : 400, color: m.away.name ? (awayWin ? bronze : '#f0ede4') : '#3a3a4a', fontStyle: m.away.name ? 'normal' : 'italic' }}>
            {m.away.name ? shortName(m.away.name) : 'TBD'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Mobile bracket: one big absolutely-positioned canvas (cards + connector lines), horizontally
// scroll-snapped in fixed-width "round" windows. Because it's the SAME canvas as the connectors,
// every card always shows its real connector line, and the next round's cards naturally peek
// at the trailing edge of each snap window — no separate "panels" that lose the connection.
const MobileBracketTree = ({
  r32, r16, qf, sf, final, thirdPlace,
}: {
  r32: BracketMatch[]; r16: BracketMatch[]; qf: BracketMatch[]; sf: BracketMatch[];
  final: BracketMatch; thirdPlace: BracketMatch | null | undefined;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeRound, setActiveRound] = useState(0);
  const [viewportW, setViewportW] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const tree = useMemo(() => buildMobileTree([r32, r16, qf, sf, [final]]), [r32, r16, qf, sf, final]);

  useEffect(() => {
    if (!wrapRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setViewportW(entry.contentRect.width);
    });
    observer.observe(wrapRef.current);
    setViewportW(wrapRef.current.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  // Each "snap window" is sized to ~72% of the viewport so the next round's cards peek at the edge
  const windowW = Math.max(220, Math.round(viewportW * 0.72));

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    // find which round's start is closest to the current scroll position
    let idx = 0;
    for (let i = 0; i < tree.roundStartX.length; i++) {
      if (scrollLeft >= tree.roundStartX[i] - windowW * 0.3) idx = i;
    }
    setActiveRound(Math.min(idx, MOBILE_ROUND_NAMES.length - 1));
  }, [tree.roundStartX, windowW]);

  const scrollToRound = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: tree.roundStartX[idx], behavior: 'smooth' });
  };

  // Third place positioned just below the Final card
  const finalCard = tree.cards[tree.cards.length - 1];
  const thirdPlaceX = finalCard.x;
  const thirdPlaceY = finalCard.y + M_CARD_H + 24;
  const canvasHeight = Math.max(tree.totalHeight, thirdPlaceY + 90 - 0);

  return (
    <div ref={wrapRef}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '4px 4px' }}>
        <button
          onClick={() => scrollToRound(Math.max(0, activeRound - 1))}
          disabled={activeRound === 0}
          style={{ background: 'none', border: 'none', color: activeRound === 0 ? '#2a2a3a' : gold, fontSize: 20, cursor: activeRound === 0 ? 'default' : 'pointer', padding: '4px 10px' }}
        >‹</button>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.08em', color: gold, transition: 'opacity 0.15s' }}>
          {MOBILE_ROUND_NAMES[activeRound]}
        </div>
        <button
          onClick={() => scrollToRound(Math.min(MOBILE_ROUND_NAMES.length - 1, activeRound + 1))}
          disabled={activeRound === MOBILE_ROUND_NAMES.length - 1}
          style={{ background: 'none', border: 'none', color: activeRound === MOBILE_ROUND_NAMES.length - 1 ? '#2a2a3a' : gold, fontSize: 20, cursor: activeRound === MOBILE_ROUND_NAMES.length - 1 ? 'default' : 'pointer', padding: '4px 10px' }}
        >›</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
        {MOBILE_ROUND_NAMES.map((_, i) => (
          <div key={i} onClick={() => scrollToRound(i)} style={{
            width: i === activeRound ? 16 : 6, height: 6, borderRadius: 3,
            background: i === activeRound ? gold : 'rgba(255,255,255,0.15)',
            transition: 'all 0.25s ease', cursor: 'pointer',
          }} />
        ))}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="mobile-tree-scroll"
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
        }}
      >
        <div style={{ position: 'relative', width: tree.totalWidth + windowW, height: canvasHeight }}>
          {/* invisible snap targets, one per round, sized to windowW */}
          {tree.roundStartX.map((x, i) => (
            <div key={i} style={{
              position: 'absolute', left: x, top: 0, width: windowW, height: 1,
              scrollSnapAlign: 'start',
            }} />
          ))}

          <svg width={tree.totalWidth + windowW} height={canvasHeight} style={{ position: 'absolute', left: 0, top: 0 }}>
            {tree.segments.map((s, i) => (
              <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={goldBorder} strokeWidth={1.5} />
            ))}
            <line
              x1={finalCard.x + M_CARD_W / 2} y1={finalCard.y + M_CARD_H}
              x2={thirdPlaceX + M_CARD_W / 2} y2={thirdPlaceY}
              stroke="rgba(205,127,50,0.35)" strokeWidth={1.5} strokeDasharray="3 3"
            />
          </svg>

          {tree.cards.map((pos, i) => <MobileMatchCard key={i} pos={pos} />)}
          <MobileThirdPlaceNode x={thirdPlaceX} y={thirdPlaceY} match={thirdPlace} />
        </div>
      </div>

      <style>{`
        .mobile-tree-scroll::-webkit-scrollbar { display: none; }
        .mobile-tree-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// ── Groups view ──────────────────────────────────────────────────────────

const GroupTeamRow = ({ team, index, compact }: { team: any; index: number; compact: boolean }) => {
  const [imgErr, setImgErr] = useState(false);
  const src = !imgErr && team.crest ? team.crest : team.flag ?? null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: compact ? 8 : 12, padding: compact ? '5px 10px' : '9px 16px',
      borderBottom: index < 2 ? `1px solid ${border}` : 'none',
      background: index < 2 && team.qualified ? 'rgba(212,175,55,0.04)' : 'transparent',
      opacity: team.qualified ? 1 : 0.45,
    }}>
      <span style={{ fontSize: compact ? 10 : 13, color: '#333344', width: compact ? 12 : 16, flexShrink: 0 }}>{index + 1}</span>
      {src ? (
        <img src={src} alt={team.name} style={{ width: compact ? 16 : 22, height: compact ? 16 : 22, objectFit: 'contain', flexShrink: 0 }}
          onError={() => setImgErr(true)} />
      ) : (
        <div style={{ width: compact ? 16 : 22, height: compact ? 16 : 22, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
      )}
      <span style={{ fontSize: compact ? 11 : 14, fontWeight: index < 2 ? 600 : 400, color: index < 2 ? '#f0ede4' : '#555566', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {team.name}
      </span>
      <span style={{ fontSize: compact ? 10 : 13, color: gold, flexShrink: 0, fontWeight: 700 }}>{team.points}pts</span>
      {team.qualified && index < 2 && <span style={{ fontSize: compact ? 9 : 12, color: '#4ade80', flexShrink: 0 }}>✓</span>}
    </div>
  );
};

const GroupQualified = ({ standings, groupKey, compact }: { standings: any[]; groupKey: string; compact: boolean }) => {
  const groupLetter = groupKey.replace('GROUP_', '');
  return (
    <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: compact ? 8 : 10, overflow: 'hidden', minWidth: compact ? 160 : 240 }}>
      <div style={{
        padding: compact ? '4px 10px' : '8px 16px', background: goldDim, borderBottom: `1px solid ${goldBorder}`,
        fontSize: compact ? 11 : 15, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em', color: gold,
      }}>
        Group {groupLetter}
      </div>
      {standings.slice(0, 3).map((team: any, i: number) => (
        <GroupTeamRow key={i} team={team} index={i} compact={compact} />
      ))}
    </div>
  );
};

// ── Desktop third-place card ─────────────────────────────────────────────

const ThirdPlaceCard = ({ match, x, y }: { match: BracketMatch | null | undefined; x: number; y: number }) => {
  const m: BracketMatch = match ?? {
    home: makeTbd('TBD'), away: makeTbd('TBD'), match: 0, venue: '', date: '2026-07-18', status: 'TIMED',
  };
  const finished = m.status === 'FINISHED';
  const homeWin = finished && m.home_score != null && m.away_score != null && m.home_score > m.away_score!;
  const awayWin = finished && m.home_score != null && m.away_score != null && m.away_score! > m.home_score;
  const dateLabel = formatDate(m.date);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: CARD_W }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: '0.06em',
        color: bronze, marginBottom: 6, textAlign: 'center', whiteSpace: 'nowrap',
      }}>
        🥉 3RD PLACE
      </div>
      <div style={{
        border: `1px solid ${bronzeBorder}`, borderRadius: 5, overflow: 'hidden',
        background: '#0d1117', position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: homeWin ? bronzeDim : surface }}>
          <FlagCircle team={m.home} />
          <span style={{ fontSize: 10.5, fontWeight: m.home.name ? 700 : 400, color: m.home.name ? (homeWin ? bronze : '#f0ede4') : '#3a3a4a', fontStyle: m.home.name ? 'normal' : 'italic' }}>
            {m.home.name ? shortName(m.home.name) : 'TBD'}
          </span>
        </div>
        <div style={{ height: 1, background: border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: awayWin ? bronzeDim : surface }}>
          <FlagCircle team={m.away} />
          <span style={{ fontSize: 10.5, fontWeight: m.away.name ? 700 : 400, color: m.away.name ? (awayWin ? bronze : '#f0ede4') : '#3a3a4a', fontStyle: m.away.name ? 'normal' : 'italic' }}>
            {m.away.name ? shortName(m.away.name) : 'TBD'}
          </span>
        </div>
        {dateLabel && (
          <div style={{ position: 'absolute', top: 2, right: 4, fontSize: 7.5, color: 'rgba(255,255,255,0.3)' }}>{dateLabel}</div>
        )}
      </div>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────

export const Bracket = () => {
  const [data, setData] = useState<BracketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'bracket' | 'groups'>('bracket');

  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/bracket`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!containerNode) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerNode);
    setContainerWidth(containerNode.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, [containerNode]);

  const layout = useMemo(() => {
    if (!data) return null;

    const r32 = padRound(data.r32, 16);
    const r16 = padRound(data.r16, 8);
    const qf = padRound(data.qf, 4);
    const sf = padRound(data.sf, 2);
    const final: BracketMatch = data.final ?? {
      home: makeTbd('Winner SF1'), away: makeTbd('Winner SF2'), match: 0, venue: 'MetLife Stadium', date: '2026-07-19',
    };

    const leftRounds = [r32.slice(0, 8), r16.slice(0, 4), qf.slice(0, 2), sf.slice(0, 1)];
    const rightRounds = [r32.slice(8), r16.slice(4), qf.slice(2), sf.slice(1)];

    const left = buildSide(leftRounds, r => r, 'right');
    const right = buildSide(rightRounds, r => 8 - r, 'left');

    const finalCol = 4;
    const finalX = finalCol * (CARD_W + COL_GAP);
    const finalY = (left.lastCenter + right.lastCenter) / 2;
    const finalCard: PositionedCard = { match: final, x: finalX, y: finalY - CARD_H / 2 };

    const leftSfCol = 3;
    const rightSfCol = 5;
    const leftEdge = leftSfCol * (CARD_W + COL_GAP) + CARD_W;
    const rightEdge = rightSfCol * (CARD_W + COL_GAP);
    const midLeft = (leftEdge + finalX) / 2;
    const midRight = (finalX + CARD_W + rightEdge) / 2;

    const finalSegments: Segment[] = [
      { x1: leftEdge, y1: left.lastCenter, x2: midLeft, y2: left.lastCenter },
      { x1: midLeft, y1: left.lastCenter, x2: midLeft, y2: finalY },
      { x1: midLeft, y1: finalY, x2: finalX, y2: finalY },
      { x1: rightEdge, y1: right.lastCenter, x2: midRight, y2: right.lastCenter },
      { x1: midRight, y1: right.lastCenter, x2: midRight, y2: finalY },
      { x1: midRight, y1: finalY, x2: finalX + CARD_W, y2: finalY },
    ];

    const cards = [...left.cards, ...right.cards, finalCard];
    const segments = [...left.segments, ...right.segments, ...finalSegments];
    const width = 9 * (CARD_W + COL_GAP) - COL_GAP;

    const thirdPlaceGap = 26;
    const thirdPlaceH = 20 + 2 * 22 + 1;
    const bracketHeight = Math.max(left.totalHeight, right.totalHeight);
    const finalCardBottom = finalCard.y + CARD_H;
    const height = Math.max(bracketHeight, finalCardBottom + thirdPlaceGap + thirdPlaceH);

    const thirdPlaceX = finalX;
    const thirdPlaceY = finalCardBottom + thirdPlaceGap;

    return { cards, segments, width, height, r32, r16, qf, sf, final, thirdPlaceX, thirdPlaceY };
  }, [data]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div style={{ width: 40, height: 40, border: `2px solid ${goldBorder}`, borderTopColor: gold, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data || !layout) return <div style={{ textAlign: 'center', padding: '4rem', color: '#555566' }}>Failed to load bracket</div>;

  const sortedGroups = Object.keys(data.group_standings).sort();

  const isMobile = containerWidth > 0 && containerWidth < MOBILE_BREAKPOINT;
  const rawScale = containerWidth > 0 ? containerWidth / layout.width : 1;
  const scale = Math.min(Math.max(rawScale, 0.4), 1.6);
  const scaledHeight = (layout.height + TITLE_H) * scale;

  return (
    <div ref={setContainerNode}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: '0.06em', color: '#fff', margin: 0 }}>
          Tournament Bracket
        </h2>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: 8, padding: 4, gap: 4 }}>
          {(['bracket', 'groups'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: 'none', fontFamily: 'Inter, sans-serif',
              background: view === v ? gold : 'transparent',
              color: view === v ? '#0d1117' : 'rgba(255,255,255,0.45)',
            }}>
              {v === 'bracket' ? 'Bracket' : 'Groups'}
            </button>
          ))}
        </div>
      </div>

      {view === 'groups' && (
        <div>
          <p style={{ fontSize: isMobile ? 13 : 15, color: '#555566', marginBottom: isMobile ? 16 : 22 }}>
            Top 2 from each group qualify automatically. Best 8 third-place teams also advance.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: isMobile ? 12 : 18,
          }}>
            {sortedGroups.map((group) => (
              <GroupQualified key={group} groupKey={group} standings={data.group_standings[group]} compact={isMobile} />
            ))}
          </div>
          {data.qualified_third.length > 0 && (
            <div style={{ marginTop: isMobile ? 24 : 32 }}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 18 : 22, letterSpacing: '0.08em', color: gold, marginBottom: isMobile ? 12 : 16 }}>
                Best 3rd Place Teams
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 12 }}>
                {data.qualified_third.map((t: any, i: number) => (
                  <div key={i} style={{
                    padding: isMobile ? '5px 12px' : '8px 18px', background: goldDim, border: `1px solid ${goldBorder}`,
                    borderRadius: 20, fontSize: isMobile ? 12 : 15, color: gold, fontWeight: 600,
                  }}>
                    {t.name} <span style={{ opacity: 0.6, fontSize: isMobile ? 10 : 12 }}>({t.points}pts)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'bracket' && (
        <div>
          {containerWidth > 0 && isMobile ? (
            <MobileBracketTree
              r32={layout.r32} r16={layout.r16} qf={layout.qf} sf={layout.sf}
              final={layout.final} thirdPlace={data.third_place}
            />
          ) : (
            <div style={{ height: scaledHeight, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 0, top: 0,
                width: layout.width, height: layout.height + TITLE_H,
                transform: `scale(${scale})`, transformOrigin: 'top left',
              }}>
                {[0, 1, 2, 3].map(r => (
                  <React.Fragment key={`t-${r}`}>
                    <div style={{ position: 'absolute', left: r * (CARD_W + COL_GAP), top: 0, width: CARD_W, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: gold }}>
                      {ROUND_TITLES[r]}
                    </div>
                    <div style={{ position: 'absolute', left: (8 - r) * (CARD_W + COL_GAP), top: 0, width: CARD_W, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: gold }}>
                      {ROUND_TITLES[r]}
                    </div>
                  </React.Fragment>
                ))}
                <div style={{ position: 'absolute', left: 4 * (CARD_W + COL_GAP), top: 0, width: CARD_W, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: gold }}>
                  🏆 FINAL
                </div>

                <svg width={layout.width} height={layout.height} style={{ position: 'absolute', left: 0, top: TITLE_H }}>
                  {layout.segments.map((s, i) => (
                    <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={goldBorder} strokeWidth={1} />
                  ))}
                </svg>

                <div style={{ position: 'absolute', left: 0, top: TITLE_H }}>
                  {layout.cards.map((pos, i) => <MatchCard key={i} pos={pos} />)}
                  <ThirdPlaceCard match={data.third_place} x={layout.thirdPlaceX} y={layout.thirdPlaceY} />
                </div>
              </div>
            </div>
          )}

          <p style={{ fontSize: 11, color: '#2a2a3a', marginTop: 16 }}>
            ✓ Qualified
          </p>
        </div>
      )}
    </div>
  );
};