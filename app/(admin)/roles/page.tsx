"use client";
import React, { useEffect, useState } from "react";
import { rolesApi, Role, CreateRoleDto } from "@/lib/api";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/ui/input/Input";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateRoleDto>({ name: "", description: "", isActive: true });

    useEffect(() => { fetchRoles(); }, []);

    const fetchRoles = async () => {
        try { setRoles(await rolesApi.getAll()); } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) await rolesApi.update(editingRole.id, formData);
            else await rolesApi.create(formData);
            setIsModalOpen(false); setEditingRole(null); setFormData({ name: "", description: "", isActive: true }); fetchRoles();
        } catch (e) { console.error(e); }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({ name: role.name, description: role.description || "", isActive: role.isActive });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingRoleId) return;
        try { await rolesApi.delete(deletingRoleId); setIsDeleteModalOpen(false); setDeletingRoleId(null); fetchRoles(); } catch (e) { console.error(e); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Roles</h1>
                <Button onClick={() => { setEditingRole(null); setFormData({ name: "", description: "", isActive: true }); setIsModalOpen(true); }} startIcon={<PlusIcon />}>Add Role</Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Permissions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {roles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{role.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{role.description || "—"}</td>
                                    <td className="px-6 py-4"><Badge color="info">{role.permissions?.length || 0}</Badge></td>
                                    <td className="px-6 py-4"><Badge color={role.isActive ? "success" : "error"}>{role.isActive ? "Active" : "Inactive"}</Badge></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(role)} className="p-1.5 text-gray-500 hover:text-brand-500"><EditIcon className="w-4 h-4" /></button>
                                            <button onClick={() => { setDeletingRoleId(role.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-error-500"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{editingRole ? "Edit Role" : "Add Role"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:text-white" rows={3} value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Active</label>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1">{editingRole ? "Update" : "Create"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Delete Role</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This will also delete all associated permissions.</p>
                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="flex-1">Cancel</Button>
                            <Button type="button" variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
