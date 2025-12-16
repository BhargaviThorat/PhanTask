import React, { useState } from "react";
import { apiService } from "../../services/api";
import { toast } from "react-hot-toast";
import { refreshRolesFromBackend } from "../../constants/roles";

// ! Main Component - Add Role Card
const AddRoleCard = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            {/* * Card Container with hover effects */}
            <div className="w-full h-full rounded-xl border-2 border-[#522320] bg-[#ffffff] p-3 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#522320]/30 hover:-translate-y-0.5 flex flex-col">
                <span className="w-full h-full flex flex-col justify-between">
                    {/* * Card Header */}
                    <h2 className="h-10 text-lg font-semibold py-1 text-[#522320] text-center">
                        Add Role
                    </h2>

                    {/* * Empty-state content (same style as CreateUserCard) */}
                    <main className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#fff9f8]/30 to-[#fff1f0]/20 rounded-xl border-[#522320]/20 shadow-sm">
                        <div className="w-14 h-14 bg-[#522320]/5 rounded-2xl flex items-center justify-center mb-3 shadow-md shadow-[#522320]/10">
                            <span className="text-2xl">🎭</span>
                        </div>

                        <h3 className="text-xl font-bold text-[#522320] mb-1.5 leading-tight">
                            Add New Role
                        </h3>

                        <p className="text-[#522320]/60 text-xs font-medium text-center leading-tight max-w-[160px]">
                            Create a new role for your organization.
                        </p>
                    </main>

                    {/* * Action Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full text-center hover:rounded-xl text-[#42260b] text-sm font-medium mt-1 py-2 hover:bg-red-100"
                    >
                        Add Role
                    </button>
                </span>
            </div>

            {/* ? Conditionally render modal */}
            {showModal && <AddRoleModal onClose={() => setShowModal(false)} />}
        </>
    );
};

export default AddRoleCard;

// ! Modal Component - Add Role Form
const AddRoleModal = ({ onClose }) => {
    // * State Management
    const [roleName, setRoleName] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    // * Handle Role Creation
    const handleAddRole = async () => {
        // Validation
        if (!roleName.trim()) {
            return toast.error("Role name is required");
        }

        // Role name format validation (uppercase, no spaces)
        const roleRegex = /^[A-Z_]+$/;
        if (!roleRegex.test(roleName.trim())) {
            return toast.error("Role name must be uppercase letters and underscores only (e.g., PROJECT_MANAGER)");
        }

        // Length validation
        if (roleName.trim().length > 50) {
            return toast.error("Role name is too long (max 50 characters)");
        }

        if (!confirmed) {
            return toast.error("Please confirm the role name before proceeding");
        }

        try {
            setLoading(true);
            const res = await apiService.addRole(roleName.trim());
            toast.success(`Role "${roleName.trim()}" added successfully!`, { duration: 3000 });

            // Refresh roles from backend to update DEFAULT_ROLE_OPTIONS
            await refreshRolesFromBackend();

            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to add role");
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
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-xl flex flex-col border border-red-700/30 max-h-[95vh] overflow-y-auto">
                    {/* * Header Section */}
                    <div className="mb-3 text-center flex-shrink-0">
                        <h3 className="text-2xl font-bold text-amber-950">Add Role</h3>
                        <p className="text-sm text-gray-700 mt-1">Create a new role for your organization</p>
                    </div>

                    {/* * Body Section - Form Inputs */}
                    <div className="flex-1 flex flex-col gap-3">
                        {/* Role Name Input */}
                        <label className="text-sm font-semibold text-gray-800">Role Name</label>
                        <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value.toUpperCase())}
                            placeholder="PROJECT_MANAGER"
                            maxLength={50}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                        />
                        <p className="text-xs text-gray-500 -mt-2">
                            Use uppercase letters and underscores only (Ex: TEAM_LEAD, DEVELOPER)
                        </p>
                    </div>

                    {/* * Footer Section - Action Buttons */}
                    <div className="mt-4 flex-shrink-0">
                        {/* ? Initial State - Add or Cancel */}
                        {!confirmVisible ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmVisible(true)}
                                    className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold hover:scale-95 transition-transform duration-300 shadow"
                                >
                                    Add Role
                                </button>

                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold hover:scale-95 transition-transform duration-300 shadow"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            // ? Confirmation State - Checkbox and Final Actions
                            <div className="flex flex-col gap-3 border-t pt-3">
                                {/* Confirmation Checkbox */}
                                <label className="flex items-center gap-2 justify-center text-sm font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={confirmed}
                                        onChange={(e) => setConfirmed(e.target.checked)}
                                        className="accent-red-700"
                                    />
                                    I confirm the role name is correct.
                                </label>

                                {/* Final Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddRole}
                                        disabled={!confirmed || loading}
                                        className={`flex-1 py-2 rounded-lg text-white font-semibold
                      hover:scale-95 transition-transform duration-300 shadow
                      ${confirmed
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-green-600/60 cursor-not-allowed"
                                            }`}
                                    >
                                        {loading ? "Adding..." : "Confirm & Add"}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setConfirmVisible(false);
                                            setConfirmed(false);
                                        }}
                                        className="flex-1 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold hover:scale-95 transition-transform duration-300 shadow"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
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
                    .animate-slideUp { animation: slideUp 0.2s ease-out forwards; }

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
