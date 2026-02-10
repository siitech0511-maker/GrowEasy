"use client";

import { useState } from "react";
import { X, ArrowRightLeft } from "lucide-react";
import { apiRequest } from "@/lib/api";

export function FundTransferModal({ coa, onClose, onCreated }: { coa: any[], onClose: () => void, onCreated: () => void }) {
    const [form, setForm] = useState({
        from_account_id: "",
        to_account_id: "",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        reference: "",
        notes: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (form.from_account_id === form.to_account_id) {
            alert("Source and Destination accounts must be different");
            return;
        }
        try {
            await apiRequest("/accounting/fund-transfers", {
                method: "POST",
                body: JSON.stringify(form),
            });
            onCreated();
            onClose();
        } catch (err) {
            alert("Transfer failed: " + err);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-white/20 animate-in zoom-in-95 backdrop-blur-2xl">
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Fund Transfer</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Inter-Account movement</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Source Account (From)</label>
                            <select required className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.from_account_id} onChange={e => setForm({ ...form, from_account_id: e.target.value })}>
                                <option value="">Select Source Account</option>
                                {coa.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-primary p-2 rounded-full shadow-lg">
                                <ArrowRightLeft className="w-4 h-4 text-white rotate-90" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Destination Account (To)</label>
                            <select required className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.to_account_id} onChange={e => setForm({ ...form, to_account_id: e.target.value })}>
                                <option value="">Select Destination Account</option>
                                {coa.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Amount</label>
                            <input type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none text-right font-bold text-indigo-400" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Transfer Date</label>
                            <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Reference / Remarks</label>
                        <input required placeholder="e.g. Cash Deposit to Bank" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all">Cancel</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all">Confirm Transfer</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
