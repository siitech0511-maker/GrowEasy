'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('./Map'), { ssr: false });

interface LocationPickerProps {
    onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
    initialLocation?: { lat: number; lng: number };
    height?: string;
    showSearch?: boolean;
}

export default function LocationPicker({
    onLocationSelect,
    initialLocation = { lat: 28.6139, lng: 77.2090 }, // Delhi default
    height = '400px',
    showSearch = true,
}: LocationPickerProps) {
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleMapClick = async (lat: number, lng: number) => {
        setSelectedLocation({ lat, lng });

        // Reverse geocoding using Nominatim (free)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            onLocationSelect({
                lat,
                lng,
                address: data.display_name,
            });
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            onLocationSelect({ lat, lng });
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            // Free geocoding using Nominatim
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectSearchResult = (result: any) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setSelectedLocation({ lat, lng });
        onLocationSelect({
            lat,
            lng,
            address: result.display_name,
        });
        setSearchResults([]);
        setSearchQuery('');
    };

    return (
        <div className="space-y-4">
            {showSearch && (
                <div className="relative">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search for a location..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    onClick={() => selectSearchResult(result)}
                                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                                >
                                    <div className="font-medium text-sm">{result.display_name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Map
                    center={[selectedLocation.lat, selectedLocation.lng]}
                    zoom={13}
                    markers={[
                        {
                            position: [selectedLocation.lat, selectedLocation.lng],
                            popup: 'Selected Location',
                            title: 'Click on map to change location',
                        },
                    ]}
                    height={height}
                    onMapClick={handleMapClick}
                />
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <strong>Selected:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </div>
        </div>
    );
}
