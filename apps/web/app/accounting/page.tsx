"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Plus,
    Search,
    ChevronRight,
    ArrowRightLeft,
    Loader2,
    X,
    CreditCard,
    PieChart,
    FileText,
    ShieldCheck,
    Building2,
    History,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { PostJournalModal } from "@/components/PostJournalModal";
import { FundTransferModal } from "@/components/FundTransferModal";
import { ChequeDepositModal } from "@/components/ChequeDepositModal";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const tabs = [
    { id: "coa", name: "Chart of Accounts", icon: Search },
    { id: "journals", name: "Journal Entries", icon: ArrowRightLeft },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "transfers", name: "Fund Transfers", icon: History },
    { id: "deposits", name: "Cheque Deposits", icon: Building2 },
    { id: "budgets", name: "Budgets", icon: PieChart },
    { id: "notes", name: "Debit/Credit Notes", icon: FileText },
    { id: "bank_rec", name: "Bank Recon", icon: ShieldCheck },
];

export default function AccountingPage() {
    const [activeTab, setActiveTab] = useState("coa");
    const [data, setData] = useState([]);
    const [coa, setCoa] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchData();
        if (coa.length === 0) fetchCOA();
    }, [activeTab]);

    async function fetchCOA() {
        try {
            const result = await apiRequest("/accounting/chart-of-accounts");
            setCoa(result);
        } catch (err) { console.error("Failed to fetch COA", err); }
    }

    async function fetchData() {
        setLoading(true);
        try {
            let endpoint = "";
            switch (activeTab) {
                case "coa": endpoint = "/accounting/chart-of-accounts"; break;
                case "journals": endpoint = "/accounting/journals"; break;
                case "transfers": endpoint = "/accounting/fund-transfers"; break;
                case "deposits": endpoint = "/accounting/cheque-deposits"; break;
                case "payments": endpoint = "/accounting/payments"; break;
                case "budgets": endpoint = "/accounting/budgets"; break;
                case "notes": endpoint = "/accounting/debit-notes"; break;
            }
            if (endpoint) {
                const result = await apiRequest(endpoint);
                setData(result);
            } else {
                setData([]);
            }
        } catch (err) {
            console.error("Fetch failed:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }

    const getActionLabel = () => {
        switch (activeTab) {
            case 'transfers': return 'New Transfer';
            case 'deposits': return 'Deposit Cheques';
            case 'coa': return 'New Account';
            case 'journals': return 'Post Journal';
            default: return 'Add Record';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Accounting Core</h1>
                    <p className="text-muted-foreground mt-1">Advanced financial ledger and banking controls.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-medium whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    {getActionLabel()}
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${activeTab === tab.id
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/5"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium">Synchronizing with ledger...</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === "coa" && <COATable data={data} />}
                    {activeTab === "journals" && <JournalList data={data} />}
                    {activeTab === "transfers" && <TransferList data={data} />}
                    {activeTab === "deposits" && <DepositList data={data} />}
                    {activeTab === "payments" && <PaymentList data={data} />}
                    {activeTab === "budgets" && <BudgetList data={data} />}
                    {activeTab === "notes" && <NotesList data={data} />}
                    {activeTab === "bank_rec" && <BankReconView />}
                </div>
            )}

            {showModal && activeTab === "coa" && <AddAccountModal onClose={() => setShowModal(false)} onCreated={fetchData} />}
            {showModal && activeTab === "journals" && <PostJournalModal coa={coa} onClose={() => setShowModal(false)} onCreated={fetchData} />}
            {showModal && activeTab === "transfers" && <FundTransferModal coa={coa} onClose={() => setShowModal(false)} onCreated={fetchData} />}
            {showModal && activeTab === "deposits" && <ChequeDepositModal coa={coa} onClose={() => setShowModal(false)} onCreated={fetchData} />}
        </div>
    );
}

const gridDefaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: true,
};

