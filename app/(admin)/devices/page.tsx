"use client";

import React, { useEffect, useState } from "react";
import {
    devicesApi,
    usersApi,
    keysApi,
    Device,
    User,
    Key,
    CreateDeviceDto,
    UpdateDeviceDto,
} from "@/lib/api";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import Input from "@/components/ui/input/Input";
import Select from "@/components/ui/select/Select";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";

export default function DevicesPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [keys, setKeys] = useState<Key[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
    const [formData, setFormData] = useState<CreateDeviceDto>({
        fingerprint: "",
        userId: "",
        tagName: "",
        keyId: "",
    });
    const [search, setSearch] = useState("");
    const [userFilter, setUserFilter] = useState("");

    const fetchData = async () => {
        try {
            const [devicesData, usersData, keysData] = await Promise.all([
                devicesApi.getAll({ search, userId: userFilter }),
                usersApi.getAll().catch(() => []),
                keysApi.getAll().catch(() => []),
            ]);

            // Helper to extract data from response
            const extractData = (response: any) => {
                if (Array.isArray(response)) return response;
                if (response && Array.isArray(response.data)) return response.data;
                return [];
            };

            setDevices(extractData(devicesData));
            setUsers(extractData(usersData));
            setKeys(extractData(keysData));
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, userFilter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                userId: formData.userId || undefined,
                keyId: formData.keyId || undefined,
            };
            if (editingDevice) {
                await devicesApi.update(editingDevice.id, data as UpdateDeviceDto);
            } else {
                await devicesApi.create(data);
            }
            setIsModalOpen(false);
            setEditingDevice(null);
            setFormData({ fingerprint: "", userId: "", tagName: "", keyId: "" });
            fetchData();
        } catch (error) {
            console.error("Failed to save device:", error);
        }
    };

    const handleEdit = (device: Device) => {
        setEditingDevice(device);
        setFormData({
            fingerprint: device.fingerprint,
            userId: device.userId || "",
            tagName: device.tagName || "",
            keyId: device.keyId || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingDevice) return;
        try {
            await devicesApi.delete(deletingDevice.id);
            setIsDeleteModalOpen(false);
            setDeletingDevice(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete device:", error);
        }
    };

    const openAddModal = () => {
        setEditingDevice(null);
        setFormData({ fingerprint: "", userId: "", tagName: "", keyId: "" });
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                        Devices
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage registered devices
                    </p>
                </div>
                <Button onClick={openAddModal} startIcon={<PlusIcon />}>
                    Add Device
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                    <Input
                        placeholder="Search devices..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    options={[
                        { value: "", label: "All Users" },
                        ...users.map((user) => ({
                            value: user.id,
                            label: user.name,
                        })),
                    ]}
                />
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
                                    Fingerprint
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Tag Name
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    User
                                </TableCell>
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
                            {devices.map((device) => (
                                <TableRow key={device.id}>
                                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 font-mono">
                                        {device.fingerprint}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {device.tagName || "-"}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {device.user?.name || device.userId || "-"}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 font-mono">
                                        {device.key?.key?.slice(0, 15) || device.keyId?.slice(0, 15) || "-"}
                                        {(device.key?.key || device.keyId) && "..."}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {new Date(device.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(device)}
                                                className="p-2 text-gray-500 hover:text-brand-500 dark:text-gray-400"
                                            >
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeletingDevice(device);
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
                            {devices.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No devices found
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
                        {editingDevice ? "Edit Device" : "Add Device"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Fingerprint"
                            value={formData.fingerprint}
                            onChange={(e) =>
                                setFormData({ ...formData, fingerprint: e.target.value })
                            }
                            required
                        />
                        <Input
                            label="Tag Name"
                            value={formData.tagName}
                            onChange={(e) =>
                                setFormData({ ...formData, tagName: e.target.value })
                            }
                        />
                        <Select
                            label="User"
                            value={formData.userId || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, userId: e.target.value })
                            }
                            required
                            options={[
                                { value: "", label: "Select User" },
                                ...users.map((user) => ({
                                    value: user.id,
                                    label: `${user.name} (${user.email})`,
                                })),
                            ]}
                        />
                        <Select
                            label="Key (Optional)"
                            value={formData.keyId || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, keyId: e.target.value })
                            }
                            options={[
                                { value: "", label: "None" },
                                ...keys.map((key) => ({
                                    value: key.id,
                                    label: key.key.slice(0, 30) + "...",
                                })),
                            ]}
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
                                {editingDevice ? "Update" : "Create"}
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
                        Delete Device
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Are you sure you want to delete this device? This action cannot be
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
