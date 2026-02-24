import { encryptPayload, decryptPayload } from "./crypto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body } = options;

    let requestBody: string | undefined;

    // Encrypt body if present and method is not GET/DELETE (usually)
    // Actually, we can encrypt for any method that has a body
    if (body) {
        if (typeof window !== "undefined") {
            const encrypted = await encryptPayload(body);
            requestBody = JSON.stringify(encrypted);
        } else {
            // Fallback for SSR if needed, or just send plain JSON if backend supports it
            // But backend expects encrypted if we send it...
            // For now, assume client-side only for mutations
            requestBody = JSON.stringify(body);
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies for auth
        body: requestBody,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
            throw new Error("Session expired. Please login again.");
        }

        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses (like DELETE)
    const text = await response.text();
    if (!text) return (null as unknown as T);

    const json = JSON.parse(text);

    // Check for encryption header
    const isEncrypted = response.headers.get("x-encrypted") === "true";
    console.log("API Response - isEncrypted:", isEncrypted, "header value:", response.headers.get("x-encrypted"));

    if (isEncrypted) {
        try {
            const decrypted = await decryptPayload(json);
            console.log("Decrypted response:", decrypted);
            return decrypted as T;
        } catch (err) {
            console.error("Decryption failed:", err, "Raw JSON:", json);
            throw new Error("Failed to decrypt response");
        }
    }

    return json;
}

// Pagination
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

// Users API
export const usersApi = {
    getAll: (params: { page?: number; limit?: number; search?: string; role?: string; status?: string } = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", params.page.toString());
        if (params.limit) query.append("limit", params.limit.toString());
        if (params.search) query.append("search", params.search);
        if (params.role) query.append("role", params.role);
        if (params.status) query.append("status", params.status);
        return apiRequest<PaginatedResult<User>>(`/users?${query.toString()}`);
    },
    getById: (id: string) => apiRequest<User>(`/users/${id}`),
    create: (data: CreateUserDto) => apiRequest<User>("/users", { method: "POST", body: data }),
    update: (id: string, data: UpdateUserDto) => apiRequest<User>(`/users/${id}`, { method: "PATCH", body: data }),
    delete: (id: string) => apiRequest<void>(`/users/${id}`, { method: "DELETE" }),
};

// Keys API
export const keysApi = {
    getAll: () => apiRequest<Key[]>("/keys"),
    getById: (id: string) => apiRequest<Key>(`/keys/${id}`),
    create: (data: CreateKeyDto) => apiRequest<Key>("/keys", { method: "POST", body: data }),
    update: (id: string, data: UpdateKeyDto) => apiRequest<Key>(`/keys/${id}`, { method: "PATCH", body: data }),
    delete: (id: string) => apiRequest<void>(`/keys/${id}`, { method: "DELETE" }),
};

// OTPs API
export const otpsApi = {
    getAll: () => apiRequest<Otp[]>("/otps"),
    getById: (id: string) => apiRequest<Otp>(`/otps/${id}`),
    create: (data: CreateOtpDto) => apiRequest<Otp>("/otps", { method: "POST", body: data }),
    update: (id: string, data: UpdateOtpDto) => apiRequest<Otp>(`/otps/${id}`, { method: "PATCH", body: data }),
    delete: (id: string) => apiRequest<void>(`/otps/${id}`, { method: "DELETE" }),
};

// Devices API
export const devicesApi = {
    getAll: (params: { page?: number; limit?: number; search?: string; userId?: string } = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", params.page.toString());
        if (params.limit) query.append("limit", params.limit.toString());
        if (params.search) query.append("search", params.search);
        if (params.userId) query.append("userId", params.userId);
        return apiRequest<PaginatedResult<Device>>(`/devices?${query.toString()}`);
    },
    getById: (id: string) => apiRequest<Device>(`/devices/${id}`),
    create: (data: CreateDeviceDto) => apiRequest<Device>("/devices", { method: "POST", body: data }),
    update: (id: string, data: UpdateDeviceDto) => apiRequest<Device>(`/devices/${id}`, { method: "PATCH", body: data }),
    delete: (id: string) => apiRequest<void>(`/devices/${id}`, { method: "DELETE" }),
};

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "user";
    status: "active" | "locked";
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDto {
    email: string;
    name: string;
    role?: "admin" | "user";
    status?: "active" | "locked";
}

export interface UpdateUserDto {
    email?: string;
    name?: string;
    role?: "admin" | "user";
    status?: "active" | "locked";
}

