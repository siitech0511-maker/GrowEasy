"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
    total_leads: number;
    by_status: Record<string, number>;
    by_source: Record<string, number>;
    conversion_rate: number;
    average_score: number;
    won_leads: number;
}

export default function MarketingDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch("/api/v1/marketing/analytics");
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Marketing Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Smart Lead Aggregator - Overview & Insights
                    </p>
                </div>
                <Link
                    href="/marketing/discover"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    🔍 Discover Leads
                </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Leads"
                    value={stats?.total_leads || 0}
                    icon="🎯"
                    color="blue"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${stats?.conversion_rate || 0}%`}
                    icon="📈"
                    color="green"
                />
                <MetricCard
                    title="Won Deals"
                    value={stats?.won_leads || 0}
                    icon="🏆"
                    color="yellow"
                />
                <MetricCard
                    title="Avg Lead Score"
                    value={Math.round(stats?.average_score || 0)}
                    icon="⭐"
                    color="purple"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads by Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Leads by Status
                    </h3>
                    <div className="space-y-3">
                        {stats?.by_status &&
                            Object.entries(stats.by_status).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <span className="text-gray-700">{status}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${((count as number) / (stats.total_leads || 1)) * 100
                                                        }%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-gray-900 font-medium w-12 text-right">
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Leads by Source */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Leads by Source
                    </h3>
                    <div className="space-y-3">
                        {stats?.by_source &&
                            Object.entries(stats.by_source).map(([source, count]) => (
                                <div key={source} className="flex items-center justify-between">
                                    <span className="text-gray-700">{source}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{
                                                    width: `${((count as number) / (stats.total_leads || 1)) * 100
                                                        }%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-gray-900 font-medium w-12 text-right">
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/marketing/leads"
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                        <div className="text-2xl mb-2">📋</div>
                        <div className="font-medium text-gray-900">View All Leads</div>
                        <div className="text-sm text-gray-500">
                            Browse and manage your leads
                        </div>
                    </Link>
                    <Link
                        href="/marketing/discover"
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                        <div className="text-2xl mb-2">🔍</div>
                        <div className="font-medium text-gray-900">Discover Leads</div>
                        <div className="text-sm text-gray-500">
                            Find new business opportunities
                        </div>
                    </Link>
                    <Link
                        href="/marketing/analytics"
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-medium text-gray-900">View Analytics</div>
                        <div className="text-sm text-gray-500">
                            Detailed reports and insights
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
}) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        yellow: "bg-yellow-50 text-yellow-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div
                    className={`text-3xl p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]
                        }`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
