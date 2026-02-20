"use client";

import React, { useEffect, useState } from "react";
import { inquiriesApi, Inquiry, InquiryStatus } from "@/lib/api";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Select from "@/components/ui/select/Select";
import Input from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal/Modal";
import Button from "@/components/ui/button/Button";

const typeLabels: Record<string, string> = {
    lifetime_purchase: "Lifetime Purchase",
    academic: "Academic",
    custom_quote: "Custom Quote",
    talk_to_sales: "Talk to Sales",
};

const typeColors: Record<string, "primary" | "success" | "warning" | "error" | "light"> = {
    lifetime_purchase: "primary",
    academic: "success",
    custom_quote: "warning",
    talk_to_sales: "light",
};

const statusColors: Record<string, "warning" | "primary" | "success" | "light"> = {
    new: "warning",
    contacted: "primary",
    closed: "success",
};

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchInquiries = async () => {
        try {
            const data = await inquiriesApi.getAll();
            if (Array.isArray(data)) {
                setInquiries(data);
            } else {
                setInquiries([]);
            }
        } catch (error) {
            console.error("Failed to fetch inquiries:", error);
            setInquiries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
        try {
            await inquiriesApi.updateStatus(id, newStatus);
            fetchInquiries();
            if (selectedInquiry?.id === id) {
                setSelectedInquiry({ ...selectedInquiry, status: newStatus });
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const filteredInquiries = inquiries.filter((inq) => {
        const matchesSearch =
            !search ||
            inq.name.toLowerCase().includes(search.toLowerCase()) ||
            inq.email.toLowerCase().includes(search.toLowerCase()) ||
            (inq.organization && inq.organization.toLowerCase().includes(search.toLowerCase()));
        const matchesType = !typeFilter || inq.type === typeFilter;
        const matchesStatus = !statusFilter || inq.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const openDetail = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setIsDetailOpen(true);
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
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                    Inquiries
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    View and manage customer inquiries
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                    <Input
                        placeholder="Search by name, email, or organization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={[
                        { value: "", label: "All Types" },
                        { value: "lifetime_purchase", label: "Lifetime Purchase" },
                        { value: "academic", label: "Academic" },
                        { value: "custom_quote", label: "Custom Quote" },
                        { value: "talk_to_sales", label: "Talk to Sales" },
                    ]}
                />
                <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                        { value: "", label: "All Status" },
                        { value: "new", label: "New" },
                        { value: "contacted", label: "Contacted" },
                        { value: "closed", label: "Closed" },
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
                                    Name
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Email
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Type
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
                                    Date
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
                            {filteredInquiries.map((inquiry) => (
                                <TableRow key={inquiry.id}>
                                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90">
                                        <div>
                                            <p className="font-medium">{inquiry.name}</p>
                                            {inquiry.organization && (
                                                <p className="text-xs text-gray-400 mt-0.5">{inquiry.organization}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {inquiry.email}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <Badge size="sm" color={typeColors[inquiry.type] || "light"}>
                                            {typeLabels[inquiry.type] || inquiry.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <Badge size="sm" color={statusColors[inquiry.status] || "light"}>
                                            {inquiry.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {new Date(inquiry.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <button
                                            onClick={() => openDetail(inquiry)}
                                            className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                                        >
                                            View
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredInquiries.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No inquiries found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                className="max-w-lg mx-4"
            >
                {selectedInquiry && (
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                    Inquiry Details
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    Submitted on {new Date(selectedInquiry.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <Badge size="sm" color={statusColors[selectedInquiry.status] || "light"}>
                                {selectedInquiry.status}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Name</label>
                                    <p className="text-gray-800 dark:text-white/90 mt-1">{selectedInquiry.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                                    <p className="text-gray-800 dark:text-white/90 mt-1">
                                        <a href={`mailto:${selectedInquiry.email}`} className="text-brand-500 hover:underline">
                                            {selectedInquiry.email}
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {selectedInquiry.phone && (
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</label>
                                    <p className="text-gray-800 dark:text-white/90 mt-1">{selectedInquiry.phone}</p>
                                </div>
                            )}

                            {selectedInquiry.organization && (
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</label>
                                    <p className="text-gray-800 dark:text-white/90 mt-1">{selectedInquiry.organization}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Type</label>
                                    <div className="mt-1">
                                        <Badge size="sm" color={typeColors[selectedInquiry.type] || "light"}>
                                            {typeLabels[selectedInquiry.type] || selectedInquiry.type}
                                        </Badge>
                                    </div>
                                </div>
                                {selectedInquiry.planSlug && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</label>
                                        <p className="text-gray-800 dark:text-white/90 mt-1">{selectedInquiry.planSlug}</p>
                                    </div>
                                )}
                            </div>

                            {selectedInquiry.message && (
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Message</label>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm leading-relaxed bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/10">
                                        {selectedInquiry.message}
                                    </p>
                                </div>
                            )}

                            {/* Status Update */}
                            <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">Update Status</label>
                                <div className="flex gap-2">
                                    {(["new", "contacted", "closed"] as InquiryStatus[]).map((status) => (
                                        <Button
                                            key={status}
                                            size="sm"
                                            variant={selectedInquiry.status === status ? "primary" : "secondary"}
                                            onClick={() => handleStatusChange(selectedInquiry.id, status)}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button
                                variant="secondary"
                                onClick={() => setIsDetailOpen(false)}
                                className="flex-1"
                            >
                                Close
                            </Button>
                            <a
                                href={`mailto:${selectedInquiry.email}`}
                                className="flex-1"
                            >
                                <Button className="w-full">
                                    Reply via Email
                                </Button>
                            </a>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
