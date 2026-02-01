import { Layers, Map as MapIcon, Users, DollarSign, Home, Zap, Activity } from 'lucide-react';

interface ControlPanelProps {
    toggles: {
        showSales: boolean;
        showBlueZones: boolean;
        showDominion: boolean;
        showIncome: boolean;
        showRace: boolean;
    };
    setters: {
        setShowSales: (v: boolean) => void;
        setShowBlueZones: (v: boolean) => void;
        setShowDominion: (v: boolean) => void;
        setShowIncome: (v: boolean) => void;
        setShowRace: (v: boolean) => void;
    };
}

export default function ControlPanel({ toggles, setters }: ControlPanelProps) {
    return (
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl z-[1000] w-72">
            <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Map Layers
            </h3>

            <div className="space-y-3">
                <Toggle
                    label="Sales Data"
                    icon={<DollarSign className="w-4 h-4 text-green-400" />}
                    active={toggles.showSales}
                    onClick={() => setters.setShowSales(!toggles.showSales)}
                />
                <Toggle
                    label="LMI Blue Zones"
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
                <Toggle
                    label="Income Heatmap"
                    icon={<Activity className="w-4 h-4 text-emerald-400" />}
                    active={toggles.showIncome}
                    onClick={() => setters.setShowIncome(!toggles.showIncome)}
                />
                <Toggle
                    label="Race Demographics"
                    icon={<Users className="w-4 h-4 text-purple-400" />}
                    active={toggles.showRace}
                    onClick={() => setters.setShowRace(!toggles.showRace)}
                />
            </div>
        </div>
    );
}

function Toggle({ label, icon, active, onClick }: { label: string, icon: any, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${active ? 'bg-slate-800 border-slate-600' : 'hover:bg-slate-800/50'
                }`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className={`text-sm ${active ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                    {label}
                </span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${active ? 'translate-x-5' : ''}`} />
            </div>
        </button>
    );
}
