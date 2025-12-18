import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaFilter } from "react-icons/fa";
import LoadingSkeleton from "../components/LoadingSkeleton";

const Notices = () => {
    const { loading } = useAuth();

    // Set mock data directly in useState
    const [notices] = useState([
        {
            id: 1,
            title: "Holiday Announcement - Diwali 2025",
            content: "The office will remain closed from Oct 24-26 for Diwali celebrations. Regular operations resume on Oct 27. Wishing everyone a happy and prosperous Diwali!",
            priority: "IMPORTANT",
            createdBy: "HR Department",
            createdAt: "2025-10-15T10:30:00Z"
        },
        {
            id: 2,
            title: "Urgent: Server Maintenance",
            content: "Emergency server maintenance scheduled for tonight at 11 PM. All services will be unavailable for approximately 2 hours. Please save your work before 10:30 PM.",
            priority: "URGENT",
            createdBy: "IT Department",
            createdAt: "2025-12-18T09:00:00Z"
        },
        {
            id: 3,
            title: "Team Building Event",
            content: "Join us for a team building event next Friday at 4 PM in the main conference hall. Snacks and refreshments will be provided. RSVP by Wednesday.",
            priority: "GENERAL",
            createdBy: "Admin",
            createdAt: "2025-12-10T14:20:00Z"
        },
        {
            id: 4,
            title: "New Parking Policy",
            content: "Effective from January 1st, 2026, new parking guidelines will be implemented. All employees must register their vehicles at the security desk. Visitor parking will be available in Lot B only.",
            priority: "IMPORTANT",
            createdBy: "Administration",
            createdAt: "2025-12-05T11:45:00Z"
        },
        {
            id: 5,
            title: "Fire Drill Schedule",
            content: "Monthly fire drill will be conducted on December 20th at 3 PM. Please follow evacuation procedures and assemble at designated meeting points.",
            priority: "GENERAL",
            createdBy: "Safety Officer",
            createdAt: "2025-12-01T08:15:00Z"
        },
        {
            id: 6,
            title: "Critical: Security Update Required",
            content: "All employees must update their system passwords immediately. New security protocols require passwords to be changed every 90 days. Contact IT support if you face any issues.",
            priority: "URGENT",
            createdBy: "Security Team",
            createdAt: "2025-12-17T16:00:00Z"
        }
    ]);

    // Filter state: ALL, URGENT, IMPORTANT, GENERAL
    const [filter, setFilter] = useState("ALL");

    // Show loading skeleton
    if (loading) {
        return (
            <div className="space-y-6 p-4">
                <div className="mb-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                    <h1 className="text-2xl text-center md:text-3xl font-bold text-amber-950">
                        Notice Board
                    </h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <LoadingSkeleton rows={4} rowHeight="h-6" hasButton={true} />
                    <LoadingSkeleton rows={4} rowHeight="h-6" hasButton={true} />
                    <LoadingSkeleton rows={4} rowHeight="h-6" hasButton={true} />
                </div>
            </div>
        );
    }

    // Filter notices based on selected filter
    const filteredNotices = notices.filter((n) => {
        if (filter === "ALL") return true;
        if (filter === "URGENT") return n.priority === "URGENT";
        if (filter === "IMPORTANT") return n.priority === "IMPORTANT";
        if (filter === "GENERAL") return n.priority === "GENERAL";
        return true;
    });

    // Sort notices by createdAt (most recent first)
    const sortedNotices = [...filteredNotices].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${d.getFullYear()}`;
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        return `${formatDate(dateStr)} at ${time}`;
    };

    // Get priority color - pink-600 for GENERAL
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "URGENT":
                return "#EF4444"; // red-500
            case "IMPORTANT":
                return "#EAB308"; // yellow-500
            case "GENERAL":
            default:
                return "#DB2777"; // pink-600
        }
    };

    // Get priority badge background
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "URGENT":
                return "bg-red-100 text-red-700";
            case "IMPORTANT":
                return "bg-yellow-100 text-yellow-700";
            case "GENERAL":
            default:
                return "bg-pink-100 text-pink-600";
        }
    };

    // Modal state
    const [selectedNotice, setSelectedNotice] = useState(null);

    const openModal = (notice) => {
        setSelectedNotice(notice);
    };

    const closeModal = () => {
        setSelectedNotice(null);
    };

    // Notice Card Component
    const NoticeCard = ({ notice }) => (
        <div
            className="border-2 rounded-xl p-4 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            style={{ borderColor: getPriorityColor(notice.priority) }}
        >
            <div>
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg flex-1">{notice.title}</h3>
                    <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityBadge(
                            notice.priority
                        )}`}
                    >
                        {notice.priority}
                    </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{notice.content}</p>
                <p className="text-xs text-gray-500">
                    Posted: {formatDateTime(notice.createdAt)}
                </p>
            </div>
            <button
                onClick={() => openModal(notice)}
                className="mt-4 w-full py-2 rounded-lg text-white text-sm font-medium hover:scale-95 transition-transform duration-300"
                style={{ backgroundColor: getPriorityColor(notice.priority) }}
            >
                View Full Notice
            </button>
        </div>
    );

    // Modal Component
    const Modal = () => {
        if (!selectedNotice) return null;

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                aria-modal="true"
                role="dialog"
            >
                <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
                <div className="relative w-[90%] sm:w-[85%] md:w-3/5 lg:w-2/5 max-h-[95vh] animate-slideUp">
                    <div
                        className="bg-white rounded-xl p-4 md:p-6 shadow-xl flex flex-col max-h-[95vh] overflow-y-auto"
                        style={{ borderLeft: `6px solid ${getPriorityColor(selectedNotice.priority)}` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-amber-950">{selectedNotice.title}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityBadge(
                                            selectedNotice.priority
                                        )}`}
                                    >
                                        {selectedNotice.priority}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Posted by:</span> {selectedNotice.createdBy}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Date:</span>{" "}
                                {formatDateTime(selectedNotice.createdAt)}
                            </p>
                        </div>

                        <div className="flex-1 overflow-auto mb-4">
                            <p className="text-sm text-gray-700 font-semibold mb-2">Notice Content:</p>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {selectedNotice.content}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={closeModal}
                                className="hover:scale-95 transition-transform duration-300 flex-1 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

                {/* Animation styles */}
                <style>
                    {`
            @keyframes slideUp {
              0% { transform: translateY(100%); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            .animate-slideUp { animation: slideUp 0.2s ease-out forwards; }
          `}
                </style>
            </div>
        );
    };

    // Filter Bar Component
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
                onClick={() => setFilter("URGENT")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "URGENT"
                    ? "bg-red-500 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-red-100"
                    }`}
            >
                <FaFilter /> Urgent
            </button>
            <button
                onClick={() => setFilter("IMPORTANT")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "IMPORTANT"
                    ? "bg-yellow-500 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-yellow-100"
                    }`}
            >
                <FaFilter /> Important
            </button>
            <button
                onClick={() => setFilter("GENERAL")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "GENERAL"
                    ? "bg-pink-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-pink-100"
                    }`}
            >
                <FaFilter /> General
            </button>
        </div>
    );

    return (
        <div className="space-y-6 p-4">
            <div className="mb-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                <h1 className="text-2xl text-center md:text-3xl font-bold text-amber-950">
                    Notice Board
                </h1>
            </div>

            {/* Filter Bar */}
            <FilterBar />

            {/* Empty State */}
            {sortedNotices.length === 0 && (
                <main className="w-full h-[60vh] flex flex-col items-center justify-center p-4">
                    <div className="w-20 h-20 bg-[#522320]/5 rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">📢</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#522320] mb-2 text-center">
                        No Notices Available
                    </h3>
                    <p className="text-[#522320]/60 text-sm text-center max-w-md">
                        There are no notices to display at the moment. Check back later for updates and announcements.
                    </p>
                </main>
            )}

            {/* Notices Grid */}
            {sortedNotices.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedNotices.map((notice) => (
                        <NoticeCard key={notice.id} notice={notice} />
                    ))}
                </div>
            )}

            <Modal />
        </div>
    );
};

export default Notices;
