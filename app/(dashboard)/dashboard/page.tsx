"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StatsCard from "@/components/StatsCard";
import {
    Banknote,
    TrendingUp,
    ShoppingBag,
    AlertCircle,
    Package,
    Clock,
    Wifi,
    WifiOff
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { useAuth } from "@/components/AuthProvider";
import { useProducts } from "@/lib/stores/use-products";
import { useOfflineStore } from "@/lib/stores/offline-store";
import { clsx } from "clsx";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuth();
    
    // Real-time data from Convex
    const stats = useQuery(api.reports.getDailyStats, { role: user?.role || "viewer", days: 7 });
    const recentTransactions = useQuery(api.transactions.listRecent, { limit: 5 });
    
    // Offline-first products from Zustand
    const { products, isLoading: productsLoading } = useProducts(user?.role || "viewer");
    const { isOnline, pendingSyncCount } = useOfflineStore();

    const lowStockProducts = products?.filter(p => p.stockQuantity < 10) || [];
    const todayReport = stats?.[0];

    const chartData = stats?.map((s: any) => ({
        date: new Date(s.date).toLocaleDateString(undefined, { weekday: 'short' }),
        revenue: s.totalRevenue,
        profit: s.totalProfit || 0
    })).reverse();

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Connection Status Banner */}
            {!isOnline && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <WifiOff className="text-amber-600" size={20} />
                    <div>
                        <p className="font-bold text-amber-800">You're offline</p>
                        <p className="text-sm text-amber-600">Changes will sync when you're back online. {pendingSyncCount > 0 && `(${pendingSyncCount} pending)`}</p>
                    </div>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                <StatsCard
                    title="Today's Revenue"
                    value={`UGX ${(todayReport?.totalRevenue || 0).toLocaleString()}`}
                    icon={<Banknote size={18} />}
                    color="indigo"
                />
                <StatsCard
                    title="Today's Profit"
                    value={`UGX ${((todayReport as any)?.totalProfit || 0).toLocaleString()}`}
                    icon={<TrendingUp size={18} />}
                    color="emerald"
                />
                <StatsCard
                    title="Total Sales"
                    value={todayReport?.totalSalesCount || 0}
                    icon={<ShoppingBag size={18} />}
                    color="amber"
                />
                <StatsCard
                    title="Low Stock"
                    value={lowStockProducts.length}
                    icon={<AlertCircle size={18} />}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">Revenue Trend</h3>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</span>
                    </div>
                    <div className="h-48 sm:h-64 lg:h-72 w-full font-medium">
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        fontWeight={600}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        fontWeight={600}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                        width={35}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #f1f5f9',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                            padding: '8px 12px'
                                        }}
                                        itemStyle={{ fontWeight: 700, fontSize: 12 }}
                                        labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px', fontSize: 11 }}
                                        formatter={(value: number) => [`UGX ${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                <div className="text-center">
                                    <BarChart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="font-bold uppercase tracking-widest text-xs">Awaiting data</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">Recent Sales</h3>
                        <Link href="/sales" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3 sm:space-y-4 flex-1">
                        {recentTransactions?.map((t: any) => (
                            <div key={t._id} className="flex items-center justify-between group p-2 sm:p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                        {t.productName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate max-w-[100px] sm:max-w-[140px] group-hover:text-indigo-600 transition-colors">{t.productName}</p>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <Clock size={10} />
                                            <p className="text-[10px] font-medium">
                                                {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600">+{t.totalSale.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t.quantity} unit{t.quantity > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        ))}
                        {(!recentTransactions || recentTransactions.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                <ShoppingBag size={32} className="mb-3 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">No recent sales</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-rose-100 text-rose-600">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-rose-900">Low Stock Alert</h3>
                            <p className="text-[10px] sm:text-xs font-medium text-rose-600">{lowStockProducts.length} products need restocking</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {lowStockProducts.slice(0, 6).map((product) => (
                            <div key={product._id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-rose-100">
                                <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                                    <Package size={16} className="text-rose-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase">{product.sku}</p>
                                </div>
                                <div className={clsx(
                                    "px-2 py-1 rounded-lg text-xs font-black",
                                    product.stockQuantity <= 3 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {product.stockQuantity} left
                                </div>
                            </div>
                        ))}
                    </div>
                    {lowStockProducts.length > 6 && (
                        <Link
                            href="/inventory"
                            className="block mt-4 text-center text-xs font-bold text-rose-600 hover:text-rose-700 uppercase tracking-widest"
                        >
                            View all {lowStockProducts.length} low stock items →
                        </Link>
                    )}
                </div>
            )}

            {/* Quick Stats - Products Overview */}
            {!productsLoading && products.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">Inventory Overview</h3>
                        <div className={clsx(
                            "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold",
                            isOnline ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        )}>
                            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                            {isOnline ? "Synced" : "Offline data"}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-2xl sm:text-3xl font-black text-slate-900">{products.length}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Products</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-2xl sm:text-3xl font-black text-emerald-700">{products.filter(p => p.stockQuantity >= 10).length}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">In Stock</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-2xl sm:text-3xl font-black text-amber-700">{products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length}</p>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Low Stock</p>
                        </div>
                        <div className="text-center p-4 bg-rose-50 rounded-xl border border-rose-100">
                            <p className="text-2xl sm:text-3xl font-black text-rose-700">{products.filter(p => p.stockQuantity === 0).length}</p>
                            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1">Out of Stock</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
