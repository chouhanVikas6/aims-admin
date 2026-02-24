"use client";

import React, { useEffect, useState } from "react";
import { usersApi, keysApi, otpsApi, devicesApi } from "@/lib/api";
import { UsersIcon, KeyIcon, OtpIcon, DeviceIcon } from "@/icons";

interface Stats {
    users: number;
    keys: number;
    otps: number;
    devices: number;
}

const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}> = ({ title, value, icon, color }) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {title}
                    </span>
                    <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                        {value}
                    </h4>
                </div>
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        users: 0,
        keys: 0,
        otps: 0,
        devices: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const extractCount = (response: unknown): number => {
                    if (Array.isArray(response)) return response.length;
                    if (response && typeof response === 'object' && 'meta' in response) {
                        return (response as { meta: { total: number } }).meta.total;
                    }
                    if (response && typeof response === 'object' && 'data' in response) {
                        return (response as { data: unknown[] }).data.length;
                    }
                    return 0;
                };

                const [users, keys, otps, devices] = await Promise.all([
                    usersApi.getAll().catch(() => []),
                    keysApi.getAll().catch(() => []),
                    otpsApi.getAll().catch(() => []),
                    devicesApi.getAll().catch(() => []),
                ]);

                setStats({
                    users: extractCount(users),
                    keys: extractCount(keys),
                    otps: extractCount(otps),
                    devices: extractCount(devices),
                });
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

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
                    Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Welcome to AIMS Admin Panel
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={<UsersIcon className="h-6 w-6 text-white" />}
                    color="bg-brand-500"
                />
                <StatCard
                    title="Total Keys"
                    value={stats.keys}
                    icon={<KeyIcon className="h-6 w-6 text-white" />}
                    color="bg-success-500"
                />
                <StatCard
                    title="Total OTPs"
                    value={stats.otps}
                    icon={<OtpIcon className="h-6 w-6 text-white" />}
                    color="bg-warning-500"
                />
                <StatCard
                    title="Total Devices"
                    value={stats.devices}
                    icon={<DeviceIcon className="h-6 w-6 text-white" />}
                    color="bg-blue-light-500"
                />
            </div>
        </div>
    );
}
