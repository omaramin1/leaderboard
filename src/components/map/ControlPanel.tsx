import { Layers, Users, DollarSign, Home, Zap, Activity } from 'lucide-react';

// ... imports remain the same

interface ControlPanelProps {
    viewMode: 'default' | 'heating' | 'demographics';
    setViewMode: (m: 'default' | 'heating' | 'demographics') => void;
    toggles: {
        showSales: boolean;
        salesFilter: string; // 'all', 'recent', 'older'
        showBlueZones: boolean;
        showDominion: boolean;
        showIncome: boolean;
        showRace: boolean;
        showRankings: boolean;
        showConfirmed: boolean;
        showSpeculation: boolean;
        minKwHPotential: number;
    };
    setters: {
        setShowSales: (v: boolean) => void;
        setSalesFilter: (v: string) => void;
        setShowBlueZones: (v: boolean) => void;
        setShowDominion: (v: boolean) => void;
        setShowIncome: (v: boolean) => void;
        setShowRace: (v: boolean) => void;
        setShowRankings: (v: boolean) => void;
        setShowConfirmed: (v: boolean) => void;
        setShowSpeculation: (v: boolean) => void;
        setMinKwHPotential: (v: number) => void;
    };
}

export default function ControlPanel({ toggles, setters, viewMode, setViewMode }: ControlPanelProps) {
    return (
        <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl z-[1000] w-80 text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Map Controls
            </h3>

            <div className="space-y-6">

                {/* Section 1: Analysis & Targeting */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">View Mode</h4>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button
                            onClick={() => setViewMode('default')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'default'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            Default
                        </button>
                        <button
                            onClick={() => setViewMode('heating')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${viewMode === 'heating'
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            Heat
                        </button>
                        <button
                            onClick={() => setViewMode('demographics')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'demographics'
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            Demo
                        </button>
                    </div>

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Targeting Analysis</h4>
                    <div className="space-y-2">
                        {/* NEW: Smart Filter Toggles */}
                        <div className="bg-indigo-900/30 rounded-lg p-2 border border-indigo-500/30 mb-2 space-y-2">
                            <Toggle
                                label="Confirmed Opportunities"
                                subLabel="LMI / Auto-Qualify Zones"
                                icon={<Zap className="w-4 h-4 text-amber-500" />}
                                active={toggles.showConfirmed}
                                onClick={() => setters.setShowConfirmed(!toggles.showConfirmed)}
                            />
                            <Toggle
                                label="Speculation / Predictive"
                                subLabel="High Benefit Score (Non-Zone)"
                                icon={<Activity className="w-4 h-4 text-purple-500" />}
                                active={toggles.showSpeculation}
                                onClick={() => setters.setShowSpeculation(!toggles.showSpeculation)}
                            />
                        </div>

                        <Toggle
                            label="Ranked Clusters"
                            subLabel="Priority Zones (High Overlap/Score)"
                            icon={<Activity className="w-4 h-4 text-purple-600" />}
                            active={toggles.showRankings}
                            onClick={() => setters.setShowRankings(!toggles.showRankings)}
                        />

                        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                            <Toggle
                                label="Customer Sales"
                                icon={<DollarSign className="w-4 h-4 text-green-400" />}
                                active={toggles.showSales}
                                onClick={() => setters.setShowSales(!toggles.showSales)}
                            />

                            {/* Manager Filter: Recency */}
                            {toggles.showSales && (
                                <div className="mt-2 pl-8 pr-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">
                                        Sales Recency (Manager View)
                                    </label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-600 rounded text-xs py-1 px-2 text-slate-300 focus:border-indigo-500 outline-none"
                                        value={toggles.salesFilter}
                                        onChange={(e) => setters.setSalesFilter(e.target.value)}
                                    >
                                        <option value="all">Show All History</option>
                                        <option value="recent">Recent (&lt; 1 Year)</option>
                                        <option value="older">Ripe for Re-Canvass (&gt; 1 Year)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 2: Demographics */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Demographics</h4>
                    <div className="space-y-2">
                        <Toggle
                            label="Income Heatmap"
                            icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
                            active={toggles.showIncome}
                            onClick={() => setters.setShowIncome(!toggles.showIncome)}
                        />
                        <Toggle
                            label="Race Distribution"
                            icon={<Users className="w-4 h-4 text-purple-400" />}
                            active={toggles.showRace}
                            onClick={() => setters.setShowRace(!toggles.showRace)}
                        />
                    </div>
                </div>

                {/* Section 3: Reference Layers */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reference Layers</h4>
                    <div className="space-y-2">
                        <Toggle
                            label="Blue Zones (LMI)"
                            icon={<Zap className="w-4 h-4 text-blue-500" />}
                            active={toggles.showBlueZones}
                            onClick={() => setters.setShowBlueZones(!toggles.showBlueZones)}
                        />
                        <Toggle
                            label="Dominion Territory"
                            icon={<Home className="w-4 h-4 text-orange-500" />}
                            active={toggles.showDominion}
                            onClick={() => setters.setShowDominion(!toggles.showDominion)}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

function Toggle({ label, subLabel, icon, active, onClick }: { label: string, subLabel?: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-2 rounded-lg transition-all border ${active ? 'bg-slate-800 border-indigo-500/50' : 'hover:bg-slate-800/50 border-transparent'}`}
        >
            <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${active ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
                        {icon}
                    </div>
                    <div>
                        <div className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-400'}`}>
                            {label}
                        </div>
                        {subLabel && (
                            <div className="text-[10px] text-slate-500 leading-tight">{subLabel}</div>
                        )}
                    </div>
                </div>

                {/* Switch UI */}
                <div className={`w-9 h-5 rounded-full relative transition-colors ${active ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${active ? 'translate-x-4' : ''}`} />
                </div>
            </div>
        </button>
    );
}
