"use client";
import React, { useEffect, useState } from "react";
import { permissionsApi, rolesApi, Permission, Role, CreatePermissionDto, HttpMethod } from "@/lib/api";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/ui/input/Input";
import Select from "@/components/ui/select/Select";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PATCH", "PUT", "DELETE", "ALL"];

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRoleId, setFilterRoleId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
    const [deletingPermId, setDeletingPermId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreatePermissionDto>({
        roleId: "", apiRoute: "", httpMethod: "ALL", isPublic: false, isAllowed: true, description: "",
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [perms, r] = await Promise.all([permissionsApi.getAll(), rolesApi.getAll()]);
            setPermissions(perms); setRoles(r);
            if (r.length > 0 && !formData.roleId) setFormData(f => ({ ...f, roleId: r[0].id }));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchPermissions = async () => {
        try {
            const perms = filterRoleId ? await permissionsApi.getByRoleId(filterRoleId) : await permissionsApi.getAll();
            setPermissions(perms);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { if (!loading) fetchPermissions(); }, [filterRoleId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPerm) await permissionsApi.update(editingPerm.id, formData);
            else await permissionsApi.create(formData);
            setIsModalOpen(false); setEditingPerm(null); fetchPermissions();
        } catch (e) { console.error(e); }
    };

    const handleEdit = (perm: Permission) => {
        setEditingPerm(perm);
        setFormData({ roleId: perm.roleId, apiRoute: perm.apiRoute, httpMethod: perm.httpMethod, isPublic: perm.isPublic, isAllowed: perm.isAllowed, description: perm.description || "" });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingPermId) return;
        try { await permissionsApi.delete(deletingPermId); setIsDeleteModalOpen(false); setDeletingPermId(null); fetchPermissions(); } catch (e) { console.error(e); }
    };

    const methodColor = (m: string) => {
        switch (m) { case "GET": return "success"; case "POST": return "info"; case "PATCH": case "PUT": return "warning"; case "DELETE": return "error"; default: return "light"; }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Permissions</h1>
                <Button onClick={() => { setEditingPerm(null); setFormData({ roleId: roles[0]?.id || "", apiRoute: "", httpMethod: "ALL", isPublic: false, isAllowed: true, description: "" }); setIsModalOpen(true); }} startIcon={<PlusIcon />}>Add Permission</Button>
            </div>
            <div className="flex items-center gap-3">
                <label className="text-sm text-gray-500 dark:text-gray-400">Filter by role:</label>
                <select className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white" value={filterRoleId} onChange={(e) => setFilterRoleId(e.target.value)}>
                    <option value="">All Roles</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Route</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Access</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Public</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {permissions.map((perm) => (
                                <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                    <td className="px-6 py-4 text-sm font-mono text-gray-800 dark:text-white/90">{perm.apiRoute}</td>
                                    <td className="px-6 py-4"><Badge color={methodColor(perm.httpMethod)}>{perm.httpMethod}</Badge></td>
                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">{perm.role?.name || roles.find(r => r.id === perm.roleId)?.name || perm.roleId.slice(0, 8)}</td>
                                    <td className="px-6 py-4"><Badge color={perm.isAllowed ? "success" : "error"}>{perm.isAllowed ? "Allowed" : "Denied"}</Badge></td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{perm.isPublic ? "Yes" : "No"}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(perm)} className="p-1.5 text-gray-500 hover:text-brand-500"><EditIcon className="w-4 h-4" /></button>
                                            <button onClick={() => { setDeletingPermId(perm.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-error-500"><TrashIcon className="w-4 h-4" /></button>
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
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{editingPerm ? "Edit Permission" : "Add Permission"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                <Select value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })} options={roles.map(r => ({ value: r.id, label: r.name }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Route</label>
                                <Input value={formData.apiRoute} onChange={(e) => setFormData({ ...formData, apiRoute: e.target.value })} placeholder="/api/resource" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HTTP Method</label>
                                <Select value={formData.httpMethod} onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value as HttpMethod })} options={HTTP_METHODS.map(m => ({ value: m, label: m }))} />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={formData.isAllowed} onChange={(e) => setFormData({ ...formData, isAllowed: e.target.checked })} /> Allowed</label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} /> Public</label>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><Input value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1">{editingPerm ? "Update" : "Create"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Delete Permission</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Are you sure?</p>
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
