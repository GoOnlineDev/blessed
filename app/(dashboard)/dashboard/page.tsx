"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StatsCard from "@/components/StatsCard";
import {
    Banknote,
    TrendingUp,
    ShoppingBag,
    AlertCircle
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

export default function DashboardPage() {
    const { user } = useAuth();
    const stats = useQuery(api.reports.getDailyStats, { role: user?.role || "viewer", days: 7 });
    const recentTransactions = useQuery(api.transactions.listRecent, { limit: 5 });
    const products = useQuery(api.products.list, { role: user?.role || "viewer" });

    const lowStock = products?.filter(p => p.stockQuantity < 10).length || 0;
    const todayReport = stats?.[0];

    const chartData = stats?.map((s: any) => ({
        date: new Date(s.date).toLocaleDateString(undefined, { weekday: 'short' }),
        revenue: s.totalRevenue,
        profit: s.totalProfit || 0
    })).reverse();

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
                    trend={{ value: "4%", isUp: true }}
                />
                <StatsCard
                    title="Low Stock"
                    value={lowStock}
                    icon={<AlertCircle size={18} />}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">Revenue Trend (Last 7 Days)</h3>
                    <div className="h-48 sm:h-64 lg:h-80 w-full font-medium">
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
                                        itemStyle={{ color: '#4f46e5', fontWeight: 700, fontSize: 12 }}
                                        labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px', fontSize: 11 }}
                                    />
                                    <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                Not enough data to display chart
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm overflow-hidden flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">Recent Sales</h3>
                    <div className="space-y-4 sm:space-y-5 flex-1">
                        {recentTransactions?.map((t: any) => (
                            <div key={t._id} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                        {t.productName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{t.productName}</p>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">
                                            {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900">UGX {t.totalSale.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.quantity} Units</p>
                                </div>
                            </div>
                        ))}
                        {(!recentTransactions || recentTransactions.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <ShoppingBag size={40} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium">No sales recorded today</p>
                            </div>
                        )}
                    </div>
                    {recentTransactions && recentTransactions.length > 0 && (
                        <button className="w-full mt-10 py-3 text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100">
                            See All Activity
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
