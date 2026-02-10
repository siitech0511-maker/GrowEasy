"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Eye, Mail, MessageCircle, Send, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef, themeQuartz } from "ag-grid-community";

import { CustomerDetailsModal } from "@/components/crm/CustomerDetailsModal";
import { SendCampaignModal } from "@/components/crm/SendCampaignModal";
import Link from "next/link";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [selectedForCampaign, setSelectedForCampaign] = useState<any[]>([]);
    const gridRef = useRef<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const result = await apiRequest("/crm/accounts");
            setAccounts(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const onSelectionChanged = () => {
        const selectedRows = gridRef.current.api.getSelectedRows();
        setSelectedForCampaign(selectedRows);
    };

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: "account_name",
            headerCheckboxSelection: true,
            checkboxSelection: true,
            headerName: "Account Name", flex: 2,
            cellClass: "font-bold text-primary cursor-pointer hover:underline",
            onCellClicked: (params) => setSelectedAccount(params.data)
        },
        // ... (rest of columns remain same, but I need to include them to keep the file valid if replace_file_content needs context, but likely I can just replace the columnDefs block if I am careful, or just the whole file content for safety/cleanliness given the mix)
        {
            headerName: "Contact Person", flex: 1.5,
            cellRenderer: (p: any) => {
                const contact = p.data.contacts?.find((c: any) => c.val_primary_contact) || p.data.contacts?.[0];
                return contact ? (
                    <div className="flex flex-col justify-center h-full leading-tight">
                        <span className="font-medium text-white text-xs">{contact.name}</span>
                        <span className="text-[10px] text-muted-foreground">{contact.phone}</span>
                    </div>
                ) : <span className="text-muted-foreground text-xs italic">No Contact</span>;
            }
        },
        { headerName: "Industry", field: "industry", flex: 1 },
        { headerName: "GSTIN", field: "gst_number", flex: 1, cellClass: "font-mono text-muted-foreground" },
        {
            headerName: "Actions", field: "id", flex: 1.2,
            cellRenderer: (p: any) => {
                const contact = p.data.contacts?.find((c: any) => c.val_primary_contact) || p.data.contacts?.[0];
                return (
                    <div className="flex items-center gap-1">
                        <Link
                            href={`/crm/accounts/${p.data.id}`}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                            title="Customer 360 View"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => setSelectedAccount(p.data)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                            title="Quick Edit"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        {contact?.email && (
                            <a
                                href={`mailto:${contact.email}`}
                                className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-all"
                                title="Send Email"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        )}
                        {contact?.phone && (
                            <a
                                href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-all"
                                title="WhatsApp"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                );
            }
        }
    ], []);

    const filteredData = accounts.filter(a =>
        a.account_name.toLowerCase().includes(search.toLowerCase()) ||
        (a.gst_number && a.gst_number.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gradient">Customers</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Manage Accounts & Companies</p>
                </div>
                <div className="flex gap-3">
                    {selectedForCampaign.length > 0 && (
                        <button
                            onClick={() => setShowCampaignModal(true)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 font-bold animate-in fade-in slide-in-from-bottom-2"
                        >
                            <Send className="w-4 h-4" />
                            Send Offer ({selectedForCampaign.length})
                        </button>
                    )}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Search customers..."
                            className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm w-64 outline-none focus:border-primary/40 focus:bg-white/10 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl" style={{ height: "calc(100vh - 200px)" }}>
                <AgGridReact
                    ref={gridRef}
                    theme={themeQuartz}
                    rowData={filteredData}
                    columnDefs={columnDefs}
                    defaultColDef={{ sortable: true, filter: true, resizable: true }}
                    rowSelection="multiple"
                    onSelectionChanged={onSelectionChanged}
                    headerHeight={48}
                    rowHeight={48}
                    overlayNoRowsTemplate="<span class='text-muted-foreground italic text-sm'>No customers found.</span>"
                />
            </div>

            {selectedAccount && <CustomerDetailsModal account={selectedAccount} onClose={() => setSelectedAccount(null)} />}
            {showCampaignModal && (
                <SendCampaignModal
                    recipients={selectedForCampaign}
                    onClose={() => setShowCampaignModal(false)}
                />
            )}
        </div>
    );
}
