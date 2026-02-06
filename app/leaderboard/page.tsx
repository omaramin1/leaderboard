import React from 'react';

const leaderboardData = [
    { rank: 1, name: 'Derrick Greene Jr', id: 'ENM014', score: 0, deals: 0 },
    { rank: 2, name: 'Carli Wittkowski', id: 'ENM019', score: 0, deals: 0 },
    { rank: 3, name: 'Nicholas Fuoco', id: 'ENM034', score: 0, deals: 0 },
    { rank: 4, name: 'Destiny Paige', id: 'ENM059', score: 0, deals: 0 },
    { rank: 5, name: 'Logan Wilcox', id: 'ENM068', score: 0, deals: 0 },
    { rank: 6, name: 'Tommy DeSocio', id: 'ENM070', score: 0, deals: 0 },
    { rank: 7, name: 'Kirubel Motuma', id: 'ENM071', score: 0, deals: 0 },
    { rank: 8, name: 'Isabella Cutrie', id: 'ENM072', score: 0, deals: 0 },
    { rank: 9, name: 'Jacob Berube', id: 'ENM075', score: 0, deals: 0 },
    { rank: 10, name: 'Shane Bush', id: 'ENM080', score: 0, deals: 0 },
    { rank: 11, name: 'Adnaan Ali', id: 'ENM082', score: 0, deals: 0 },
    { rank: 12, name: 'Christian Sawyer', id: 'ENM084', score: 0, deals: 0 },
    { rank: 13, name: 'Keiron Moore', id: 'ENM086', score: 0, deals: 0 },
    { rank: 14, name: 'Marquayous Hill', id: 'ENM087', score: 0, deals: 0 },
    { rank: 15, name: 'Lejohn Windn', id: 'ENM088', score: 0, deals: 0 },
    { rank: 16, name: 'Michael Scotford', id: 'ENM089', score: 0, deals: 0 },
    { rank: 17, name: 'Aiman Ibrahim', id: 'ENM090', score: 0, deals: 0 },
    { rank: 18, name: 'Giavanna Agostini', id: 'ENM104', score: 0, deals: 0 },
    { rank: 19, name: 'David Sebast', id: 'ENM105', score: 0, deals: 0 },
    { rank: 20, name: 'Nicholas Grant', id: 'ENM109', score: 0, deals: 0 },
    { rank: 21, name: 'Kiley Eastin', id: 'ENM111', score: 0, deals: 0 },
    { rank: 22, name: 'Markell Hill', id: 'ENM112', score: 0, deals: 0 },
    { rank: 23, name: 'Jonathan Taylor', id: 'ENM117', score: 0, deals: 0 },
    { rank: 24, name: 'Brandon Sims', id: 'ENM118', score: 0, deals: 0 },
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
