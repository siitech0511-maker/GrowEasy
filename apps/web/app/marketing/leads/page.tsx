"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BusinessLead {
    id: number;
    business_name: string;
    category: string;
    source: string;
    phone: string;
    email: string;
    city: string;
    rating: number;
    review_count: number;
    has_website: boolean;
    lead_score: number;
    lead_status: string;
    assigned_to: string | null;
    created_at: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<BusinessLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "",
        source: "",
        city: "",
        search: "",
    });

    useEffect(() => {
        fetchLeads();
    }, [filters]);

    const fetchLeads = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append("status", filters.status);
            if (filters.source) params.append("source", filters.source);
            if (filters.city) params.append("city", filters.city);
            if (filters.search) params.append("search", filters.search);

            const response = await fetch(`/api/v1/marketing/leads?${params}`);
            const data = await response.json();
            setLeads(data.leads || []);
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            New: "bg-blue-100 text-blue-800",
            Contacted: "bg-yellow-100 text-yellow-800",
            Interested: "bg-purple-100 text-purple-800",
            "Proposal Sent": "bg-orange-100 text-orange-800",
            Won: "bg-green-100 text-green-800",
            Lost: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getScoreColor = (score: number) => {
        if (score >= 150) return "text-green-600 font-bold";
        if (score >= 100) return "text-blue-600 font-semibold";
        if (score >= 50) return "text-yellow-600";
        return "text-gray-600";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Business Leads</h1>
                    <p className="text-gray-500 mt-1">
                        Manage and track your discovered leads
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/marketing/discover"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        🔍 Discover New Leads
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                    </select>
                    <select
                        value={filters.source}
                        onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Sources</option>
                        <option value="Google Maps">Google Maps</option>
                        <option value="Justdial">Justdial</option>
                        <option value="IndiaMART">IndiaMART</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Manual">Manual</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Filter by city..."
                        value={filters.city}
                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading leads...</div>
                ) : leads.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No leads found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Start discovering leads to see them here
                        </p>
                        <Link
                            href="/marketing/discover"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Discover Leads
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Business
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Source
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {lead.business_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {lead.category}
                                                    </div>
                                                    {!lead.has_website && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                            No Website
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{lead.phone}</div>
                                            {lead.email && (
                                                <div className="text-sm text-gray-500">{lead.email}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{lead.city}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <span className="text-yellow-500">⭐</span>
                                                <span className="ml-1 text-sm text-gray-900">
                                                    {lead.rating.toFixed(1)}
                                                </span>
                                                <span className="ml-1 text-xs text-gray-500">
                                                    ({lead.review_count})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm ${getScoreColor(lead.lead_score)}`}>
                                                {lead.lead_score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                    lead.lead_status
                                                )}`}
                                            >
                                                {lead.lead_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{lead.source}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/marketing/leads/${lead.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </Link>
                                                {lead.phone && (
                                                    <a
                                                        href={`tel:${lead.phone}`}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Call
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            {leads.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div>
                            Showing <span className="font-semibold">{leads.length}</span> leads
                        </div>
                        <div className="flex gap-4">
                            <div>
                                High Score Leads:{" "}
                                <span className="font-semibold text-green-600">
                                    {leads.filter((l) => l.lead_score >= 150).length}
                                </span>
                            </div>
                            <div>
                                No Website:{" "}
                                <span className="font-semibold text-red-600">
                                    {leads.filter((l) => !l.has_website).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
