import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSkeleton from "../components/LoadingSkeleton";

const ManageUsers = () => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [inactiveUsers, setInactiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);

    const [searchTermActive, setSearchTermActive] = useState("");
    const [searchTermInactive, setSearchTermInactive] = useState("");

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 990);

    // Update isDesktop on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 990);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Natural sort function for usernames with numbers
    const naturalSort = (a, b) => {
        const regex = /^([a-zA-Z]+)(\d*)$/;
        const [, textA = "", numA = "0"] = a.username.match(regex) || [];
        const [, textB = "", numB = "0"] = b.username.match(regex) || [];

        const textCompare = textA.localeCompare(textB);
        if (textCompare !== 0) return textCompare;
        return Number(numA) - Number(numB);
    };

    useEffect(() => {
        if (!isDesktop) return; // Don't fetch if not desktop

        const fetchUsers = async () => {
            try {
                const res = await apiService.getAllActiveUsers();
                const sortedUsers = res.data
                    .filter((u) => !u.roles.includes("ADMIN"))
                    .sort(naturalSort);

                setActiveUsers(sortedUsers);

                // Placeholder inactive users for future
                setInactiveUsers([]);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filtered users
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

    const handleDeactivate = async () => {
        if (!selectedUser) return;

        setActionLoading(selectedUser.uid);

        try {
            await apiService.deactivateUser(selectedUser.uid);
            toast.success("User deactivated successfully");

            setActiveUsers((prev) =>
                prev.filter((u) => u.uid !== selectedUser.uid)
            );

            setShowDeactivateModal(false);
            setSelectedUser(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to deactivate user");
        } finally {
            setActionLoading(null);
        }
    };

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

    return (
        <div className="space-y-6 p-4">
            {/* PAGE HEADER */}
            <div className="mb-3 bg-white/60 rounded-xl p-4 shadow-sm border border-gray-100">
                <h1 className="text-2xl md:text-3xl font-bold text-center text-amber-950">
                    Manage Users
                </h1>
            </div>

            {/* ACTIVE USERS */}
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
                                        <td className="p-3 flex items-center justify-center gap-2">
                                            <button className="px-3 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 hover:scale-95 transition-transform">
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

            {/* INACTIVE USERS */}
            {inactiveUsers.length > 0 &&
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>}

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
        </div>
    );
};

export default ManageUsers;

// DEACTIVATE MODAL
const DeactivateUserModal = ({ user, onClose, onConfirm, loading }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-[90%] sm:w-[400px] animate-slideUp">
                <div className="bg-white rounded-xl p-5 shadow-xl border border-red-300">
                    <h3 className="text-xl font-bold text-red-700 text-center">Deactivate User</h3>
                    <p className="text-sm text-gray-700 mt-3 text-center">
                        Are you sure you want to deactivate <span className="font-semibold">{user.username}</span>?
                    </p>
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
