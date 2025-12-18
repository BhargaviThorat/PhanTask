// * ============================================================================
// * ROLE CONSTANTS
// * ============================================================================
// ! Centralized role definitions - fetched dynamically from backend
// ? This file provides utilities to work with roles from your database

import { apiService } from "../services/api";

// * ============================================================================
// * DEFAULT FALLBACK ROLES (Editable - will be updated from DB)
// * ============================================================================

export let DEFAULT_ROLE_OPTIONS = [
  { value: "TRAINEE", label: "Trainee" },
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" }, // Always last
];

// * ============================================================================
// * ROLE CONSTANTS (for comparison/validation)
// * ============================================================================
export const ROLES = {
  USER: "USER",
  TRAINEE: "TRAINEE",
  ADMIN: "ADMIN",
};

// * ============================================================================
// * UTILITY FUNCTIONS
// * ============================================================================

/**
 * Transforms backend roles array to React-Select options format
 * ADMIN is always sorted to the end of the array
 * @param {string[]} rolesArray - Array of role strings from backend
 * @returns {Array<{value: string, label: string}>}
 */
const transformRolesToOptions = (rolesArray) => {
  if (!rolesArray || !Array.isArray(rolesArray)) {
    return DEFAULT_ROLE_OPTIONS;
  }

  const options = rolesArray.map((role) => ({
    value: role,
    label: role.charAt(0) + role.slice(1).toLowerCase(),
  }));

  // Sort: ADMIN always last, others alphabetically
  return options.sort((a, b) => {
    if (a.value === ROLES.ADMIN) return 1; // ADMIN goes to end
    if (b.value === ROLES.ADMIN) return -1; // ADMIN goes to end
    return a.label.localeCompare(b.label); // Others sorted alphabetically
  });
};

/**
 * Filters out ADMIN role from options (for task assignment)
 * @param {Array<{value: string, label: string}>} roleOptions
 * @returns {Array<{value: string, label: string}>}
 */
const filterOutAdmin = (roleOptions) => {
  return roleOptions.filter((role) => role.value !== ROLES.ADMIN);
};

/**
 * Adds placeholder option at the beginning
 * @param {Array<{value: string, label: string}>} roleOptions
 * @returns {Array<{value: string, label: string}>}
 */
const addPlaceholder = (roleOptions) => {
  return [{ value: "", label: "Select Role..." }, ...roleOptions];
};

/**
 * Gets role options without ADMIN and with placeholder (for task assignment dropdowns)
 * @param {Array<{value: string, label: string}>} roleOptions
 * @returns {Array<{value: string, label: string}>}
 */
export const getRoleOptionsWithoutAdmin = (
  roleOptions = DEFAULT_ROLE_OPTIONS
) => {
  return addPlaceholder(filterOutAdmin(roleOptions));
};

// * ============================================================================
// * FETCH ROLES FROM BACKEND AND UPDATE DEFAULT_ROLE_OPTIONS
// * ============================================================================

let isRolesFetched = false; // Track if roles have been fetched

/**
 * Fetch roles from backend and update the DEFAULT_ROLE_OPTIONS constant
 * Should be called ONLY after ADMIN login
 */
export const refreshRolesFromBackend = async () => {
  // Prevent multiple fetches
  if (isRolesFetched) {
    console.log("Roles already fetched, skipping...");
    return DEFAULT_ROLE_OPTIONS;
  }

  try {
    const response = await apiService.getAllRoles();
    const rolesArray = response.data || [];

    console.log("Fetched roles from backend:", rolesArray);

    // Update the exported constant (with ADMIN always last)
    DEFAULT_ROLE_OPTIONS = transformRolesToOptions(rolesArray);
    isRolesFetched = true;

    return DEFAULT_ROLE_OPTIONS;
  } catch (error) {
    console.warn(
      "⚠️ Failed to fetch roles from backend, using defaults:",
      error
    );
    return DEFAULT_ROLE_OPTIONS;
  }
};

// * REMOVED auto-fetch - will be called manually after ADMIN login
