"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MarketingLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/marketing", icon: "📊" },
        { name: "Leads", href: "/marketing/leads", icon: "🎯" },
        { name: "Discovery", href: "/marketing/discover", icon: "🔍" },
        { name: "Analytics", href: "/marketing/analytics", icon: "📈" },
        { name: "Settings", href: "/marketing/settings", icon: "⚙️" },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-blue-600">
                        Smart Lead Aggregator
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Marketing Module</p>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                ? "bg-blue-50 text-blue-600 font-medium"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
