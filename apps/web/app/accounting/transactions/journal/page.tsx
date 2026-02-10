"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { PostJournalModal } from "@/components/PostJournalModal";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function JournalPage() {
    const [journals, setJournals] = useState<any[]>([]);
    const [coa, setCoa] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

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
            const result = await apiRequest("/accounting/journals");
            setJournals(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Reference", field: "reference", flex: 1.5, cellClass: "font-bold text-primary" },
        { headerName: "Date", field: "date", flex: 1, cellClass: "font-mono" },
        {
            headerName: "Status", field: "status", flex: 1,
            cellRenderer: (p: any) => (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${p.value === "Posted" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                    {p.value}
                </span>
            ),
        },
        { headerName: "Notes", field: "notes", flex: 2, valueFormatter: (p: any) => p.value || "—" },
        {
            headerName: "Total Debit", field: "total_debit", flex: 1, type: "numericColumn",
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`, cellClass: "font-bold text-emerald-400",
        },
        {
            headerName: "Total Credit", field: "total_credit", flex: 1, type: "numericColumn",
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`, cellClass: "font-bold text-emerald-400",
        },
    ], []);

    const filteredData = journals.filter(j =>
        j.reference.toLowerCase().includes(search.toLowerCase()) ||
        (j.notes && j.notes.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gradient">Journal Entries</h1>
                    <p className="text-muted-foreground mt-1 font-medium">General Ledger Transactions</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Search journals..."
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
                        New Entry
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
                    overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No journal entries found.</span>"
                />
            </div>

            {showModal && <PostJournalModal coa={coa} onClose={() => setShowModal(false)} onCreated={fetchData} />}
        </div>
    );
}
