import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// AUTO-ADD TOKEN
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTO-LOGOUT ON 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = "/login?sessionExpired=true";
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // * AUTH - MATCHES BACKEND
  login: (username, password) =>
    api.post("/auth/login", { username, password }),

  // PUBLIC ENDPOINT - Bypass token interceptor
  changePasswordFirstLogin: async (oldPassword, newPassword, username) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });
    return publicApi.post("/users/change-password-first-login", {
      username,
      oldPassword,
      newPassword,
    });
  },

  // USER INFO
  getCurrentUser: () => api.get("/auth/me"),

  // * DASHBOARD DATA (protected - uses token)
  getAssignedTasks: () => api.get("/tasks/assigned"),
  getAttendance: () => api.get("/attendance/current"),
  getSchedule: () => api.get("/schedule/today"),
  getNotices: () => api.get("/notices/active"),
};

export default api;
