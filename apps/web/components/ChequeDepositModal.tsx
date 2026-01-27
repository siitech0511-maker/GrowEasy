"use client";

import { useState } from "react";
import { X, Plus, Trash2, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export function ChequeDepositModal({ coa, onClose, onCreated }: { coa: any[], onClose: () => void, onCreated: () => void }) {
    const [form, setForm] = useState({
        bank_account_id: "",
        deposit_date: new Date().toISOString().split('T')[0],
        reference: "",
        company_id: "test-company",
        cheques: [
            { cheque_number: "", bank_name: "", amount: 0, date_on_cheque: new Date().toISOString().split('T')[0], received_from: "" }
        ]
    });

    const totalAmount = form.cheques.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.bank_account_id) return;

        try {
            await apiRequest("/accounting/cheque-deposits", {
                method: "POST",
                body: JSON.stringify(form),
            });
            onCreated();
            onClose();
        } catch (err) {
            alert("Deposit failed: " + err);
        }
    }

    const addCheque = () => {
        setForm({ ...form, cheques: [...form.cheques, { cheque_number: "", bank_name: "", amount: 0, date_on_cheque: new Date().toISOString().split('T')[0], received_from: "" }] });
    };

    const removeCheque = (index: number) => {
        if (form.cheques.length <= 1) return;
        const newCheques = [...form.cheques];
        newCheques.splice(index, 1);
        setForm({ ...form, cheques: newCheques });
    };

    const updateCheque = (index: number, field: string, value: any) => {
        const newCheques = [...form.cheques];
        newCheques[index] = { ...newCheques[index], [field]: value };
        setForm({ ...form, cheques: newCheques });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-white/20 animate-in zoom-in-95 backdrop-blur-2xl">
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Cheque Deposit</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Multi-Cheque Bulk Entry</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Target Bank Account</label>
                            <select required className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.bank_account_id} onChange={e => setForm({ ...form, bank_account_id: e.target.value })}>
                                <option value="">Select Bank Account</option>
                                {coa.filter(a => a.type === 'Asset').map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Deposit Date</label>
                            <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.deposit_date} onChange={e => setForm({ ...form, deposit_date: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Deposit Breakdown</h3>
                            <button type="button" onClick={addCheque} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                <Plus className="w-3.5 h-3.5" /> Add Cheque
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {form.cheques.map((cheque, index) => (
                                <div key={index} className="p-4 bg-white/5 rounded-2xl border border-white/10 grid grid-cols-12 gap-4 items-end">
                                    <div className="col-span-4 space-y-1">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase">From (Entity)</label>
                                        <input required placeholder="Received From" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs outline-none" value={cheque.received_from} onChange={e => updateCheque(index, 'received_from', e.target.value)} />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Cheque #</label>
                                        <input required placeholder="No." className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs outline-none" value={cheque.cheque_number} onChange={e => updateCheque(index, 'cheque_number', e.target.value)} />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Amount</label>
                                        <input type="number" required className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs outline-none text-right font-bold" value={cheque.amount} onChange={e => updateCheque(index, 'amount', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="col-span-2 flex justify-end pb-1">
                                        <button type="button" onClick={() => removeCheque(index)} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center shadow-inner">
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Deposit Value</p>
                            <p className="text-2xl font-black text-emerald-400">₹{totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-5 h-5 opacity-40" />
                            <span className="text-xs font-bold uppercase tracking-tighter">{form.cheques.length} Items</span>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all">Cancel</button>
                        <button disabled={totalAmount <= 0} type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Record Deposit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
