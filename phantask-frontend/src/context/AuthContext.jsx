import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { apiService } from "../services/api";
import { refreshRolesFromBackend } from "../constants/roles";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoized function to refresh profile
  const refreshProfile = useCallback(async () => {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiService.getUserProfile();
      setUser(res.data);

      // Fetch roles from backend if user is ADMIN
      if (Array.isArray(res.data?.roles) && res.data.roles.includes("ADMIN")) {
        await refreshRolesFromBackend();
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load profile once on mount
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // LOGOUT function to clear session and user state
  const logout = (navigate) => {
    sessionStorage.clear();
    setUser(null);
    if (navigate) navigate("/login");
  };

  // Final value object with role helpers included
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    setUser,

    refreshProfile, // memoized

    // ROLE HELPERS
    isAdmin: user?.roles?.includes("ADMIN"),
    isHR: user?.roles?.includes("HR"),
    isEmployee: user?.roles?.includes("EMPLOYEE"),
    hasRole: (role) => user?.roles?.includes(role),

    logout, // with navigate argument
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
