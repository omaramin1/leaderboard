'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/src/components/map/MapComponent'), {
    ssr: false,
    loading: () => <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function MapWrapper() {
    return <Map />;
}
