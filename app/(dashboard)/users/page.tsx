"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableRow, TableCell } from "@/components/Table";
import { Button } from "@/components/UI";
import Modal from "@/components/Modal";
import { Users, Shield, Check, ShieldCheck, ShieldAlert, Mail, Settings } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "@/components/AuthProvider";

const allPages = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Inventory", path: "/inventory", icon: "📦" },
    { label: "Sales", path: "/sales", icon: "🛒" },
    { label: "Reports", path: "/reports", icon: "📈" },
    { label: "Users", path: "/users", icon: "👥" },
];

const roleColors = {
    admin: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500" },
    editor: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", icon: "text-indigo-500" },
    viewer: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", icon: "text-slate-400" },
};

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

            setFeedback({ type: 'success', message: `Permissions updated successfully!` });

            setTimeout(() => {
                setEditingUser(null);
                setFeedback(null);
                setIsUpdating(false);
            }, 1500);

        } catch (error: any) {
            console.error("Update failed:", error);
            setFeedback({ type: 'error', message: error.message || "Failed to update permissions." });
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

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "admin": return <ShieldCheck size={18} />;
            case "editor": return <Shield size={18} />;
            default: return <ShieldAlert size={18} />;
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                    <Users size={24} />
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">User Management</h2>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Control system access & permissions</p>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
                {users?.map((user) => {
                    const colors = roleColors[user.role as keyof typeof roleColors] || roleColors.viewer;
                    return (
                        <div key={user._id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-slate-100 uppercase text-sm flex-shrink-0">
                                    {user.name?.[0] || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate">{user.name || "Unknown"}</h3>
                                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                        <Mail size={12} />
                                        {user.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEditingUser(user)}
                                    className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    <Settings size={16} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                                    colors.bg, colors.border
                                )}>
                                    <span className={colors.icon}>{getRoleIcon(user.role || "viewer")}</span>
                                    <span className={clsx("text-xs font-black uppercase", colors.text)}>
                                        {user.role || "viewer"}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    {(user.allowedPages || []).slice(0, 3).map((page: string) => (
                                        <span key={page} className="text-[9px] px-2 py-1 bg-slate-50 border border-slate-100 rounded text-slate-500 font-bold uppercase">
                                            {page.split("/")[1]?.substring(0, 3)}
                                        </span>
                                    ))}
                                    {(user.allowedPages || []).length > 3 && (
                                        <span className="text-[9px] px-2 py-1 bg-slate-50 border border-slate-100 rounded text-slate-500 font-bold">
                                            +{(user.allowedPages || []).length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
                <Table headers={[
                    "User",
                    { label: "Email", className: "hidden md:table-cell" },
                    "Role",
                    { label: "Access", className: "hidden lg:table-cell" },
                    { label: "Actions", className: "text-right" }
                ]}>
                    {users?.map((user) => {
                        const colors = roleColors[user.role as keyof typeof roleColors] || roleColors.viewer;
                        return (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-slate-100 uppercase text-xs flex-shrink-0">
                                            {user.name?.[0] || "?"}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold text-slate-900 truncate">{user.name || "Unknown"}</div>
                                            <div className="text-[10px] text-slate-400 truncate md:hidden">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-slate-500 hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-slate-400" />
                                        {user.email}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={clsx(
                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                                        colors.bg, colors.border
                                    )}>
                                        <span className={colors.icon}>{getRoleIcon(user.role || "viewer")}</span>
                                        <span className={clsx("text-xs font-black uppercase tracking-wider", colors.text)}>
                                            {user.role || "viewer"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <div className="flex flex-wrap gap-1.5">
                                        {(user.allowedPages || []).map((page: string) => (
                                            <span key={page} className="text-[9px] px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-slate-600 font-bold uppercase tracking-wider">
                                                {page.split("/")[1]}
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="secondary"
                                        className="px-4 py-2 text-xs font-bold rounded-xl"
                                        onClick={() => setEditingUser(user)}
                                    >
                                        <Settings size={14} />
                                        <span className="hidden md:inline">Configure</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </Table>
            </div>

            {(!users || users.length === 0) && (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                    <Users size={48} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No users found</h3>
                    <p className="text-sm text-slate-500">Users will appear here once registered</p>
                </div>
            )}

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title="User Configuration"
            >
                {editingUser && (
                    <div className="space-y-6">
                        {/* User Info */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-indigo-600 border border-slate-200 text-xl shadow-sm">
                                {editingUser.name[0]}
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-900 leading-tight">{editingUser.name}</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">{editingUser.email}</p>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Security Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["admin", "editor", "viewer"] as const).map((r) => {
                                    const colors = roleColors[r];
                                    const isSelected = editingUser.role === r;
                                    return (
                                        <button
                                            key={r}
                                            onClick={() => setEditingUser({ ...editingUser, role: r })}
                                            className={clsx(
                                                "px-4 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all",
                                                isSelected
                                                    ? `${colors.bg} ${colors.border} ${colors.text} shadow-sm`
                                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className={isSelected ? colors.icon : "text-slate-300"}>
                                                    {getRoleIcon(r)}
                                                </span>
                                                {r}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Page Access */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Page Access</label>
                            <div className="space-y-2">
                                {allPages.map((page) => {
                                    const isAllowed = editingUser.allowedPages.includes(page.path);
                                    return (
                                        <button
                                            key={page.path}
                                            onClick={() => togglePage(page.path)}
                                            className={clsx(
                                                "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                                                isAllowed
                                                    ? "bg-indigo-50 border-indigo-200"
                                                    : "bg-white border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{page.icon}</span>
                                                <span className={clsx(
                                                    "font-bold text-sm",
                                                    isAllowed ? "text-indigo-700" : "text-slate-600"
                                                )}>
                                                    {page.label}
                                                </span>
                                            </div>
                                            <div className={clsx(
                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                isAllowed
                                                    ? "bg-indigo-600 border-indigo-600"
                                                    : "bg-white border-slate-200"
                                            )}>
                                                {isAllowed && <Check size={14} strokeWidth={3} className="text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Feedback */}
                        {feedback && (
                            <div className={clsx(
                                "p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2",
                                feedback.type === 'success'
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-rose-50 text-rose-600 border border-rose-100"
                            )}>
                                {feedback.message}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <Button
                                variant="secondary"
                                className="flex-1 py-3 rounded-xl"
                                onClick={() => setEditingUser(null)}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 py-3 rounded-xl"
                                onClick={handleUpdate}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
