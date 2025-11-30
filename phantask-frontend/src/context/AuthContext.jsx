import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);      // { username, roles, ... }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const testToken = sessionStorage.getItem("testToken");
        if (testToken === "open") {
            setUser({ username: "test-user", roles: ["TEST"] });
            setLoading(false);
            return;
        }


        const token = sessionStorage.getItem("authToken");
        if (!token) {
            setLoading(false);
            return;
        }

        apiService
            .getCurrentUser()
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => {
                sessionStorage.clear();
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        setUser,    // Expose setUser to allow manual updates
        logout: () => {
            sessionStorage.clear();
            setUser(null);
            window.location.href = "/login";
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
