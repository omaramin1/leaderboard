'use client';
import React, { useState } from 'react';
import leaderboardData from './data.json';

type TimeFrame = 'daily' | 'weekly' | 'monthly';

export default function LeaderboardPage() {
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');

    // Sort data based on the selected timeframe
    const sortedData = [...leaderboardData]
        .sort((a, b) => b[timeFrame] - a[timeFrame])
        .map((rep, index) => ({ ...rep, rank: index + 1 }));

    const top10 = sortedData.slice(0, 10);
    const rest = sortedData.slice(10);

    // Get medal colors for top 3
    const getMedalColor = (rank: number) => {
        switch (rank) {
            case 1: return 'from-yellow-400 to-yellow-600 border-yellow-400';
            case 2: return 'from-gray-300 to-gray-500 border-gray-400';
            case 3: return 'from-orange-400 to-orange-600 border-orange-500';
            default: return 'from-blue-500 to-blue-700 border-blue-500';
        }
    };

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return rank.toString();
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-gold selection:text-black">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-3xl">⚡</span>
                        <span className="text-sm font-bold tracking-widest text-gray-500 uppercase">EMG Field Ops</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm">
                        ELITE SALES
                    </h1>
                    <p className="text-gray-400 text-lg uppercase tracking-widest font-semibold">Field Operations Leaderboard</p>
                </header>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-gray-900/50 p-1.5 rounded-full inline-flex border border-gray-800 backdrop-blur-xl">
                        {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeFrame(t)}
                                className={`py-2 px-8 rounded-full capitalize font-bold text-sm transition-all duration-300 ${timeFrame === t
                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/20 scale-105'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TOP 10 LEADERBOARD */}
                <div className="bg-gradient-to-b from-gray-900/60 to-gray-900/30 rounded-3xl p-6 md:p-8 border border-gray-800/50 backdrop-blur-sm mb-8">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-yellow-400">
                        <span className="text-3xl">🏆</span>
                        TOP 10 PERFORMERS
                    </h2>
                    <div className="space-y-3">
                        {top10.map((rep) => (
                            <div
                                key={rep.id}
                                className={`flex items-center justify-between p-4 md:p-5 rounded-xl border transition-all duration-300 group
                                    ${rep.rank <= 3
                                        ? `bg-gradient-to-r ${getMedalColor(rep.rank)} bg-opacity-20 border-opacity-50 hover:scale-[1.02]`
                                        : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/80 hover:border-blue-500/30'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                                        ${rep.rank <= 3
                                            ? 'bg-black/30 text-white'
                                            : 'bg-gray-800 text-gray-400 border border-gray-700 group-hover:text-white group-hover:border-blue-500'
                                        }`}
                                    >
                                        {getRankBadge(rep.rank)}
                                    </div>
                                    <div>
                                        <div className={`font-bold text-lg ${rep.rank <= 3 ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                            {rep.name}
                                        </div>
                                        <div className="text-xs text-gray-500">{rep.id}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-3xl font-black tabular-nums ${rep.rank === 1 ? 'text-yellow-400' : 'text-white'}`}>
                                        {rep[timeFrame]}
                                    </div>
                                    <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wide">Deals</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rest of the Field */}
                {rest.length > 0 && (
                    <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-500">
                            <span className="w-2 h-8 bg-gray-600 rounded-full"></span>
                            Field Representatives
                        </h2>
                        <div className="grid grid-cols-1 gap-2">
                            {rest.map((rep) => (
                                <div key={rep.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border-b border-gray-800/50 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 text-center font-mono text-gray-600 text-sm">#{rep.rank}</div>
                                        <div className="text-gray-400 font-medium">{rep.name}</div>
                                    </div>
                                    <div className="text-gray-300 font-bold tabular-nums">{rep[timeFrame]}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center border-t border-gray-900 pt-8">
                    <p className="text-gray-600 text-xs uppercase tracking-widest">
                        Live Data Connection &bull; Updated {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
