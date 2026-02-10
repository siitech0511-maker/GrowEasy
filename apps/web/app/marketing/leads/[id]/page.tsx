"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface BusinessLead {
    id: number;
    business_name: string;
    category: string;
    source: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    rating: number;
    review_count: number;
    has_website: boolean;
    website_url: string;
    lead_score: number;
    lead_status: string;
    assigned_to: string | null;
    google_maps_url: string;
    notes: string;
    contact_person: string;
    created_at: string;
    updated_at: string;
    last_contacted_at: string;
}

interface Activity {
    id: number;
    activity_type: string;
    subject: string;
    notes: string;
    created_at: string;
    call_duration: number;
    call_outcome: string;
}

export default function LeadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = params.id as string;

    const [lead, setLead] = useState<BusinessLead | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [newActivity, setNewActivity] = useState({
        activity_type: "Call",
        subject: "",
        notes: "",
    });

    useEffect(() => {
        if (leadId) {
            fetchLead();
            fetchActivities();
        }
    }, [leadId]);

    const fetchLead = async () => {
        try {
            const response = await fetch(`/api/v1/marketing/leads/${leadId}`);
            const data = await response.json();
            setLead(data);
        } catch (error) {
            console.error("Error fetching lead:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            const response = await fetch(`/api/v1/marketing/leads/${leadId}/activities`);
            const data = await response.json();
            setActivities(data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await fetch(`/api/v1/marketing/leads/${leadId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lead_status: newStatus }),
            });
            fetchLead();
            fetchActivities();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleAddActivity = async () => {
        try {
            await fetch(`/api/v1/marketing/leads/${leadId}/activity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newActivity),
            });
            setShowActivityModal(false);
            setNewActivity({ activity_type: "Call", subject: "", notes: "" });
            fetchActivities();
            fetchLead();
        } catch (error) {
            console.error("Error adding activity:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading lead details...</div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Lead not found</h2>
                <Link href="/marketing/leads" className="text-blue-600 hover:underline mt-4 inline-block">
                    Back to Leads
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/marketing/leads"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Back
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {lead.business_name}
                        </h1>
                        <p className="text-gray-500 mt-1">{lead.category}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {lead.phone && (
                        <a
                            href={`tel:${lead.phone}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            📞 Call
                        </a>
                    )}
                    <button
                        onClick={() => setShowActivityModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Add Activity
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Lead Info Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Lead Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Business Name" value={lead.business_name} />
                            <InfoItem label="Category" value={lead.category} />
                            <InfoItem label="Phone" value={lead.phone} />
                            <InfoItem label="Email" value={lead.email} />
                            <InfoItem label="Contact Person" value={lead.contact_person} />
                            <InfoItem label="Source" value={lead.source} />
                            <InfoItem
                                label="Rating"
                                value={`⭐ ${lead.rating.toFixed(1)} (${lead.review_count} reviews)`}
                            />
                            <InfoItem label="Lead Score" value={lead.lead_score.toString()} />
                            <InfoItem
                                label="Website"
                                value={lead.has_website ? lead.website_url : "❌ No Website"}
                            />
                            <InfoItem
                                label="Status"
                                value={
                                    <select
                                        value={lead.lead_status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded"
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Interested">Interested</option>
                                        <option value="Proposal Sent">Proposal Sent</option>
                                        <option value="Won">Won</option>
                                        <option value="Lost">Lost</option>
                                    </select>
                                }
                            />
                        </div>

                        {lead.address && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                                <p className="text-gray-700">
                                    {lead.address}
                                    {lead.city && `, ${lead.city}`}
                                    {lead.state && `, ${lead.state}`}
                                    {lead.pincode && ` - ${lead.pincode}`}
                                </p>
                            </div>
                        )}

                        {lead.notes && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                                <p className="text-gray-700">{lead.notes}</p>
                            </div>
                        )}

                        {lead.google_maps_url && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <a
                                    href={lead.google_maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    🗺️ View on Google Maps
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Activity Timeline
                        </h3>
                        {activities.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No activities yet. Add your first activity above.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                {getActivityIcon(activity.activity_type)}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-900">
                                                    {activity.subject || activity.activity_type}
                                                </h4>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(activity.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {activity.notes && (
                                                <p className="text-gray-700 mt-1">{activity.notes}</p>
                                            )}
                                            {activity.call_outcome && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Outcome: {activity.call_outcome}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Stats
                        </h3>
                        <div className="space-y-3">
                            <StatItem label="Lead Score" value={lead.lead_score} color="blue" />
                            <StatItem
                                label="Activities"
                                value={activities.length}
                                color="green"
                            />
                            <StatItem
                                label="Days Since Created"
                                value={Math.floor(
                                    (new Date().getTime() - new Date(lead.created_at).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )}
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            {lead.phone && (
                                <a
                                    href={`tel:${lead.phone}`}
                                    className="block w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-center"
                                >
                                    📞 Call Now
                                </a>
                            )}
                            {lead.email && (
                                <a
                                    href={`mailto:${lead.email}`}
                                    className="block w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-center"
                                >
                                    ✉️ Send Email
                                </a>
                            )}
                            {lead.phone && (
                                <a
                                    href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-center"
                                >
                                    💬 WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Modal */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Add Activity
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Activity Type
                                </label>
                                <select
                                    value={newActivity.activity_type}
                                    onChange={(e) =>
                                        setNewActivity({ ...newActivity, activity_type: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="Call">Call</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Email">Email</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Note">Note</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={newActivity.subject}
                                    onChange={(e) =>
                                        setNewActivity({ ...newActivity, subject: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Brief description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={newActivity.notes}
                                    onChange={(e) =>
                                        setNewActivity({ ...newActivity, notes: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    rows={4}
                                    placeholder="Detailed notes..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddActivity}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add Activity
                                </button>
                                <button
                                    onClick={() => setShowActivityModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: any }) {
    return (
        <div>
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-gray-900 font-medium">{value || "-"}</div>
        </div>
    );
}

function StatItem({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-600",
        green: "text-green-600",
        purple: "text-purple-600",
    };

    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-700">{label}</span>
            <span className={`font-bold text-lg ${colorClasses[color]}`}>{value}</span>
        </div>
    );
}

function getActivityIcon(type: string) {
    const icons: Record<string, string> = {
        Call: "📞",
        Meeting: "🤝",
        Email: "✉️",
        WhatsApp: "💬",
        Note: "📝",
        "Status Change": "🔄",
    };
    return icons[type] || "📌";
}