function COATable({ data }: { data: any[] }) {
    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Code", field: "code", flex: 1, cellClass: "font-mono text-primary/80" },
        { headerName: "Description", field: "name", flex: 2, cellClass: "font-bold" },
        { headerName: "Alias", field: "alias", flex: 1, valueFormatter: (p: any) => p.value || "—" },
        {
            headerName: "Type", field: "type", flex: 1,
            cellRenderer: (p: any) => (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-bold uppercase tracking-wider">{p.value}</span>
            ),
        },
        {
            headerName: "Posting", field: "posting_type", flex: 0.8,
            cellRenderer: (p: any) => (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${p.value === "Balance Sheet" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                    {p.value === "Profit and Loss" ? "P&L" : "B/S"}
                </span>
            ),
        },
        {
            headerName: "Balance", field: "typical_balance", flex: 0.8,
            cellRenderer: (p: any) => (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${p.value === "Debit" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                    {p.value === "Debit" ? "Dr" : "Cr"}
                </span>
            ),
        },
        {
            headerName: "Current Bal.", field: "current_balance", flex: 1, type: "numericColumn",
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`,
            cellClass: "font-bold text-emerald-400",
        },
        {
            headerName: "Status", field: "is_inactive", flex: 0.8,
            cellRenderer: (p: any) => p.value
                ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">Inactive</span>
                : <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">Active</span>,
        },
    ], []);

    return (
        <div className="ag-theme-quartz-dark rounded-2xl overflow-hidden" style={{ height: Math.max(200, Math.min(600, 52 + data.length * 40)) }}>
            <AgGridReact rowData={data} columnDefs={columnDefs} defaultColDef={gridDefaultColDef} headerHeight={42} rowHeight={40}
                overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>Waiting for financial data... Try adding a record.</span>" />
        </div>
    );
}

function JournalList({ data }: { data: any[] }) {
    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Reference", field: "reference", flex: 1.5, cellClass: "font-bold" },
        { headerName: "Date", field: "date", flex: 1, cellClass: "font-mono" },
        {
            headerName: "Status", field: "status", flex: 0.8,
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
        { headerName: "Lines", field: "lines", flex: 0.6, valueFormatter: (p: any) => `${p.value?.length || 0}` },
    ], []);

    return (
        <div className="ag-theme-quartz-dark rounded-2xl overflow-hidden" style={{ height: Math.max(200, Math.min(600, 52 + data.length * 40)) }}>
            <AgGridReact rowData={data} columnDefs={columnDefs} defaultColDef={gridDefaultColDef} headerHeight={42} rowHeight={40}
                overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No journal entries recorded for this period.</span>" />
        </div>
    );
}

function TransferList({ data }: { data: any[] }) {
    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Reference", field: "reference", flex: 1.5, cellClass: "font-bold" },
        { headerName: "Date", field: "date", flex: 1, cellClass: "font-mono" },
        { headerName: "Notes", field: "notes", flex: 2, valueFormatter: (p: any) => p.value || "Inter-account movement" },
        {
            headerName: "Amount", field: "amount", flex: 1, type: "numericColumn",
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`, cellClass: "font-bold text-indigo-400",
        },
        {
            headerName: "Status", field: "status", flex: 0.8,
            cellRenderer: (p: any) => (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">{p.value || "Posted"}</span>
            ),
        },
    ], []);

    return (
        <div className="ag-theme-quartz-dark rounded-2xl overflow-hidden" style={{ height: Math.max(200, Math.min(600, 52 + data.length * 40)) }}>
            <AgGridReact rowData={data} columnDefs={columnDefs} defaultColDef={gridDefaultColDef} headerHeight={42} rowHeight={40}
                overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No recent fund transfers found.</span>" />
        </div>
    );
}

function PaymentList({ data }: { data: any[] }) {
    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Date", field: "date", flex: 1, cellClass: "font-mono" },
        { headerName: "Payee", field: "payee_id", flex: 1.5, valueFormatter: (p: any) => p.value ? `${p.value.substring(0, 8)}...` : "", cellClass: "font-bold" },
        {
            headerName: "Mode", field: "mode", flex: 0.8,
            cellRenderer: (p: any) => (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-bold uppercase">{p.value || "N/A"}</span>
            ),
        },
        { headerName: "Allocations", field: "allocations", flex: 1, valueFormatter: (p: any) => `${p.value?.length || 0} invoice(s)` },
        {
            headerName: "Amount", field: "amount", flex: 1, type: "numericColumn",
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`, cellClass: "font-bold text-emerald-400",
        },
    ], []);

    return (
        <div className="ag-theme-quartz-dark rounded-2xl overflow-hidden" style={{ height: Math.max(200, Math.min(600, 52 + data.length * 40)) }}>
            <AgGridReact rowData={data} columnDefs={columnDefs} defaultColDef={gridDefaultColDef} headerHeight={42} rowHeight={40}
                overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No payment records found.</span>" />
        </div>
    );
}

function BudgetList({ data }: { data: any[] }) {
    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Description", field: "description", flex: 2, valueFormatter: (p: any) => p.value || "Budget Period", cellClass: "font-bold" },
        { headerName: "Period Start", field: "period_start", flex: 1, cellClass: "font-mono" },
        { headerName: "Period End", field: "period_end", flex: 1, cellClass: "font-mono" },
        { headerName: "Lines", field: "lines", flex: 0.6, valueFormatter: (p: any) => `${p.value?.length || 0}` },
        {
            headerName: "Total Budget", field: "lines", flex: 1, type: "numericColumn", colId: "total_budget",
            valueGetter: (p: any) => p.data?.lines?.reduce((s: number, l: any) => s + (Number(l.budgeted_amount) || 0), 0) || 0,
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`, cellClass: "font-bold text-violet-400",
        },
        {
            headerName: "Actual", field: "lines", flex: 1, type: "numericColumn", colId: "total_actual",
            valueGetter: (p: any) => p.data?.lines?.reduce((s: number, l: any) => s + (Number(l.actual_amount) || 0), 0) || 0,
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`, cellClass: "font-bold text-emerald-400",
        },
    ], []);

    return (
        <div className="ag-theme-quartz-dark rounded-2xl overflow-hidden" style={{ height: Math.max(200, Math.min(600, 52 + data.length * 40)) }}>
            <AgGridReact rowData={data} columnDefs={columnDefs} defaultColDef={gridDefaultColDef} headerHeight={42} rowHeight={40}
                overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No budgets defined for this period.</span>" />
        </div>
    );
}

function NotesList({ data }: { data: any[] }) {
    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Date", field: "date", flex: 1, cellClass: "font-mono" },
        {
            headerName: "Type", field: "vendor_id", flex: 1,
            cellRenderer: (p: any) => (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${p.value ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                    {p.value ? "Debit Note" : "Credit Note"}
                </span>
            ),
        },
        { headerName: "Reason", field: "reason", flex: 1, cellClass: "font-bold" },
        {
            headerName: "Status", field: "status", flex: 0.8,
            cellRenderer: (p: any) => (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">{p.value}</span>
            ),
        },
        { headerName: "Lines", field: "lines", flex: 0.6, valueFormatter: (p: any) => `${p.value?.length || 0}` },
        {
            headerName: "Total", field: "total_amount", flex: 1, type: "numericColumn",
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`, cellClass: "font-bold text-emerald-400",
        },
    ], []);

    return (
        <div className="ag-theme-quartz-dark rounded-2xl overflow-hidden" style={{ height: Math.max(200, Math.min(600, 52 + data.length * 40)) }}>
            <AgGridReact rowData={data} columnDefs={columnDefs} defaultColDef={gridDefaultColDef} headerHeight={42} rowHeight={40}
                overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No debit or credit notes found.</span>" />
        </div>
    );
}

