import { X, Building2, User, Phone, MapPin, CreditCard, Mail } from "lucide-react";

export function CustomerDetailsModal({ account, onClose }: { account: any, onClose: () => void }) {
    if (!account) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="h-full w-full max-w-2xl bg-[#0A0A0A] border-l border-white/10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="sticky top-0 z-10 px-6 py-6 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{account.account_name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                                {account.industry || "General"}
                            </span>
                            {account.gst_number && (
                                <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">
                                    GST: {account.gst_number}
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8">

                    {/* Primary Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                                <CreditCard className="w-4 h-4" /> Financials
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm text-muted-foreground">Credit Limit</span>
                                    <span className="font-bold text-emerald-400">₹{(account.credit_limit || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm text-muted-foreground">Payment Terms</span>
                                    <span className="text-sm text-white">{account.payment_terms || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                                <MapPin className="w-4 h-4" /> Addresses
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-muted-foreground mb-1 block">Billing Address</span>
                                    <p className="text-sm text-white leading-relaxed">{account.billing_address || "—"}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground mb-1 block">Shipping Address</span>
                                    <p className="text-sm text-white leading-relaxed">{account.shipping_address || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contacts List */}
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                            <User className="w-4 h-4" /> Contacts
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {account.contacts && account.contacts.length > 0 ? (
                                account.contacts.map((contact: any) => (
                                    <div key={contact.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-primary font-bold">
                                            {contact.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white group-hover:text-primary transition-colors">{contact.name}</h4>
                                            <p className="text-xs text-muted-foreground">{contact.designation || "No Designation"}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {contact.phone && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Phone className="w-3 h-3" /> {contact.phone}
                                                </div>
                                            )}
                                            {contact.email && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Mail className="w-3 h-3" /> {contact.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-xl text-muted-foreground text-sm">
                                    No contacts found.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
