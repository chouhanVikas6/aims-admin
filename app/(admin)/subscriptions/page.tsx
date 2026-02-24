"use client";
import React, { useEffect, useState } from "react";
import { subscriptionsApi, Subscription } from "@/lib/api";
import Badge from "@/components/ui/badge/Badge";

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

    useEffect(() => { fetchSubscriptions(); }, []);

    const fetchSubscriptions = async () => {
        try {
            const data = await subscriptionsApi.getAll();
            setSubscriptions(data);
        } catch (error) {
            console.error("Failed to fetch subscriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "active": return "success";
            case "expired": return "error";
            case "cancelled": return "warning";
            default: return "light";
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Subscriptions</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">{subscriptions.length} total</span>
            </div>

            {/* Detail Modal */}
            {selectedSub && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => setSelectedSub(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Subscription Details</h2>
                            <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">ID</span><span className="text-gray-800 dark:text-white font-mono text-xs">{selectedSub.id}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Status</span><Badge color={statusColor(selectedSub.status)}>{selectedSub.status}</Badge></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">User</span><span className="text-gray-800 dark:text-white">{selectedSub.user?.name || selectedSub.userId}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Plan</span><span className="text-gray-800 dark:text-white">{selectedSub.plan?.name || selectedSub.planId}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Max Devices</span><span className="text-gray-800 dark:text-white">{selectedSub.maxDevices}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Starts</span><span className="text-gray-800 dark:text-white">{new Date(selectedSub.startsAt).toLocaleDateString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Expires</span><span className="text-gray-800 dark:text-white">{selectedSub.expiresAt ? new Date(selectedSub.expiresAt).toLocaleDateString() : "Never"}</span></div>
                            {selectedSub.key && <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Key</span><span className="text-gray-800 dark:text-white font-mono text-xs">{selectedSub.key.key || selectedSub.keyId}</span></div>}
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Created</span><span className="text-gray-800 dark:text-white">{new Date(selectedSub.createdAt).toLocaleString()}</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Devices</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {subscriptions.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">No subscriptions found</td></tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">{sub.user?.name || sub.userId.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">{sub.plan?.name || sub.planId.slice(0, 8)}</td>
                                        <td className="px-6 py-4"><Badge color={statusColor(sub.status)}>{sub.status}</Badge></td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(sub.startsAt).toLocaleDateString()} — {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : "∞"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">{sub.maxDevices}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => setSelectedSub(sub)} className="text-brand-500 hover:text-brand-600 text-sm font-medium">View</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
