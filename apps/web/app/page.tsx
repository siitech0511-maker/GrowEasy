"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Activity,
  Plus
} from "lucide-react";

const kpis = [
  {
    name: "Total Revenue",
    value: "₹24,56,780",
    change: "+12.5%",
    trending: "up",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    name: "Active Customers",
    value: "1,284",
    change: "+3.2%",
    trending: "up",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    name: "Stock Valuation",
    value: "₹8,42,000",
    change: "-2.1%",
    trending: "down",
    icon: Package,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    name: "Growth Rate",
    value: "18.4%",
    change: "+4.1%",
    trending: "up",
    icon: TrendingUp,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

const quickActions = [
  { name: "New Invoice", icon: Plus, color: "bg-blue-500" },
  { name: "Post Journal", icon: BookOpenIcon, color: "bg-indigo-500" },
  { name: "Add Stock", icon: Package, color: "bg-emerald-500" },
  { name: "Record Expense", icon: ArrowDownRight, color: "bg-rose-500" },
];

// Placeholder for BookOpen since it's locally needed
function BookOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors text-sm font-medium">
            Download Report
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shadow-lg shadow-primary/20">
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="glass p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bg} blur-3xl -mr-8 -mt-8 rounded-full opacity-50`}></div>
            <div className="flex items-center justify-between relative z-10">
              <div className={`p-2.5 ${kpi.bg} rounded-xl`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trending === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.change}
                {kpi.trending === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <p className="text-sm font-medium text-muted-foreground">{kpi.name}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Real-time Performance
            </h3>
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button className="px-3 py-1 text-xs font-medium rounded-md bg-primary/20 text-primary">Revenue</button>
              <button className="px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground">Profit</button>
            </div>
          </div>
          <div className="flex-1 border-b border-white/5 flex items-end justify-between gap-4 py-4 px-2">
            {[40, 60, 45, 75, 55, 90, 70, 85, 60, 95, 80, 100].map((h, i) => (
              <div key={i} className="w-full bg-primary/10 rounded-t-lg relative group transition-all duration-500" style={{ height: `${h}%` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-primary/0 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl">
                  ₹{(h * 10).toLocaleString()}k
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-medium uppercase tracking-widest px-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-center">{action.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { title: "Invoice #INV-2401 Paid", time: "2 hours ago", color: "bg-emerald-400" },
                { title: "New Inventory: iPhone 16 Pro", time: "5 hours ago", color: "bg-blue-400" },
                { title: "Payroll Processed: Dec 2025", time: "1 day ago", color: "bg-purple-400" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${item.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 text-xs font-bold text-primary hover:underline transition-all">
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
