import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster';

const MarkerClusterGroup = createPathComponent(({ children: _c, ...props }, ctx) => {
    const clusterProps: Record<string, any> = {};
    const clusterEvents: Record<string, any> = {};

    // Split props and events
    Object.entries(props).forEach(([propName, prop]) => {
        if (propName.startsWith('on')) {
            clusterEvents[propName] = prop;
        } else {
            clusterProps[propName] = prop;
        }
    });

    const instance = new L.MarkerClusterGroup(clusterProps);

    // Initialize events
    Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
        const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
        instance.on(clusterEvent, callback);
    });

    return {
        instance,
        context: { ...ctx, layerContainer: instance },
    };
});

export default MarkerClusterGroup;
