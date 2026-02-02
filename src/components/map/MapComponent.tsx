'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ControlPanel from './ControlPanel';

// Types
type SalesRecord = {
    Customer_A: string;
    City: string;
    State: string;
    Latitude: number;
    Longitude: number;
    Sale_Date: string;
};

export default function MapComponent() {
    const [salesData, setSalesData] = useState<SalesRecord[]>([]);
    const [blueZones, setBlueZones] = useState<any>(null);
    const [censusData, setCensusData] = useState<any>(null);
    const [rankedAreas, setRankedAreas] = useState<any[]>([]);

    // Toggles
    const [showSales, setShowSales] = useState(true);
    const [showBlueZones, setShowBlueZones] = useState(true);
    const [showDominion, setShowDominion] = useState(true);
    const [showIncome, setShowIncome] = useState(false);
    const [showRace, setShowRace] = useState(false);
    const [showRankings, setShowRankings] = useState(true);

    useEffect(() => {
        // Load Static Data
        fetch('/data/sales.json').then(r => r.json()).then(setSalesData).catch(console.error);
        fetch('/data/blue_zones.geojson').then(r => r.json()).then(setBlueZones).catch(console.error);
        fetch('/data/census_stats.geojson').then(r => r.json()).then(setCensusData).catch(console.error);
        fetch('/data/sales.json').then(r => r.json()).then(setSalesData).catch(console.error);
        fetch('/data/blue_zones.geojson').then(r => r.json()).then(setBlueZones).catch(console.error);
        fetch('/data/census_stats.geojson').then(r => r.json()).then(setCensusData).catch(console.error);
        fetch('/data/ranked_clusters.json').then(r => r.json()).then(setRankedAreas).catch(console.error);
    }, []);

    // Styles
    const incomeStyle = (feature: any) => {
        const income = feature.properties.Median_Income;
        return {
            fillColor: income > 100000 ? '#006d2c' : income > 75000 ? '#31a354' : income > 50000 ? '#74c476' : '#bae4b3',
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.6
        };
    };

    const raceStyle = (feature: any) => {
        const pctBlack = feature.properties.Pct_Black;
        // Simple heatmap: Darker Purple = Higher % Black population
        return {
            fillColor: pctBlack > 0.5 ? '#4a1486' : pctBlack > 0.3 ? '#807dba' : pctBlack > 0.1 ? '#bcbddc' : '#f2f0f7',
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.6
        };
    };

    const blueZoneStyle = {
        fillColor: '#3b82f6',
        weight: 3,
        opacity: 1,
        color: '#2563eb',
        fillOpacity: 0
    };

    // Dominion Placeholder (Richmond area box)
    const dominionPoly = [
        [37.4, -77.6], [37.7, -77.6], [37.7, -77.3], [37.4, -77.3]
    ];

    return (
        <div className="relative w-full h-screen">
            <MapContainer
                center={[37.54, -77.43]}
                zoom={9}
                style={{ height: '100%', width: '100%', background: '#cbd5e1' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Dominion Layer */}
                {showDominion && (
                    <Polygon
                        positions={dominionPoly as any}
                        pathOptions={{ color: 'orange', fillOpacity: 0.1, dashArray: '5,5' }}
                    />
                )}

                {/* Blue Zones */}
                {showBlueZones && blueZones && (
                    <GeoJSON data={blueZones} style={blueZoneStyle} />
                )}

                {/* Census Income */}
                {showIncome && censusData && (
                    <GeoJSON data={censusData} style={incomeStyle} />
                )}

                {/* Census Race */}
                {showRace && censusData && (
                    <GeoJSON data={censusData} style={raceStyle} />
                )}

                {/* Sales Markers */}
                {showSales && salesData.map((sale, idx) => (
                    <CircleMarker
                        key={`sale-${idx}`}
                        center={[sale.Latitude, sale.Longitude]}
                        radius={3}
                        pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.8 }}
                    >
                        <Popup>
                            <div className="text-slate-900">
                                <strong>{sale.Customer_A}</strong><br />
                                {sale.City}, {sale.State}<br />
                                {sale.Sale_Date}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

                {/* Ranked Area Pins */}
                {showRankings && rankedAreas.map((area, idx) => (
                    <CircleMarker
                        key={`rank-${idx}`}
                        center={[area.lat, area.lng]}
                        radius={10} // Larger for emphasis
                        pathOptions={{
                            color: '#8b5cf6', // Indigo/Purple
                            fillColor: '#8b5cf6',
                            fillOpacity: 0.9,
                            weight: 2,
                            opacity: 1
                        }}
                    >
                        <Popup>
                            <div className="text-slate-900 min-w-[200px]">
                                <h3 className="font-bold text-lg border-b pb-1 mb-2">Rank #{area.rank}</h3>
                                <div className="text-sm space-y-1">
                                    <div className={`px-2 py-1 rounded text-white text-center font-bold mb-2 ${area.in_zone ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                                        {area.in_zone ? 'QUALIFIED ZONE' : 'Out of Zone'}
                                    </div>
                                    <p><strong>Saturation:</strong> {area.size} Homes</p>
                                    <p><strong>Benefit Score:</strong> {area.score}/100</p>
                                    <p className="text-xs text-slate-500 mt-1">{area.tract}</p>

                                    <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-100 p-2 rounded">
                                        <div>
                                            <span className="text-xs text-slate-500">SNAP Rate</span><br />
                                            <span className="font-medium">{area.snap_rate}%</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500">Medicaid</span><br />
                                            <span className="font-medium">{area.medicaid_rate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

            </MapContainer>

            {/* Floating Control Panel */}
            <ControlPanel
                toggles={{ showSales, showBlueZones, showDominion, showIncome, showRace, showRankings }}
                setters={{ setShowSales, setShowBlueZones, setShowDominion, setShowIncome, setShowRace, setShowRankings }}
            />
        </div>
    );
}
