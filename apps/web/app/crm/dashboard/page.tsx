"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
    BarChart3,
    TrendingUp,
    Target,
    Users,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
} from "lucide-react";

export default function CRMDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const result = await apiRequest("/crm/analytics");
            setStats(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gradient">CRM Insights</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Real-time Performance & Sales Analytics</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">
                        Refresh Data
                    </button>
                    <div className="h-10 w-[1px] bg-white/10 mx-2" />
                    <button className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Actual Revenue"
                    value={`₹${stats?.achievement.actual.toLocaleString()}`}
                    subtitle={`${stats?.achievement.percent}% of Target`}
                    icon={<Target className="w-5 h-5 text-emerald-400" />}
                    trend="+12.5%"
                    isUp={true}
                />
                <KPICard
                    title="Conversion Rate"
                    value={`${stats?.funnel.conversion_rate}%`}
                    subtitle="Lead to Customer"
                    icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
                    trend="+2.1%"
                    isUp={true}
                />
                <KPICard
                    title="Total Leads"
                    value={stats?.funnel.leads}
                    subtitle="Acquisition this period"
                    icon={<Users className="w-5 h-5 text-purple-400" />}
                    trend="-5.4%"
                    isUp={false}
                />
                <KPICard
                    title="Win Rate"
                    value={`${stats?.velocity.win_rate}%`}
                    subtitle="Opportunity Close rate"
                    icon={<BarChart3 className="w-5 h-5 text-amber-400" />}
                    trend="+0.8%"
                    isUp={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Achievement Gauge */}
                <div className="lg:col-span-1 glass border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target className="w-32 h-32" />
                    </div>
                    <h3 className="text-sm font-bold text-muted-foreground mb-8 self-start uppercase tracking-widest">Target Achievement</h3>
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                                className="text-primary transition-all duration-1000 ease-out"
                                strokeDasharray={552.9}
                                strokeDashoffset={552.9 - (552.9 * (stats?.achievement.percent || 0)) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white">{stats?.achievement.percent}%</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Achieved</span>
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-8 w-full">
                        <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Target</span>
                            <p className="text-lg font-black text-white">₹{(stats?.achievement.target / 100000).toFixed(1)}L</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Remaining</span>
                            <p className="text-lg font-black text-rose-400">₹{((stats?.achievement.target - stats?.achievement.actual) / 100000).toFixed(1)}L</p>
                        </div>
                    </div>
                </div>

                {/* Lead Source ROI */}
                <div className="lg:col-span-2 glass border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Lead Source Distribution</h3>
                            <p className="text-xs text-muted-foreground/60 font-medium">ROI tracking by acquisition channel</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-6">
                        {stats?.source_roi.map((item: any, i: number) => {
                            const percentage = (item.count / stats.funnel.leads * 100).toFixed(1);
                            return (
                                <div key={item.source} className="space-y-2 group">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-white/80 group-hover:text-primary transition-colors">{item.source}</span>
                                        <span className="text-[10px] font-black text-muted-foreground">{item.count} Leads ({percentage}%)</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000 delay-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                {/* Win Loss Summary */}
                <div className="glass border border-white/10 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-muted-foreground mb-8 uppercase tracking-widest">Win / Loss Analysis</h3>
                    <div className="flex items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground">Won Deals</p>
                                    <p className="text-xl font-black text-white">{stats?.win_loss.won}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground">Lost Deals</p>
                                    <p className="text-xl font-black text-white">{stats?.win_loss.lost}</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-32 h-32 relative">
                            {/* Simple SVG Donut Chart */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-rose-500" />
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="transparent"
                                    className="text-primary transition-all duration-1000 ease-out"
                                    strokeDasharray={351.8}
                                    strokeDashoffset={351.8 - (351.8 * (stats?.velocity.win_rate || 0)) / 100}
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Sales Suggestions Area */}
                <div className="glass border border-white/10 rounded-3xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
                    <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> AI Insights & Suggestions
                    </h3>
                    <div className="space-y-4">
                        <SuggestionItem
                            text="Your conversion rate is 15% higher from Referral sources this month."
                            type="positive"
                        />
                        <SuggestionItem
                            text="3 high-value deals in 'Negotiation' have had no activity for 72 hours."
                            type="warning"
                        />
                        <SuggestionItem
                            text="Average deal size has increased by 8% following the new pricing update."
                            type="positive"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, subtitle, icon, trend, isUp }: any) {
    return (
        <div className="glass border border-white/10 rounded-2xl p-4 group hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded border ${isUp ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }`}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-2xl font-black text-white">{value}</h4>
                </div>
                <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">{subtitle}</p>
            </div>
        </div>
    );
}

function SuggestionItem({ text, type }: any) {
    const colors = type === 'positive' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-100' : 'border-amber-500/20 bg-amber-500/5 text-amber-100';
    return (
        <div className={`p-3 rounded-xl border text-xs font-medium ${colors}`}>
            {text}
        </div>
    );
}
