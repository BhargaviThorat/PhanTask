import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { getRoleOptionsWithoutAdmin, DEFAULT_ROLE_OPTIONS } from "../../constants/roles";


// ! Main Component - Create Notice Card
const CreateNoticeCard = () => {
    const [showModal, setShowModal] = useState(false);


    return (
        <>
            {/* * Card Container with hover effects */}
            <div className="w-full h-full rounded-xl border-2 border-[#522320] bg-[#ffffff] p-3 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#522320]/30 hover:-translate-y-0.5 flex flex-col">
                <span className="w-full h-full flex flex-col justify-between">
                    {/* * Card Header */}
                    <h2 className="h-10 text-lg font-semibold py-1 text-[#522320] text-center">
                        Create Notice
                    </h2>


                    {/* * Empty-state content */}
                    <main className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#fff9f8]/30 to-[#fff1f0]/20 rounded-xl border-[#522320]/20 shadow-sm">
                        <div className="w-14 h-14 bg-[#522320]/5 rounded-2xl flex items-center justify-center mb-3 shadow-md shadow-[#522320]/10">
                            <span className="text-2xl">📢</span>
                        </div>


                        <h3 className="text-xl text-center font-bold text-[#522320] mb-1.5 leading-tight">
                            Post New Notice
                        </h3>


                        <p className="text-[#522320]/60 text-xs font-medium text-center leading-tight max-w-[160px]">
                            Create announcements visible to selected roles.
                        </p>
                    </main>


                    {/* * Action Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full text-center hover:rounded-xl text-[#42260b] text-sm font-medium mt-1 py-2 hover:bg-red-100"
                    >
                        Create Notice
                    </button>
                </span>
            </div>


            {/* ? Conditionally render modal */}
            {showModal && <CreateNoticeModal onClose={() => setShowModal(false)} />}
        </>
    );
};


export default CreateNoticeCard;


// ! Modal Component - Create Notice Form
const CreateNoticeModal = ({ onClose }) => {
    // * State Management
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [postedBy, setPostedBy] = useState("");
    const [priority, setPriority] = useState("GENERAL");
    const [targetRoles, setTargetRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmed, setConfirmed] = useState(false);


    // * Role Options for Multi-Select Dropdown with Checkboxes (without ADMIN)
    const roleOptions = getRoleOptionsWithoutAdmin(DEFAULT_ROLE_OPTIONS);


    // * Priority Options
    const priorityOptions = [
        { value: "GENERAL", label: "General" },
        { value: "IMPORTANT", label: "Important" },
        { value: "URGENT", label: "Urgent" },
    ];


    // * Custom Styles for React-Select Multi-Select with Checkboxes
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: "40px",
            borderRadius: "0.5rem",
            borderWidth: "1px",
            borderColor: state.isFocused ? "#dc2626" : "#d1d5db",
            boxShadow: state.isFocused
                ? "0 0 0 2px rgba(220, 38, 38, 1)"
                : "none",
            padding: "0.5rem 0.75rem",
            fontSize: "0.875rem",
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
                ? "#fef3c7"
                : state.isFocused
                    ? "#fef3c7"
                    : "white",
            color: "#111827",
            cursor: "pointer",
            padding: "0.5rem 0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        }),
        placeholder: (base) => ({
            ...base,
            color: "#9ca3af",
            fontSize: "0.875rem",
            margin: "0",
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: "#facc15",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: "#422006",
            fontSize: "0.875rem",
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: "#422006",
            "&:hover": {
                backgroundColor: "#eab308",
                color: "#422006",
            },
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


    // * Custom Option Component with Checkbox (for multi-select)
    const CheckboxOption = (props) => {
        // Skip rendering checkbox for placeholder/empty options
        if (!props.data.value || props.data.value === "") {
            return null;
        }


        return (
            <div
                {...props.innerProps}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm ${props.isFocused ? 'bg-yellow-100' : 'bg-white'
                    }`}
            >
                <input
                    type="checkbox"
                    checked={props.isSelected}
                    onChange={() => null}
                    className="accent-yellow-400"
                />
                <span>{props.label}</span>
            </div>
        );
    };


    // * Handle Notice Creation
    const handleCreateNotice = async () => {
        // Validation
        if (!title.trim()) return toast.error("Notice title is required");
        if (!content.trim()) return toast.error("Notice content is required");
        if (!postedBy.trim()) return toast.error("Posted by field is required");
        if (targetRoles.length === 0) return toast.error("At least one role must be selected");
        if (!confirmed) return toast.error("Please confirm before proceeding");


        try {
            setLoading(true);


            // Prepare data payload
            const noticeData = {
                title: title.trim(),
                content: content.trim(),
                postedBy: postedBy.trim(),
                priority: priority,
                targetRoles: targetRoles.map(role => role.value),
                // createdAt will be handled by backend
            };


            console.log("Notice Data:", noticeData);


            // TODO: Replace with actual API call when backend is ready
            // const res = await apiService.createNotice(noticeData);


            toast.success("Notice created successfully!", { duration: 3000 });
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to create notice");
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
                        <h3 className="text-2xl font-bold text-amber-950">Create Notice</h3>
                        <p className="text-sm text-gray-700 mt-1">Post an announcement for selected roles</p>
                    </div>


                    {/* * Body Section - Form Inputs */}
                    <div className="flex-1 flex flex-col gap-3">
                        {/* Title Input */}
                        <label className="text-sm font-semibold text-gray-800">Notice Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Holiday Announcement - Diwali 2025"
                            maxLength={150}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                        />


                        {/* Content Textarea */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter notice content..."
                            rows="4"
                            maxLength={1000}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none"
                        />


                        {/* Posted By Input */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Posted By</label>
                        <input
                            type="text"
                            value={postedBy}
                            onChange={(e) => setPostedBy(e.target.value)}
                            placeholder="Ex: HR Department, Admin, IT Team"
                            maxLength={100}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                        />


                        {/* Priority Select */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Priority</label>
                        <Select
                            styles={selectStyles}
                            placeholder="Select Priority..."
                            value={priorityOptions.find(p => p.value === priority)}
                            onChange={(opt) => setPriority(opt?.value || "GENERAL")}
                            options={priorityOptions}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />


                        {/* Target Roles Multi-Select with Checkboxes */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Target Roles</label>
                        <Select
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            styles={selectStyles}
                            placeholder="Select Roles..."
                            value={targetRoles}
                            onChange={(selected) => setTargetRoles(selected || [])}
                            options={roleOptions}
                            components={{ Option: CheckboxOption }}
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
                                    Create Notice
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
                                    I confirm all details are correct.
                                </label>


                                {/* Final Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateNotice}
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
