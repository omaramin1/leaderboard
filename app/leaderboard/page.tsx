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

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Field Rep Leaderboard
                </h1>

                {/* Tabs */}
                <div className="flex justify-center mb-8 bg-gray-800 p-1 rounded-lg inline-flex mx-auto w-full max-w-md">
                    {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeFrame(t)}
                            className={`flex-1 py-2 px-4 rounded-md capitalize font-medium transition-all duration-200 ${timeFrame === t
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            {t} Deals
                        </button>
                    ))}
                </div>

                <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-700">
                                    <th className="p-4 font-semibold text-gray-300">Rank</th>
                                    <th className="p-4 font-semibold text-gray-300">Representative</th>
                                    <th className="p-4 font-semibold text-gray-300 text-right">
                                        Deals ({timeFrame})<br />
                                        <span className="text-xs text-gray-400 font-normal">(TPV Complete & Sent)</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((rep) => (
                                    <tr
                                        key={rep.id}
                                        className="border-b border-gray-700 last:border-0 hover:bg-gray-750 transition-colors duration-200"
                                    >
                                        <td className="p-4">
                                            <div className={`
                        w-8 h-8 flex items-center justify-center rounded-full font-bold
                        ${rep.rank === 1 ? 'bg-yellow-500 text-black' :
                                                    rep.rank === 2 ? 'bg-gray-400 text-black' :
                                                        rep.rank === 3 ? 'bg-orange-600 text-black' : 'text-gray-400'}
                      `}>
                                                {rep.rank}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-lg flex flex-col">
                                            <span>{rep.name}</span>
                                            <span className="text-xs text-gray-500 font-mono">{rep.id}</span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-blue-400 text-xl">{rep[timeFrame]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    Data updated from VIPR Portal. Showing {timeFrame} performance.
                    <br />
                    (Daily/Weekly counts currently defaulting to 0 until next synchronization cycle)
                </div>
            </div>
        </div>
    );
}
