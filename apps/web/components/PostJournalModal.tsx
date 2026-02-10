"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { X, Plus, Trash2, Layers, Check, AlertTriangle, FileText } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export function PostJournalModal({ coa, onClose, onCreated }: { coa: any[], onClose: () => void, onCreated: () => void }) {
    const gridRef = useRef<AgGridReact>(null);
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        reference: "",
        notes: "",
    });
    const [batchId, setBatchId] = useState("");
    const [lines, setLines] = useState([
        { account_id: "", debit: 0, credit: 0, description: "" },
        { account_id: "", debit: 0, credit: 0, description: "" },
    ]);

    const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

    const accountOptions = useMemo(() => coa.map(a => `${a.code} - ${a.name}`), [coa]);
    const accountMap = useMemo(() => {
        const map: Record<string, string> = {};
        coa.forEach(a => { map[`${a.code} - ${a.name}`] = a.id; map[a.id] = `${a.code} - ${a.name}`; });
        return map;
    }, [coa]);

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: "Account Code & Name",
            field: "account_id",
            flex: 2.5,
            editable: true,
            cellEditor: "agSelectCellEditor",
            cellEditorParams: { values: accountOptions },
            valueFormatter: (params: any) => accountMap[params.value] || params.value || "Select Account",
            cellClass: "font-mono font-medium text-emerald-400"
        },
        {
            headerName: "Debit (₹)",
            field: "debit",
            flex: 1,
            editable: true,
            cellEditor: "agNumberCellEditor",
            cellEditorParams: { min: 0, precision: 2 },
            type: "numericColumn",
            valueFormatter: (params: any) => params.value ? `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "",
        },
        {
            headerName: "Credit (₹)",
            field: "credit",
            flex: 1,
            editable: true,
            cellEditor: "agNumberCellEditor",
            cellEditorParams: { min: 0, precision: 2 },
            type: "numericColumn",
            valueFormatter: (params: any) => params.value ? `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "",
        },
        {
            headerName: "Description",
            field: "description",
            flex: 1.5,
            editable: true,
        },
        {
            headerName: "",
            field: "actions",
            width: 60,
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                return params.api.getDisplayedRowCount() > 2 ? (
                    <button onClick={() => handleRemoveLine(params.node.rowIndex!)} className="p-1 text-rose-400 hover:bg-rose-400/10 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                ) : null;
            },
        }
    ], [accountOptions, accountMap]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        const updated = [...lines];
        const field = event.colDef.field;
        const idx = event.rowIndex!;
        if (field === "account_id") {
            updated[idx] = { ...updated[idx], account_id: accountMap[event.newValue] || event.newValue };
        } else if (field) {
            updated[idx] = { ...updated[idx], [field]: event.newValue };
        }
        setLines(updated);
    }, [lines, accountMap]);

    const handleRemoveLine = useCallback((index: number) => this.setLines((prev: any[]) => prev.filter((_, i) => i !== index)), []);

    const addLine = () => {
        setLines(prev => [...prev, { account_id: "", debit: 0, credit: 0, description: "" }]);
    };

    const getRowData = useMemo(() => {
        return lines.map(line => ({
            ...line,
            account_id: accountMap[line.account_id] || line.account_id,
        }));
    }, [lines, accountMap]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Remove empty lines
        const sanitizedLines = lines.filter(l => l.account_id || l.debit > 0 || l.credit > 0).map(line => ({
            ...line,
            debit: line.debit || 0,
            credit: line.credit || 0,
        }));

        if (sanitizedLines.length === 0) {
            alert("No valid lines to post.");
            return;
        }

        if (!batchId && !isBalanced) {
            alert("Journal entry must be balanced to post directly. Save to Batch if you want to save a draft.");
            return;
        }

        try {
            await apiRequest("/accounting/journals", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    lines: sanitizedLines,
                    batch_id: batchId || null
                }),
            });
            onCreated();
            onClose();
        } catch (err) {
            alert("Posting failed: " + err);
        }
    }

    const defaultColDef = useMemo(() => ({
        sortable: false,
        filter: false,
        resizable: true,
        suppressMovable: true,
    }), []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border-white/20 animate-in zoom-in-95 backdrop-blur-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
                    <div>
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Double-Entry Journal
                        </h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Manual Ledger Transaction</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Date</label>
                                <input type="date" required className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary/40"
                                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="col-span-4 space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Reference / Voucher No.</label>
                                <input required className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary/40"
                                    value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="e.g. JV/2026/001" />
                            </div>
                            <div className="col-span-5 space-y-2">
                                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Layers className="w-3 h-3" />
                                    Batch ID (Optional - Draft Mode)
                                </label>
                                <input className="w-full bg-[#1e293b] border border-emerald-500/20 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-emerald-500/50 text-emerald-400 font-mono font-bold placeholder:text-emerald-500/20"
                                    value={batchId} onChange={e => setBatchId(e.target.value)} placeholder="e.g. BATCH-JAN-END-01" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Narration / Notes</label>
                            <textarea className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/40 min-h-[60px] resize-none"
                                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Describe the transaction..." />
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Transaction Lines</label>
                                <button type="button" onClick={addLine}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add Section
                                </button>
                            </div>
                            <div className="ag-theme-quartz-dark rounded-xl overflow-hidden border border-white/10 flex-1">
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={getRowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    onCellValueChanged={onCellValueChanged}
                                    singleClickEdit={true}
                                    stopEditingWhenCellsLoseFocus={true}
                                    domLayout="normal"
                                    headerHeight={42}
                                    rowHeight={40}
                                    suppressRowHoverHighlight={false}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 pt-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-white/5">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Debits</p>
                                <p className="text-2xl font-black text-emerald-400">₹{totalDebit.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Credits</p>
                                <p className="text-2xl font-black text-emerald-400">₹{totalCredit.toLocaleString()}</p>
                            </div>
                            {!isBalanced && (
                                <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-4 rounded-xl border border-rose-500/20">
                                    <AlertTriangle className="w-5 h-5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Unbalanced</p>
                                        <p className="text-sm font-bold">Diff: ₹{Math.abs(totalDebit - totalCredit).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">Discard</button>

                            <button type="submit"
                                className={`px-8 py-3 rounded-xl font-black shadow-xl transition-all flex items-center gap-2 ${isBalanced
                                        ? "bg-primary text-white shadow-primary/20 hover:scale-105"
                                        : batchId
                                            ? "bg-amber-500 text-white shadow-amber-500/20 hover:scale-105"
                                            : "bg-white/5 text-muted-foreground cursor-not-allowed"
                                    }`}
                                disabled={!isBalanced && !batchId}
                            >
                                {batchId ? (
                                    <>
                                        <Layers className="w-4 h-4" />
                                        Save to Batch
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Post Journal
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
