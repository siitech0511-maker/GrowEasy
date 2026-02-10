import { useState } from "react";
import { X, Loader2, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/api";

export function ConvertLeadModal({ lead, onClose, onConverted }: { lead: any, onClose: () => void, onConverted: () => void }) {
    const [submitting, setSubmitting] = useState(false);

    async function handleConvert() {
        setSubmitting(true);
        try {
            await apiRequest(`/crm/leads/${lead.id}/convert`, {
                method: "POST"
            });
            onConverted();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h2 className="text-lg font-bold text-white">Convert Lead</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Convert {lead.name}?</h3>
                        <p className="text-muted-foreground text-sm">
                            This will create a new <strong>Customer Account</strong> and an <strong>Opportunity</strong> in your sales pipeline.
                        </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Lead Code:</span>
                            <span className="font-mono">{lead.lead_code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Company:</span>
                            <span className="font-bold text-white">{lead.company_name || "N/A"}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConvert}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Conversion"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
