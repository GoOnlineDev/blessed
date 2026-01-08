"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableRow, TableCell } from "@/components/Table";
import { Button, Input } from "@/components/UI";
import { ShoppingCart, Search, Receipt, Plus, Minus, CheckCircle2, Package } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function SalesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [success, setSuccess] = useState(false);
    const { user } = useAuth();

    const products = useQuery(api.products.list, { role: user?.role || "viewer" });
    const registerSale = useMutation(api.transactions.create);
    const recentSales = useQuery(api.transactions.listRecent, { limit: 10 });

    const filteredProducts = searchQuery.length > 1
        ? products?.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    const handleRegisterSale = async () => {
        if (!selectedProduct || quantity <= 0) return;

        try {
            await registerSale({
                productId: selectedProduct._id,
                userId: user?.id as any,
                quantity,
            });

            setSuccess(true);
            setSelectedProduct(null);
            setQuantity(1);
            setSearchQuery("");

            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Sale Registration Form */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm relative overflow-hidden">
                    {success && (
                        <div className="absolute inset-0 bg-indigo-600/95 backdrop-blur-md z-10 flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-500">
                            <CheckCircle2 size={48} className="mb-3 animate-bounce" />
                            <p className="text-lg sm:text-xl font-black uppercase tracking-widest">Sale Complete!</p>
                            <p className="text-indigo-100 mt-1 font-medium text-sm">Transaction recorded</p>
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-5 sm:mb-6">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <ShoppingCart size={20} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">New Sale</h2>
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
                                <div className="absolute z-20 w-full mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-top-4 duration-300">
                                    {filteredProducts.map(p => (
                                        <button
                                            key={p._id}
                                            onClick={() => {
                                                setSelectedProduct(p);
                                                setSearchQuery("");
                                            }}
                                            className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group"
                                        >
                                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sku}</p>
                                                <p className="text-xs font-black text-indigo-600">UGX {p.sellPrice.toLocaleString()}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedProduct ? (
                            <div className="p-8 rounded-[2.5rem] bg-indigo-50/30 border border-indigo-50 animate-in zoom-in-95 duration-300">
                                <p className="text-[10px] font-bold text-indigo-500 bg-white border border-indigo-100 w-fit px-2 py-1 rounded-md mb-3 uppercase tracking-widest">{selectedProduct.sku}</p>
                                <h3 className="text-xl font-black text-slate-900 mb-6">{selectedProduct.name}</h3>

                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-100/30">
                                    <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Price</span>
                                    <span className="text-slate-900 font-black text-lg">UGX {selectedProduct.sellPrice.toLocaleString()}</span>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Quantity</label>
                                    <div className="flex items-center gap-6">
                                        <Button variant="secondary" className="w-12 h-12 rounded-2xl p-0" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                            <Minus size={20} />
                                        </Button>
                                        <span className="text-3xl font-black flex-1 text-center text-slate-900">{quantity}</span>
                                        <Button variant="secondary" className="w-12 h-12 rounded-2xl p-0" onClick={() => setQuantity(quantity + 1)}>
                                            <Plus size={20} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-indigo-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
                                        <span className="text-2xl font-black text-slate-900">UGX {(selectedProduct.sellPrice * quantity).toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button className="w-full mt-10 py-5 rounded-2xl text-base font-black shadow-lg shadow-indigo-200" onClick={handleRegisterSale}>
                                    Register Transaction
                                </Button>
                                <button className="w-full mt-4 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest" onClick={() => setSelectedProduct(null)}>
                                    Clear Selection
                                </button>
                            </div>
                        ) : (
                            <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400 bg-slate-50/50 group hover:bg-slate-50 hover:border-slate-200 transition-all cursor-default">
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
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                        <Receipt size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Recent Sales</h2>
                        <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Live store activity</p>
                    </div>
                </div>

                <Table headers={[
                    { label: "Date", className: "hidden sm:table-cell" },
                    "Product",
                    "Qty",
                    { label: "Revenue", className: "text-right" },
                    { label: "Clerk", className: "hidden md:table-cell" }
                ]}>
                    {recentSales?.map((t: any) => (
                        <TableRow key={t._id}>
                            <TableCell className="text-xs text-slate-400 font-bold uppercase tracking-tighter hidden sm:table-cell">
                                {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell>
                                <div className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">{t.productName}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 sm:hidden">
                                    {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="font-black text-slate-900">{t.quantity}</span>
                                <span className="text-[10px] text-slate-400 ml-1 font-bold uppercase hidden sm:inline">Units</span>
                            </TableCell>
                            <TableCell className="font-black text-indigo-600 text-right">
                                UGX {t.totalSale.toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-slate-200 uppercase">
                                        {t.userName?.[0]}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">{t.userName}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!recentSales || recentSales.length === 0) && (
                        <TableRow>
                            <TableCell className="text-center py-20 text-slate-300" colSpan={5}>
                                <div className="flex flex-col items-center">
                                    <Receipt size={40} className="mb-4 opacity-10" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No transactions yet today</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </Table>
            </div>
        </div>
    );
}
