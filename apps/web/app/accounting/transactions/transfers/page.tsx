"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, ArrowRightLeft } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import { FundTransferModal } from "@/components/FundTransferModal";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function FundTransfersPage() {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [coa, setCoa] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchData();
        fetchCOA();
    }, []);

    async function fetchCOA() {
        try {
            const result = await apiRequest("/accounting/chart-of-accounts");
            setCoa(result);
        } catch (err) { console.error("Failed to fetch COA", err); }
    }

    async function fetchData() {
        setLoading(true);
        try {
            const result = await apiRequest("/accounting/fund-transfers");
            setTransfers(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Ref #", field: "reference", flex: 1, cellClass: "font-mono text-muted-foreground" },
        { headerName: "Date", field: "date", flex: 1, cellClass: "font-mono" },
        { headerName: "Notes", field: "notes", flex: 2 },
        {
            headerName: "Amount", field: "amount", flex: 1.5, type: "numericColumn",
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`, cellClass: "font-bold text-blue-400"
        },
        // We would ideally resolve account names here
        {
            headerName: "Status", field: "status", flex: 1,
            cellRenderer: (p: any) => (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase tracking-wider">
                    {p.value}
                </span>
            )
        },
    ], []);

    const filteredData = transfers.filter(t =>
        t.reference.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gradient">Fund Transfers</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Internal Money Movement</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Search transfers..."
                            className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm w-64 outline-none focus:border-primary/40 focus:bg-white/10 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        New Transfer
                    </button>
                </div>
            </div>

            <div className="ag-theme-quartz-dark rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl" style={{ height: "calc(100vh - 200px)" }}>
                <AgGridReact
                    rowData={filteredData}
                    columnDefs={columnDefs}
                    defaultColDef={{ sortable: true, filter: true, resizable: true }}
                    headerHeight={48}
                    rowHeight={48}
                    overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No transfers found.</span>"
                />
            </div>

            {showModal && <FundTransferModal coa={coa} onClose={() => setShowModal(false)} onCreated={fetchData} />}
        </div>
    );
}
