"use client";

import { useState, useEffect } from "react";
import { Plus, Layers, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { PostJournalModal } from "@/components/PostJournalModal";

export default function BatchPostingPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [coa, setCoa] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchBatches();
        fetchCOA();
    }, []);

    async function fetchCOA() {
        try {
            const result = await apiRequest("/accounting/chart-of-accounts");
            setCoa(result);
        } catch (err) { console.error("Failed to fetch COA", err); }
    }

    async function fetchBatches() {
        setLoading(true);
        try {
            const result = await apiRequest("/accounting/batches");
            setBatches(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handlePostBatch(batchId: string) {
        if (!confirm(`Are you sure you want to post all transactions in batch "${batchId}"? This cannot be undone.`)) return;

        setProcessing(batchId);
        try {
            await apiRequest(`/accounting/batches/${batchId}/post`, { method: "POST" });
            fetchBatches(); // Refresh list
        } catch (err) {
            alert("Failed to post batch: " + err);
        } finally {
            setProcessing(null);
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gradient">Batch Posting</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Manage and commit draft transaction batches.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 font-bold whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Create New Batch
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium">Loading batches...</p>
                </div>
            ) : batches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-white/10 rounded-3xl bg-white/5">
                    <Layers className="w-12 h-12 text-muted-foreground/30" />
                    <div className="text-center">
                        <p className="text-lg font-bold text-muted-foreground">No Pending Batches</p>
                        <p className="text-xs text-muted-foreground/60 max-w-xs mt-1">Create a new journal entry and assign a Batch ID to see it here.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map((batch) => (
                        <div key={batch.id} className="glass p-6 rounded-3xl border border-white/10 hover:border-amber-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-2">
                                    <Layers className="w-3 h-3 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{batch.id}</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse" />
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground font-medium">Entries</span>
                                    <span className="text-xl font-bold">{batch.count}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground font-medium">Total Value</span>
                                    <span className="text-xl font-bold text-emerald-400">₹{Number(batch.total).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handlePostBatch(batch.id)}
                                disabled={processing === batch.id}
                                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white font-bold transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                {processing === batch.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover/btn:text-white transition-colors" />
                                        Post Batch
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <PostJournalModal coa={coa} onClose={() => setShowModal(false)} onCreated={fetchBatches} />}
        </div>
    );
}
