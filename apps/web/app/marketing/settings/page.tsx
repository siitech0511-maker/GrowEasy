"use client";

import { useEffect, useState } from "react";

interface CategoryWeight {
    id: number;
    category: string;
    weight: number;
    description: string;
    is_active: boolean;
}

interface QualificationRule {
    id: number;
    rule_name: string;
    min_rating: number;
    min_reviews: number;
    website_required: boolean;
    phone_required: boolean;
    min_lead_score: number;
    is_active: boolean;
}

interface LeadSourceConfig {
    id: number;
    source_name: string;
    api_key: string;
    daily_quota: number;
    requests_today: number;
    source_weight: number;
    is_active: boolean;
}

export default function SettingsPage() {
    const [categories, setCategories] = useState<CategoryWeight[]>([]);
    const [rules, setRules] = useState<QualificationRule[]>([]);
    const [sources, setSources] = useState<LeadSourceConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"sources" | "rules" | "categories">(
        "sources"
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [categoriesRes, rulesRes, sourcesRes] = await Promise.all([
                fetch("/api/v1/marketing/categories"),
                fetch("/api/v1/marketing/rules"),
                fetch("/api/v1/marketing/sources"),
            ]);

            const categoriesData = await categoriesRes.json();
            const rulesData = await rulesRes.json();
            const sourcesData = await sourcesRes.json();

            setCategories(categoriesData);
            setRules(rulesData);
            setSources(sourcesData);
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">
                    Configure lead sources, qualification rules, and category weights
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                    <button
                        onClick={() => setActiveTab("sources")}
                        className={`pb-4 px-1 border-b-2 font-medium transition-colors ${activeTab === "sources"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Lead Sources
                    </button>
                    <button
                        onClick={() => setActiveTab("rules")}
                        className={`pb-4 px-1 border-b-2 font-medium transition-colors ${activeTab === "rules"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Qualification Rules
                    </button>
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`pb-4 px-1 border-b-2 font-medium transition-colors ${activeTab === "categories"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Category Weights
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "sources" && (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                            🔑 API Configuration
                        </h4>
                        <p className="text-sm text-blue-800">
                            Configure API keys and credentials for external lead sources. Keep
                            your API keys secure and never share them publicly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sources.map((source) => (
                            <SourceCard key={source.id} source={source} />
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "rules" && (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                            ⚖️ Qualification Rules
                        </h4>
                        <p className="text-sm text-blue-800">
                            Define criteria to automatically qualify or disqualify leads based on
                            rating, reviews, website presence, and other factors.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Rule Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Min Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Min Reviews
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        No Website
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rules.map((rule) => (
                                    <tr key={rule.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {rule.rule_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {rule.min_rating}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {rule.min_reviews}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {rule.website_required ? (
                                                <span className="text-green-600">✓ Required</span>
                                            ) : (
                                                <span className="text-gray-400">Not required</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${rule.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {rule.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "categories" && (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                            ⭐ Category Weights
                        </h4>
                        <p className="text-sm text-blue-800">
                            Assign score weights to different business categories. Higher weights
                            indicate better conversion potential.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Weight
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {category.category}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                                +{category.weight}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {category.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${category.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {category.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function SourceCard({ source }: { source: LeadSourceConfig }) {
    const getSourceIcon = (name: string) => {
        const icons: Record<string, string> = {
            "Google Maps": "🗺️",
            Justdial: "📱",
            IndiaMART: "🏭",
            Facebook: "👥",
            Manual: "✍️",
        };
        return icons[name] || "📌";
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{getSourceIcon(source.source_name)}</span>
                    <div>
                        <h3 className="font-semibold text-gray-900">{source.source_name}</h3>
                        <span
                            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${source.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                        >
                            {source.is_active ? "✓ Active" : "✗ Inactive"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Daily Quota</span>
                    <span className="font-medium text-gray-900">{source.daily_quota}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Used Today</span>
                    <span className="font-medium text-gray-900">
                        {source.requests_today}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Source Weight</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                        +{source.source_weight}
                    </span>
                </div>

                {!source.is_active && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                            ⚠️ API key not configured. Add your API credentials to activate this
                            source.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
