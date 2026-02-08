'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, GeoJSON, LayersControl, Marker } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Building, Caravan, Home } from 'lucide-react';
import MarkerClusterGroup from './MarkerClusterGroup';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
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
    const [ourDeals, setOurDeals] = useState<any[]>([]);
    const [salesFilter, setSalesFilter] = useState('all');

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
                const [sales, zones, census, ranks, deals] = await Promise.all([
                    fetch('/data/sales.json').then(r => r.json()),
                    fetch('/data/blue_zones.geojson').then(r => r.json()),
                    fetch('/data/census_stats.geojson').then(r => r.json()),
                    fetch('/data/ranked_clusters.json').then(r => r.json()),
                    fetch('/data/our_deals.json').then(r => r.json()).catch(() => [])
                ]);

                setSalesData(sales);
                setBlueZones(zones);
                setCensusData(census);
                setRankedAreas(ranks);
                setOurDeals(deals);
            } catch (error) {
                console.error("Error loading map data:", error);
            }
        };
        loadData();
    }, []);

    // NEW: Filter State for "Smart Targeting"
    const [showConfirmed, setShowConfirmed] = useState(true);   // LMI / Auto-Qualify
    const [showSpeculation, setShowSpeculation] = useState(true); // High Benefit Score
    const [minKwHPotential, setMinKwHPotential] = useState(50); // Default threshold

    // Styles



    const getEstimatedBill = (score: number) => {
        // Higher score = likely higher usage/bill
        if (score > 80) return '$350+';
        if (score > 60) return '$250 - $350';
        return '$150 - $250';
    };

    const getHeatingType = (score: number) => {
        // High score often correlates with electric resistance in this model
        if (score > 70) return 'Electric Resistance';
        if (score > 50) return 'Heat Pump / Mix';
        return 'Gas / Other';
    };

    // Housing Type Inference
    const inferHousingType = (size: number) => {
        if (size > 300) return 'Apartment Complex';
        if (size > 150) return 'Trailer Park / Dense';
        return 'Neighborhood';
    };

    const getHousingIcon = (type: string, color: string) => {
        const size = 16;
        if (type === 'Apartment Complex') return <Building size={size} color={color} fill="white" />;
        if (type.includes('Trailer')) return <Caravan size={size} color={color} fill="white" />;
        return <Home size={size} color={color} fill="white" />;
    };

    const createCustomIcon = (type: string, color: string) => {
        const iconMarkup = renderToStaticMarkup(
            <div className="flex items-center justify-center bg-white rounded-full p-1 shadow-md border-2" style={{ borderColor: color }}>
                {getHousingIcon(type, color)}
            </div>
        );
        return L.divIcon({
            html: iconMarkup,
            className: 'custom-marker-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14]
        });
    };

    // Filter Logic
    const filteredSales = useMemo(() => {
        if (salesFilter === 'all') return salesData;

        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

        return salesData.filter(sale => {
            if (!sale.Sale_Date) return false;
            const saleDate = new Date(sale.Sale_Date);
            if (isNaN(saleDate.getTime())) return false; // Invalid date

            if (salesFilter === 'recent') {
                return saleDate >= cutoffDate;
            } else {
                return saleDate < cutoffDate;
            }
        });
    }, [salesData, salesFilter]);

    // Styles
    const incomeStyle = (feature: { properties: { Median_Income: number } } | undefined) => {
        const income = feature?.properties.Median_Income;
        return {
            fillColor: income && income > 100000 ? '#006d2c' : income && income > 75000 ? '#31a354' : income && income > 50000 ? '#74c476' : '#bae4b3',
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.6
        };
    };

    const raceStyle = (feature: { properties: { Pct_Black: number } } | undefined) => {
        const pctBlack = feature?.properties.Pct_Black;
        // Simple heatmap: Darker Purple = Higher % Black population
        return {
            fillColor: pctBlack && pctBlack > 0.5 ? '#4a1486' : pctBlack && pctBlack > 0.3 ? '#807dba' : pctBlack && pctBlack > 0.1 ? '#bcbddc' : '#f2f0f7',
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
        <div className="relative w-full h-screen" >
            <MapContainer
                center={[37.54, -77.43]}
                zoom={9}
                style={{ height: '100%', width: '100%', background: '#cbd5e1' }}
                zoomControl={false}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Street View">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Satellite (Esri)">
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Dark Mode">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>


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

                {/* Old Sales Markers (Big List) - Orange - CLUSTERED */}
                {showSales && (
                    <MarkerClusterGroup>
                        {filteredSales.map((sale, idx) => (
                            <CircleMarker
                                key={`sale-${idx}`}
                                center={[sale.Latitude, sale.Longitude]}
                                radius={4}
                                pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.8 }}
                            >
                                <Popup>
                                    <div className="text-slate-900">
                                        <strong>{sale.Customer_A}</strong><br />
                                        {sale.City}, {sale.State}<br />
                                        <span className="text-xs text-slate-500">Historical Sale</span>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MarkerClusterGroup>
                )}

                {/* Our Deals (Short List) - Green */}
                {/* Always visible regardless of zoom because it's a short list */}
                {useMemo(() => (
                    showSales && ourDeals.map((deal, idx) => (
                        <CircleMarker
                            key={`deal-${idx}`}
                            center={[deal.Latitude, deal.Longitude]}
                            radius={6}
                            pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }}
                        >
                            <Popup>
                                <div className="text-slate-900">
                                    <strong>{deal.Customer_A}</strong><br />
                                    {deal.City}, {deal.State}<br />
                                    <span className="text-xs font-bold text-emerald-600">Active Deal</span>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))
                ), [showSales, ourDeals])}

                {/* Ranked Area Pins */}
                {showRankings && rankedAreas.map((area, idx) => {
                    // Classification
                    const isConfirmed = area.in_zone; // Auto-Qualify / LMI
                    const isSpeculation = !isConfirmed && (area.score >= minKwHPotential || area.benefit_likelihood >= 0.5);

                    // Filtering
                    if (isConfirmed && !showConfirmed) return null;
                    if (isSpeculation && !showSpeculation) return null;
                    if (!isConfirmed && !isSpeculation) return null; // Low value area

                    // Styling
                    // Confirmed = Gold/Emerald (Solid)
                    // Speculation = Purple (Predictive)
                    const areaColor = isConfirmed ? '#d97706' : '#7c3aed'; // Amber-600 vs Violet-600
                    const housingType = inferHousingType(area.size);
                    const customIcon = createCustomIcon(housingType, areaColor);

                    return (
                        <div key={`rank-${idx}`}>
                            {/* Territory Polygon - OUTLINE focused */}
                            {area.polygon && (
                                <Polygon
                                    positions={area.polygon.map((p: number[]) => [p[1], p[0]])}
                                    pathOptions={{
                                        color: areaColor,
                                        weight: 4,
                                        opacity: 1,
                                        fillColor: areaColor,
                                        fillOpacity: 0.15,
                                        dashArray: '5, 5'
                                    }}
                                >
                                    <Popup minWidth={280}>
                                        <div className="text-slate-900">
                                            <div className="flex flex-col border-b pb-2 mb-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h3 className="font-bold text-lg leading-tight">Rank #{area.rank}</h3>
                                                        <span className="text-[10px] text-slate-500">{area.tract}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${isConfirmed ? 'bg-amber-600' : 'bg-purple-600'}`}>
                                                        {isConfirmed ? 'CONFIRMED' : 'SPECULATION'}
                                                    </span>
                                                </div>
                                                {/* Housing Type Tag */}
                                                <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 rounded px-1.5 py-0.5 w-fit">
                                                    {getHousingIcon(housingType, '#475569')} {/* Slate-600 */}
                                                    <span>{housingType}</span>
                                                </div>
                                            </div>

                                            {/* Key Metrics Grid */}
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Saturation</div>
                                                    <div className="text-sm font-bold text-slate-800">{area.size} Homes</div>
                                                </div>
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Est. Bill</div>
                                                    <div className="text-sm font-bold text-emerald-700">{getEstimatedBill(area.score)}</div>
                                                </div>
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Heating</div>
                                                    <div className="text-sm font-bold text-slate-800">{getHeatingType(area.score)}</div>
                                                </div>
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Med. Income</div>
                                                    <div className="text-sm font-bold text-slate-800">
                                                        {/* Placeholder - mapping specific income would require joining census data */}
                                                        {isConfirmed ? '< $60k' : '$60k - $90k'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Benefit Score Bar */}
                                            <div className="mb-3">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-bold text-slate-600">Benefit Score</span>
                                                    <span className="font-bold text-emerald-600">{area.score}/100</span>
                                                </div>
                                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-emerald-500 h-full"
                                                        style={{ width: `${Math.min(area.score, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Demographics Footer */}
                                            {area.demographics && (
                                                <div className="pt-2 border-t flex justify-between text-xs text-slate-500">
                                                    <span>Avg Age: <strong className="text-slate-700">{area.demographics.age}</strong></span>
                                                    <span>HH Size: <strong className="text-slate-700">{area.demographics.hh_size}</strong></span>
                                                    <span>Black: <strong className="text-slate-700">{area.demographics.pct_black}%</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}

                            {/* Center Marker with Icon */}
                            <Marker
                                position={[area.lat, area.lng]}
                                icon={customIcon}
                            >
                                {/* Bind popup to marker as well so looking at the icon works */}
                                <Popup>Rank #{area.rank} - {housingType}</Popup>
                            </Marker>
                        </div>
                    );
                })}

            </MapContainer>

            {/* Floating Control Panel */}
            <ControlPanel
                toggles={{
                    showSales, salesFilter, showBlueZones, showDominion, showIncome, showRace, showRankings,
                    showConfirmed, showSpeculation, minKwHPotential
                }}
                setters={{
                    setShowSales, setSalesFilter, setShowBlueZones, setShowDominion, setShowIncome, setShowRace, setShowRankings,
                    setShowConfirmed, setShowSpeculation, setMinKwHPotential
                }
                }
            />
        </div >
    );
}
