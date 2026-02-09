import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useMapEvents } from 'react-leaflet';

export function useSupabaseMapData(fetchEnabled: boolean) {
    const [bounds, setBounds] = useState<any>(null);
    const [clusters, setClusters] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Update bounds when map moves
    const MapEvents = () => {
        useMapEvents({
            moveend: (e) => {
                setBounds(e.target.getBounds());
            }
        });
        return null;
    };

    useEffect(() => {
        if (!fetchEnabled || !bounds) return;

        const fetchInView = async () => {
            setLoading(true);
            const { _southWest, _northEast } = bounds;

            // 1. Fetch Priority Clusters (Pins)
            // Using PostGIS to find points within the View Box
            const { data: clusterData, error: clusterError } = await supabase
                .rpc('get_clusters_within_bbox', {
                    min_lat: _southWest.lat,
                    min_lng: _southWest.lng,
                    max_lat: _northEast.lat,
                    max_lng: _northEast.lng
                });

            if (clusterData) setClusters(clusterData);
            if (clusterError) console.error('Cluster Fetch Error:', clusterError);

            // 2. Fetch Sales History (Legacy & Arcadia)
            // Limit to e.g. 500 to prevent crashing browser
            const { data: salesData, error: salesError } = await supabase
                .from('sales_entries')
                .select('*')
                .gte('location', `POINT(${_southWest.lng} ${_southWest.lat})`) // Simplified fetch, ideally use RPC for BBox
                .limit(200);

            if (salesData) setSales(salesData);

            setLoading(false);
        };

        // Debounce fetching
        const timeoutId = setTimeout(fetchInView, 500);
        return () => clearTimeout(timeoutId);

    }, [bounds, fetchEnabled]);

    return { clusters, sales, loading, MapEvents };
}
