"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StatsCard from "@/components/StatsCard";
import { Table, TableRow, TableCell } from "@/components/Table";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Calendar,
    Download,
    Package,
    Percent
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/UI";
import { useAuth } from "@/components/AuthProvider";
import { clsx } from "clsx";

export default function ReportsPage() {
    const { user } = useAuth();
    const stats = useQuery(api.reports.getDailyStats, { role: user?.role || "viewer", days: 30 });
    const salesByItem = useQuery(api.reports.getSalesByItem, { role: user?.role || "viewer" });

    const totalRevenue = stats?.reduce((acc, s) => acc + s.totalRevenue, 0) || 0;
    const totalProfit = stats?.reduce((acc, s: any) => acc + (s.totalProfit || 0), 0) || 0;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const chartData = stats?.map((s: any) => ({
        date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: s.totalRevenue,
        profit: s.totalProfit || 0
    })).reverse();

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Analytics</h2>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Store Performance</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm">
                        <Calendar size={16} />
                        <span className="hidden sm:inline">30 Days</span>
                    </Button>
                    <Button variant="secondary" className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </div>
            </div>

            {/* High Level Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                <StatsCard
                    title="Revenue"
                    value={`UGX ${totalRevenue.toLocaleString()}`}
                    icon={<DollarSign size={18} />}
                    color="indigo"
                />
                <StatsCard
                    title="Profit"
                    value={`UGX ${totalProfit.toLocaleString()}`}
                    icon={<TrendingUp size={18} />}
                    color="emerald"
                />
                <StatsCard
                    title="Margin"
                    value={`${avgMargin.toFixed(1)}%`}
                    icon={<Percent size={18} />}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Revenue Area Chart */}
                <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">Revenue vs Profit</h3>
                        <div className="flex gap-3 sm:gap-6">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-indigo-600" />
                                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Revenue</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500" />
                                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Profit</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-48 sm:h-64 lg:h-72 w-full font-medium">
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} fontWeight={700} tickLine={false} axisLine={false} dy={8} />
                                    <YAxis stroke="#94a3b8" fontSize={9} fontWeight={700} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} width={30} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #f1f5f9',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                                            padding: '8px 12px',
                                            fontSize: 11
                                        }}
                                        itemStyle={{ fontWeight: 700 }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">Awaiting data...</div>
                        )}
                    </div>
                </div>

                {/* Top Products Chart */}
                <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mb-4 sm:mb-6">Best Performers</h3>
                    <div className="h-48 sm:h-64 lg:h-72 w-full font-medium">
                        {salesByItem && salesByItem.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesByItem.slice(0, 5)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="#64748b"
                                        fontSize={10}
                                        fontWeight={700}
                                        width={100}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #f1f5f9',
                                            borderRadius: '16px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
                                        }}
                                        labelStyle={{ color: '#0f172a', fontWeight: 900, marginBottom: '4px' }}
                                        formatter={(value: number | undefined) => [`UGX ${(value ?? 0).toLocaleString()}`, "Revenue"]}
                                    />
                                    <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 8, 8, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">Awaiting data...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Performance Table */}
            <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <Package size={18} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Product Performance</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed breakdown</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-3">
                    {salesByItem?.map((item) => {
                        const margin = item.revenue > 0 ? ((item.profit || 0) / item.revenue) * 100 : 0;
                        return (
                            <div key={item.productId} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{item.name}</h4>
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{item.sku}</p>
                                    </div>
                                    <div className={clsx(
                                        "px-2 py-1 rounded-lg text-xs font-bold",
                                        margin >= 30 ? "bg-emerald-100 text-emerald-700" : margin >= 15 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                                    )}>
                                        {margin.toFixed(0)}%
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">Sold</p>
                                        <p className="text-sm font-black text-slate-900">{item.quantity}</p>
                                    </div>
                                    <div className="bg-indigo-50 rounded-xl p-2.5 border border-indigo-100">
                                        <p className="text-[9px] font-bold text-indigo-600 uppercase mb-0.5">Revenue</p>
                                        <p className="text-sm font-black text-indigo-700">{(item.revenue / 1000).toFixed(0)}k</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                                        <p className="text-[9px] font-bold text-emerald-600 uppercase mb-0.5">Profit</p>
                                        <p className="text-sm font-black text-emerald-700">{((item.profit || 0) / 1000).toFixed(0)}k</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                    <Table headers={[
                        "Product",
                        { label: "Units Sold", className: "text-center" },
                        { label: "Revenue", className: "text-right" },
                        { label: "Profit", className: "text-right" },
                        { label: "Margin", className: "text-center" }
                    ]}>
                        {salesByItem?.map((item) => {
                            const margin = item.revenue > 0 ? ((item.profit || 0) / item.revenue) * 100 : 0;
                            return (
                                <TableRow key={item.productId} className="hover:bg-slate-50/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                <Package size={16} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 truncate max-w-[200px]">{item.name}</div>
                                                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{item.sku}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 font-black text-slate-900">
                                            {item.quantity}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-bold text-indigo-600">UGX {item.revenue.toLocaleString()}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-black text-emerald-600">+UGX {(item.profit || 0).toLocaleString()}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[80px] hidden lg:block">
                                                <div
                                                    className={clsx(
                                                        "h-full rounded-full transition-all",
                                                        margin >= 30 ? "bg-emerald-500" : margin >= 15 ? "bg-amber-500" : "bg-rose-500"
                                                    )}
                                                    style={{ width: `${Math.min(100, margin * 2)}%` }}
                                                />
                                            </div>
                                            <span className={clsx(
                                                "text-sm font-black px-2 py-1 rounded-lg",
                                                margin >= 30 ? "bg-emerald-100 text-emerald-700" : margin >= 15 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                                            )}>
                                                {margin.toFixed(0)}%
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </Table>
                </div>

                {(!salesByItem || salesByItem.length === 0) && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                        <BarChart3 size={48} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No sales data yet</h3>
                        <p className="text-sm text-slate-500">Complete some sales to see analytics here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
