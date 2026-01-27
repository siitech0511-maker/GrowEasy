"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Download,
    Filter,
    RefreshCcw,
    Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const complianceTabs = [
    { id: "overview", name: "GST Overview", icon: ShieldCheck },
    { id: "gstr1", name: "GSTR-1 Summary", icon: FileText },
    { id: "gstr3b", name: "GSTR-3B Filing", icon: TrendingUp },
    { id: "itc", name: "ITC Tracker", icon: ArrowDownRight },
];

export default function CompliancePage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [gstSummary, setGstSummary] = useState({
        output_tax: 0,
        input_tax: 0,
        net_payable: 0,
        last_filed: "2025-12-31",
        status: "Pending"
    });

    useEffect(() => {
        // Simulate loading for now until backend config state is seeded
        setTimeout(() => {
            setLoading(false);
            setGstSummary({
                output_tax: 145670.00,
                input_tax: 89000.00,
                net_payable: 56670.00,
                last_filed: "2025-12-31",
                status: "Action Required"
            });
        }, 800);
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">GST & Compliance</h1>
                    <p className="text-muted-foreground mt-1">Real-time tax liability tracking and statutory reporting.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all text-sm font-medium">
                        <Download className="w-4 h-4" />
                        Export Return
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        File Return
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Output Tax Liability"
                    value={`₹${gstSummary.output_tax.toLocaleString()}`}
                    trend="+12%"
                    color="rose"
                    icon={ArrowUpRight}
                />
                <StatCard
                    title="Input Tax Credit"
                    value={`₹${gstSummary.input_tax.toLocaleString()}`}
                    trend="+5%"
                    color="emerald"
                    icon={ArrowDownRight}
                />
                <StatCard
                    title="Net Tax Payable"
                    value={`₹${gstSummary.net_payable.toLocaleString()}`}
                    trend="Balanced"
                    color="indigo"
                    icon={TrendingUp}
                />
                <StatCard
                    title="Compliance Status"
                    value={gstSummary.status}
                    trend="Due in 5 days"
                    color="amber"
                    icon={Clock}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {complianceTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${activeTab === tab.id
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/5"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium">Compiling tax data for the period...</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === "overview" && <GstMainOverview summary={gstSummary} />}
                    {activeTab !== "overview" && <GenericCompliancePlaceholder title={activeTab.toUpperCase()} />}
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
    const colors: any = {
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    };

    return (
        <div className={`glass p-6 rounded-2xl border-white/5 relative overflow-hidden group`}>
            <div className="flex items-center justify-between relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${colors[color]}`}>
                    {trend}
                </span>
            </div>
            <div className="mt-4 relative z-10">
                <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">{title}</p>
                <h3 className="text-2xl font-black mt-1">{value}</h3>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-10 rounded-full ${color === 'rose' ? 'bg-rose-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-primary'}`}></div>
        </div>
    );
}

function GstMainOverview({ summary }: any) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass p-8 rounded-3xl border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight">Recent Tax Computations</h3>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                        <RefreshCcw className="w-3 h-3" /> Re-calculate
                    </button>
                </div>
                <div className="space-y-4">
                    <TaxRow label="CGST (Central Tax)" value="₹72,835.00" color="indigo" />
                    <TaxRow label="SGST (State Tax)" value="₹72,835.00" color="indigo" />
                    <TaxRow label="IGST (Integrated Tax)" value="₹0.00" color="muted" />
                    <div className="h-px bg-white/5 my-2"></div>
                    <TaxRow label="Total Output Liability" value="₹1,45,670.00" bold />
                </div>
            </div>

            <div className="glass p-8 rounded-3xl border-white/5 space-y-6">
                <h3 className="text-xl font-bold tracking-tight">ITC Statistics</h3>
                <div className="space-y-4">
                    <TaxRow label="Eligible Input Tax" value="₹89,000.00" color="emerald" />
                    <TaxRow label="Ineligible ITC" value="₹4,200.00" color="rose" />
                    <TaxRow label="Reversals" value="₹0.00" color="muted" />
                    <div className="h-px bg-white/5 my-2"></div>
                    <TaxRow label="Available for Offset" value="₹89,000.00" bold />
                </div>
            </div>

            <div className="lg:col-span-2 glass rounded-3xl overflow-hidden border-white/5">
                <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold">GST Returns History</h3>
                    <Filter className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </div>
                <table className="w-full text-left">
                    <tbody className="divide-y divide-white/5">
                        {[
                            { period: 'Dec 2025', return: 'GSTR-3B', date: '21 Jan 2026', status: 'Filed', amount: '₹42,300' },
                            { period: 'Dec 2025', return: 'GSTR-1', date: '11 Jan 2026', status: 'Filed', amount: 'N/A' },
                            { period: 'Nov 2025', return: 'GSTR-3B', date: '20 Dec 2025', status: 'Filed', amount: '₹38,900' }
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold">{row.period}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{row.return}</p>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono">{row.date}</td>
                                <td className="px-6 py-4">
                                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">{row.status}</span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-right">{row.amount}</td>
                                <td className="px-6 py-4 text-right">
                                    <Download className="w-4 h-4 text-muted-foreground hover:text-white cursor-pointer inline-block" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TaxRow({ label, value, color, bold }: any) {
    return (
        <div className="flex items-center justify-between">
            <span className={`text-sm ${bold ? 'font-bold' : 'text-muted-foreground font-medium'}`}>{label}</span>
            <span className={`text-sm font-mono ${bold ? 'font-black text-white' : color === 'rose' ? 'text-rose-400' : color === 'emerald' ? 'text-emerald-400' : color === 'indigo' ? 'text-indigo-400' : 'text-foreground'}`}>
                {value}
            </span>
        </div>
    );
}

function GenericCompliancePlaceholder({ title }: { title: string }) {
    return (
        <div className="glass p-20 rounded-3xl border-dashed border-2 border-white/5 text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <AlertCircle className="w-10 h-10 text-primary opacity-50" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">{title} Analysis</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">This diagnostic tool is compiling statutory data for the active filing period. Please wait while the ledger syncs.</p>
        </div>
    );
}
