"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiscoverPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        city: "",
        category: "",
        sources: {
            google_maps: false,
            openstreetmap: false,
            justdial: false,
            indiamart: false,
            facebook: false,
        },
        radius: 5000,
        max_results: 100,
    });

    const [discovering, setDiscovering] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleDiscover = async () => {
        setDiscovering(true);
        setResult(null);

        try {
            const sources = Object.entries(config.sources)
                .filter(([_, enabled]) => enabled)
                .map(([source]) => {
                    // Normalize to match backend expectations
                    if (source === 'google_maps') return 'Google Maps';
                    if (source === 'openstreetmap') return 'OpenStreetMap';
                    return source.charAt(0).toUpperCase() + source.slice(1);
                });

            const token = localStorage.getItem('token');

            if (!token) {
                alert("Authentication missing. Redirecting to login.");
                router.push('/login');
                return;
            }

            const response = await fetch("/api/v1/marketing/discover", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    city: config.city,
                    category: config.category || undefined,
                    sources: sources,
                    radius: config.radius,
                    max_results: config.max_results,
                }),
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                router.push('/login');
                throw new Error("Session expired. Please login again.");
            }

            const data = await response.json();

            if (!response.ok || data.status === 'failed') {
                throw new Error(data.message || data.detail || "Discovery failed");
            }

            setResult(data);
        } catch (error: any) {
            console.error("Error discovering leads:", error);
            setResult({
                status: "failed",
                message: error.message || "Failed to discover leads. Please try again.",
            });
        } finally {
            setDiscovering(false);
        }
    };

    const isFormValid = config.city && Object.values(config.sources).some((v) => v);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Discover Leads</h1>
                <p className="text-gray-500 mt-1">
                    Find new business opportunities from multiple sources
                </p>
            </div>

            {/* Configuration Form */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Discovery Configuration
                </h3>

                <div className="space-y-6">
                    {/* City Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={config.city}
                            onChange={(e) => setConfig({ ...config, city: e.target.value })}
                            placeholder="e.g., Mumbai, Delhi, Bangalore"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                    </div>

                    {/* Category Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category (Optional)
                        </label>
                        <input
                            type="text"
                            value={config.category}
                            onChange={(e) => setConfig({ ...config, category: e.target.value })}
                            placeholder="e.g., Restaurant, Manufacturer, Salon"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                    </div>

                    {/* Source Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lead Sources <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <SourceCheckbox
                                label="Google Maps"
                                icon="🗺️"
                                checked={config.sources.google_maps}
                                onChange={(checked) =>
                                    setConfig({
                                        ...config,
                                        sources: { ...config.sources, google_maps: checked },
                                    })
                                }
                                status="inactive"
                                statusText="API key required"
                            />
                            <SourceCheckbox
                                label="OpenStreetMap / Geoapify"
                                icon="🌍"
                                checked={config.sources.openstreetmap}
                                onChange={(checked) =>
                                    setConfig({
                                        ...config,
                                        sources: { ...config.sources, openstreetmap: checked },
                                    })
                                }
                                status="active"
                                statusText="Free limit applied"
                            />
                            <SourceCheckbox
                                label="Justdial"
                                icon="📱"
                                checked={config.sources.justdial}
                                onChange={(checked) =>
                                    setConfig({
                                        ...config,
                                        sources: { ...config.sources, justdial: checked },
                                    })
                                }
                                status="inactive"
                                statusText="Not configured"
                            />
                            <SourceCheckbox
                                label="IndiaMART"
                                icon="🏭"
                                checked={config.sources.indiamart}
                                onChange={(checked) =>
                                    setConfig({
                                        ...config,
                                        sources: { ...config.sources, indiamart: checked },
                                    })
                                }
                                status="inactive"
                                statusText="Not configured"
                            />
                            <SourceCheckbox
                                label="Facebook"
                                icon="👥"
                                checked={config.sources.facebook}
                                onChange={(checked) =>
                                    setConfig({
                                        ...config,
                                        sources: { ...config.sources, facebook: checked },
                                    })
                                }
                                status="inactive"
                                statusText="Not configured"
                            />
                        </div>
                    </div>

                    {/* Radius Slider (for Google Maps & OSM) */}
                    {(config.sources.google_maps || config.sources.openstreetmap) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Radius: {config.radius / 1000} km
                            </label>
                            <input
                                type="range"
                                min="1000"
                                max="50000"
                                step="1000"
                                value={config.radius}
                                onChange={(e) =>
                                    setConfig({ ...config, radius: parseInt(e.target.value) })
                                }
                                className="w-full"
                            />
                        </div>
                    )}

                    {/* Max Results */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Results
                        </label>
                        <select
                            value={config.max_results}
                            onChange={(e) =>
                                setConfig({ ...config, max_results: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        >
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                            <option value={500}>500</option>
                        </select>
                    </div>

                    {/* Discover Button */}
                    <button
                        onClick={handleDiscover}
                        disabled={!isFormValid || discovering}
                        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${isFormValid && !discovering
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        {discovering ? "🔍 Discovering..." : "🔍 Start Discovery"}
                    </button>
                </div>
            </div>

            {/* Result Display */}
            {result && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Discovery Result
                    </h3>
                    {result.status === "pending" || result.status === "completed" ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl">ℹ️</div>
                                <div>
                                    <div className="font-medium text-blue-900">
                                        {result.message}
                                    </div>
                                    <div className="text-sm text-blue-700 mt-1">
                                        Please configure API keys in Settings to enable lead discovery.
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <StatBox label="Found" value={result.total_found} />
                                <StatBox label="Qualified" value={result.total_qualified} />
                                <StatBox label="Created" value={result.total_created} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl">❌</div>
                            <div>
                                <div className="font-medium text-red-900">Discovery Failed</div>
                                <div className="text-sm text-red-700 mt-1">{result.message}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-2">
                    📌 How Lead Discovery Works
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li>
                        • <strong>Google Maps:</strong> Finds businesses based on location and
                        category with ratings and reviews
                    </li>
                    <li>
                        • <strong>OpenStreetMap:</strong> Free alternative to find local businesses
                        and points of interest
                    </li>
                    <li>
                        • <strong>Justdial:</strong> Discovers local businesses from India's
                        largest directory
                    </li>
                    <li>
                        • <strong>IndiaMART:</strong> Targets B2B manufacturers, wholesalers,
                        and traders
                    </li>
                    <li>
                        • <strong>Facebook:</strong> Finds business pages with contact
                        information
                    </li>
                    <li className="mt-3 pt-3 border-t border-blue-200">
                        💡 <strong>Tip:</strong> Leads are automatically scored based on
                        rating, reviews, category, and source. Focus on high-score leads for
                        better conversion!
                    </li>
                </ul>
            </div>

            {/* Setup Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-2">
                    ⚠️ API Configuration Required
                </h4>
                <p className="text-sm text-yellow-800 mb-3">
                    To enable lead discovery, you need to configure API keys for the sources
                    you want to use. Go to Settings to add your API credentials.
                </p>
                <a
                    href="/marketing/settings"
                    className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                >
                    Configure API Keys →
                </a>
            </div>
        </div>
    );
}

function SourceCheckbox({
    label,
    icon,
    checked,
    onChange,
    status,
    statusText,
}: {
    label: string;
    icon: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    status: "active" | "inactive";
    statusText: string;
}) {
    return (
        <label
            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${checked
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
                }`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-5 h-5"
            />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                </div>
                <div
                    className={`text-xs mt-1 ${status === "active" ? "text-green-600" : "text-gray-500"
                        }`}
                >
                    {statusText}
                </div>
            </div>
        </label>
    );
}

function StatBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600 mt-1">{label}</div>
        </div>
    );
}
