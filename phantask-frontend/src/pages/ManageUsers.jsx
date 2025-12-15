import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { FaFilter } from "react-icons/fa";

// * ============================================================================
// * MANAGE USERS COMPONENT
// * ============================================================================
// ! This component is only accessible on desktop (screen width >= 990px)
// ? Handles user management: view, search, filter, deactivate, and reactivate users

const ManageUsers = () => {
    // * ============================================================================
    // * STATE MANAGEMENT
    // * ============================================================================

    // User lists
    const [activeUsers, setActiveUsers] = useState([]);
    const [inactiveUsers, setInactiveUsers] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Modal and selection states
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showReactivateModal, setShowReactivateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Search states
    const [searchTermActive, setSearchTermActive] = useState("");
    const [searchTermInactive, setSearchTermInactive] = useState("");

    // Filter state: ALL, ACTIVE, INACTIVE
    const [filter, setFilter] = useState("ALL");

    // Desktop detection state
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 990);

    // * ============================================================================
    // * DESKTOP DETECTION
    // * ============================================================================
    // ! Component only works on desktop screens (>= 990px)

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 990);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // * ============================================================================
    // * NATURAL SORT FUNCTION
    // * ============================================================================
    // ? Sorts usernames alphabetically, then numerically (e.g., user1, user2, user10)

    const naturalSort = (a, b) => {
        const regex = /^([a-zA-Z]+)(\d*)$/;
        const [, textA = "", numA = "0"] = a.username.match(regex) || [];
        const [, textB = "", numB = "0"] = b.username.match(regex) || [];

        const textCompare = textA.localeCompare(textB);
        if (textCompare !== 0) return textCompare;
        return Number(numA) - Number(numB);
    };

    // * ============================================================================
    // * FETCH USERS ON MOUNT
    // * ============================================================================
    // ? Fetches active and inactive users, filters out ADMINs, and sorts them

    useEffect(() => {
        if (!isDesktop) return; // Don't fetch if not desktop

        const fetchUsers = async () => {
            try {
                // Fetch active users
                const resActive = await apiService.getAllActiveUsers();
                const sortedActive = resActive.data
                    .filter((u) => !u.roles.includes("ADMIN"))
                    .sort(naturalSort);
                setActiveUsers(sortedActive);
                console.log(sortedActive);


                // Fetch inactive users
                const resInactive = await apiService.getAllInactiveUsers();
                const sortedInactive = resInactive.data
                    .filter((u) => !u.roles.includes("ADMIN"))
                    .sort(naturalSort);
                setInactiveUsers(sortedInactive);
                console.log(sortedInactive);

            } catch (err) {
                console.error(err);
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isDesktop]);

    // * ============================================================================
    // * REFETCH USERS FUNCTION
    // * ============================================================================
    // ? Re-fetches both active and inactive users after edit/update

    const refetchUsers = async () => {
        try {
            // Fetch active users
            const resActive = await apiService.getAllActiveUsers();
            const sortedActive = resActive.data
                .filter((u) => !u.roles.includes("ADMIN"))
                .sort(naturalSort);
            setActiveUsers(sortedActive);

            // Fetch inactive users
            const resInactive = await apiService.getAllInactiveUsers();
            const sortedInactive = resInactive.data
                .filter((u) => !u.roles.includes("ADMIN"))
                .sort(naturalSort);
            setInactiveUsers(sortedInactive);

            // toast.success("User list refreshed");
        } catch (err) {
            console.error(err);
            toast.error("Failed to refresh users");
        }
    };

    // * ============================================================================
    // * FILTERED USERS (WITH SEARCH)
    // * ============================================================================
    // ? Filters users based on search terms (username or email)

    const filteredActiveUsers = activeUsers.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTermActive.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTermActive.toLowerCase())
    );

    const filteredInactiveUsers = inactiveUsers.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTermInactive.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTermInactive.toLowerCase())
    );

    // * ============================================================================
    // * SECTION VISIBILITY (BASED ON FILTER)
    // * ============================================================================
    // ? Determines which sections to show based on selected filter

    const showActiveSection = filter === "ALL" || filter === "ACTIVE";
    const showInactiveSection = filter === "ALL" || filter === "INACTIVE";

    // * ============================================================================
    // * DEACTIVATE USER HANDLER
    // * ============================================================================
    // ! Moves user from active list to inactive list

    const handleDeactivate = async () => {
        if (!selectedUser) return;

        setActionLoading(selectedUser.uid);

        try {
            await apiService.deactivateUser(selectedUser.uid);
            toast.success("User deactivated successfully");

            // Remove from activeUsers
            setActiveUsers(prev => prev.filter(u => u.uid !== selectedUser.uid));

            // Add to inactiveUsers
            setInactiveUsers(prev => [...prev, selectedUser]);

            setShowDeactivateModal(false);
            setSelectedUser(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to deactivate user");
        } finally {
            setActionLoading(null);
        }
    };

    // * ============================================================================
    // * REACTIVATE USER HANDLER
    // * ============================================================================
    // ! Moves user from inactive list to active list

    const handleReactivate = async () => {
        if (!selectedUser) return;

        setActionLoading(selectedUser.uid);

        try {
            await apiService.reactivateUser(selectedUser.uid);
            toast.success("User reactivated successfully");

            // Remove from inactiveUsers
            setInactiveUsers(prev => prev.filter(u => u.uid !== selectedUser.uid));

            // Add to activeUsers
            setActiveUsers(prev => [...prev, selectedUser]);

            setShowReactivateModal(false);
            setSelectedUser(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to reactivate user");
        } finally {
            setActionLoading(null);
        }
    };

    // * ============================================================================
    // * FILTER BAR COMPONENT
    // * ============================================================================
    // ? Three filter buttons: All, Active, Inactive

    const FilterBar = () => (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
            <button
                onClick={() => setFilter("ALL")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "ALL"
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-orange-100"
                    }`}
            >
                <FaFilter /> All
            </button>
            <button
                onClick={() => setFilter("ACTIVE")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "ACTIVE"
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-green-100"
                    }`}
            >
                <FaFilter /> Active
            </button>
            <button
                onClick={() => setFilter("INACTIVE")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "INACTIVE"
                    ? "bg-red-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-red-100"
                    }`}
            >
                <FaFilter /> Inactive
            </button>
        </div>
    );

    // * ============================================================================
    // * DESKTOP CHECK
    // * ============================================================================
    // ! Show error message if accessed from mobile or small screen

    if (!isDesktop) {
        return (
            <div className="flex items-center justify-center h-screen p-4">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                    <h1 className="text-2xl font-bold mb-4 text-amber-950">
                        Desktop Access Required
                    </h1>
                    <p className="text-gray-700">
                        The <span className="font-semibold">Manage Users</span> functionality is only accessible on a desktop or a large screen.
                        <br />
                        Please switch to a device with a screen width of <span className="font-semibold">990px or more</span>.
                    </p>
                </div>
            </div>
        );
    }

    // * ============================================================================
    // * LOADING STATE
    // * ============================================================================
    // ? Shows skeleton loader while fetching users

    if (loading) {
        return (
            <div className="p-4">
                <LoadingSkeleton
                    titleHeight="h-8"
                    rows={5}
                    rowHeight="h-8"
                    hasButton={false}
                />
            </div>
        );
    }

    // * ============================================================================
    // * MAIN RENDER
    // * ============================================================================

    return (
        <div className="space-y-6 p-4">
            {/* PAGE HEADER */}
            <div className="mb-3 bg-white/60 rounded-xl p-4 shadow-sm border border-gray-100">
                <h1 className="text-2xl md:text-3xl font-bold text-center text-amber-950">
                    Manage Users
                </h1>
            </div>

            {/* Filter Bar */}
            <FilterBar />

            {/* No users message when filtered */}
            {filter !== "ALL" &&
                ((filter === "ACTIVE" && filteredActiveUsers.length === 0) ||
                    (filter === "INACTIVE" && filteredInactiveUsers.length === 0)) && (
                    <main className="w-full h-full flex flex-col items-center justify-center p-4">
                        <h3 className="text-xl font-bold text-[#522320] mb-1.5 text-center">
                            No {filter === "ACTIVE" ? "Active" : "Inactive"} Users Found
                        </h3>
                        <p className="text-[#522320]/60 text-sm text-center">
                            {filter === "ACTIVE"
                                ? "No active users to display."
                                : "No inactive users to display."}
                        </p>
                    </main>
                )}

            {/* ============================================================================ */}
            {/* ACTIVE USERS TABLE */}
            {/* ============================================================================ */}
            {/* ? Shows active users with search and action buttons */}

            {showActiveSection && (activeUsers.length > 0 || searchTermActive) && (
                <div className="border rounded-xl p-4 bg-white/80 shadow-sm border-green-500">
                    <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h2 className="text-xl font-bold text-green-700">Active Users</h2>
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={searchTermActive}
                            onChange={(e) => setSearchTermActive(e.target.value)}
                            className="w-full md:w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {filteredActiveUsers.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">
                            {searchTermActive ? "No users match your search." : "No active users found."}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-green-100 text-green-900">
                                        <th className="p-3 text-center">Username</th>
                                        <th className="p-3 text-center">Email</th>
                                        <th className="p-3 text-center">Roles</th>
                                        <th className="p-3 text-center">Onboarding</th>
                                        <th className="p-3 text-center">Created On</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredActiveUsers.map((user) => (
                                        <tr
                                            key={user.uid}
                                            className="border-t hover:bg-green-50 transition-colors"
                                        >
                                            <td className="p-3 font-medium text-center">{user.username}</td>
                                            <td className="p-3 text-center">{user.email}</td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {(user.roles.length ? user.roles : ["N/A"]).map((role) => (
                                                        <span
                                                            key={role}
                                                            className="inline-flex items-center rounded-full bg-[#FCE0D6] px-2.5 py-1 text-xs font-medium text-[#8c432b]"
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="p-3 text-center">
                                                {(!user.firstLogin) ? (
                                                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                        Completed
                                                    </span>
                                                ) : (

                                                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-3 text-center text-xs text-green-800 font-medium">
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>

                                            <td className="p-3 flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 hover:scale-95 transition-transform"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowDeactivateModal(true);
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 hover:scale-95 transition-all"
                                                >
                                                    Deactivate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================================ */}
            {/* INACTIVE USERS TABLE */}
            {/* ============================================================================ */}
            {/* ? Shows inactive users with search and reactivate button */}

            {showInactiveSection && inactiveUsers.length > 0 && (
                <div className="border rounded-xl p-4 bg-white/80 shadow-sm border-red-300">
                    <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h2 className="text-xl font-bold text-red-700">Inactive Users</h2>
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={searchTermInactive}
                            onChange={(e) => setSearchTermInactive(e.target.value)}
                            className="w-full md:w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    {filteredInactiveUsers.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">
                            {searchTermInactive ? "No users match your search." : "Inactive users will appear here."}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-red-100 text-red-900">
                                        <th className="p-3 text-center">Username</th>
                                        <th className="p-3 text-center">Email</th>
                                        <th className="p-3 text-center">Roles</th>
                                        <th className="p-3 text-center">Created On</th>
                                        <th className="p-3 text-center">Deactivated On</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInactiveUsers.map((user) => (
                                        <tr
                                            key={user.uid}
                                            className="border-t hover:bg-red-50 transition-colors"
                                        >
                                            <td className="p-3 font-medium text-center">{user.username}</td>
                                            <td className="p-3 text-center">{user.email}</td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {(user.roles.length ? user.roles : ["N/A"]).map((role) => (
                                                        <span
                                                            key={role}
                                                            className="inline-flex items-center rounded-full bg-[#FCE0D6] px-2.5 py-1 text-xs font-medium text-[#8c432b]"
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="p-3 text-center text-xs text-yellow-800 font-medium">
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>

                                            <td className="p-3 text-center text-xs text-red-600 font-medium">
                                                {user.deactivatedAt
                                                    ? new Date(user.deactivatedAt).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>

                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowReactivateModal(true);
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 hover:scale-95 transition-all"
                                                >
                                                    Reactivate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================================ */}
            {/* MODALS */}
            {/* ============================================================================ */}

            {/* DEACTIVATE MODAL */}
            {showDeactivateModal && selectedUser && (
                <DeactivateUserModal
                    user={selectedUser}
                    loading={actionLoading === selectedUser.uid}
                    onClose={() => {
                        setShowDeactivateModal(false);
                        setSelectedUser(null);
                    }}
                    onConfirm={handleDeactivate}
                />
            )}

            {/* REACTIVATE MODAL */}
            {showReactivateModal && selectedUser && (
                <ReactivateUserModal
                    user={selectedUser}
                    loading={actionLoading === selectedUser.uid}
                    onClose={() => {
                        setShowReactivateModal(false);
                        setSelectedUser(null);
                    }}
                    onConfirm={handleReactivate}
                />
            )}

            {/* EDIT MODAL */}
            {showEditModal && selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={refetchUsers}
                />
            )}

        </div>
    );
};

export default ManageUsers;

// * ============================================================================
// * DEACTIVATE USER MODAL
// * ============================================================================
// ! Confirmation modal before deactivating a user
// ? Shows user's username and requires explicit confirmation

const DeactivateUserModal = ({ user, onClose, onConfirm, loading }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-[90%] sm:w-[400px] animate-slideUp">
                <div className="bg-white rounded-xl p-5 shadow-xl border border-red-300">
                    <h3 className="text-xl font-bold text-red-700 text-center">Deactivate User</h3>
                    <p className="text-sm text-gray-700 mt-3 text-center">
                        Are you sure you want to deactivate <span className="font-semibold">{user.username}</span>?
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-5 flex gap-2">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold hover:scale-95 transition"
                        >
                            {loading ? "Processing..." : "Yes, Deactivate"}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold hover:scale-95 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Slide-up Animation */}
            <style>
                {`
                    @keyframes slideUp {
                        0% { transform: translateY(100%); opacity: 0; }
                        100% { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slideUp {
                        animation: slideUp 0.2s ease-out forwards;
                    }
                `}
            </style>
        </div>
    );
};

// * ============================================================================
// * REACTIVATE USER MODAL
// * ============================================================================
// ! Confirmation modal before reactivating a user
// ? Shows user's username and requires explicit confirmation

const ReactivateUserModal = ({ user, onClose, onConfirm, loading }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-[90%] sm:w-[400px] animate-slideUp">
                <div className="bg-white rounded-xl p-5 shadow-xl border border-green-300">
                    <h3 className="text-xl font-bold text-green-700 text-center">Reactivate User</h3>
                    <p className="text-sm text-gray-700 mt-3 text-center">
                        Are you sure you want to reactivate <span className="font-semibold">{user.username}</span>?
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-5 flex gap-2">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold hover:scale-95 transition"
                        >
                            {loading ? "Processing..." : "Yes, Reactivate"}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold hover:scale-95 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Slide-up Animation */}
            <style>
                {`
                    @keyframes slideUp {
                        0% { transform: translateY(100%); opacity: 0; }
                        100% { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slideUp {
                        animation: slideUp 0.2s ease-out forwards;
                    }
                `}
            </style>
        </div>
    );
};


// * ============================================================================
// * EDIT USER MODAL
// * ============================================================================
// ! Modal for editing user profile details by admin
// ? Allows editing fullName, department, phone, yearOfStudy, dob, and password reset

const EditUserModal = ({ user, onClose, onSuccess }) => {
    // * State Management
    const [fullName, setFullName] = useState(user.fullName || "");
    const [department, setDepartment] = useState(user.department || "");
    const [phone, setPhone] = useState(user.phone || "");
    const [yearOfStudy, setYearOfStudy] = useState(user.yearOfStudy || "");
    const [dob, setDob] = useState(user.dob || "");
    const [resetPassword, setResetPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // * Handle User Update
    const handleUpdateUser = async () => {
        try {
            setLoading(true);

            const updateData = {
                fullName: fullName.trim() || null,
                department: department.trim() || null,
                phone: phone.trim() || null,
                yearOfStudy: yearOfStudy.trim() || null,
                dob: dob || null,
                resetPassword: resetPassword
            };

            await apiService.editUserByAdmin(user.uid, updateData);

            toast.success("User updated successfully");
            onSuccess(); // Refresh user list
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.error || "Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* * Background Overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* * Modal Container - Responsive width with scroll */}
            <div className="relative w-[90%] sm:w-[80%] md:w-2/5 max-h-[95vh] animate-slideUp">
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-xl flex flex-col border border-yellow-500/30 max-h-[95vh] overflow-y-auto">
                    {/* * Header Section */}
                    <div className="mb-3 text-center flex-shrink-0">
                        <h3 className="text-2xl font-bold text-amber-950">Edit User</h3>
                        <p className="text-sm text-gray-700 mt-1">Update user profile details for <span className="font-semibold">{user.username}</span></p>
                    </div>

                    {/* * Body Section - Form Inputs */}
                    <div className="flex-1 flex flex-col gap-3">
                        {/* Full Name Input */}
                        <label className="text-sm font-semibold text-gray-800">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter full name"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />

                        {/* Department Input */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Department</label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Enter department"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />

                        {/* Phone Input */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Phone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />

                        {/* Year of Study Input */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Year of Study</label>
                        <input
                            type="text"
                            value={yearOfStudy}
                            onChange={(e) => setYearOfStudy(e.target.value)}
                            placeholder="Enter year of study"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />

                        {/* Date of Birth Input */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Date of Birth</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />

                        {/* Reset Password Checkbox */}
                        <div className="flex items-center justify-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <input
                                type="checkbox"
                                id="resetPassword"
                                checked={resetPassword}
                                onChange={(e) => setResetPassword(e.target.checked)}
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="resetPassword" className="text-sm font-semibold text-red-700 cursor-pointer select-none">
                                ⚠️ Reset Password to Default (Temp@123)
                            </label>
                        </div>

                        {/* {resetPassword && (
                            <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                ⚠️ User will be required to change their password on next login
                            </p>
                        )} */}
                    </div>

                    {/* * Footer Section - Action Buttons */}
                    <div className="mt-4 flex-shrink-0 flex gap-2">
                        <button
                            onClick={handleUpdateUser}
                            disabled={loading}
                            className={`flex-1 py-2 rounded-lg text-white font-semibold
                            hover:scale-95 transition-transform duration-300 shadow
                            ${loading ? "bg-yellow-500/60 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"}`}
                        >
                            {loading ? "Updating..." : "Update User"}
                        </button>

                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg bg-stone-200 hover:bg-stone-300
                            text-gray-800 font-semibold hover:scale-95 transition-transform duration-300 shadow"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* * Custom Styles - Animations and Scrollbar */}
            <style>
                {`
                    /* Slide-up animation for modal entrance */
                    @keyframes slideUp {
                        0% { transform: translateY(100%); opacity: 0; }
                        100% { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slideUp {
                        animation: slideUp 0.2s ease-out forwards;
                    }

                    /* Custom scrollbar styling for modal */
                    .overflow-y-auto::-webkit-scrollbar {
                        width: 8px;
                    }

                    .overflow-y-auto::-webkit-scrollbar-track {
                        background: transparent;
                        margin: 0.4rem 0;
                    }

                    .overflow-y-auto::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 8px;
                    }

                    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                        background: #9ca3af;
                    }
                `}
            </style>
        </div>
    );
};