"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Filter,
    ChevronRight,
    ArrowRightLeft,
    FileSpreadsheet,
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
                case "deposits": endpoint = "/accounting/cheque-deposits"; break; // Placeholder or separate endpoint
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
                    {activeTab === "deposits" && <GenericPlaceholder title="Cheque Deposits" description="Manage multi-cheque deposits into bank accounts." />}
                    {activeTab === "payments" && <GenericPlaceholder title="Payment Records" description="Manage incoming and outgoing payment allocations." />}
                    {activeTab === "budgets" && <GenericPlaceholder title="Financial Budgets" description="Track departmental budgets vs actual spending." />}
                    {activeTab === "notes" && <GenericPlaceholder title="Debit & Credit Notes" description="Handle sales returns and vendor adjustments." />}
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

function COATable({ data }: { data: any[] }) {
    return (
        <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Code</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Balance</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic text-sm">Waiting for financial data... Try adding a record.</td></tr>
                    ) : data.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 text-sm font-mono text-primary/80">{item.code}</td>
                            <td className="px-6 py-4 text-sm font-bold">{item.name}</td>
                            <td className="px-6 py-4">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-bold uppercase tracking-wider">{item.type}</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-right text-emerald-400">₹{item.opening_balance?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-2 hover:bg-primary/20 rounded-lg transition-all text-muted-foreground hover:text-primary">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function JournalList({ data }: { data: any[] }) {
    return (
        <div className="grid grid-cols-1 gap-4">
            {data.length === 0 ? (
                <div className="glass p-12 text-center text-muted-foreground rounded-2xl border-dashed border-2 border-white/5">No journal entries recorded for this period.</div>
            ) : data.map((item) => (
                <div key={item.id} className="glass p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer group border-white/5">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                            <ArrowRightLeft className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold">{item.reference}</h3>
                                <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tighter">POSTED</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Entry #{item.id.substring(0, 6).toUpperCase()} • {item.date}</p>
                        </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Total Value</p>
                            <p className="text-lg font-bold text-gradient">₹{item.total_debit?.toLocaleString()}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TransferList({ data }: { data: any[] }) {
    return (
        <div className="grid grid-cols-1 gap-4">
            {data.length === 0 ? (
                <div className="glass p-12 text-center text-muted-foreground rounded-2xl border-dashed border-2 border-white/5">No recent fund transfers found.</div>
            ) : data.map((item) => (
                <div key={item.id} className="glass p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-all border-white/5">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <History className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold">Transfer: {item.reference}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{item.date} • {item.notes || 'Inter-account movement'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Amount Moved</p>
                        <p className="text-lg font-bold text-indigo-400">₹{item.amount?.toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function BankReconView() {
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

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Transaction Details</th>
                            <th className="px-6 py-4 text-right">Withdrawal</th>
                            <th className="px-6 py-4 text-right">Deposit</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {[
                            { date: '2026-01-27', desc: 'Transfer to Petty Cash', out: '15000', in: '-', status: 'uncleared' },
                            { date: '2026-01-26', desc: 'Cheque Deposit #4421', out: '-', in: '25000', status: 'reconciled' }
                        ].map((item, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    {item.status === 'reconciled'
                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        : <AlertCircle className="w-4 h-4 text-amber-400" />
                                    }
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold">{item.desc}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{item.date}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-mono text-right text-rose-400">{item.out}</td>
                                <td className="px-6 py-4 text-sm font-mono text-right text-emerald-400">{item.in}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[10px] font-black text-primary uppercase hover:underline">Reconcile</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function GenericPlaceholder({ title, description }: { title: string, description: string }) {
    return (
        <div className="glass p-12 rounded-2xl text-center space-y-4 border-white/5">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpenIcon className="w-8 h-8 text-primary opacity-50" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm">{description}</p>
            <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all mt-4">
                Service Active - Ready for Data
            </button>
        </div>
    );
}

function AddAccountModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
    const [form, setForm] = useState({
        code: "", name: "", type: "Asset", sub_type: "", description: "", opening_balance: 0, company_id: "test-company"
    });

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-white/20 animate-in zoom-in-95 backdrop-blur-2xl">
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Standard Ledger</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">New Account Definition</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Code</label>
                            <input required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Type</label>
                            <select className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option>Asset</option><option>Liability</option><option>Equity</option><option>Revenue</option><option>Expense</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Legal Name</label>
                        <input required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Sub Type</label>
                            <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.sub_type} onChange={e => setForm({ ...form, sub_type: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Opening Balance</label>
                            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" value={form.opening_balance} onChange={e => setForm({ ...form, opening_balance: parseFloat(e.target.value) })} />
                        </div>
                    </div>
                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all outline-none">Discard</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all outline-none">Initialize Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function BookOpenIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
    );
}
