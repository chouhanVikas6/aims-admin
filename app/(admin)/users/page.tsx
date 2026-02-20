"use client";

import React, { useEffect, useState } from "react";
import { usersApi, User, CreateUserDto, UpdateUserDto } from "@/lib/api";
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

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<CreateUserDto>({
        email: "",
        name: "",
        role: "user",
        status: "active",
    });
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchUsers = async () => {
        try {
            const response = await usersApi.getAll({
                search,
                role: roleFilter,
                status: statusFilter,
            });
            // Handle both paginated result (response.data) and direct array
            if (Array.isArray(response)) {
                setUsers(response);
            } else if (response && Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.error("Unexpected response format:", response);
                setUsers([]);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, roleFilter, statusFilter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await usersApi.update(editingUser.id, formData as UpdateUserDto);
            } else {
                await usersApi.create(formData);
            }
            setIsModalOpen(false);
            setEditingUser(null);
            setFormData({ email: "", name: "", role: "user", status: "active" });
            fetchUsers();
        } catch (error) {
            console.error("Failed to save user:", error);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingUser) return;
        try {
            await usersApi.delete(deletingUser.id);
            setIsDeleteModalOpen(false);
            setDeletingUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ email: "", name: "", role: "user", status: "active" });
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
                        Users
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage user accounts
                    </p>
                </div>
                <Button onClick={openAddModal} startIcon={<PlusIcon />}>
                    Add User
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    options={[
                        { value: "", label: "All Roles" },
                        { value: "admin", label: "Admin" },
                        { value: "user", label: "User" },
                    ]}
                />
                <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                        { value: "", label: "All Status" },
                        { value: "active", label: "Active" },
                        { value: "locked", label: "Locked" },
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
                                    Role
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
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90">
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {user.email}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <Badge
                                            size="sm"
                                            color={user.role === "admin" ? "primary" : "light"}
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <Badge
                                            size="sm"
                                            color={user.status === "active" ? "success" : "error"}
                                        >
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-gray-500 hover:text-brand-500 dark:text-gray-400"
                                            >
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeletingUser(user);
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
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No users found
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
                        {editingUser ? "Edit User" : "Add User"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                        <Select
                            label="Role"
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value as "admin" | "user",
                                })
                            }
                            options={[
                                { value: "user", label: "User" },
                                { value: "admin", label: "Admin" },
                            ]}
                        />
                        <Select
                            label="Status"
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.value as "active" | "locked",
                                })
                            }
                            options={[
                                { value: "active", label: "Active" },
                                { value: "locked", label: "Locked" },
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
                                {editingUser ? "Update" : "Create"}
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
                        Delete User
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Are you sure you want to delete {deletingUser?.name}? This action
                        cannot be undone.
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
