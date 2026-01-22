"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Table, TableRow, TableCell } from "@/components/Table";
import { Button, Input } from "@/components/UI";
import { ShoppingCart, Search, Receipt, Plus, Minus, CheckCircle2, Package, Clock, User, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useProducts } from "@/lib/stores/use-products";
import { useOfflineStore } from "@/lib/stores/offline-store";
import { SyncService } from "@/lib/stores/sync-service";
import { clsx } from "clsx";

export default function SalesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [success, setSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useAuth();

    // Convex mutation for creating transactions
    const createTransaction = useMutation(api.transactions.create);

    // Use offline-first products
    const { products, isLoading: productsLoading } = useProducts(user?.role || "viewer");
    const { isOnline, pendingSyncCount, transactions: offlineTransactions, updateProduct } = useOfflineStore();

    // Get recent sales from Convex (real-time)
    const recentSales = useQuery(api.transactions.listRecent, { limit: 10 });

    const filteredProducts = searchQuery.length > 1
        ? products?.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    const handleRegisterSale = async () => {
        if (!selectedProduct || quantity <= 0 || !user?.id) return;

        // Check stock availability
        if (selectedProduct.stockQuantity < quantity) {
            alert(`Insufficient stock. Only ${selectedProduct.stockQuantity} available.`);
            return;
        }

        setIsProcessing(true);
        try {
            if (isOnline) {
                await createTransaction({
                    productId: selectedProduct._id,
                    userId: user.id as Id<"users">,
                    quantity,
                });
            } else {
                await SyncService.addTransaction(selectedProduct._id, user.id, quantity, selectedProduct);
                updateProduct(selectedProduct._id, {
                    stockQuantity: selectedProduct.stockQuantity - quantity,
                });
            }

            setSuccess(true);
            setSelectedProduct(null);
            setQuantity(1);
            setSearchQuery("");

            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            console.error('[SalesPage] Transaction error:', error);
            alert(error.message || "Failed to register sale");
        } finally {
            setIsProcessing(false);
        }
    };

    const profit = selectedProduct ? (selectedProduct.sellPrice - (selectedProduct.buyPrice || 0)) * quantity : 0;
    const total = selectedProduct ? selectedProduct.sellPrice * quantity : 0;

    // Combine server transactions with offline pending ones
    const pendingOfflineTransactions = offlineTransactions.filter(t => !t._synced);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Sale Registration Form */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm relative overflow-hidden">
                    {success && (
                        <div className="absolute inset-0 bg-emerald-600/95 backdrop-blur-md z-10 flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-500">
                            <CheckCircle2 size={48} className="mb-3 animate-bounce" />
                            <p className="text-lg sm:text-xl font-black uppercase tracking-widest">Sale Complete!</p>
                            <p className="text-emerald-100 mt-1 font-medium text-sm">
                                {isOnline ? "Transaction recorded" : "Saved offline - will sync later"}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-5 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <ShoppingCart size={20} />
                            </div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">New Sale</h2>
                        </div>
                        
                        {/* Online status */}
                        <div className={clsx(
                            "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold",
                            isOnline ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        )}>
                            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {isOnline ? "Online" : "Offline"}
                        </div>
                    </div>

                    <div className="space-y-5 sm:space-y-6">
                        <div className="relative">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-3 block">Product Lookup</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <Input
                                    placeholder="SKU or product name..."
                                    className="pl-12 bg-slate-50 border-slate-100 focus:bg-white transition-all py-4 text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {filteredProducts && filteredProducts.length > 0 && (
                                <div className="absolute z-20 w-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-top-4 duration-300">
                                    {filteredProducts.map(p => (
                                        <button
                                            key={p._id}
                                            onClick={() => {
                                                setSelectedProduct(p);
                                                setSearchQuery("");
                                                setQuantity(1);
                                            }}
                                            className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sku}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-emerald-600">UGX {p.sellPrice.toLocaleString()}</p>
                                                    <p className={clsx(
                                                        "text-[10px] font-bold",
                                                        p.stockQuantity < 10 ? "text-rose-500" : "text-slate-400"
                                                    )}>
                                                        {p.stockQuantity} in stock
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {productsLoading && searchQuery.length > 1 && (
                                <div className="absolute z-20 w-full mt-3 bg-white border border-slate-100 rounded-2xl p-8 text-center">
                                    <RefreshCw size={20} className="mx-auto animate-spin text-indigo-600 mb-2" />
                                    <p className="text-sm text-slate-500">Loading products...</p>
                                </div>
                            )}
                        </div>

                        {selectedProduct ? (
                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-100 animate-in zoom-in-95 duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-600 bg-indigo-100 w-fit px-2 py-1 rounded-md mb-2 uppercase tracking-widest">{selectedProduct.sku}</p>
                                        <h3 className="text-xl font-black text-slate-900">{selectedProduct.name}</h3>
                                    </div>
                                    <div className={clsx(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold",
                                        selectedProduct.stockQuantity < 10 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {selectedProduct.stockQuantity} available
                                    </div>
                                </div>

                                {/* Price breakdown */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Unit Price</p>
                                        <p className="text-lg font-black text-emerald-600">UGX {selectedProduct.sellPrice.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Unit Profit</p>
                                        <p className="text-lg font-black text-indigo-600">
                                            +{(selectedProduct.sellPrice - (selectedProduct.buyPrice || 0)).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Quantity</label>
                                    <div className="flex items-center gap-4 bg-white rounded-2xl p-2 border border-slate-100">
                                        <Button variant="secondary" className="w-12 h-12 rounded-xl p-0" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                            <Minus size={20} />
                                        </Button>
                                        <span className="text-3xl font-black flex-1 text-center text-slate-900">{quantity}</span>
                                        <Button variant="secondary" className="w-12 h-12 rounded-xl p-0" onClick={() => setQuantity(Math.min(selectedProduct.stockQuantity, quantity + 1))}>
                                            <Plus size={20} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="mt-6 pt-6 border-t border-slate-200/50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-500">Total Revenue</span>
                                        <span className="text-xl font-black text-slate-900">UGX {total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-500">Total Profit</span>
                                        <span className="text-lg font-black text-emerald-600">+UGX {profit.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full mt-6 py-5 rounded-2xl text-base font-black shadow-lg shadow-indigo-200" 
                                    onClick={handleRegisterSale}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <RefreshCw size={20} className="animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={20} />
                                            Complete Sale
                                        </>
                                    )}
                                </Button>
                                <button className="w-full mt-3 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest" onClick={() => setSelectedProduct(null)}>
                                    Clear Selection
                                </button>
                            </div>
                        ) : (
                            <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 bg-slate-50/50 group hover:bg-slate-50 hover:border-slate-200 transition-all cursor-default">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
                                    <Package size={32} className="opacity-30" />
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest">Awaiting Selection</p>
                                <p className="text-[10px] font-medium text-slate-300 mt-1">Start by searching a product above</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Sales List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                            <Receipt size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Recent Sales</h2>
                            <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Live store activity</p>
                        </div>
                    </div>
                    
                    {pendingOfflineTransactions.length > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-700 flex items-center gap-2">
                            <WifiOff size={12} />
                            {pendingOfflineTransactions.length} pending sync
                        </div>
                    )}
                </div>

                {/* Pending Offline Transactions */}
                {pendingOfflineTransactions.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Pending Offline Sales</p>
                        {pendingOfflineTransactions.map((t) => {
                            const product = products.find(p => p._id === t.productId);
                            return (
                                <div key={t._id} className="bg-white border border-amber-100 rounded-xl p-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-900">{product?.name || 'Unknown Product'}</p>
                                        <p className="text-[10px] text-slate-500">Qty: {t.quantity} • Waiting to sync</p>
                                    </div>
                                    <p className="font-black text-emerald-600">+{t.totalSale.toLocaleString()}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-3">
                    {recentSales?.map((t: any) => (
                        <div key={t._id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900">{t.productName}</h3>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{t.productSku}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-emerald-600">+{t.totalSale.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t.quantity} units</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Clock size={12} />
                                    <span className="text-xs font-medium">
                                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User size={12} className="text-slate-400" />
                                    <span className="text-xs font-medium text-slate-500">{t.userName}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                    <Table headers={[
                        { label: "Time", className: "w-24" },
                        "Product",
                        { label: "Qty", className: "text-center w-20" },
                        { label: "Revenue", className: "text-right" },
                        { label: "Profit", className: "text-right hidden lg:table-cell" },
                        { label: "Clerk", className: "hidden md:table-cell" }
                    ]}>
                        {recentSales?.map((t: any) => (
                            <TableRow key={t._id}>
                                <TableCell className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} />
                                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-bold text-slate-900 truncate max-w-[200px]">{t.productName}</div>
                                    <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{t.productSku}</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 font-black text-slate-900">
                                        {t.quantity}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="text-lg font-black text-emerald-600">+{t.totalSale.toLocaleString()}</span>
                                </TableCell>
                                <TableCell className="text-right hidden lg:table-cell">
                                    <span className="font-bold text-indigo-600">+{t.totalProfit?.toLocaleString()}</span>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-slate-100 uppercase">
                                            {t.userName?.[0]}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">{t.userName}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!recentSales || recentSales.length === 0) && (
                            <TableRow>
                                <TableCell className="text-center py-16 text-slate-300" colSpan={6}>
                                    <div className="flex flex-col items-center">
                                        <Receipt size={40} className="mb-4 opacity-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No sales recorded yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Complete your first sale to see it here</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </Table>
                </div>
            </div>
        </div>
    );
}
