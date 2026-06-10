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
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white font-semibold">{value ?? 'N/A'}</span>
    </div>
);

const CardBadge = ({ count, type }: { count: number; type: 'yellow' | 'red' }) => {
    const bg = type === 'yellow' ? 'bg-yellow-400' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className={`w-4 h-5 ${bg} rounded-sm shadow`} />
            <span className="text-white font-bold text-lg">{count}</span>
        </div>
    );
};

export const PlayerDetail = ({ id }: Props) => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [wiki, setWiki] = useState<WikiData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/players/${id}`);
                setPlayer(res.data.player);
                setWiki(res.data.wiki ?? null);
            } catch (err) {
                console.error('Error fetching player:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayer();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
            </div>
        );
    }

    if (!player) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>Player not found</p>
            </div>
        );
    }

    const formatHeight = (h: number | null) =>
        h ? `${h.toFixed(2)} m` : 'N/A';

    const formatDOB = (dob: string | null) => {
        if (!dob) return 'N/A';
        return new Date(dob).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
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

    return (
        <div className="space-y-6 max-w-4xl mx-auto">

            {/* ── Header ── */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white mb-1">{player.name}</h1>
                        <p className="text-emerald-400 text-lg mb-1">{player.team}</p>
                        {player.club_name && (
                            <p className="text-gray-500 text-sm">Club: {player.club_name}</p>
                        )}
                    </div>

                    {/* Kit number badge */}
                    {player.national_kit_number && (
                        <div className="text-center">
                            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">National Kit</p>
                            <div className="w-16 h-20 bg-emerald-600 text-white text-3xl flex items-center justify-center rounded-lg font-bold shadow-lg">
                                {player.national_kit_number}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Wikipedia Bio ── */}
            {wiki && wiki.extract && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">About</h3>
                    <div className="flex gap-5">
                        {wiki.image && (
                            <img
                                src={wiki.image}
                                alt={player.name}
                                className="w-28 h-28 object-cover rounded-lg flex-shrink-0"
                            />
                        )}
                        <div>
                            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                                {wiki.extract}
                            </p>
                            {wiki.url && (
                                <a
                                    href={wiki.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:text-emerald-300 text-sm mt-3 inline-block"
                                >
                                    Full biography on Wikipedia →
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Player Info ── */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">Player Info</h3>
                    <StatRow label="Position" value={positionLabel(player.position)} />
                    <StatRow label="Date of Birth" value={formatDOB(player.date_of_birth)} />
                    <StatRow label="Age" value={player.age} />
                    <StatRow label="Height" value={formatHeight(player.height)} />
                    <StatRow label="Strong Foot" value={player.strong_foot ? player.strong_foot.charAt(0).toUpperCase() + player.strong_foot.slice(1) : null} />
                </div>

                {/* ── FIFA World Cup 2026 Stats ── */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                        FIFA World Cup 2026
                    </h3>
                    <StatRow label="Appearances" value={player.appearances} />
                    <StatRow label="Goals" value={player.goals} />
                    <StatRow label="Assists" value={player.assists} />

                    {/* Cards — shown with actual card visuals */}
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-400 text-sm">Yellow Cards</span>
                        <CardBadge count={player.yellow_cards} type="yellow" />
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400 text-sm">Red Cards</span>
                        <CardBadge count={player.red_cards} type="red" />
                    </div>
                </div>
            </div>

        </div>
    );
};