function DepositList({ data }: { data: any[] }) {
    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Reference", field: "reference_number", flex: 1.5, valueFormatter: (p: any) => p.value || p.data?.id?.substring(0, 8), cellClass: "font-bold" },
        { headerName: "Date", field: "date", flex: 1, valueFormatter: (p: any) => p.value || p.data?.transaction_date, cellClass: "font-mono" },
        { headerName: "Cheques", field: "lines", flex: 0.8, valueFormatter: (p: any) => `${p.value?.length || 0}` },
        {
            headerName: "Total", field: "total_amount", flex: 1, type: "numericColumn",
            valueFormatter: (p: any) => `₹${(p.value || 0).toLocaleString()}`, cellClass: "font-bold text-teal-400",
        },
        {
            headerName: "Status", field: "reconciled", flex: 0.8,
            cellRenderer: (p: any) => (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${p.value ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                    {p.value ? "Reconciled" : "Pending"}
                </span>
            ),
        },
    ], []);

    return (
        <div className="ag-theme-quartz-dark rounded-2xl overflow-hidden" style={{ height: Math.max(200, Math.min(600, 52 + data.length * 40)) }}>
            <AgGridReact rowData={data} columnDefs={columnDefs} defaultColDef={gridDefaultColDef} headerHeight={42} rowHeight={40}
                overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No cheque deposits recorded.</span>" />
        </div>
    );
}

function BankReconView() {
    const sampleData = [
        { date: '2026-01-27', desc: 'Transfer to Petty Cash', out: 15000, in_amt: 0, status: 'uncleared' },
        { date: '2026-01-26', desc: 'Cheque Deposit #4421', out: 0, in_amt: 25000, status: 'reconciled' }
    ];

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: "Status", field: "status", width: 80,
            cellRenderer: (p: any) => p.value === 'reconciled'
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <AlertCircle className="w-4 h-4 text-amber-400" />,
        },
        { headerName: "Transaction", field: "desc", flex: 2, cellClass: "font-bold" },
        { headerName: "Date", field: "date", flex: 1, cellClass: "font-mono text-muted-foreground" },
        {
            headerName: "Withdrawal", field: "out", flex: 1, type: "numericColumn",
            valueFormatter: (p: any) => p.value ? `₹${p.value.toLocaleString()}` : "—", cellClass: "font-mono text-rose-400",
        },
        {
            headerName: "Deposit", field: "in_amt", flex: 1, type: "numericColumn",
            valueFormatter: (p: any) => p.value ? `₹${p.value.toLocaleString()}` : "—", cellClass: "font-mono text-emerald-400",
        },
    ], []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl border-white/5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">System Balance</p>
                    <p className="text-2xl font-black">₹12,45,670</p>
                </div>
                <div className="glass p-6 rounded-2xl border-white/5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Uncleared Items</p>
                    <p className="text-2xl font-black text-rose-400">₹42,000</p>
                </div>
                <div className="glass p-6 rounded-2xl border-white/5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Expected Bank Balance</p>
                    <p className="text-2xl font-black text-emerald-400">₹12,03,670</p>
                </div>
            </div>

            <div className="ag-theme-quartz-dark rounded-2xl overflow-hidden" style={{ height: 172 }}>
                <AgGridReact rowData={sampleData} columnDefs={columnDefs} defaultColDef={gridDefaultColDef} headerHeight={42} rowHeight={40} />
            </div>
        </div>
    );
}

function AddAccountModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
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
