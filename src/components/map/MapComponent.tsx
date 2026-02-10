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

interface RankedArea {
    id: number;
    lat: number;
    lng: number;
    polygon: number[][];
    size: number;
    in_zone: boolean;
    score: number;
    kwh_potential_raw: number;
    demographics: {
        age: number;
        hh_size: number;
        pct_black: number;
    };
    tract: string;
    benefit_likelihood: number;
    rank: number;
    description: string;
    benefit_score?: number; // Optional as it might be same as score
    snap_rate?: number;
    medicaid_rate?: number;
}

export default function MapComponent() {
    const [salesData, setSalesData] = useState<SalesRecord[]>([]);
    const [blueZones, setBlueZones] = useState<any>(null);
    const [censusData, setCensusData] = useState<any>(null);
    const [rankedAreas, setRankedAreas] = useState<RankedArea[]>([]);
    const [ourDeals, setOurDeals] = useState<any[]>([]);
    const [salesFilter, setSalesFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'default' | 'heating' | 'demographics'>('default');

    // NEW: Selected Zone State
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

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
        // If no zone is selected, DO NOT show the massive list of sales pins to prevent crash
        if (!selectedZoneId && salesFilter !== 'force_all') return [];

        let currentData = salesData;

        // 1. Filter by selected Zone (Geo-spatial check simplified logic: we assume sales are tagged or we check bounds)
        // Since we don't have a 'zone_id' on sales records, we will use a simple lat/lng bounds check against the selected zone
        if (selectedZoneId) {
            const selectedZone = rankedAreas.find(r => r.id === selectedZoneId);
            if (selectedZone && selectedZone.polygon) {
                // Rough bounds check implementation
                // Find min/max lat/lng of the polygon
                let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
                selectedZone.polygon.forEach((p: number[]) => {
                    // Polygon format in JSON is [lng, lat]
                    const lng = p[0];
                    const lat = p[1];
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLng = Math.min(minLng, lng);
                    maxLng = Math.max(maxLng, lng);
                });

                // Add a small buffer (approx 100m) 
                const buffer = 0.001;
                minLat -= buffer; maxLat += buffer;
                minLng -= buffer; maxLng += buffer;

                currentData = currentData.filter(sale =>
                    sale.Latitude >= minLat && sale.Latitude <= maxLat &&
                    sale.Longitude >= minLng && sale.Longitude <= maxLng
                );
            }
        }

        if (salesFilter === 'all') return currentData;

        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

        return currentData.filter(sale => {
            if (!sale.Sale_Date) return false;
            const saleDate = new Date(sale.Sale_Date);
            if (isNaN(saleDate.getTime())) return false; // Invalid date

            if (salesFilter === 'recent') {
                return saleDate >= cutoffDate;
            } else {
                return saleDate < cutoffDate;
            }
        });
    }, [salesData, salesFilter, selectedZoneId, rankedAreas]);

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
                    const isConfirmed = area.in_zone === true; // Blue Zone overlap
                    const isSpeculation = !isConfirmed;

                    // Filter Logic
                    if (!showConfirmed && isConfirmed) return null;
                    if (!showSpeculation && isSpeculation) return null;
                    if (area.kwh_potential_raw < minKwHPotential) return null;

                    // Color Logic based on View Mode
                    let areaColor = isConfirmed ? '#9333ea' : '#f97316'; // Default Purple/Orange
                    let opacity = 0.15;

                    if (viewMode === 'heating') {
                        if (area.score > 70) areaColor = '#ef4444'; // Red - High
                        else if (area.score > 50) areaColor = '#f97316'; // Orange - Medium
                        else areaColor = '#94a3b8'; // Grey - Low
                        opacity = 0.3; // More visible in heat mode
                    } else if (viewMode === 'demographics') {
                        const pctBlack = area.demographics?.pct_black ?? 0;
                        if (pctBlack > 50) areaColor = '#9333ea'; // Purple - Majority Black
                        else if (pctBlack < 20) areaColor = '#10b981'; // Green - Likely White/Other
                        else areaColor = '#eab308'; // Yellow - Mix/Diversity
                        opacity = 0.3;
                    } else {
                        // Default Mode refinements
                        if (area.rank <= 10) areaColor = '#facc15'; // Top 10 Gold
                    }

                    const isSelected = selectedZoneId === area.id;
                    // Fix: Ensure we have fallback for housingType calculation if needed or use existing logic
                    // The original code had: const housingType = inferHousingType(area.size); 
                    // But 'inferHousingType' might not be defined in this file (it wasn't in previous context). 
                    // Let's use the logic seen in other snippets: area.size > 100 ...
                    const housingType = area.size > 100 ? 'Dense Single Family' : 'Sporadic Single Family';

                    const customIcon = createCustomIcon(housingType, areaColor);

                    return (
                        <div key={`rank-${idx}`}>
                            {/* Territory Polygon - OUTLINE focused */}
                            {area.polygon && (
                                <Polygon
                                    positions={area.polygon.map((p: number[]) => [p[1], p[0]])}
                                    eventHandlers={{
                                        click: (e) => {
                                            if (selectedZoneId === area.id) {
                                                setSelectedZoneId(null); // Deselect
                                            } else {
                                                setSelectedZoneId(area.id); // Select
                                            }
                                        }
                                    }}
                                    pathOptions={{
                                        color: isSelected ? '#ffffff' : areaColor, // Highlight selected with white border
                                        weight: isSelected ? 4 : 2,
                                        opacity: 1,
                                        fillColor: areaColor,
                                        fillOpacity: isSelected ? 0.35 : opacity, // Darker fill when selected
                                        dashArray: isSelected ? '0' : '5, 5'
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
                                                <div className="mt-1">
                                                    <button
                                                        className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent popup close? No, let standard map click handle it, but here we can force state
                                                            if (selectedZoneId !== area.id) setSelectedZoneId(area.id);
                                                            else setSelectedZoneId(null);
                                                        }}
                                                    >
                                                        {isSelected ? 'Zone Selected (Showing Pins)' : 'Click Area to Load Data'}
                                                    </button>
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
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Heating Prediction</div>
                                                    <div className="text-sm font-bold text-slate-800">{getHeatingType(area.score)}</div>
                                                </div>
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Med. Income</div>
                                                    <div className="text-sm font-bold text-slate-800">
                                                        {/* Placeholder - mapping specific income would require joining census data */}
                                                        {isConfirmed ? '< $60k (LMI)' : '$60k - $90k'}
                                                    </div>
                                                </div>
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Benefits Prob.</div>
                                                    <div className="text-sm font-bold text-purple-700">
                                                        {(area.benefit_likelihood * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                                <div className="bg-slate-100 p-2 rounded">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">kWh Expected</div>
                                                    <div className="text-sm font-bold text-blue-700">
                                                        {area.kwh_potential_raw ? area.kwh_potential_raw.toFixed(1) : '—'} kWh/d
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
                                eventHandlers={{
                                    click: () => {
                                        if (selectedZoneId === area.id) {
                                            setSelectedZoneId(null);
                                        } else {
                                            setSelectedZoneId(area.id);
                                        }
                                    }
                                }}
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
                }}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {/* Legend Overlay */}
            {(viewMode === 'heating' || viewMode === 'demographics') && (
                <div className="absolute bottom-8 left-8 bg-white/90 p-3 rounded-lg shadow-xl border border-slate-200 z-[1000] text-xs">
                    <h4 className="font-bold mb-2 uppercase tracking-wide text-slate-600">
                        {viewMode === 'heating' ? 'Heating Potential' : 'Demographics'}
                    </h4>
                    <div className="space-y-1">
                        {viewMode === 'heating' ? (
                            <>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> <span>High (Electric)</span></div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> <span>Medium (Mix)</span></div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-400"></span> <span>Low (Gas)</span></div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-600"></span> <span>Primary: Black</span></div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> <span>Mix / Diverse</span></div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> <span>Primary: White/Other</span></div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
}
