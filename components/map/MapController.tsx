import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
    center?: [number, number];
    zoom?: number;
    bounds?: L.LatLngBoundsExpression;
    onUserInteraction?: () => void;
}

export const MapController = ({ center, zoom, bounds, onUserInteraction }: MapControllerProps) => {
    const map = useMap();
    const isFlying = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => { map.invalidateSize(); }, 100);
        return () => clearTimeout(timer);
    }, [map]);

    // Attach interaction listeners to detect manual movement
    useEffect(() => {
        if (!onUserInteraction) return;

        const handleInteraction = () => {
            // Only trigger interaction if not currently animating controlled by app
            if (!isFlying.current) {
                onUserInteraction();
            }
        };

        map.on('dragstart', handleInteraction);
        map.on('zoomstart', handleInteraction);

        return () => {
            map.off('dragstart', handleInteraction);
            map.off('zoomstart', handleInteraction);
        };
    }, [map, onUserInteraction]);

    useEffect(() => {
        if (bounds) {
            isFlying.current = true;
            map.fitBounds(bounds, { padding: [50, 50] });
            setTimeout(() => { isFlying.current = false; }, 1000);
        } else if (center) {
            const currentCenter = map.getCenter();
            const dist = map.distance(currentCenter, L.latLng(center[0], center[1]));

            // Filter micro-movements (GPS jitter)
            if (dist < 0.5) return;

            // Use flyTo only for large distances to avoid "seasickness" / jitter on small updates
            if (dist > 500) {
                isFlying.current = true;
                map.flyTo(center, zoom || map.getZoom(), { animate: true, duration: 1.5 });
                setTimeout(() => { isFlying.current = false; }, 1500);
            } else {
                // Smooth pan for tracking
                map.panTo(center, { animate: true, duration: 0.8 });
                if (zoom && map.getZoom() !== zoom) {
                    map.setZoom(zoom);
                }
            }
        }
    }, [center, zoom, bounds, map]);
    return null;
};