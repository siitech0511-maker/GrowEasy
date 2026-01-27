"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export function PostJournalModal({ coa, onClose, onCreated }: { coa: any[], onClose: () => void, onCreated: () => void }) {
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        reference: "",
        notes: "",
        company_id: "test-company",
        lines: [
            { account_id: "", debit: 0, credit: 0, description: "" },
            { account_id: "", debit: 0, credit: 0, description: "" },
        ]
    });

    const totalDebit = form.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = form.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isBalanced) return;

        try {
            await apiRequest("/accounting/journals", {
                method: "POST",
                body: JSON.stringify(form),
            });
            onCreated();
            onClose();
        } catch (err) {
            alert("Failed to post journal: " + err);
        }
    }

    const addLine = () => {
        setForm({ ...form, lines: [...form.lines, { account_id: "", debit: 0, credit: 0, description: "" }] });
    };

    const removeLine = (index: number) => {
        if (form.lines.length <= 2) return;
        const newLines = [...form.lines];
        newLines.splice(index, 1);
        setForm({ ...form, lines: newLines });
    };

    const updateLine = (index: number, field: string, value: any) => {
        const newLines = [...form.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setForm({ ...form, lines: newLines });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border-white/20 animate-in zoom-in-95 backdrop-blur-2xl">
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Double-Entry Journal</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Manual Ledger Transaction</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Date</label>
                            <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Reference / Voucher No.</label>
                            <input required placeholder="e.g. JV/2026/001" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Transaction Lines</h3>
                            <button type="button" onClick={addLine} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                <Plus className="w-3.5 h-3.5" /> Add Line
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                            {form.lines.map((line, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-4">
                                        <select required className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-2.5 px-3 text-xs outline-none" value={line.account_id} onChange={e => updateLine(index, 'account_id', e.target.value)}>
                                            <option value="">Select Account</option>
                                            {coa.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-3">
                                        <input placeholder="Debit" type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs outline-none text-right" value={line.debit} onChange={e => updateLine(index, 'debit', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="col-span-3">
                                        <input placeholder="Credit" type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs outline-none text-right" value={line.credit} onChange={e => updateLine(index, 'credit', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <button type="button" onClick={() => removeLine(index)} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center shadow-inner">
                        <div className="flex gap-12">
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Debits</p>
                                <p className="text-xl font-black text-emerald-400">₹{totalDebit.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Credits</p>
                                <p className="text-xl font-black text-emerald-400">₹{totalCredit.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {!isBalanced && totalDebit > 0 && <p className="text-xs font-bold text-rose-400 animate-pulse mb-1">Out of balance by ₹{Math.abs(totalDebit - totalCredit).toLocaleString()}</p>}
                            {isBalanced && <p className="text-xs font-bold text-emerald-500 mb-1 flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Entry Balanced</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all outline-none">Discard Changes</button>
                        <button disabled={!isBalanced} type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed outline-none">Post Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
