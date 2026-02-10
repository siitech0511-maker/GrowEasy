"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
    Building2,
    FileText,
    ShoppingBag,
    Receipt,
    CreditCard,
    LifeBuoy,
    LayoutDashboard,
    ExternalLink,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function Customer360Page() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        setLoading(true);
        try {
            const result = await apiRequest(`/crm/accounts/${id}/360`);
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Customer 360...</div>;
    if (!data) return <div className="p-8 text-center text-rose-400">Customer not found.</div>;

    const { account, opportunities, quotations, orders, invoices, payments, kpis } = data;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Link href="/crm/accounts" className="hover:text-primary transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Customers
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white">{account.account_name}</span>
            </div>

            {/* Profile Header */}
            <div className="glass border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row justify-between gap-8 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                        <Building2 className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">{account.account_name}</h1>
                        <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                            {account.industry || "General Industry"} • <span className="opacity-60">{account.gst_number || "No GST"}</span>
                        </p>
                        <div className="flex gap-2 mt-4">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter">Verified Account</span>
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase tracking-tighter">Priority Client</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 px-8 border-l border-white/5">
                    <div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Total Purchased</span>
                        <p className="text-2xl font-black text-white">₹{kpis.total_purchased.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Outstanding</span>
                        <p className="text-2xl font-black text-rose-400">₹{kpis.outstanding.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                <TabButton id="overview" label="Overview" icon={<LayoutDashboard className="w-4 h-4" />} active={activeTab} onClick={setActiveTab} />
                <TabButton id="sales" label="Sales (Quotes/Orders)" icon={<ShoppingBag className="w-4 h-4" />} active={activeTab} onClick={setActiveTab} />
                <TabButton id="finance" label="Finance (Invoices)" icon={<Receipt className="w-4 h-4" />} active={activeTab} onClick={setActiveTab} />
                <TabButton id="tickets" label="Helpdesk" icon={<LifeBuoy className="w-4 h-4" />} active={activeTab} onClick={setActiveTab} />
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                        <SectionCard title="Active Opportunities" count={opportunities.length}>
                            <div className="space-y-3">
                                {opportunities.map((o: any) => (
                                    <div key={o.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:border-primary/30 transition-all">
                                        <div>
                                            <p className="text-xs font-bold text-white">{o.opportunity_name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">{o.stage}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-emerald-400">₹{o.deal_value.toLocaleString()}</p>
                                            <p className="text-[9px] text-muted-foreground">{o.probability}% Confidence</p>
                                        </div>
                                    </div>
                                ))}
                                {opportunities.length === 0 && <p className="text-xs text-muted-foreground italic">No active opportunities.</p>}
                            </div>
                        </SectionCard>

                        <SectionCard title="Primary Contacts" count={account.contacts?.length || 0}>
                            <div className="space-y-4">
                                {account.contacts?.map((c: any) => (
                                    <div key={c.id} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary border border-primary/20">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{c.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{c.designation || "No Title"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                )}

                {activeTab === "sales" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                        <SectionCard title="Sales Quotations" count={quotations.length}>
                            <GridTable headers={["Date", "Reference", "Amount", "Status"]}>
                                {quotations.map((q: any) => (
                                    <tr key={q.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-[11px] text-white/70">{new Date(q.date).toLocaleDateString()}</td>
                                        <td className="p-3 text-[11px] font-mono text-primary">{q.id.split('-')[0]}...</td>
                                        <td className="p-3 text-[11px] font-bold">₹{q.total_amount.toLocaleString()}</td>
                                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase border border-blue-500/20">{q.status}</span></td>
                                    </tr>
                                ))}
                            </GridTable>
                        </SectionCard>

                        <SectionCard title="Sales Orders" count={orders.length}>
                            <GridTable headers={["Date", "Order ID", "Total", "Status"]}>
                                {orders.map((o: any) => (
                                    <tr key={o.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-[11px] text-white/70">{new Date(o.date).toLocaleDateString()}</td>
                                        <td className="p-3 text-[11px] font-mono text-primary flex items-center gap-1">
                                            {o.id.split('-')[0]}... <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                                        </td>
                                        <td className="p-3 text-[11px] font-bold">₹{o.total.toLocaleString()}</td>
                                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase border border-emerald-500/20">{o.status}</span></td>
                                    </tr>
                                ))}
                            </GridTable>
                        </SectionCard>
                    </div>
                )}

                {activeTab === "finance" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                        <SectionCard title="Recent Invoices" count={invoices.length}>
                            <GridTable headers={["Invoice #", "Due Date", "Amount", "Status"]}>
                                {invoices.map((i: any) => (
                                    <tr key={i.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-[11px] font-bold text-white uppercase">{i.id.split('-')[0]}</td>
                                        <td className="p-3 text-[11px] text-white/70">{new Date(i.due_date).toLocaleDateString()}</td>
                                        <td className="p-3 text-[11px] font-black">₹{i.total.toLocaleString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${i.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}>
                                                {i.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </GridTable>
                        </SectionCard>
                    </div>
                )}

                {activeTab === "tickets" && (
                    <div className="flex flex-col items-center justify-center p-20 glass border border-dashed border-white/10 rounded-3xl opacity-50">
                        <LifeBuoy className="w-12 h-12 mb-4 text-muted-foreground" />
                        <p className="text-sm font-bold text-white">No active tickets</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center max-w-[200px]">Helpdesk integration is active but no support records were found for this account.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ id, label, icon, active, onClick }: any) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function SectionCard({ title, count, children }: any) {
    return (
        <div className="glass border border-white/10 rounded-3xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">{count}</span>
            </div>
            {children}
        </div>
    );
}

function GridTable({ headers, children }: any) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr>
                        {headers.map((h: string) => (
                            <th key={h} className="p-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}
