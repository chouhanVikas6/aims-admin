"use client";
import React, { useEffect, useState } from "react";
import { plansApi, Plan, CreatePlanDto, PlanCategory } from "@/lib/api";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/ui/input/Input";
import Select from "@/components/ui/select/Select";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreatePlanDto>({
        name: "", slug: "", category: "professional" as PlanCategory, price: 0,
        currency: "INR", durationDays: 30, maxDevices: 1, features: [],
        isActive: true, requiresApproval: false, description: "", targetAudience: "",
    });
    const [featuresInput, setFeaturesInput] = useState("");

    useEffect(() => { fetchPlans(); }, []);

    const fetchPlans = async () => {
        try {
            const data = await plansApi.getAll();
            setPlans(data);
        } catch (error) {
            console.error("Failed to fetch plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, features: featuresInput.split("\n").map(f => f.trim()).filter(Boolean) };
            if (editingPlan) {
                await plansApi.update(editingPlan.id, payload);
            } else {
                await plansApi.create(payload);
            }
            setIsModalOpen(false);
            resetForm();
            fetchPlans();
        } catch (error) {
            console.error("Failed to save plan:", error);
        }
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name, slug: plan.slug, category: plan.category, price: plan.price,
            currency: plan.currency, durationDays: plan.durationDays, maxDevices: plan.maxDevices,
            features: plan.features, isActive: plan.isActive, requiresApproval: plan.requiresApproval,
            description: plan.description || "", targetAudience: plan.targetAudience || "",
        });
        setFeaturesInput(plan.features.join("\n"));
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingPlanId) return;
        try {
            await plansApi.delete(deletingPlanId);
            setIsDeleteModalOpen(false);
            setDeletingPlanId(null);
            fetchPlans();
        } catch (error) {
            console.error("Failed to delete plan:", error);
        }
    };

    const resetForm = () => {
        setEditingPlan(null);
        setFormData({ name: "", slug: "", category: "professional", price: 0, currency: "INR", durationDays: 30, maxDevices: 1, features: [], isActive: true, requiresApproval: false, description: "", targetAudience: "" });
        setFeaturesInput("");
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Plans</h1>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }} startIcon={<PlusIcon />}>Add Plan</Button>
            </div>

            {/* Plans Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {plans.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">No plans found</td></tr>
                            ) : (
                                plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-800 dark:text-white/90">{plan.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{plan.slug}</div>
                                        </td>
                                        <td className="px-6 py-4"><Badge color="info">{plan.category}</Badge></td>
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90 font-medium">₹{plan.price}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{plan.durationDays ? `${plan.durationDays} days` : "Lifetime"}</td>
                                        <td className="px-6 py-4"><Badge color={plan.isActive ? "success" : "error"}>{plan.isActive ? "Active" : "Inactive"}</Badge></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleEdit(plan)} className="p-1.5 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"><EditIcon className="w-4 h-4" /></button>
                                                <button onClick={() => { setDeletingPlanId(plan.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{editingPlan ? "Edit Plan" : "Add Plan"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as PlanCategory })} options={[
                                    { value: "professional", label: "Professional" },
                                    { value: "educational", label: "Educational" },
                                    { value: "lifetime", label: "Lifetime" },
                                ]} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                                    <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (days)</label>
                                    <Input type="number" value={formData.durationDays || ""} onChange={(e) => setFormData({ ...formData, durationDays: e.target.value ? parseInt(e.target.value) : undefined })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Devices</label>
                                <Input type="number" value={formData.maxDevices || 1} onChange={(e) => setFormData({ ...formData, maxDevices: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:focus:border-brand-800" rows={2} value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (one per line)</label>
                                <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:focus:border-brand-800" rows={3} value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded border-gray-300 dark:border-gray-700" />
                                    Active
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={formData.requiresApproval} onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })} className="rounded border-gray-300 dark:border-gray-700" />
                                    Requires Approval
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1">{editingPlan ? "Update" : "Create"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Delete Plan</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Are you sure you want to delete this plan? This action cannot be undone.</p>
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
