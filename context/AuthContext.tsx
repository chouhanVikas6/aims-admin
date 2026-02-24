"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { decryptPayload, EncryptedPayload } from "@/lib/crypto";

interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "user";
    status: "active" | "locked";
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, name: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Helper to check if response is encrypted and decrypt if needed
async function parseResponse<T>(response: Response): Promise<T> {
    const json = await response.json();
    const isEncrypted = response.headers.get("x-encrypted") === "true";

    if (isEncrypted) {
        return decryptPayload(json as EncryptedPayload) as Promise<T>;
    }
    return json as T;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                credentials: "include",
            });

            if (response.ok) {
                const userData = await parseResponse<User>(response);
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await parseResponse<{ message?: string }>(response);
            throw new Error(error.message || "Login failed");
        }

        const data = await parseResponse<{ user: User }>(response);
        setUser(data.user);
        router.push("/");
    };

    const register = async (email: string, name: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, name, password }),
        });

        if (!response.ok) {
            const error = await parseResponse<{ message?: string }>(response);
            throw new Error(error.message || "Registration failed");
        }

        const data = await parseResponse<{ user: User }>(response);
        setUser(data.user);
        router.push("/");
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Continue with logout even if API call fails
        }
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
