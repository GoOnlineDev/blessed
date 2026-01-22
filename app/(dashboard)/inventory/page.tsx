"use client";

import { Table, TableRow, TableCell } from "@/components/Table";
import { Button, Input } from "@/components/UI";
import Modal from "@/components/Modal";
import { Plus, Search, Package, Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { UploadButton } from "@/lib/uploadthing";
import { useAuth } from "@/components/AuthProvider";
import { useProducts } from "@/lib/stores/use-products";
import { useOfflineStore } from "@/lib/stores/offline-store";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function InventoryPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [deletingProduct, setDeletingProduct] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();

    // Use Convex mutations
    const createProduct = useMutation(api.products.create);
    const updateProduct = useMutation(api.products.update);
    const deleteProduct = useMutation(api.products.deleteProduct);

    // Get products from hook (uses real-time Convex query)
    const { products, isLoading, error } = useProducts(user?.role || "viewer", { includeBuyPrice: true });
    const { isOnline, pendingSyncCount } = useOfflineStore();

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.role) return;

        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const buyPrice = Number(formData.get("buyPrice"));
        const sellPrice = Number(formData.get("sellPrice"));
        const stockQuantity = Number(formData.get("stockQuantity"));

        const productData = {
            name: name.trim(),
            buyPrice,
            sellPrice,
            stockQuantity,
            imageUrl: uploadedImageUrl || undefined,
        };

        try {
            if (editingProduct) {
                // Update existing product
                await updateProduct({
                    id: editingProduct._id,
                    ...productData,
                });
            } else {
                // Create new product
                await createProduct(productData);
            }
            closeModals();
        } catch (error: any) {
            console.error('[InventoryPage] Save error:', error);
            alert(error.message || "Failed to save product");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingProduct || !user?.role) return;

        try {
            await deleteProduct({ id: deletingProduct._id });
            setDeletingProduct(null);
        } catch (error: any) {
            console.error('[InventoryPage] Delete error:', error);
            alert(error.message || "Failed to delete product");
        }
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setUploadedImageUrl(product.imageUrl || null);
    };

    const closeModals = () => {
        setIsAddModalOpen(false);
        setEditingProduct(null);
        setUploadedImageUrl(null);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header with sync status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    {/* Sync Status Badge */}
                    <div className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold",
                        isOnline ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                    )}>
                        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                        <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
                        {pendingSyncCount > 0 && (
                            <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[10px]">
                                {pendingSyncCount}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsAddModalOpen(true)} className="text-xs sm:text-sm px-3 sm:px-4 py-2">
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                    <RefreshCw size={32} className="mx-auto text-indigo-600 animate-spin mb-4" />
                    <p className="text-slate-600 font-medium">Loading products...</p>
                </div>
            )}

            {/* Mobile Card View */}
            {!isLoading && filteredProducts.length > 0 && (
                <div className="block lg:hidden space-y-3">
                    {filteredProducts.map((product) => {
                        const profit = product.sellPrice - (product.buyPrice || 0);
                        const margin = (product.buyPrice || 0) > 0 ? (profit / product.buyPrice) * 100 : 0;
                        const isLowStock = product.stockQuantity < 10;
                        const isOffline = product._isOffline;

                        return (
                            <div
                                key={product._id}
                                className={clsx(
                                    "bg-white border rounded-2xl p-4 shadow-sm",
                                    isLowStock ? "border-rose-200" : isOffline ? "border-amber-200" : "border-slate-100"
                                )}
                            >
                                {isOffline && (
                                    <div className="mb-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded inline-flex items-center gap-1">
                                        <WifiOff size={10} />
                                        Pending sync
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="text-slate-300" size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{product.sku}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            className="p-2 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                            onClick={() => openEditModal(product)}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                            onClick={() => setDeletingProduct(product)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    <div className="bg-rose-50 rounded-xl p-2.5 border border-rose-100">
                                        <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Buy</p>
                                        <p className="text-sm font-black text-rose-700">{(product.buyPrice || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Sell</p>
                                        <p className="text-sm font-black text-emerald-700">{product.sellPrice?.toLocaleString()}</p>
                                    </div>
                                    <div className={clsx(
                                        "rounded-xl p-2.5 border",
                                        isLowStock ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100"
                                    )}>
                                        <p className={clsx(
                                            "text-[9px] font-bold uppercase tracking-wider mb-0.5",
                                            isLowStock ? "text-rose-600" : "text-slate-500"
                                        )}>Stock</p>
                                        <div className="flex items-center gap-1">
                                            {isLowStock && <AlertTriangle size={12} className="text-rose-500" />}
                                            <p className={clsx(
                                                "text-sm font-black",
                                                isLowStock ? "text-rose-700" : "text-slate-700"
                                            )}>{product.stockQuantity}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Profit/Unit</span>
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "text-sm font-black",
                                            profit >= 0 ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {profit >= 0 ? "+" : ""}{profit.toLocaleString()}
                                        </span>
                                        <span className={clsx(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                            margin >= 20 ? "bg-emerald-100 text-emerald-700" : margin >= 10 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                                        )}>
                                            {margin.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Desktop Table View */}
            {!isLoading && filteredProducts.length > 0 && (
                <div className="hidden lg:block">
                    <Table headers={[
                        "Product",
                        "SKU",
                        { label: "Buy Price", className: "text-center" },
                        { label: "Sell Price", className: "text-center" },
                        { label: "Profit", className: "hidden lg:table-cell text-center" },
                        { label: "Stock", className: "text-center" },
                        { label: "", className: "text-right" }
                    ]}>
                        {filteredProducts.map((product) => {
                            const profit = product.sellPrice - (product.buyPrice || 0);
                            const margin = (product.buyPrice || 0) > 0 ? (profit / product.buyPrice) * 100 : 0;
                            const isLowStock = product.stockQuantity < 10;
                            const isOffline = product._isOffline;

                            return (
                                <TableRow key={product._id} className={clsx("group", isOffline && "bg-amber-50/30")}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="text-slate-300" size={16} />
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-900 truncate max-w-[200px] block">{product.name}</span>
                                                {isOffline && (
                                                    <span className="text-[9px] font-bold text-amber-600 flex items-center gap-1">
                                                        <WifiOff size={10} /> Pending sync
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">
                                        {product.sku}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-100">
                                            <TrendingDown size={14} className="text-rose-500" />
                                            <span className="font-bold text-rose-700 text-sm">{(product.buyPrice || 0).toLocaleString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                            <TrendingUp size={14} className="text-emerald-500" />
                                            <span className="font-bold text-emerald-700 text-sm">{product.sellPrice?.toLocaleString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={clsx(
                                                "font-black text-sm",
                                                profit >= 0 ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {profit >= 0 ? "+" : ""}{profit.toLocaleString()}
                                            </span>
                                            <span className={clsx(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                margin >= 20 ? "bg-emerald-100 text-emerald-700" : margin >= 10 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                                            )}>
                                                {margin.toFixed(0)}% margin
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={clsx(
                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                                            isLowStock ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100"
                                        )}>
                                            <div className={clsx(
                                                "w-2 h-2 rounded-full flex-shrink-0",
                                                isLowStock ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                                            )} />
                                            <span className={clsx(
                                                "text-sm font-bold",
                                                isLowStock ? 'text-rose-600' : 'text-slate-600'
                                            )}>
                                                {product.stockQuantity}
                                            </span>
                                            {isLowStock && <AlertTriangle size={14} className="text-rose-500" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                className="p-2 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                onClick={() => openEditModal(product)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                onClick={() => setDeletingProduct(product)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </Table>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredProducts.length === 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                    <Package size={48} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No products found</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        {searchQuery ? "Try a different search term" : "Add your first product to get started"}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={16} />
                            Add Product
                        </Button>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isAddModalOpen || !!editingProduct}
                onClose={closeModals}
                title={editingProduct ? "Edit Product" : "Add New Product"}
            >
                <form onSubmit={handleAddProduct} className="space-y-6">
                    <Input
                        label="Product Name"
                        name="name"
                        required
                        placeholder="e.g. Tororo Cement"
                        defaultValue={editingProduct?.name}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-rose-600 uppercase tracking-widest px-1 flex items-center gap-1.5">
                                <TrendingDown size={12} />
                                Buying Price (UGX)
                            </label>
                            <Input
                                name="buyPrice"
                                type="number"
                                required
                                defaultValue={editingProduct?.buyPrice}
                                className="border-rose-200 focus:border-rose-400 focus:ring-rose-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest px-1 flex items-center gap-1.5">
                                <TrendingUp size={12} />
                                Selling Price (UGX)
                            </label>
                            <Input
                                name="sellPrice"
                                type="number"
                                required
                                defaultValue={editingProduct?.sellPrice}
                                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-100"
                            />
                        </div>
                    </div>
                    <Input
                        label="Current Stock"
                        name="stockQuantity"
                        type="number"
                        required
                        defaultValue={editingProduct?.stockQuantity ?? 0}
                    />

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Product Image</label>

                        {uploadedImageUrl ? (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 group">
                                <img src={uploadedImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setUploadedImageUrl(null)}
                                        className="p-2 bg-white text-rose-600 rounded-xl shadow-xl hover:scale-110 transition-transform"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 transition-colors hover:bg-slate-50 hover:border-slate-200">
                                <UploadButton
                                    endpoint="imageUploader"
                                    className="ut-button:bg-indigo-600 ut-button:ut-readying:bg-indigo-500 ut-label:text-slate-500 ut-button:rounded-xl ut-button:px-6"
                                    onClientUploadComplete={(res) => {
                                        if (res?.[0]) {
                                            setUploadedImageUrl(res[0].url);
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        alert(`Upload failed: ${error.message}`);
                                    }}
                                />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Max 4MB (PNG, JPG, WEBP)</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={closeModals}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSaving}>
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <RefreshCw size={16} className="animate-spin" />
                                    Saving...
                                </div>
                            ) : (
                                editingProduct ? "Update Product" : "Save Product"
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={!!deletingProduct}
                onClose={() => setDeletingProduct(null)}
                title="Delete Product"
            >
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={32} />
                    </div>
                    <p className="text-slate-600">
                        Are you sure you want to delete <span className="font-bold text-slate-900">{deletingProduct?.name}</span>?
                        This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setDeletingProduct(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-rose-600 text-white border-rose-600 hover:bg-rose-700 hover:border-rose-700"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
