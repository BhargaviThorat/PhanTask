import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to refresh user profile
    const refreshUserProfile = async () => {
        const token = sessionStorage.getItem("authToken");
        // const testToken = sessionStorage.getItem("testToken");

        // Backdoor: if testToken === "open", set a default user
        // if (testToken === "open") {
        //     setUser({
        //         userId: 101,
        //         username: "developer",
        //         fullName: "Dev Tester",
        //         email: "developer@example.com",
        //         phone: "8888888888",
        //         role: "DEVELOPER",
        //         roles: ["DEVELOPER"],
        //         department: "software",
        //         photoUrl: "",
        //         yearOfStudy: "",
        //         enabled: true,
        //         firstLogin: false,
        //         passwordChangedAt: "2025-11-23T19:31:16.002822"
        //     });
        //     setLoading(false);
        //     return;
        // }

        // If no token, no need to fetch profile
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            console.log("Fetching user profile...");
            const res = await apiService.getUserProfile();
            // console.log("Profile data received:", res.data);
            setUser(res.data);
        } catch (err) {
            console.log(
                "getUserProfile failed",
                err?.config?.url,
                err.response?.status,
                err.response?.data
            );
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        refreshUserProfile();
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        setUser,
        refreshProfile: refreshUserProfile,
        logout: () => {
            sessionStorage.clear();
            setUser(null);
            window.location.href = "/login";
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);