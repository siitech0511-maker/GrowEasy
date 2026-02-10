"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    ShoppingCart,
    Package,
    Users,
    Settings,
    CreditCard,
    TrendingUp,
    ShieldCheck,
    Truck,
    Briefcase,
    PieChart,
    HardDrive,
    Globe,
    Target
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const menuGroups = [
    {
        title: "General",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/" },
        ],
    },
    {
        title: "Accounting Master",
        items: [
            { name: "Chart of Accounts", icon: BookOpen, href: "/accounting/master/coa" },
        ],
    },
    {
        title: "Accounting Transactions",
        items: [
            { name: "Journal Entries", icon: FileText, href: "/accounting/transactions/journal" },
            { name: "Batch Posting", icon: BookOpen, href: "/accounting/transactions/batch" },
            { name: "Payments", icon: CreditCard, href: "/accounting/transactions/payments" },
            { name: "Fund Transfers", icon: TrendingUp, href: "/accounting/transactions/transfers" },
        ],
    },
    {
        title: "Accounting Reports",
        items: [
            { name: "General Ledger", icon: PieChart, href: "/accounting/reports/ledger" },
            { name: "Bank Reconciliation", icon: ShieldCheck, href: "/accounting/reports/bank-recon" },
        ],
    },
    {
        title: "Operations",
        items: [
            { name: "Sales", icon: TrendingUp, href: "/sales" },
            { name: "Purchase & Expense", icon: ShoppingCart, href: "/purchase" },
            { name: "POS (Retail)", icon: HardDrive, href: "/pos" },
            { name: "Inventory", icon: Package, href: "/inventory" },
            { name: "Warehouse", icon: Truck, href: "/warehouse" },
        ],
    },
    {
        title: "Personnel",
        items: [
            { name: "HRMS & Payroll", icon: Users, href: "/hrms" },
            { name: "Projects", icon: Briefcase, href: "/projects" },
        ],
    },
    {
        title: "CRM",
        items: [
            { name: "Insights", icon: PieChart, href: "/crm/dashboard" },
            { name: "Leads", icon: Globe, href: "/crm/leads" },
            { name: "Pipeline", icon: TrendingUp, href: "/crm/pipeline" },
            { name: "Customers", icon: Users, href: "/crm/accounts" },
        ],
    },
    {
        title: "Marketing",
        items: [
            { name: "Lead Aggregator", icon: Target, href: "/marketing" },
        ],
    },
    {
        title: "System",
        items: [
            { name: "Reports", icon: PieChart, href: "/reports" },
            { name: "Settings", icon: Settings, href: "/settings" },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen sidebar-gradient border-r border-white/10 flex flex-col fixed left-0 top-0 overflow-y-auto">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gradient tracking-tight">GrowEasy</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">ERP Suite</p>
            </div>

            <div className="flex-1 px-4 py-2">
                {menuGroups.map((group) => (
                    <div key={group.title} className="mb-6">
                        <h2 className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {group.title}
                        </h2>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                                            isActive
                                                ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "w-4 h-4",
                                            isActive ? "text-primary" : "group-hover:text-primary transition-colors"
                                        )} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/5 mx-4 mb-4 rounded-xl glass">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-xs font-bold">
                        OT
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-none">OptionTrader</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-1">Admin Account</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
