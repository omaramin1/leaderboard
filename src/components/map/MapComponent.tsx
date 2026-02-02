'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ControlPanel from './ControlPanel';

// Zoom Handler Component
function ZoomHandler({ setZoom }: { setZoom: (z: number) => void }) {
    useMapEvents({
        zoomend: (e) => {
            setZoom(e.target.getZoom());
        }
    });
    return null;
}

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
    const [currentZoom, setCurrentZoom] = useState(9);

    // Toggles
    const [showSales, setShowSales] = useState(true);
    const [showBlueZones, setShowBlueZones] = useState(true);
    const [showDominion, setShowDominion] = useState(true);
    const [showIncome, setShowIncome] = useState(false);
    const [showRace, setShowRace] = useState(false);
    const [showRankings, setShowRankings] = useState(true);

    useEffect(() => {
        // Load Static Data
        const loadData = async () => {
            try {
                const [sales, zones, census, ranks] = await Promise.all([
                    fetch('/data/sales.json').then(r => r.json()),
                    fetch('/data/blue_zones.geojson').then(r => r.json()),
                    fetch('/data/census_stats.geojson').then(r => r.json()),
                    fetch('/data/ranked_clusters.json').then(r => r.json())
                ]);
                setSalesData(sales);
                setBlueZones(zones);
                setCensusData(census);
                setRankedAreas(ranks);
            } catch (e) {
                console.error("Failed to load map data:", e);
            }
        };
        loadData();
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


                <ZoomHandler setZoom={setCurrentZoom} />

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

                {/* Sales Markers - Zoom Dependent (Visible only when zoomed in > 13) */}
                {useMemo(() => (
                    showSales && currentZoom > 13 && salesData.map((sale, idx) => (
                        <CircleMarker
                            key={`sale-${idx}`}
                            center={[sale.Latitude, sale.Longitude]}
                            radius={4}
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
                    ))
                ), [showSales, salesData, currentZoom])}

                {/* Ranked Area Pins */}
                {/* User Request: Show Auto-Qualify Zone OR Areas with > 40% Benefit Likelihood */}
                {showRankings && rankedAreas.filter(area => area.in_zone || (area.benefit_likelihood >= 0.4)).map((area, idx) => (
                    <div key={`rank-${idx}`}>
                        {/* Territory Polygon - OUTLINE focused */}
                        {area.polygon && (
                            <Polygon
                                positions={area.polygon}
                                pathOptions={{
                                    color: '#7c3aed', // More vibrant violet
                                    weight: 4,        // Thicker outline for better visibility
                                    opacity: 1,       // Fully solid stroke
                                    fillColor: '#8b5cf6',
                                    fillOpacity: 0.15, // Slightly more fill to see the "zone"
                                    dashArray: '5, 5'
                                }}
                            >
                                <Popup>
                                    <div className="text-slate-900 min-w-[200px]">
                                        <h3 className="font-bold text-lg border-b pb-1 mb-2">Rank #{area.rank}</h3>

                                        {/* kWh Potential Badge */}
                                        <div className="mb-3 p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded">
                                            <p className="text-xs font-bold text-slate-500 uppercase">Est. kWh Potential</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xl font-bold ${area.score >= 80 ? 'text-emerald-600' : area.score >= 50 ? 'text-amber-600' : 'text-slate-600'}`}>
                                                    {area.score >= 80 ? 'HIGH' : area.score >= 50 ? 'MODERATE' : 'LOW'}
                                                </span>
                                                <span className="text-xs text-slate-500">({area.score}/100)</span>
                                            </div>
                                        </div>

                                        <div className="text-sm space-y-1">
                                            <div className={`px-2 py-1 rounded text-white text-center font-bold mb-2 ${area.in_zone ? 'bg-emerald-600' : 'bg-amber-500'}`}>
                                                {area.in_zone ? 'AUTO-QUALIFY ZONE' : `Likely Qualify (${Math.round(area.benefit_likelihood * 100)}%)`}
                                            </div>

                                            {/* Demographics Grid */}
                                            {area.demographics && (
                                                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                                                    <div className="bg-slate-50 p-1 rounded">
                                                        <span className="text-slate-400">Avg Age</span>
                                                        <div className="font-medium text-slate-700">{area.demographics.age} yrs</div>
                                                    </div>
                                                    <div className="bg-slate-50 p-1 rounded">
                                                        <span className="text-slate-400">HH Size</span>
                                                        <div className="font-medium text-slate-700">{area.demographics.hh_size} ppl</div>
                                                    </div>
                                                </div>
                                            )}

                                            <p><strong>Saturation:</strong> {area.size} Homes</p>
                                        </div>
                                    </div>
                                </Popup>
                            </Polygon>
                        )}

                        {/* Center Marker (Optional, mostly for low zooms) */}
                        <CircleMarker
                            center={[area.lat, area.lng]}
                            radius={4}
                            pathOptions={{
                                color: '#8b5cf6',
                                fillColor: '#fff',
                                fillOpacity: 1,
                                weight: 2
                            }}
                        />
                    </div>
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
