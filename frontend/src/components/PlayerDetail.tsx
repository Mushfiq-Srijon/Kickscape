import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Player {
    id: number;
    name: string;
    team: string;
    country: string;
    position: string;
    age: number;
    height: number;
    strong_foot: string;
    national_kit_number: number;
    club_kit_number: number;
    club_name: string;
    debut_date: string;
    national_goals: number;
    national_assists: number;
    national_matches: number;
    striking: number;
    defending: number;
    speed: number;
    passing: number;
    dribbling: number;
    physical: number;
}

interface Props {
    id: number;
}

export const PlayerDetail = ({ id }: Props) => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/players/${id}`);
                setPlayer(res.data.player);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
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

    // Prepare chart data
    const chartData = [
        { stat: 'Striking', value: player.striking },
        { stat: 'Defending', value: player.defending },
        { stat: 'Speed', value: player.speed },
        { stat: 'Passing', value: player.passing },
        { stat: 'Dribbling', value: player.dribbling },
        { stat: 'Physical', value: player.physical },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
                <div className="flex justify-between items-start gap-8">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white mb-2">{player.name}</h1>
                        <p className="text-emerald-400 text-lg mb-4">{player.team}</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-400 text-sm">Position</p>
                                <p className="text-white font-semibold">{player.position}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Age</p>
                                <p className="text-white font-semibold">{player.age || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Height</p>
                                <p className="text-white font-semibold">
                                    {player.height ? `${player.height.toFixed(2)}m` : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Strong Foot</p>
                                <p className="text-white font-semibold capitalize">
                                    {player.strong_foot || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Kit Number Card */}
                    <div className="flex gap-4">
                        {player.national_kit_number && (
                            <div className="text-center">
                                <p className="text-gray-400 text-sm mb-2">National Kit #</p>
                                <div className="w-16 h-24 bg-emerald-500 text-white text-3xl flex items-center justify-center rounded font-bold shadow-lg">
                                    {player.national_kit_number}
                                </div>
                            </div>
                        )}
                        {player.club_kit_number && (
                            <div className="text-center">
                                <p className="text-gray-400 text-sm mb-2">Club Kit #</p>
                                <div className="w-16 h-24 bg-blue-600 text-white text-3xl flex items-center justify-center rounded font-bold shadow-lg">
                                    {player.club_kit_number}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats & Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Career Info */}
                <div className="space-y-4">
                    {/* Club Info */}
                    {player.club_name && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-3">Club</h3>
                            <p className="text-gray-300">{player.club_name}</p>
                        </div>
                    )}

                    {/* National Team Career */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-white mb-4">National Team Career</h3>
                        <div className="space-y-3">
                            {player.debut_date && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Debut Date</span>
                                    <span className="text-white font-semibold">
                                        {new Date(player.debut_date).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-400">Matches</span>
                                <span className="text-white font-semibold">
                                    {player.national_matches}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Goals</span>
                                <span className="text-white font-semibold">
                                    {player.national_goals}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Assists</span>
                                <span className="text-white font-semibold">
                                    {player.national_assists}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">Detailed Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {chartData.map((item) => (
                        <div key={item.stat} className="space-y-2">
                            <p className="text-sm text-gray-400">{item.stat}</p>
                            <div className="bg-white/10 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all"
                                    style={{ width: `${item.value}%` }}
                                ></div>
                            </div>
                            <p className="text-lg font-bold text-emerald-400">{item.value}/100</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};