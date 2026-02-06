import React from 'react';

const leaderboardData = [
    { rank: 1, name: 'Sarah Jenkins', score: 1250, deals: 45 },
    { rank: 2, name: 'Mike Ross', score: 1100, deals: 38 },
    { rank: 3, name: 'Jessica Pearson', score: 950, deals: 32 },
    { rank: 4, name: 'Harvey Specter', score: 900, deals: 30 },
    { rank: 5, name: 'Louis Litt', score: 850, deals: 28 },
    { rank: 6, name: 'Donna Paulsen', score: 800, deals: 26 },
    { rank: 7, name: 'Rachel Zane', score: 750, deals: 24 },
    { rank: 8, name: 'Katrina Bennett', score: 700, deals: 22 },
    { rank: 9, name: 'Alex Williams', score: 650, deals: 20 },
    { rank: 10, name: 'Samantha Wheeler', score: 600, deals: 18 },
];

export default function LeaderboardPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Field Rep Leaderboard
                </h1>

                <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-700">
                                    <th className="p-4 font-semibold text-gray-300">Rank</th>
                                    <th className="p-4 font-semibold text-gray-300">Representative</th>
                                    <th className="p-4 font-semibold text-gray-300 text-right">
                                        Deals Closed<br />
                                        <span className="text-xs text-gray-400 font-normal">(TPV Complete & Sent)</span>
                                    </th>
                                    <th className="p-4 font-semibold text-gray-300 text-right">Total Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((rep) => (
                                    <tr
                                        key={rep.rank}
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
                                        <td className="p-4 font-medium text-lg">{rep.name}</td>
                                        <td className="p-4 text-right text-gray-300">{rep.deals}</td>
                                        <td className="p-4 text-right font-bold text-blue-400">{rep.score.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
