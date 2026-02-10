'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const Map = dynamic(() => import('@/components/maps/Map'), { ssr: false });
const LocationPicker = dynamic(() => import('@/components/maps/LocationPicker'), { ssr: false });

export default function MapsDemo() {
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
        address?: string;
    } | null>(null);

    // Sample markers for India
    const sampleMarkers = [
        { position: [28.6139, 77.2090] as [number, number], popup: 'Delhi', title: 'Capital of India' },
        { position: [19.0760, 72.8777] as [number, number], popup: 'Mumbai', title: 'Financial Capital' },
        { position: [12.9716, 77.5946] as [number, number], popup: 'Bangalore', title: 'Tech Hub' },
        { position: [22.5726, 88.3639] as [number, number], popup: 'Kolkata', title: 'Cultural Capital' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        OpenStreetMap Integration Demo
                    </h1>
                    <p className="text-gray-600">
                        Free, unlimited map solution for GrowEasy - No API key required! 🗺️
                    </p>
                </div>

                {/* Basic Map Example */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">1. Basic Map with Markers</h2>
                    <p className="text-gray-600 mb-4">
                        Displaying major cities in India with custom markers and popups
                    </p>
                    <Map
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        markers={sampleMarkers}
                        height="400px"
                    />
                </div>

                {/* Location Picker Example */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">2. Interactive Location Picker</h2>
                    <p className="text-gray-600 mb-4">
                        Search for locations or click on the map to select a point. Uses free Nominatim geocoding.
                    </p>
                    <LocationPicker
                        onLocationSelect={(location) => {
                            setSelectedLocation(location);
                            console.log('Selected location:', location);
                        }}
                        height="500px"
                    />

                    {selectedLocation && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="font-semibold text-green-900 mb-2">Location Selected:</h3>
                            <p className="text-sm text-gray-700">
                                <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}<br />
                                <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}<br />
                                {selectedLocation.address && (
                                    <>
                                        <strong>Address:</strong> {selectedLocation.address}
                                    </>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* Features List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">✨ Features</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">🆓 100% Free</h3>
                            <p className="text-sm text-gray-700">No API keys, no usage limits, no credit card required</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h3 className="font-semibold text-green-900 mb-2">🔍 Free Geocoding</h3>
                            <p className="text-sm text-gray-700">Search addresses and reverse geocoding with Nominatim</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h3 className="font-semibold text-purple-900 mb-2">📍 Custom Markers</h3>
                            <p className="text-sm text-gray-700">Add unlimited markers with popups and custom icons</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                            <h3 className="font-semibold text-orange-900 mb-2">🎨 Fully Customizable</h3>
                            <p className="text-sm text-gray-700">Style maps, add layers, and create interactive experiences</p>
                        </div>
                    </div>
                </div>

                {/* Usage Examples */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">💡 Use Cases for GrowEasy</h2>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span><strong>CRM Leads:</strong> Track customer locations and visualize sales territories</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span><strong>Inventory:</strong> Show warehouse and store locations on a map</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span><strong>Delivery Tracking:</strong> Display delivery routes and customer addresses</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span><strong>Store Locator:</strong> Help customers find nearest stores or service centers</span>
                        </li>
                    </ul>
                </div>

                {/* Code Example */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">📝 Quick Usage Example</h2>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        {`import Map from '@/components/maps/Map';

// Simple map with markers
<Map
  center={[28.6139, 77.2090]}
  zoom={13}
  markers={[
    {
      position: [28.6139, 77.2090],
      popup: 'Your Business Location',
      title: 'GrowEasy HQ'
    }
  ]}
  height="400px"
/>`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
