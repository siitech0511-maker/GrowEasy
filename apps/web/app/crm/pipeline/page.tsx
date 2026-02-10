"use client";

import { useState, useEffect } from "react";
import { Plus, TrendingUp, DollarSign, Briefcase, Clock, AlertTriangle, CheckCircle2, Target } from "lucide-react";
import { apiRequest } from "@/lib/api";

const STAGES = ["Prospect", "Proposal", "Negotiation", "Won", "Lost"];

const STAGE_COLORS: any = {
    "Prospect": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Proposal": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Negotiation": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "Won": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Lost": "bg-red-500/10 text-red-400 border-red-500/20",
};

const PRIORITY_COLORS: any = {
    "High": "text-red-400 bg-red-400/10 border-red-400/20",
    "Medium": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    "Low": "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

function getDaysSince(dateString: string) {
    if (!dateString) return 0;
    const diff = new Date().getTime() - new Date(dateString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function PipelinePage() {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        total_value: 0,
        weighted_forecast: 0,
        open_deals_count: 0,
        win_rate: 0,
        avg_deal_size: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [opps, statsData] = await Promise.all([
                apiRequest("/crm/opportunities"),
                apiRequest("/crm/opportunities/stats")
            ]);
            setOpportunities(opps);
            setStats(statsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStageChange(oppId: number, newStage: string) {
        setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, stage: newStage } : o));
        try {
            await apiRequest(`/crm/opportunities/${oppId}/stage`, {
                method: "PUT",
                body: JSON.stringify({ stage: newStage })
            });
            const newStats = await apiRequest("/crm/opportunities/stats");
            setStats(newStats);
        } catch (err) {
            console.error("Failed to update stage", err);
            fetchData();
        }
    }

    const board = STAGES.reduce((acc: any, stage) => {
        acc[stage] = opportunities.filter(o => o.stage === stage);
        return acc;
    }, {});

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gradient">Sales Pipeline</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Production-Grade Sales Forecast & Tracking</p>
                    </div>
                </div>

                {/* KPI Header Expansion */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-emerald-400 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Value</span>
                        </div>
                        <h3 className="text-xl font-black text-white">₹{stats.total_value.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Forecast</span>
                        </div>
                        <h3 className="text-xl font-black text-white">₹{Math.round(stats.weighted_forecast).toLocaleString()}</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Open Deals</span>
                        </div>
                        <h3 className="text-xl font-black text-white">{stats.open_deals_count}</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-orange-400 mb-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Win Rate</span>
                        </div>
                        <h3 className="text-xl font-black text-white">{stats.win_rate}%</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-pink-400 mb-1">
                            <Target className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Avg Size</span>
                        </div>
                        <h3 className="text-xl font-black text-white">₹{Math.round(stats.avg_deal_size).toLocaleString()}</h3>
                    </div>
                </div>

                {/* Funnel Visualization */}
                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                        {STAGES.map((s) => {
                            const val = (board[s] || []).reduce((sum: number, o: any) => sum + (o.deal_value || 0), 0);
                            const percent = stats.total_value > 0 ? (val / stats.total_value) * 100 : 0;
                            return (
                                <div
                                    key={s}
                                    className={`h-full transition-all duration-1000 ${STAGE_COLORS[s].split(' ')[0]}`}
                                    style={{ width: `${percent}%` }}
                                    title={`${s}: ₹${val.toLocaleString()} (${Math.round(percent)}%)`}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4 pt-2">
                <div className="flex gap-4 h-full min-w-[1500px]">
                    {STAGES.map((stage) => {
                        const stageItems = board[stage] || [];
                        const stageValue = stageItems.reduce((sum: number, o: any) => sum + (o.deal_value || 0), 0);
                        return (
                            <div key={stage} className="flex-1 flex flex-col min-w-[300px] bg-white/5 border border-white/5 rounded-2xl overflow-hidden glass">
                                <div className={`p-4 border-b flex flex-col gap-1 sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-xl z-20 ${STAGE_COLORS[stage].replace('text-', 'border-').split(' ')[2]}`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`font-black text-xs uppercase tracking-wider px-2 py-0.5 rounded-md ${STAGE_COLORS[stage]}`}>
                                            {stage}
                                        </span>
                                        <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded-md text-muted-foreground font-bold">
                                            {stageItems.length}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-bold pl-1 mt-1 opacity-70">
                                        STAGE VALUE: <span className="text-emerald-400">₹{stageValue.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar bg-black/40">
                                    {stageItems.map((opp: any) => {
                                        const daysInStage = getDaysSince(opp.updated_at || opp.created_at);
                                        const isStagnant = daysInStage > 30 && stage !== "Won" && stage !== "Lost";

                                        return (
                                            <div key={opp.id} className={`p-4 rounded-xl bg-[#161616] border transition-all cursor-move group relative flex flex-col gap-2 shadow-lg ${isStagnant ? "border-red-500/30 hover:border-red-500/50" : "border-white/5 hover:border-primary/50"
                                                }`}>

                                                {/* Header & Badges */}
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-[13px] text-white group-hover:text-primary transition-colors leading-tight truncate" title={opp.opportunity_name}>
                                                            {opp.opportunity_name}
                                                        </h3>
                                                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate opacity-70">
                                                            {opp.account?.account_name || "Unknown Company"}
                                                        </p>
                                                    </div>
                                                    <div className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${PRIORITY_COLORS[opp.priority || 'Medium']}`}>
                                                        {opp.priority || 'Medium'}
                                                    </div>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Deal Value</span>
                                                        <span className="text-[12px] font-black text-emerald-400">₹{(opp.deal_value || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Probability</span>
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ${opp.probability > 70 ? 'bg-emerald-500' : opp.probability > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${opp.probability}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-[10px] font-black text-white">{opp.probability}%</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Health Indicators */}
                                                <div className="flex items-center gap-4 mt-2 py-2 border-y border-white/5">
                                                    <div className="flex items-center gap-1.5" title="Days in stage">
                                                        <Clock className={`w-3 h-3 ${isStagnant ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`} />
                                                        <span className={`text-[10px] font-bold ${isStagnant ? 'text-red-400' : 'text-muted-foreground opacity-60'}`}>
                                                            {daysInStage} days
                                                        </span>
                                                    </div>
                                                    {isStagnant && (
                                                        <div className="flex items-center gap-1 text-red-400" title="Attention Required">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            <span className="text-[9px] font-black uppercase">Stalled</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quick Stage Switch */}
                                                <div className="flex items-center justify-between pt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <select
                                                        value={stage}
                                                        onChange={(e) => handleStageChange(opp.id, e.target.value)}
                                                        className="bg-black/50 border border-white/10 text-[9px] font-bold rounded h-6 px-1.5 text-muted-foreground focus:text-white outline-none cursor-pointer w-32"
                                                    >
                                                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>

                                                    <button className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {stageItems.length === 0 && (
                                        <div className="h-28 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl bg-white/[0.01] group/empty cursor-pointer hover:bg-white/[0.03] transition-all">
                                            <div className="p-2 rounded-full border border-dashed border-white/10 text-muted-foreground/20 group-hover/empty:text-primary/40 group-hover/empty:border-primary/30 transition-all">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <span className="text-[9px] text-muted-foreground/20 font-black uppercase tracking-widest mt-2 group-hover/empty:text-primary/30">
                                                Add Deal
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
