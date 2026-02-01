'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, GeoJSON, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ControlPanel from './ControlPanel';

// Fix Leaflet Icons
const iconRetinaUrl = '/leaflet/marker-icon-2x.png';
const iconUrl = '/leaflet/marker-icon.png';
const shadowUrl = '/leaflet/marker-shadow.png';

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

    // Toggles
    const [showSales, setShowSales] = useState(true);
    const [showBlueZones, setShowBlueZones] = useState(true);
    const [showDominion, setShowDominion] = useState(true);
    const [showIncome, setShowIncome] = useState(false);
    const [showRace, setShowRace] = useState(false);

    useEffect(() => {
        // Load Static Data
        fetch('/data/sales.json').then(r => r.json()).then(setSalesData).catch(console.error);
        fetch('/data/blue_zones.geojson').then(r => r.json()).then(setBlueZones).catch(console.error);
        fetch('/data/census_stats.geojson').then(r => r.json()).then(setCensusData).catch(console.error);
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
        fillColor: '#3b82f6', // Tailwind blue-500
        weight: 2,
        opacity: 1,
        color: '#2563eb', // Tailwind blue-600
        fillOpacity: 0.2
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
                style={{ height: '100%', width: '100%', background: '#1e293b' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
                        key={idx}
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

            </MapContainer>

            {/* Floating Control Panel */}
            <ControlPanel
                toggles={{ showSales, showBlueZones, showDominion, showIncome, showRace }}
                setters={{ setShowSales, setShowBlueZones, setShowDominion, setShowIncome, setShowRace }}
            />
        </div>
    );
}
