"use client";
import React, { useEffect, useState } from "react";
import { ordersApi, Order } from "@/lib/api";
import Badge from "@/components/ui/badge/Badge";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await ordersApi.getAll();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "paid": return "success";
            case "pending": return "warning";
            case "failed": return "error";
            case "refunded": return "info";
            default: return "light";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Orders</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">{orders.length} total</span>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Order Details</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Order ID</span><span className="text-gray-800 dark:text-white font-mono text-xs">{selectedOrder.id}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Status</span><Badge color={statusColor(selectedOrder.status)}>{selectedOrder.status}</Badge></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">User</span><span className="text-gray-800 dark:text-white">{selectedOrder.user?.name || selectedOrder.userId}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Plan</span><span className="text-gray-800 dark:text-white">{selectedOrder.plan?.name || selectedOrder.planId}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Amount</span><span className="text-gray-800 dark:text-white">₹{selectedOrder.amount}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">GST</span><span className="text-gray-800 dark:text-white">₹{selectedOrder.gstAmount}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Total</span><span className="text-gray-800 dark:text-white font-semibold">₹{selectedOrder.totalAmount}</span></div>
                            {selectedOrder.invoiceNumber && <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Invoice</span><span className="text-gray-800 dark:text-white">{selectedOrder.invoiceNumber}</span></div>}
                            {selectedOrder.razorpayPaymentId && <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Razorpay ID</span><span className="text-gray-800 dark:text-white font-mono text-xs">{selectedOrder.razorpayPaymentId}</span></div>}
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Created</span><span className="text-gray-800 dark:text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {orders.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">No orders found</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">{order.user?.name || order.userId.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">{order.plan?.name || order.planId.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90 font-medium">₹{order.totalAmount}</td>
                                        <td className="px-6 py-4"><Badge color={statusColor(order.status)}>{order.status}</Badge></td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => setSelectedOrder(order)} className="text-brand-500 hover:text-brand-600 text-sm font-medium">View</button>
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
