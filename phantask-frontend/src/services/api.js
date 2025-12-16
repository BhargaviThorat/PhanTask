import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Decode JWT to get expiration time
const getTokenExpiry = (token) => {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Token is not a valid JWT:", token);
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload.exp * 1000;
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
};

// Check if token is expired or expiring soon (within 1 minute)
const shouldRefreshToken = (token) => {
  if (!token) return false;

  const expiry = getTokenExpiry(token);
  if (!expiry) return false;

  const timeUntilExpiry = expiry - Date.now();

  // Already expired or expiring within 60 seconds
  return timeUntilExpiry < 60000;
};

// REFRESH TOKEN LOGIC WITH PROPER PROMISE HANDLING
let refreshPromise = null;

const refreshAccessToken = async () => {
  const refreshToken = sessionStorage.getItem("refreshToken");
  console.log("Attempting token refresh...");

  if (!refreshToken) {
    console.error("No refresh token available");
    return false;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      }
    );

    console.log("Token refreshed successfully");

    const { token, refreshToken: newRefresh } = response.data;

    if (!token) {
      console.error("No token in refresh response");
      return false;
    }

    sessionStorage.setItem("authToken", token);

    if (newRefresh) {
      sessionStorage.setItem("refreshToken", newRefresh);
    }

    return true;
  } catch (e) {
    console.error(
      "Token refresh failed:",
      e.response?.status,
      e.response?.data
    );

    // If refresh token is invalid/expired, clear everything
    if (e.response?.status === 401 || e.response?.status === 403) {
      sessionStorage.clear();
    }

    return false;
  }
};

// Wrapper to ensure only one refresh happens at a time
const ensureValidToken = async () => {
  const token = sessionStorage.getItem("authToken");

  if (!shouldRefreshToken(token)) {
    return true; // Token is still valid
  }

  // If already refreshing, wait for that to complete
  if (refreshPromise) {
    console.log("Waiting for existing refresh...");
    return await refreshPromise;
  }

  // Start new refresh
  console.log("Starting new token refresh...");
  refreshPromise = refreshAccessToken().finally(() => {
    refreshPromise = null; // Clear promise after completion
  });

  return await refreshPromise;
};

// REQUEST INTERCEPTOR: Ensure token is valid before request
api.interceptors.request.use(
  async (config) => {
    const token = sessionStorage.getItem("authToken");

    if (token) {
      // Check and refresh if needed
      const isValid = await ensureValidToken();

      if (!isValid) {
        // Token refresh failed, redirect to login
        console.error("Failed to refresh token, redirecting to login");
        sessionStorage.clear();
        window.location.href = "/login?sessionExpired=true";
        return Promise.reject(new axios.Cancel("Session expired"));
      }

      // Use the (possibly new) token
      const currentToken = sessionStorage.getItem("authToken");
      config.headers.Authorization = `Bearer ${currentToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Handle 401 errors as backup
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh-token");
    const isLoginCall = originalRequest?.url?.includes("/auth/login");

    // If 401 and not already retried and not the refresh call itself
    if (status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      console.log("Received 401, attempting token refresh...");

      const refreshed = await ensureValidToken();

      if (refreshed) {
        const newToken = sessionStorage.getItem("authToken");
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log("Retrying request with new token");
        return api(originalRequest);
      } else {
        console.error("Token refresh failed on 401");
      }
    }

    // If still 401 or refresh failed, logout
    // BUT NOT if it's the login endpoint failing
    if (status === 401 && !isLoginCall) {
      console.error("Authentication failed, logging out");
      sessionStorage.clear();
      window.location.href = "/login?sessionExpired=true";
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  /* ---------------------------------
   *     AUTHENTICATION
   * --------------------------------- */
  login: (username, password) =>
    api.post("/auth/login", { username, password }),

  /* ---------------------------------
   *     USER MANAGEMENT (ADMIN)
   * --------------------------------- */
  createAccount: (email, role) =>
    api.post("/users/create-account", { email, role }),
  editUserByAdmin: (userId, userData) =>
    api.put(`/users/${userId}/edit`, userData),
  deactivateUser: (userId) => api.put(`/users/${userId}/deactivate`),
  reactivateUser: (userId) => api.put(`/users/${userId}/reactivate`),
  getAllActiveUsers: () => api.get("/users/active"),
  getAllInactiveUsers: () => api.get("/users/inactive"),

  /* ---------------------------------
   *     ROLE MANAGEMENT (ADMIN)
   * --------------------------------- */
  getAllRoles: () => api.get("/roles/all"),
  addRole: (roleName) => api.post("/roles/add", { roleName }),

  /* ---------------------------------
   *      TOKEN REFRESH
   * --------------------------------- */
  refreshAccessToken,

  /* ---------------------------------
   *      CHANGE PASSWORD ON FIRST LOGIN
   * --------------------------------- */
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

  /* ---------------------------------
   *      UPDATE PROFILE ON FIRST LOGIN (NO AUTH REQUIRED)
   * --------------------------------- */
  updateProfileFirstLogin: async (formData, username) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { "Content-Type": "multipart/form-data" },
    });
    // Append username to identify the user
    formData.append("username", username);
    return publicApi.post("/users/update-profile-first-login", formData);
  },

  /* ---------------------------------
   *      USER PROFILE
   * --------------------------------- */
  getUserProfile: () => api.get("/users/profile"),
  updateProfile: (formData) =>
    api.post("/users/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /* ---------------------------------
   *      DASHBOARD DATA
   * --------------------------------- */
  // getMyPendingTasks: () => api.get("/tasks/my/pending"), // Already defined below
  getAttendance: () => api.get("/attendance/current"),
  getSchedule: () => api.get("/schedule/today"),
  getNotices: () => api.get("/notices/active"),

  /* ---------------------------------
   *      TASK MANAGEMENT (ADMIN)
   * --------------------------------- */
  createTask: (taskData) => api.post("/tasks/admin/create", taskData),
  updateTask: (taskId, taskData) =>
    api.put(`/tasks/admin/update/${taskId}`, taskData),
  deleteTask: (taskId) => api.delete(`/tasks/admin/delete/${taskId}`),
  getAllTasks: () => api.get("/tasks/admin/all"),

  /* ---------------------------------
   *      TASK MANAGEMENT (USER)
   * --------------------------------- */
  getMyTasks: () => api.get("/tasks/my"),
  getMyPendingTasks: () => api.get("/tasks/my/pending"),
  getMySubmittedTasks: () => api.get("/tasks/my/submitted"),
  submitTask: (taskId, driveUrl) =>
    api.put(`/tasks/my/submit/${taskId}`, { driveUrl }),
};

export default api;