export interface Key {
    id: string;
    key: string;
    startsAt: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateKeyDto {
    key: string;
    startsAt: string;
    expiresAt: string;
    keyId?: string; // Optional for when creating device with key
}

export interface UpdateKeyDto {
    key?: string;
    startsAt?: string;
    expiresAt?: string;
}

export interface Otp {
    id: string;
    otp: string;
    provider: "phone" | "email";
    isUsed: boolean;
    expiry: string;
    createdAt: string;
}

export interface CreateOtpDto {
    otp: string;
    provider: "phone" | "email";
    expiry: string;
}

export interface UpdateOtpDto {
    otp?: string;
    provider?: "phone" | "email";
    isUsed?: boolean;
    expiry?: string;
}

export interface Device {
    id: string;
    fingerprint: string;
    userId?: string;
    user?: User;
    tagName?: string;
    keyId?: string;
    key?: Key;
    createdAt: string;
    updatedAt: string;
    key_id?: string; // For compatibility
}

export interface CreateDeviceDto {
    fingerprint: string;
    userId?: string;
    tagName?: string;
    keyId?: string;
}

export interface UpdateDeviceDto {
    fingerprint?: string;
    userId?: string;
    tagName?: string;
    keyId?: string;
}

// Inquiry types
export type InquiryType = 'lifetime_purchase' | 'academic' | 'custom_quote' | 'talk_to_sales';
export type InquiryStatus = 'new' | 'contacted' | 'closed';

export interface Inquiry {
    id: string;
    userId?: string;
    user?: User;
    type: InquiryType;
    planSlug?: string;
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    message?: string;
    status: InquiryStatus;
    createdAt: string;
}

// Inquiries API
export const inquiriesApi = {
    getAll: () => apiRequest<Inquiry[]>("/inquiries"),
    updateStatus: (id: string, status: InquiryStatus) =>
        apiRequest<Inquiry>(`/inquiries/${id}/status`, { method: "PATCH", body: { status } }),
};

// === NEW MODULE TYPES ===

// Order types
export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
    id: string;
    userId: string;
    user?: User;
    planId: string;
    plan?: Plan;
    status: OrderStatus;
    amount: number;
    currency: string;
    gstAmount: number;
    totalAmount: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    invoiceNumber?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// Plan types
export type PlanCategory = "professional" | "educational" | "lifetime";

export interface Plan {
    id: string;
    name: string;
    slug: string;
    category: PlanCategory;
    price: number;
    currency: string;
    durationDays?: number;
    maxDevices: number;
    features: string[];
    isActive: boolean;
    requiresApproval: boolean;
    description?: string;
    targetAudience?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlanDto {
    name: string;
    slug: string;
    category: PlanCategory;
    price: number;
    currency?: string;
    durationDays?: number;
    maxDevices?: number;
    features?: string[];
    isActive?: boolean;
    requiresApproval?: boolean;
    description?: string;
    targetAudience?: string;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> { }

// Subscription types
export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface Subscription {
    id: string;
    userId: string;
    user?: User;
    planId: string;
    plan?: Plan;
    orderId: string;
    order?: Order;
    keyId?: string;
    key?: Key;
    status: SubscriptionStatus;
    startsAt: string;
    expiresAt?: string;
    maxDevices: number;
    createdAt: string;
    updatedAt: string;
}

// Role types
export interface Role {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    permissions?: Permission[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleDto {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> { }

// Permission types
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "ALL";

export interface Permission {
    id: string;
    roleId: string;
    role?: Role;
    apiRoute: string;
    httpMethod: HttpMethod;
    isPublic: boolean;
    isAllowed: boolean;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePermissionDto {
    roleId: string;
    apiRoute: string;
    httpMethod: HttpMethod;
    isPublic?: boolean;
    isAllowed?: boolean;
    description?: string;
}

export interface UpdatePermissionDto extends Partial<CreatePermissionDto> { }

// === NEW MODULE APIs ===

// Orders API (read-only for admin)
export const ordersApi = {
    getAll: () => apiRequest<Order[]>("/orders/admin/all"),
    getById: (id: string) => apiRequest<Order>(`/orders/${id}`),
};

// Plans API (full CRUD for admin)
export const plansApi = {
    getAll: () => apiRequest<Plan[]>("/plans/admin/all"),
    getById: (id: string) => apiRequest<Plan>(`/plans/${id}`),
    create: (data: CreatePlanDto) => apiRequest<Plan>("/plans", { method: "POST", body: data }),
    update: (id: string, data: UpdatePlanDto) => apiRequest<Plan>(`/plans/${id}`, { method: "PATCH", body: data }),
    delete: (id: string) => apiRequest<{ message: string }>(`/plans/${id}`, { method: "DELETE" }),
};

// Subscriptions API (read-only for admin)
export const subscriptionsApi = {
    getAll: () => apiRequest<Subscription[]>("/subscriptions/admin/all"),
    getById: (id: string) => apiRequest<Subscription>(`/subscriptions/${id}`),
};

// Roles API (full CRUD)
export const rolesApi = {
    getAll: () => apiRequest<Role[]>("/roles"),
    getById: (id: string) => apiRequest<Role>(`/roles/${id}`),
    create: (data: CreateRoleDto) => apiRequest<Role>("/roles", { method: "POST", body: data }),
    update: (id: string, data: UpdateRoleDto) => apiRequest<Role>(`/roles/${id}`, { method: "PATCH", body: data }),
    delete: (id: string) => apiRequest<void>(`/roles/${id}`, { method: "DELETE" }),
};

// Permissions API (full CRUD with role filtering)
export const permissionsApi = {
    getAll: () => apiRequest<Permission[]>("/permissions"),
    getByRoleId: (roleId: string) => apiRequest<Permission[]>(`/permissions/role/${roleId}`),
    getById: (id: string) => apiRequest<Permission>(`/permissions/${id}`),
    create: (data: CreatePermissionDto) => apiRequest<Permission>("/permissions", { method: "POST", body: data }),
    update: (id: string, data: UpdatePermissionDto) => apiRequest<Permission>(`/permissions/${id}`, { method: "PATCH", body: data }),
    delete: (id: string) => apiRequest<void>(`/permissions/${id}`, { method: "DELETE" }),
};
