"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { X, Plus, Trash2, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export function ChequeDepositModal({ coa, onClose, onCreated }: { coa: any[], onClose: () => void, onCreated: () => void }) {
    const gridRef = useRef<AgGridReact>(null);
    const [form, setForm] = useState({
        bank_account_id: "",
        deposit_date: new Date().toISOString().split('T')[0],
        reference: "",
    });
    const [cheques, setCheques] = useState([
        { cheque_number: "", bank_name: "", amount: 0, date_on_cheque: new Date().toISOString().split('T')[0], received_from: "" }
    ]);

    const totalAmount = cheques.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Received From", field: "received_from", flex: 2, editable: true },
        { headerName: "Cheque #", field: "cheque_number", flex: 1, editable: true },
        { headerName: "Bank Name", field: "bank_name", flex: 1.5, editable: true },
        { headerName: "Date on Cheque", field: "date_on_cheque", flex: 1, editable: true },
        {
            headerName: "Amount (₹)", field: "amount", flex: 1, editable: true,
            cellEditor: "agNumberCellEditor", cellEditorParams: { min: 0, precision: 2 },
            type: "numericColumn",
            valueFormatter: (params: any) => params.value ? `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "",
        },
        {
            headerName: "", field: "actions", width: 60, sortable: false, filter: false,
            cellRenderer: (params: any) => {
                return params.api.getDisplayedRowCount() > 1 ? (
                    <button onClick={() => removeCheque(params.node.rowIndex!)} className="p-1 text-rose-400 hover:bg-rose-400/10 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                ) : null;
            },
        }
    ], []);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const updated = [...cheques];
        const field = event.colDef.field;
        const idx = event.rowIndex!;
        if (field) {
            updated[idx] = { ...updated[idx], [field]: event.newValue };
        }
        setCheques(updated);
    }, [cheques]);

    const removeCheque = useCallback((index: number) => {
        if (cheques.length <= 1) return;
        setCheques(prev => prev.filter((_, i) => i !== index));
    }, [cheques.length]);

    const addCheque = () => {
        setCheques(prev => [...prev, { cheque_number: "", bank_name: "", amount: 0, date_on_cheque: new Date().toISOString().split('T')[0], received_from: "" }]);
    };

    const defaultColDef = useMemo(() => ({
        sortable: false, filter: false, resizable: true, suppressMovable: true,
    }), []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.bank_account_id) return;
        try {
            await apiRequest("/accounting/cheque-deposits", {
                method: "POST",
                body: JSON.stringify({ ...form, cheques }),
            });
            onCreated();
            onClose();
        } catch (err) {
            alert("Deposit failed: " + err);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border-white/20 animate-in zoom-in-95 backdrop-blur-2xl">
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

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Deposit Breakdown</h3>
                            <button type="button" onClick={addCheque} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                <Plus className="w-3.5 h-3.5" /> Add Cheque
                            </button>
                        </div>

                        <div className="ag-theme-quartz-dark rounded-xl overflow-hidden" style={{ height: Math.min(300, 52 + cheques.length * 40) }}>
                            <AgGridReact
                                ref={gridRef}
                                rowData={cheques}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                onCellValueChanged={onCellValueChanged}
                                singleClickEdit={true}
                                stopEditingWhenCellsLoseFocus={true}
                                domLayout="normal"
                                headerHeight={42}
                                rowHeight={40}
                            />
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center shadow-inner">
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Deposit Value</p>
                            <p className="text-2xl font-black text-emerald-400">₹{totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-5 h-5 opacity-40" />
                            <span className="text-xs font-bold uppercase tracking-tighter">{cheques.length} Items</span>
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
