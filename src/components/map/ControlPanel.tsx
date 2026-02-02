import { Layers, Users, DollarSign, Home, Zap, Activity } from 'lucide-react';

interface ControlPanelProps {
    toggles: {
        showSales: boolean;
        showBlueZones: boolean;
        showDominion: boolean;
        showIncome: boolean;
        showRace: boolean;
        showRankings: boolean;
    };
    setters: {
        setShowSales: (v: boolean) => void;
        setShowBlueZones: (v: boolean) => void;
        setShowDominion: (v: boolean) => void;
        setShowIncome: (v: boolean) => void;
        setShowRace: (v: boolean) => void;
        setShowRankings: (v: boolean) => void;
    };
}

// ... imports remain the same

export default function ControlPanel({ toggles, setters }: ControlPanelProps) {
    return (
        <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl z-[1000] w-80 text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Map Controls
            </h3>

            <div className="space-y-6">

                {/* Section 1: Analysis & Targeting */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Targeting Analysis</h4>
                    <div className="space-y-2">
                        <Toggle
                            label="Ranked Clusters"
                            subLabel="Priority Zones (High Overlap/Score)"
                            icon={<Activity className="w-4 h-4 text-purple-600" />}
                            active={toggles.showRankings}
                            onClick={() => setters.setShowRankings(!toggles.showRankings)}
                        />
                        <Toggle
                            label="Customer Sales"
                            icon={<DollarSign className="w-4 h-4 text-green-400" />}
                            active={toggles.showSales}
                            onClick={() => setters.setShowSales(!toggles.showSales)}
                        />
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
