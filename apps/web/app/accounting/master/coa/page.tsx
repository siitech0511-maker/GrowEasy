"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AddAccountModal } from "@/components/AddAccountModal";

export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAccounts();
    }, []);

    async function fetchAccounts() {
        setLoading(true);
        try {
            const data = await apiRequest("/accounting/chart-of-accounts");
            setAccounts(data);
        } catch (err) {
            console.error("Failed to fetch accounts", err);
        } finally {
            setLoading(false);
        }
    }

    const filteredAccounts = accounts.filter(acc =>
        acc.name.toLowerCase().includes(search.toLowerCase()) ||
        acc.code.toLowerCase().includes(search.toLowerCase()) ||
        acc.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gradient">Chart of Accounts</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Master Data Management</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Search accounts..."
                            className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm w-64 outline-none focus:border-primary/40 focus:bg-white/10 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        New Account
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAccounts.map((acc) => (
                        <div key={acc.id} className="group relative glass p-6 rounded-3xl border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:border-primary/20 group-hover:text-primary transition-colors">
                                    {acc.code}
                                </div>
                                <div className={`w-2 h-2 rounded-full ${!acc.is_inactive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-rose-500"}`} />
                            </div>

                            <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-2" title={acc.name}>
                                {acc.name}
                            </h3>

                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                    {acc.type}
                                </span>
                                {acc.sub_type && (
                                    <span className="text-xs font-medium text-muted-foreground/70">
                                        • {acc.sub_type}
                                    </span>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Current Balance</p>
                                <p className={`text-2xl font-black tracking-tight ${(acc.current_balance || 0) < 0 ? "text-rose-400" : "text-emerald-400"
                                    }`}>
                                    ₹{Math.abs(acc.current_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    <span className="text-xs text-muted-foreground ml-1 font-bold">
                                        {(acc.current_balance || 0) < 0 ? "Dr" : "Cr"}
                                    </span>
                                </p>
                            </div>
                            <div className="h-16" /> {/* Spacer for absolute footer */}
                        </div>
                    ))}
                </div>
            )}

            {showModal && <AddAccountModal onClose={() => setShowModal(false)} onCreated={fetchAccounts} />}
        </div>
    );
}
