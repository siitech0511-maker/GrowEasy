"use client";

import { Bell, Search, User } from "lucide-react";

export function Header() {
    return (
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-96 max-w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search transactions, accounts, or items..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
                </button>
                <div className="h-4 w-px bg-white/10 mx-2"></div>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Profile</span>
                </button>
            </div>
        </header>
    );
}
