import React, { useState } from "react";
import { apiService } from "../../services/api";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { DEFAULT_ROLE_OPTIONS } from "../../constants/roles";

// ! Main Component - Create User Card
const CreateUserCard = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* * Card Container with hover effects */}
      <div className="w-full h-full rounded-xl border-2 border-[#522320] bg-[#ffffff] p-3 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#522320]/30 hover:-translate-y-0.5 flex flex-col">
        <span className="w-full h-full flex flex-col justify-between">
          {/* * Card Header */}
          <h2 className="h-10 text-lg font-semibold py-1 text-[#522320] text-center">
            Create User
          </h2>

          {/* * Empty-state content (same style as AssignedTasksCard) */}
          <main className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#fff9f8]/30 to-[#fff1f0]/20 rounded-xl border-[#522320]/20 shadow-sm">
            <div className="w-14 h-14 bg-[#522320]/5 rounded-2xl flex items-center justify-center mb-3 shadow-md shadow-[#522320]/10">
              <span className="text-2xl">👤</span>
            </div>

            <h3 className="text-xl font-bold text-[#522320] mb-1.5 leading-tight">
              Add New User
            </h3>

            <p className="text-[#522320]/60 text-xs font-medium text-center leading-tight max-w-[160px]">
              Create a user account using an email address.
            </p>
          </main>

          {/* * Action Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full text-center hover:rounded-xl text-[#42260b] text-sm font-medium mt-1 py-2 hover:bg-red-100"
          >
            Create User
          </button>
        </span>
      </div>

      {/* ? Conditionally render modal */}
      {showModal && <CreateUserModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default CreateUserCard;

// ! Modal Component - Create User Form
const CreateUserModal = ({ onClose }) => {
  // * State Management
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER"); // default value
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // * Role Options for Dropdown (from constants)
  const roleOptions = DEFAULT_ROLE_OPTIONS;


  // * Custom Styles for React-Select (matching email input styling)
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "0.5rem", // rounded-lg to match email input
      borderWidth: "1px",
      borderColor: state.isFocused ? "#dc2626" : "#d1d5db", // match email input focus
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(220, 38, 38, 1)" // darker focus ring to match email input
        : "none",
      padding: "0.5rem 0.75rem", // px-3 py-2 to match email input
      fontSize: "0.875rem", // text-sm
      backgroundColor: "white",
      "&:hover": {
        borderColor: state.isFocused ? "#dc2626" : "#d1d5db",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0",
    }),
    input: (base) => ({
      ...base,
      margin: "0",
      padding: "0",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "24px",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#facc15"
        : state.isFocused
          ? "#fef3c7"
          : "white",
      color: state.isSelected ? "#422006" : "#111827",
      cursor: "pointer",
      borderRadius: "0.375rem",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      fontSize: "0.875rem",
      margin: "0",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#111827",
      margin: "0",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      scrollbarWidth: "thin",
      scrollbarColor: "#d1d5db transparent",
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
        margin: "0.125rem 0",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#d1d5db",
        borderRadius: "8px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "#9ca3af",
      },
    }),
  };

  // * Handle User Creation
  const handleCreateUser = async () => {
    // Validation
    if (!email.trim()) return toast.error("Email address is required");
    if (!role.trim()) return toast.error("Role is required");
    if (!confirmed) return toast.error("Please confirm the email before proceeding");

    try {
      setLoading(true);
      const res = await apiService.createAccount(email, role);
      toast.success(
        `User created! \nUsername: ${res.data.username}\n${res.data.tempPasswordMessage}`,
        { duration: 4000 }
      );
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to create user");
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
            <h3 className="text-2xl font-bold text-amber-950">Create User</h3>
            <p className="text-sm text-gray-700 mt-1">Add a new user using email address</p>
          </div>

          {/* * Body Section - Form Inputs */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Email Input */}
            <label className="text-sm font-semibold text-gray-800">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              maxLength={254}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
    focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />


            {/* Role Select */}
            <label className="text-sm font-semibold text-gray-800 mt-1">Role</label>
            <Select
              styles={selectStyles}
              placeholder="Select Role..."
              value={roleOptions.find(r => r.value === role)}
              onChange={(opt) => setRole(opt?.value || "USER")}
              options={roleOptions}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          {/* * Footer Section - Action Buttons */}
          <div className="mt-4 flex-shrink-0">
            {/* ? Initial State - Create or Cancel */}
            {!confirmVisible ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmVisible(true)}
                  className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold hover:scale-95 transition-transform duration-300 shadow"
                >
                  Create User
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
                  I confirm the email is correct.
                </label>

                {/* Final Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateUser}
                    disabled={!confirmed || loading}
                    className={`flex-1 py-2 rounded-lg text-white font-semibold
                hover:scale-95 transition-transform duration-300 shadow
                ${confirmed
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-green-600/60 cursor-not-allowed"
                      }`}
                  >
                    {loading ? "Creating..." : "Confirm & Create"}
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