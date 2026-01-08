"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableRow, TableCell } from "@/components/Table";
import { Button, Input } from "@/components/UI";
import Modal from "@/components/Modal";
import { Users, Shield, Check, X, ShieldCheck, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "@/components/AuthProvider";
import { refreshSession } from "@/app/actions/refresh_session";

const allPages = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Inventory", path: "/inventory" },
    { label: "Sales", path: "/sales" },
    { label: "Reports", path: "/reports" },
    { label: "Users", path: "/users" },
];

export default function UsersPage() {
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const { user: currentUser } = useAuth();

    const users = useQuery(api.users.list);
    const updateRoleAndPages = useMutation(api.users.updateRoleAndPages);

    const handleUpdate = async () => {
        if (!editingUser) return;

        setIsUpdating(true);
        setFeedback(null);

        try {
            await updateRoleAndPages({
                id: editingUser._id,
                role: editingUser.role,
                allowedPages: editingUser.allowedPages,
            });

            // If we just updated ourselves, refresh the session to update the server-side cookie
            if (currentUser && editingUser._id === currentUser.id) {
                console.log("Updated self, refreshing session cookie...");
                await refreshSession();
            }

            setFeedback({ type: 'success', message: `Permissions for ${editingUser.name} updated successfully.` });

            // Close modal after a short delay to show success
            setTimeout(() => {
                setEditingUser(null);
                setFeedback(null);
                setIsUpdating(false);
            }, 1500);

        } catch (error: any) {
            console.error("Update failed:", error);
            setFeedback({ type: 'error', message: error.message || "Failed to commit updates." });
            setIsUpdating(false);
        }
    };

    const togglePage = (path: string) => {
        setEditingUser((prev: any) => {
            const allowed = prev.allowedPages.includes(path)
                ? prev.allowedPages.filter((p: string) => p !== path)
                : [...prev.allowedPages, path];
            return { ...prev, allowedPages: allowed };
        });
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-4 rounded-[1.25rem] bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                    <Users size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Control system access & permissions</p>
                </div>
            </div>

            <Table headers={[
                "Display Name",
                { label: "Email Address", className: "hidden md:table-cell" },
                "Security Role",
                { label: "Direct Access", className: "hidden md:table-cell" },
                { label: "Actions", className: "text-right" }
            ]}>
                {users?.map((user) => (
                    <TableRow key={user._id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-slate-100 uppercase text-xs flex-shrink-0">
                                    {user.name[0]}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-bold text-slate-900 truncate">{user.name}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-500 hidden md:table-cell">{user.email}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2.5">
                                {user.role === "admin" ? (
                                    <ShieldCheck className="text-amber-500" size={18} />
                                ) : user.role === "editor" ? (
                                    <Shield className="text-indigo-500" size={18} />
                                ) : (
                                    <ShieldAlert className="text-slate-300" size={18} />
                                )}
                                <span className={clsx(
                                    "capitalize text-xs font-black tracking-widest uppercase",
                                    user.role === 'admin' ? 'text-amber-600' : 'text-slate-600'
                                )}>
                                    {user.role}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1.5">
                                {user.allowedPages.map((page: string) => (
                                    <span key={page} className="text-[9px] px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-slate-600 font-black uppercase tracking-wider">
                                        {page.split("/")[1]}
                                    </span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="secondary" className="px-3 md:px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setEditingUser(user)}>
                                <span className="md:inline hidden">Configure</span>
                                <span className="md:hidden">Edit</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </Table>

            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title="Personnel Configuration"
            >
                {editingUser && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-indigo-600 border border-slate-200 text-lg shadow-sm">
                                {editingUser.name[0]}
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-900 leading-tight">{editingUser.name}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{editingUser.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Security Privilege</label>
                            <div className="grid grid-cols-3 gap-3">
                                {["admin", "editor", "viewer"].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setEditingUser({ ...editingUser, role: r })}
                                        className={`px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${editingUser.role === r
                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100"
                                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Endpoint Authorization</label>
                            <div className="space-y-2">
                                {allPages.map((page) => (
                                    <button
                                        key={page.path}
                                        onClick={() => togglePage(page.path)}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
                                            <div className={clsx(
                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                editingUser.allowedPages.includes(page.path)
                                                    ? "bg-indigo-600 border-indigo-600 shadow-sm"
                                                    : "bg-white border-slate-200 group-hover:border-slate-400"
                                            )}>
                                                {editingUser.allowedPages.includes(page.path) && <Check size={14} strokeWidth={4} className="text-white" />}
                                            </div>
                                            {page.label}
                                        </div>
                                        <code className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{page.path}</code>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {feedback && (
                            <div className={clsx(
                                "p-4 rounded-xl text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2",
                                feedback.type === 'success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                            )}>
                                {feedback.message}
                            </div>
                        )}

                        <div className="flex gap-4 pt-6 border-t border-slate-50">
                            <Button
                                variant="secondary"
                                className="flex-1 py-4 rounded-2xl"
                                onClick={() => setEditingUser(null)}
                                disabled={isUpdating}
                            >
                                Discard Changes
                            </Button>
                            <Button
                                className="flex-1 py-4 rounded-2xl shadow-lg shadow-indigo-100"
                                onClick={handleUpdate}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Syncing...</span>
                                    </div>
                                ) : (
                                    "Commit Updates"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
