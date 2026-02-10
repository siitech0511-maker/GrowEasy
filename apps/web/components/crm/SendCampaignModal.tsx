import { useState } from "react";
import { X, Mail, MessageCircle, Send } from "lucide-react";

export function SendCampaignModal({ recipients, onClose }: { recipients: any[], onClose: () => void }) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    // Filter recipients who have valid contact info
    const emailRecipients = recipients.filter(r => r.contacts?.some((c: any) => c.email));
    const waRecipients = recipients.filter(r => r.contacts?.some((c: any) => c.phone));

    const handleSendEmail = () => {
        // Collect emails (BCC)
        const emails = emailRecipients.map(r => {
            const contact = r.contacts.find((c: any) => c.email);
            return contact.email;
        }).join(",");

        // Construct mailto
        const mailtoLink = `mailto:?bcc=${emails}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.open(mailtoLink, '_blank');
        onClose();
    };

    const handleSendWhatsApp = () => {
        // Since WA doesn't support bulk link, we might just warn or iterate (but iterating popups is blocked)
        alert(`WhatsApp Bulk Send requires integration. \n\nFound ${waRecipients.length} phone numbers.\n\nFor now, please use the individual WhatsApp buttons in the grid.`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Send className="w-5 h-5 text-purple-500" />
                            Send Bulk Offer
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Selected {recipients.length} Customers
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Subject</label>
                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all font-medium"
                            placeholder="e.g. Exclusive Year-End Sale for Our Premium Partners!"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all h-40 resize-none"
                            placeholder="Type your offer details here..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <button
                            onClick={handleSendEmail}
                            disabled={emailRecipients.length === 0}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Mail className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-blue-100">Send Email</span>
                            <span className="text-xs text-blue-400/60">{emailRecipients.length} Recipients</span>
                        </button>

                        <button
                            onClick={handleSendWhatsApp}
                            disabled={waRecipients.length === 0}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MessageCircle className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-emerald-100">Send WhatsApp</span>
                            <span className="text-xs text-emerald-400/60">{waRecipients.length} Recipients</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
