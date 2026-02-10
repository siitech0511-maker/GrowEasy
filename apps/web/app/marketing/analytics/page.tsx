"use client";

import { useEffect, useState } from "react";

interface Analytics {
    total_leads: number;
    by_status: Record<string, number>;
    by_source: Record<string, number>;
    conversion_rate: number;
    average_score: number;
    won_leads: number;
}

interface FunnelStage {
    stage: string;
    count: number;
}

interface SourcePerformance {
    source: string;
    total_leads: number;
    won_leads: number;
    conversion_rate: number;
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [funnel, setFunnel] = useState<FunnelStage[]>([]);
    const [performance, setPerformance] = useState<SourcePerformance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [analyticsRes, funnelRes, performanceRes] = await Promise.all([
                fetch("/api/v1/marketing/analytics"),
                fetch("/api/v1/marketing/analytics/funnel"),
                fetch("/api/v1/marketing/analytics/performance"),
            ]);

            const analyticsData = await analyticsRes.json();
            const funnelData = await funnelRes.json();
            const performanceData = await performanceRes.json();

            setAnalytics(analyticsData);
            setFunnel(funnelData.stages || []);
            setPerformance(performanceData);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-500 mt-1">
                    Detailed insights into your lead performance
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Leads"
                    value={analytics?.total_leads || 0}
                    icon="🎯"
                    trend="+12%"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${analytics?.conversion_rate || 0}%`}
                    icon="📈"
                    trend="+5%"
                />
                <MetricCard
                    title="Won Deals"
                    value={analytics?.won_leads || 0}
                    icon="🏆"
                    trend="+8"
                />
                <MetricCard
                    title="Avg Score"
                    value={Math.round(analytics?.average_score || 0)}
                    icon="⭐"
                    trend="+3"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Conversion Funnel
                    </h3>
                    <div className="space-y-3">
                        {funnel.map((stage, index) => {
                            const maxCount = Math.max(...funnel.map((s) => s.count));
                            const percentage = (stage.count / maxCount) * 100;
                            return (
                                <div key={stage.stage}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">
                                            {stage.stage}
                                        </span>
                                        <span className="text-sm text-gray-600">{stage.count}</span>
                                    </div>
                                    <div className="relative h-8 bg-gray-100 rounded">
                                        <div
                                            className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-end pr-3"
                                            style={{ width: `${percentage}%` }}
                                        >
                                            <span className="text-white text-xs font-medium">
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Source Performance */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Source Performance
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-sm font-medium text-gray-700">
                                        Source
                                    </th>
                                    <th className="text-right py-2 text-sm font-medium text-gray-700">
                                        Total
                                    </th>
                                    <th className="text-right py-2 text-sm font-medium text-gray-700">
                                        Won
                                    </th>
                                    <th className="text-right py-2 text-sm font-medium text-gray-700">
                                        Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {performance.map((perf) => (
                                    <tr key={perf.source} className="border-b border-gray-100">
                                        <td className="py-3 text-sm text-gray-900">{perf.source}</td>
                                        <td className="py-3 text-sm text-gray-600 text-right">
                                            {perf.total_leads}
                                        </td>
                                        <td className="py-3 text-sm text-green-600 text-right font-medium">
                                            {perf.won_leads}
                                        </td>
                                        <td className="py-3 text-sm text-right">
                                            <span
                                                className={`font-medium ${perf.conversion_rate >= 15
                                                        ? "text-green-600"
                                                        : perf.conversion_rate >= 10
                                                            ? "text-yellow-600"
                                                            : "text-red-600"
                                                    }`}
                                            >
                                                {perf.conversion_rate.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leads by Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Leads by Status
                    </h3>
                    <div className="space-y-3">
                        {analytics?.by_status &&
                            Object.entries(analytics.by_status).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                                        <span className="text-gray-700">{status}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getStatusBgColor(status)}`}
                                                style={{
                                                    width: `${((count as number) / (analytics.total_leads || 1)) * 100
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
                        {analytics?.by_source &&
                            Object.entries(analytics.by_source).map(([source, count]) => (
                                <div key={source} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{getSourceIcon(source)}</span>
                                        <span className="text-gray-700">{source}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{
                                                    width: `${((count as number) / (analytics.total_leads || 1)) * 100
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

            {/* Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    💡 Key Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InsightCard
                        icon="🎯"
                        title="Best Performing Source"
                        description={
                            performance.length > 0
                                ? `${performance[0]?.source} with ${performance[0]?.conversion_rate.toFixed(1)}% conversion rate`
                                : "No data available"
                        }
                    />
                    <InsightCard
                        icon="📊"
                        title="Pipeline Health"
                        description={`${analytics?.total_leads || 0} total leads with ${analytics?.conversion_rate || 0
                            }% conversion rate`}
                    />
                    <InsightCard
                        icon="⭐"
                        title="Lead Quality"
                        description={`Average lead score of ${Math.round(
                            analytics?.average_score || 0
                        )} points`}
                    />
                    <InsightCard
                        icon="🏆"
                        title="Success Rate"
                        description={`${analytics?.won_leads || 0} deals won from ${analytics?.total_leads || 0
                            } total leads`}
                    />
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon,
    trend,
}: {
    title: string;
    value: string | number;
    icon: string;
    trend: string;
}) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{title}</p>
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-green-600 mt-2">{trend} from last month</p>
        </div>
    );
}

function InsightCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                    <h4 className="font-semibold text-gray-900">{title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        New: "bg-blue-500",
        Contacted: "bg-yellow-500",
        Interested: "bg-purple-500",
        "Proposal Sent": "bg-orange-500",
        Won: "bg-green-500",
        Lost: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
}

function getStatusBgColor(status: string) {
    const colors: Record<string, string> = {
        New: "bg-blue-600",
        Contacted: "bg-yellow-600",
        Interested: "bg-purple-600",
        "Proposal Sent": "bg-orange-600",
        Won: "bg-green-600",
        Lost: "bg-red-600",
    };
    return colors[status] || "bg-gray-600";
}

function getSourceIcon(source: string) {
    const icons: Record<string, string> = {
        "Google Maps": "🗺️",
        Justdial: "📱",
        IndiaMART: "🏭",
        Facebook: "👥",
        Manual: "✍️",
    };
    return icons[source] || "📌";
}
