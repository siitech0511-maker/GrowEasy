'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
    center?: [number, number];
    zoom?: number;
    markers?: Array<{
        position: [number, number];
        popup?: string;
        title?: string;
    }>;
    height?: string;
    width?: string;
    className?: string;
    onMapClick?: (lat: number, lng: number) => void;
}

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
    const map = useMap();

    useEffect(() => {
        if (!onClick) return;

        const handleClick = (e: L.LeafletMouseEvent) => {
            onClick(e.latlng.lat, e.latlng.lng);
        };

        map.on('click', handleClick);

        return () => {
            map.off('click', handleClick);
        };
    }, [map, onClick]);

    return null;
}

export default function Map({
    center = [20.5937, 78.9629], // India center
    zoom = 5,
    markers = [],
    height = '400px',
    width = '100%',
    className = '',
    onMapClick,
}: MapProps) {
    return (
        <div className={className} style={{ height, width }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {markers.map((marker, index) => (
                    <Marker key={index} position={marker.position}>
                        {marker.popup && (
                            <Popup>
                                <div>
                                    {marker.title && <strong>{marker.title}</strong>}
                                    {marker.title && marker.popup && <br />}
                                    {marker.popup}
                                </div>
                            </Popup>
                        )}
                    </Marker>
                ))}

                {onMapClick && <MapClickHandler onClick={onMapClick} />}
            </MapContainer>
        </div>
    );
}
