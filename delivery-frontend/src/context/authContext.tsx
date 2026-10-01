"use client";
import {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation, } from "@/hooks/loginHook";
import { useLogoutMutation } from "@/hooks/logoutHook";
import { useMeQuery } from "@/hooks/useMeQuery";
import { AuthStatus, AuthUser } from "@/lib/auth/types";

interface AuthContextType {
    user: (AuthUser | null);
    status: AuthStatus;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refetchUser: () => Promise<void>;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const meQuery = useMeQuery();
    const loginMutation = useLoginMutation();
    const logoutMutation = useLogoutMutation();

    const user = useMemo(() => meQuery.data?.user ?? null, [meQuery.data]);




    const status: AuthStatus = meQuery.isPending
        ? "loading"
        : user
            ? "authenticated"
            : "unauthenticated";

    const isAuthenticated = status === "authenticated";





    const login = async (email: string, password: string) => {
        const response = await loginMutation.mutateAsync({ email, password });
        if (response.data?.success === false) {
            throw new Error("Login failed");
        }

        try {
            await meQuery.refetch();
            
            router.replace("/dashboard");
        } catch {
            console.error("Failed to refresh authenticated user");
        }
    };

    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
            await meQuery.refetch();
            router.replace("/login");
        }
        catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const refetchUser = async () => {
        await meQuery.refetch();
    };

    return (
        <AuthContext.Provider
            value={{
                user,

                status,
                isAuthenticated,
                login,
                logout,
                refetchUser,
            }}
        >

            {children}

        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}