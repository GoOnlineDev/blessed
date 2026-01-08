"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableRow, TableCell } from "@/components/Table";
import { Button, Input } from "@/components/UI";
import Modal from "@/components/Modal";
import { Plus, Search, Filter, MoreVertical, Package, ArrowUpRight, Edit, Trash2, X } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { UploadButton } from "@/lib/uploadthing";
import { useAuth } from "@/components/AuthProvider";

export default function InventoryPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [deletingProduct, setDeletingProduct] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const { user } = useAuth();

    const products = useQuery(api.products.list, { role: user?.role || "viewer" });
    const createProduct = useMutation(api.products.create);
    const updateProduct = useMutation(api.products.update);
    const deleteProduct = useMutation(api.products.deleteProduct);

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const buyPrice = Number(formData.get("buyPrice"));
        const sellPrice = Number(formData.get("sellPrice"));
        const stockQuantity = Number(formData.get("stockQuantity"));
        const data = {
            name,
            buyPrice,
            sellPrice,
            stockQuantity,
            imageUrl: uploadedImageUrl || undefined,
        };

        if (editingProduct) {
            await updateProduct({ id: editingProduct._id, ...data });
        } else {
            await createProduct(data);
        }
        closeModals();
    };

    const handleDelete = async () => {
        if (deletingProduct) {
            await deleteProduct({ id: deletingProduct._id });
            setDeletingProduct(null);
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <Input
                        placeholder="Search products..."
                        className="pl-10 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-2">
                        <Filter size={16} />
                        <span className="hidden sm:inline">Filter</span>
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="text-xs sm:text-sm px-3 sm:px-4 py-2">
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            <Table headers={[
                "Product",
                { label: "SKU", className: "hidden sm:table-cell" },
                { label: "Buy Price", className: "hidden md:table-cell" },
                "Sell",
                "Stock",
                { label: "", className: "text-right" }
            ]}>
                {filteredProducts?.map((product) => (
                    <TableRow key={product._id} className="group">
                        <TableCell>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="text-slate-300" size={16} />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="font-bold text-slate-900 block truncate text-sm">{product.name}</span>
                                    <div className="flex items-center gap-2 sm:hidden">
                                        <span className="text-[9px] font-bold text-indigo-600 uppercase">{product.sku}</span>
                                        <span className="text-[9px] font-bold text-slate-400">UGX {product.sellPrice?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-[10px] font-black tracking-widest text-indigo-600 uppercase">
                            {product.sku}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            <span className="font-bold text-slate-500 text-sm">UGX {(product as any).buyPrice?.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                            <span className="font-black text-indigo-600 text-sm">UGX {product.sellPrice?.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${product.stockQuantity < 10 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                <span className={clsx(
                                    "text-xs sm:text-sm font-bold whitespace-nowrap",
                                    product.stockQuantity < 10 ? 'text-rose-600' : 'text-slate-600'
                                )}>
                                    {product.stockQuantity}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    onClick={() => openEditModal(product)}
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                    onClick={() => setDeletingProduct(product)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </Table>


            <Modal
                isOpen={isAddModalOpen || !!editingProduct}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                }}
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
                        <Input
                            label="Buying Price (UGX)"
                            name="buyPrice"
                            type="number"
                            required
                            defaultValue={editingProduct?.buyPrice}
                        />
                        <Input
                            label="Selling Price (UGX)"
                            name="sellPrice"
                            type="number"
                            required
                            defaultValue={editingProduct?.sellPrice}
                        />
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
                            <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center bg-slate-50/50 transition-colors hover:bg-slate-50 hover:border-slate-200 group">
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
                        <input type="hidden" name="imageUrl" value={uploadedImageUrl || ""} />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                                setIsAddModalOpen(false);
                                setEditingProduct(null);
                            }}
                        >
                            Discard
                        </Button>
                        <Button type="submit" className="flex-1">
                            {editingProduct ? "Update Product" : "Save Product"}
                        </Button>
                    </div>
                </form>
            </Modal>

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
