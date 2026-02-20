import { encryptPayload, decryptPayload } from "./crypto";

const API_BASE_URL = "http://localhost:3002";

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
