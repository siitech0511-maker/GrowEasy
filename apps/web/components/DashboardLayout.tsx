"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    const isLoginPage = pathname === "/login";

    useEffect(() => {
        if (isLoginPage) {
            setChecked(true);
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
        } else {
            setChecked(true);
        }
    }, [pathname, isLoginPage, router]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!checked) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64 min-h-screen">
                <Header />
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
