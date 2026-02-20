"use client";

import React, { useEffect, useState } from "react";
import { otpsApi, Otp, CreateOtpDto, UpdateOtpDto } from "@/lib/api";
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
import Select from "@/components/ui/select/Select";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";

export default function OtpsPage() {
    const [otps, setOtps] = useState<Otp[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingOtp, setEditingOtp] = useState<Otp | null>(null);
    const [deletingOtp, setDeletingOtp] = useState<Otp | null>(null);
    const [formData, setFormData] = useState<CreateOtpDto>({
        otp: "",
        provider: "email",
        expiry: "",
    });

    const fetchOtps = async () => {
        try {
            const data = await otpsApi.getAll();
            setOtps(data);
        } catch (error) {
            console.error("Failed to fetch OTPs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOtps();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingOtp) {
                await otpsApi.update(editingOtp.id, formData as UpdateOtpDto);
            } else {
                await otpsApi.create(formData);
            }
            setIsModalOpen(false);
            setEditingOtp(null);
            setFormData({ otp: "", provider: "email", expiry: "" });
            fetchOtps();
        } catch (error) {
            console.error("Failed to save OTP:", error);
        }
    };

    const handleEdit = (otp: Otp) => {
        setEditingOtp(otp);
        setFormData({
            otp: otp.otp,
            provider: otp.provider,
            expiry: otp.expiry.slice(0, 16),
        });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingOtp) return;
        try {
            await otpsApi.delete(deletingOtp.id);
            setIsDeleteModalOpen(false);
            setDeletingOtp(null);
            fetchOtps();
        } catch (error) {
            console.error("Failed to delete OTP:", error);
        }
    };

    const openAddModal = () => {
        setEditingOtp(null);
        setFormData({ otp: "", provider: "email", expiry: "" });
        setIsModalOpen(true);
    };

    const isExpired = (expiry: string) => new Date(expiry) < new Date();

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
                        OTPs
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage one-time passwords
                    </p>
                </div>
                <Button onClick={openAddModal} startIcon={<PlusIcon />}>
                    Add OTP
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
                                    OTP
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Provider
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Used
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Expiry
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
                            {otps.map((otp) => (
                                <TableRow key={otp.id}>
                                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 font-mono">
                                        {otp.otp}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <Badge
                                            size="sm"
                                            color={otp.provider === "email" ? "info" : "warning"}
                                        >
                                            {otp.provider}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <Badge
                                            size="sm"
                                            color={otp.isUsed ? "light" : "success"}
                                        >
                                            {otp.isUsed ? "Used" : "Unused"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {new Date(otp.expiry).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <Badge
                                            size="sm"
                                            color={isExpired(otp.expiry) ? "error" : "success"}
                                        >
                                            {isExpired(otp.expiry) ? "Expired" : "Valid"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {new Date(otp.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(otp)}
                                                className="p-2 text-gray-500 hover:text-brand-500 dark:text-gray-400"
                                            >
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeletingOtp(otp);
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
                            {otps.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No OTPs found
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
                        {editingOtp ? "Edit OTP" : "Add OTP"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="OTP"
                            value={formData.otp}
                            onChange={(e) =>
                                setFormData({ ...formData, otp: e.target.value })
                            }
                            required
                        />
                        <Select
                            label="Provider"
                            value={formData.provider}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    provider: e.target.value as "phone" | "email",
                                })
                            }
                            options={[
                                { value: "email", label: "Email" },
                                { value: "phone", label: "Phone" },
                            ]}
                        />
                        <Input
                            label="Expiry"
                            type="datetime-local"
                            value={formData.expiry}
                            onChange={(e) =>
                                setFormData({ ...formData, expiry: e.target.value })
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
                                {editingOtp ? "Update" : "Create"}
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
                        Delete OTP
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Are you sure you want to delete this OTP? This action cannot be
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
