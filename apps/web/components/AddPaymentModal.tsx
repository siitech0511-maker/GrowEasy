"use client";

import { useState, useMemo } from "react";
import { X, Plus, Trash2, CreditCard, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/api";

export function AddPaymentModal({ coa, onClose, onCreated }: { coa: any[], onClose: () => void, onCreated: () => void }) {
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        payee_id: "", // TODO: Should be a contact/vendor lookup
        account_id: "", // Bank/Cash account
        mode: "NEFT",
        reference: "",
        notes: "",
    });

    // For now we just implement direct payment (no invoice allocation yet for simplicity in this task scope, 
    // unless user requested full feature. User just said "Payment form not showing". 
    // I'll stick to a simple direct expense/payment structure for now which creates a PaymentHeader).
    // Actually, looking at the schema/backend, PaymentHeader has allocations. 
    // But let's see accounting service. create_payment takes PaymentHeaderCreate which has allocations. 
    // If I want to make a simple payment (e.g. Expense), I might need to support "Lines" or "Allocations". 
    // The backend `create_payment` iterates allocations. 
    // Let's implement a simple "Direct Payment" where we can allocate to an expense account or invoice.
    // For simplicity, I'll add a section for "Allocations" which can be just expense accounts for now if no invoice system is fully active.
    // Wait, the backend implementation of `create_payment` uses `PaymentDetail` which links to `invoice_id`.
    // If there are no invoices, this might be tricky.
    // Let's check `PaymentDetail` model in `db_models/accounting.py`.
    // It has `invoice_id` (ForeignKey) and `amount_allocated`.
    // If `invoice_id` is nullable, we can use it for direct expenses?
    // Let's assume for now this is for paying Invoices. 
    // BUT, the user might want to just "Pay Expense". 
    // If the modal is just "Payment", usually it means paying a vendor. 
    // Given the context is "Accounting", it might be generic.
    // Let's make it simple: Header + Allocations (Invoice ID input).

    const [allocations, setAllocations] = useState([
        { invoice_id: "", amount_allocated: 0, notes: "" }
    ]);

    const totalAmount = allocations.reduce((sum, a) => sum + (Number(a.amount_allocated) || 0), 0);

    // Filter for Bank/Cash accounts
    const paymentAccounts = useMemo(() =>
        coa.filter(c => ["Asset"].includes(c.type) && (c.sub_type?.toLowerCase().includes("bank") || c.sub_type?.toLowerCase().includes("cash") || c.name.toLowerCase().includes("bank") || c.name.toLowerCase().includes("cash"))),
        [coa]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await apiRequest("/accounting/payments", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    amount: totalAmount,
                    allocations: allocations.filter(a => a.amount_allocated > 0)
                }),
            });
            onCreated();
            onClose();
        } catch (err) {
            alert("Payment failed: " + err);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-white/20 animate-in zoom-in-95 backdrop-blur-2xl max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-primary" />
                            Outgoing Payment
                        </h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Vendor Payment / Expense</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-8 space-y-6 overflow-y-auto flex-1">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Date</label>
                                <input type="date" required className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/40"
                                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Payment Mode</label>
                                <select className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/40"
                                    value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                                    <option>NEFT</option><option>RTGS</option><option>IMPS</option><option>Cheque</option><option>Cash</option><option>UPI</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Paid From (Bank/Cash)</label>
                            <select required className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/40"
                                value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })}>
                                <option value="">Select Account...</option>
                                {paymentAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Payee / Vendor</label>
                            <input required className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/40"
                                value={form.payee_id} onChange={e => setForm({ ...form, payee_id: e.target.value })} placeholder="Vendor Name or ID" />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Allocations / Invoices</h3>
                                <button type="button" onClick={() => setAllocations([...allocations, { invoice_id: "", amount_allocated: 0, notes: "" }])}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add Allocation
                                </button>
                            </div>

                            {allocations.map((alloc, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <input className="flex-1 bg-[#1e293b] border border-white/10 rounded-xl py-2 px-3 text-sm outline-none focus:border-primary/40"
                                        placeholder="Invoice # / Ref" value={alloc.invoice_id}
                                        onChange={e => {
                                            const newAlloc = [...allocations]; newAlloc[idx].invoice_id = e.target.value; setAllocations(newAlloc);
                                        }} />
                                    <input type="number" className="w-32 bg-[#1e293b] border border-white/10 rounded-xl py-2 px-3 text-sm outline-none focus:border-primary/40 text-right font-mono"
                                        placeholder="0.00" value={alloc.amount_allocated}
                                        onChange={e => {
                                            const newAlloc = [...allocations]; newAlloc[idx].amount_allocated = parseFloat(e.target.value) || 0; setAllocations(newAlloc);
                                        }} />
                                    <button type="button" onClick={() => setAllocations(allocations.filter((_, i) => i !== idx))}
                                        className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors mt-0.5">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 pt-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-white/5">
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Payment</p>
                            <p className="text-3xl font-black text-emerald-400">₹{totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-4 rounded-2xl font-bold hover:bg-white/5 transition-colors">Cancel</button>
                            <button type="submit" disabled={totalAmount <= 0} className="px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
