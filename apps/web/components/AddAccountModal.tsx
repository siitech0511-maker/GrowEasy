"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/api";

export function AddAccountModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
    const [activeSection, setActiveSection] = useState("general");
    const [form, setForm] = useState({
        code: "", name: "", alias: "", type: "Asset", sub_type: "", description: "",
        category: "", posting_type: "Balance Sheet", typical_balance: "Debit",
        is_inactive: false, allow_account_entry: true, opening_balance: 0,
        posting_level_sales: "Detail", posting_level_inventory: "Detail",
        posting_level_purchasing: "Detail", posting_level_payroll: "Detail",
        include_in_lookup: [] as string[],
        user_defined_1: "", user_defined_2: "", user_defined_3: "", user_defined_4: "",
    });

    function toggleLookup(series: string) {
        setForm(prev => ({
            ...prev,
            include_in_lookup: prev.include_in_lookup.includes(series)
                ? prev.include_in_lookup.filter(s => s !== series)
                : [...prev.include_in_lookup, series]
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await apiRequest("/accounting/chart-of-accounts", {
                method: "POST",
                body: JSON.stringify(form),
            });
            onCreated();
            onClose();
        } catch (err) {
            alert("Creation failed: " + err);
        }
    }

    const sections = [
        { id: "general", label: "General" },
        { id: "posting", label: "Posting Setup" },
        { id: "custom", label: "User-Defined" },
    ];

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/40 transition-colors";
    const selectCls = "w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/40 transition-colors";
    const labelCls = "text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-white/20 animate-in zoom-in-95 backdrop-blur-2xl max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Account Maintenance</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">New Account Definition</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
                            <input type="checkbox" checked={form.is_inactive} onChange={e => setForm({ ...form, is_inactive: e.target.checked })}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary" />
                            Inactive
                        </label>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex border-b border-white/10 shrink-0">
                    {sections.map(s => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)}
                            className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeSection === s.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                            {s.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-8 space-y-6 overflow-y-auto flex-1">

                        {activeSection === "general" && (
                            <>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelCls}>Account Code</label>
                                        <input required className={inputCls} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. 1000-00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Account Type</label>
                                        <select className={selectCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                            <option>Asset</option><option>Liability</option><option>Equity</option><option>Revenue</option><option>Expense</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Description</label>
                                    <input required className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Account description" />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Alias</label>
                                    <input className={inputCls} value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} placeholder="Short alias name" />
                                </div>
                                <div className="flex items-center gap-3 py-1">
                                    <input type="checkbox" checked={form.allow_account_entry} onChange={e => setForm({ ...form, allow_account_entry: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary" />
                                    <label className="text-sm font-bold">Allow Account Entry</label>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Category</label>
                                    <input className={inputCls} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Account category" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelCls}>Sub Type</label>
                                        <input className={inputCls} value={form.sub_type} onChange={e => setForm({ ...form, sub_type: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Opening Balance</label>
                                        <input type="number" step="0.01" className={inputCls} value={form.opening_balance} onChange={e => setForm({ ...form, opening_balance: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className={labelCls}>Posting Type</label>
                                        <div className="space-y-2">
                                            {["Balance Sheet", "Profit and Loss"].map(v => (
                                                <label key={v} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="posting_type" checked={form.posting_type === v}
                                                        onChange={() => setForm({ ...form, posting_type: v })}
                                                        className="w-4 h-4 accent-primary" />
                                                    <span className="text-sm font-medium">{v}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className={labelCls}>Typical Balance</label>
                                        <div className="space-y-2">
                                            {["Debit", "Credit"].map(v => (
                                                <label key={v} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="typical_balance" checked={form.typical_balance === v}
                                                        onChange={() => setForm({ ...form, typical_balance: v })}
                                                        className="w-4 h-4 accent-primary" />
                                                    <span className="text-sm font-medium">{v}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === "posting" && (
                            <>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Level of Posting from Series</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(["sales", "inventory", "purchasing", "payroll"] as const).map(series => (
                                            <div key={series} className="space-y-2">
                                                <label className={labelCls}>{series.charAt(0).toUpperCase() + series.slice(1)}{series === "inventory" ? " Control" : ""}</label>
                                                <select className={selectCls}
                                                    value={(form as any)[`posting_level_${series}`]}
                                                    onChange={e => setForm({ ...form, [`posting_level_${series}`]: e.target.value })}>
                                                    <option>Detail</option><option>Summary</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Include in Lookup</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["Sales", "Inventory Control", "Purchasing", "Payroll"].map(series => (
                                            <label key={series} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                                <input type="checkbox" checked={form.include_in_lookup.includes(series)}
                                                    onChange={() => toggleLookup(series)}
                                                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary" />
                                                <span className="text-sm font-bold">{series}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === "custom" && (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">User-Defined Fields</h3>
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="space-y-2">
                                        <label className={labelCls}>User-Defined {n}</label>
                                        <input className={inputCls}
                                            value={(form as any)[`user_defined_${n}`]}
                                            onChange={e => setForm({ ...form, [`user_defined_${n}`]: e.target.value })}
                                            placeholder={`Custom field ${n}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-8 pt-4 border-t border-white/10 flex gap-4 shrink-0">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all outline-none">Discard</button>
                        <button type="button" className="py-4 px-6 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all outline-none">Clear</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all outline-none">Save Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
