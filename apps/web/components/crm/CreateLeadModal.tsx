import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { apiRequest } from "@/lib/api";

export function CreateLeadModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        company_name: "",
        email: "",
        phone: "",
        lead_source: "Website"
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiRequest("/crm/leads", {
                method: "POST",
                body: JSON.stringify(form)
            });
            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h2 className="text-lg font-bold text-white">New Lead</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Full Name <span className="text-red-400">*</span></label>
                            <input
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Company Name</label>
                            <input
                                value={form.company_name}
                                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Phone</label>
                                <input
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                                    placeholder="+91..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Source</label>
                            <select
                                value={form.lead_source}
                                onChange={(e) => setForm({ ...form, lead_source: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:bg-white/10 outline-none transition-all appearance-none"
                            >
                                <option value="Website" className="bg-zinc-900">Website</option>
                                <option value="WhatsApp" className="bg-zinc-900">WhatsApp</option>
                                <option value="Call" className="bg-zinc-900">Call</option>
                                <option value="Referral" className="bg-zinc-900">Referral</option>
                                <option value="Ads" className="bg-zinc-900">Ads</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Create Lead
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
