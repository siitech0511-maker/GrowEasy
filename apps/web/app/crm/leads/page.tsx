"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, Filter, ArrowRight, Download, Edit3, CalendarClock, ShieldCheck, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef, themeQuartz } from "ag-grid-community";
import { ConvertLeadModal } from "@/components/crm/ConvertLeadModal";
import { CreateLeadModal } from "@/components/crm/CreateLeadModal";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function LeadsPage() {
    const gridRef = useRef<AgGridReact>(null);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const result = await apiRequest("/crm/leads");
            setLeads(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const onExport = () => {
        gridRef.current?.api.exportDataAsCsv({
            fileName: `leads_export_${new Date().toISOString().split('T')[0]}.csv`
        });
    };

    const onCellValueChanged = async (event: any) => {
        const { data, colDef, newValue, oldValue } = event;
        console.log("Inline Edit:", colDef.field, oldValue, "->", newValue);
        try {
            await apiRequest(`/crm/leads/${data.id}`, {
                method: "PUT",
                body: JSON.stringify({ [colDef.field]: newValue })
            });
            // Success - maybe show toast?
        } catch (err) {
            console.error("Failed to update lead", err);
            fetchData(); // Rollback local change
        }
    };

    const handleWhatsApp = async (lead: any) => {
        const phone = lead.phone?.replace(/\D/g, '');
        if (!phone) return;

        // 1. Open WhatsApp
        window.open(`https://wa.me/${phone}`, '_blank');

        // 2. Auto-log Communication (Simplified)
        try {
            await apiRequest("/crm/comms/log", {
                method: "POST",
                body: JSON.stringify({
                    direction: "Outbound",
                    channel: "WhatsApp",
                    reference_type: "Lead",
                    reference_id: lead.id,
                    content: "Initiated click-to-chat"
                })
            });
        } catch (err) {
            console.error("Failed to log comm", err);
        }
    };

    const handleGeoCheckin = async (lead: any) => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                await apiRequest("/crm/comms/log", {
                    method: "POST",
                    body: JSON.stringify({
                        direction: "Outbound",
                        channel: "Field Visit",
                        reference_type: "Lead",
                        reference_id: lead.id,
                        content: `Field Visit Check-in at ${latitude}, ${longitude}`,
                        status: "Delivered"
                    })
                });
                alert("Geo-Checkin successful!");
            } catch (err) {
                console.error("Geo-Checkin failed", err);
            }
        });
    };

    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Lead Code", field: "lead_code", flex: 1, cellClass: "font-mono" },
        { headerName: "Name", field: "name", flex: 1.5, cellClass: "font-bold text-primary", editable: true },
        { headerName: "Company", field: "company_name", flex: 1.5, editable: true },
        {
            headerName: "Phone / WhatsApp", field: "phone", flex: 1.5,
            cellRenderer: (p: any) => (
                <div className="flex items-center gap-2">
                    <span className="flex-1">{p.value}</span>
                    <button
                        onClick={() => handleWhatsApp(p.data)}
                        className="p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                        title="Click to WhatsApp"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    </button>
                </div>
            )
        },
        {
            headerName: "Source", field: "lead_source", flex: 1,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: ["Website", "WhatsApp", "Call", "Referral", "Ads", "Import"] },
            cellRenderer: (p: any) => <span className="opacity-70 text-xs uppercase tracking-wider">{p.value}</span>
        },
        {
            headerName: "Status", field: "lead_status", flex: 1,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: ["New", "Contacted", "Qualified", "Lost", "Converted"] },
            cellRenderer: (p: any) => {
                const colors: any = {
                    "New": "text-blue-400 bg-blue-500/10 border-blue-500/20",
                    "Contacted": "text-amber-400 bg-amber-500/10 border-amber-500/20",
                    "Qualified": "text-purple-400 bg-purple-500/10 border-purple-500/20",
                    "Converted": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                    "Lost": "text-red-400 bg-red-500/10 border-red-500/20",
                };
                const colorClass = colors[p.value] || "text-muted-foreground";
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
                        {p.value}
                    </span>
                );
            }
        },
        {
            headerName: "SLA Status", field: "created_at", flex: 1,
            cellRenderer: (p: any) => {
                const created = new Date(p.value);
                const now = new Date();
                const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
                const responded = p.data.first_response_at;

                if (responded) return <span className="text-emerald-500 text-[10px] font-black uppercase">Met SLA</span>;

                if (diffHours > 24) return <span className="text-red-400 text-[10px] font-black uppercase animate-pulse">Overdue! (24h+)</span>;
                if (diffHours > 4) return <span className="text-orange-400 text-[10px] font-black uppercase">Urgent (4h+)</span>;
                return <span className="text-blue-400 text-[10px] font-black uppercase">On Track</span>;
            }
        },
        {
            headerName: "AI Score", field: "conversion_probability", flex: 1.2,
            cellRenderer: (p: any) => (
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${p.value > 0.7 ? 'bg-emerald-500' : p.value > 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${(p.value || 0) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-black font-mono">{(p.value * 100).toFixed(0)}%</span>
                </div>
            )
        },
        {
            headerName: "Best Time", field: "best_time_to_call", flex: 1.2,
            cellRenderer: (p: any) => (
                <div className="flex items-center gap-1.5 opacity-80">
                    <CalendarClock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold">{p.value || "Calculating..."}</span>
                </div>
            )
        },
        {
            headerName: "Compliance", field: "whatsapp_consent", flex: 1,
            cellRenderer: (p: any) => (
                <div className={`flex items-center gap-1.5 ${p.value ? 'text-emerald-400' : 'text-muted-foreground opacity-40'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase">{p.value ? "Opt-in" : "N/A"}</span>
                </div>
            )
        },
        {
            headerName: "Actions", field: "id", flex: 1.5,
            cellRenderer: (p: any) => (
                <div className="flex items-center gap-2">
                    {p.data.lead_status !== "Converted" && (
                        <button
                            onClick={() => setSelectedLead(p.data)}
                            className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                            title="Convert to Deal"
                        >
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => handleGeoCheckin(p.data)}
                        className="p-1.5 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
                        title="Geo-Checkin (Field Visit)"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => handleWhatsApp(p.data)}
                        className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    </button>
                </div>
            )
        }
    ], []);

    const filteredData = leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.lead_code.toLowerCase().includes(search.toLowerCase()) ||
        (l.company_name && l.company_name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gradient">Leads</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Enterprise Data Management (Inline Edits Mode)</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-all font-bold"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Search leads..."
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
                        Add Lead
                    </button>
                </div>
            </div>

            <div className="rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl" style={{ height: "calc(100vh - 200px)" }}>
                <AgGridReact
                    ref={gridRef}
                    theme={themeQuartz.withParams({
                        backgroundColor: "transparent",
                        foregroundColor: "#ffffff",
                        headerBackgroundColor: "rgba(255,255,255,0.05)",
                        rowHoverColor: "rgba(255,255,255,0.05)",
                        borderColor: "rgba(255,255,255,0.1)",
                    })}
                    rowData={filteredData}
                    columnDefs={columnDefs}
                    defaultColDef={{ sortable: true, filter: true, resizable: true }}
                    headerHeight={48}
                    rowHeight={48}
                    overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No leads found.</span>"
                />
            </div>

            {showModal && <CreateLeadModal onClose={() => setShowModal(false)} onCreated={fetchData} />}
            {selectedLead && (
                <ConvertLeadModal
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onConverted={fetchData}
                />
            )}
        </div>
    );
}
