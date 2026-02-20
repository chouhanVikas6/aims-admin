"use client";

import React, { useEffect, useState } from "react";
import { keysApi, Key, CreateKeyDto, UpdateKeyDto } from "@/lib/api";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import Input from "@/components/ui/input/Input";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";

export default function KeysPage() {
    const [keys, setKeys] = useState<Key[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<Key | null>(null);
    const [deletingKey, setDeletingKey] = useState<Key | null>(null);
    const [formData, setFormData] = useState<CreateKeyDto>({
        key: "",
        startsAt: "",
        expiresAt: "",
    });

    const fetchKeys = async () => {
        try {
            const data = await keysApi.getAll();
            setKeys(data);
        } catch (error) {
            console.error("Failed to fetch keys:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingKey) {
                await keysApi.update(editingKey.id, formData as UpdateKeyDto);
            } else {
                await keysApi.create(formData);
            }
            setIsModalOpen(false);
            setEditingKey(null);
            setFormData({ key: "", startsAt: "", expiresAt: "" });
            fetchKeys();
        } catch (error) {
            console.error("Failed to save key:", error);
        }
    };

    const handleEdit = (key: Key) => {
        setEditingKey(key);
        setFormData({
            key: key.key,
            startsAt: key.startsAt.slice(0, 16),
            expiresAt: key.expiresAt.slice(0, 16),
        });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingKey) return;
        try {
            await keysApi.delete(deletingKey.id);
            setIsDeleteModalOpen(false);
            setDeletingKey(null);
            fetchKeys();
        } catch (error) {
            console.error("Failed to delete key:", error);
        }
    };

    const openAddModal = () => {
        setEditingKey(null);
        setFormData({ key: crypto.randomUUID(), startsAt: "", expiresAt: "" });
        setIsModalOpen(true);
    };

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                        Keys
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage license keys
                    </p>
                </div>
                <Button onClick={openAddModal} startIcon={<PlusIcon />}>
                    Add Key
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Key
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Starts At
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Expires At
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Status
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Created At
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {keys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 font-mono">
                                        {key.key.slice(0, 20)}...
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {new Date(key.startsAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {new Date(key.expiresAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <Badge
                                            size="sm"
                                            color={isExpired(key.expiresAt) ? "error" : "success"}
                                        >
                                            {isExpired(key.expiresAt) ? "Expired" : "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {new Date(key.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(key)}
                                                className="p-2 text-gray-500 hover:text-brand-500 dark:text-gray-400"
                                            >
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeletingKey(key);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-2 text-gray-500 hover:text-error-500 dark:text-gray-400"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {keys.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No keys found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                className="max-w-md mx-4"
            >
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                        {editingKey ? "Edit Key" : "Add Key"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Key"
                            value={formData.key}
                            onChange={(e) =>
                                setFormData({ ...formData, key: e.target.value })
                            }
                            required
                            readOnly
                            className="bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <Input
                            label="Starts At"
                            type="datetime-local"
                            value={formData.startsAt}
                            onChange={(e) =>
                                setFormData({ ...formData, startsAt: e.target.value })
                            }
                            required
                        />
                        <Input
                            label="Expires At"
                            type="datetime-local"
                            value={formData.expiresAt}
                            onChange={(e) =>
                                setFormData({ ...formData, expiresAt: e.target.value })
                            }
                            required
                        />
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1">
                                {editingKey ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                className="max-w-sm mx-4"
            >
                <div className="p-6 text-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
                        Delete Key
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Are you sure you want to delete this key? This action cannot be
                        undone.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete} className="flex-1">
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
