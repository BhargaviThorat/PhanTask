import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { FaFilter } from "react-icons/fa";
import Select from "react-select";

// * ============================================================================
// * MANAGE TASKS COMPONENT
// * ============================================================================
// ! This component is only accessible on desktop (screen width >= 990px)
// ? Handles task management: view, search, filter, edit, and delete tasks

const ManageTasks = () => {
    // * ============================================================================
    // * STATE MANAGEMENT
    // * ============================================================================

    // Task lists
    const [pendingTasks, setPendingTasks] = useState([]);
    const [submittedTasks, setSubmittedTasks] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Modal and selection states
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Search states
    const [searchTermPending, setSearchTermPending] = useState("");
    const [searchTermSubmitted, setSearchTermSubmitted] = useState("");

    // Filter state: ALL, PENDING, SUBMITTED, OVERDUE
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
    // * OVERDUE CHECK FUNCTION
    // * ============================================================================
    // ? Checks if a task is overdue (due date passed and status is PENDING)

    const isOverdue = (task) => {
        if (!task.dueDate || task.status !== "PENDING") return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // * ============================================================================
    // * SORT TASKS BY DATE
    // * ============================================================================
    // ? Sorts pending tasks by due date (ascending), submitted by upload date (descending)

    const sortPendingByDueDate = (tasks) => {
        return [...tasks].sort((a, b) => {
            // Tasks without due date go to the end
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            // Sort by due date ascending (earliest first)
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    };

    const sortSubmittedByUploadDate = (tasks) => {
        return [...tasks].sort((a, b) => {
            // Tasks without upload date go to the end
            if (!a.uploadDateTime && !b.uploadDateTime) return 0;
            if (!a.uploadDateTime) return 1;
            if (!b.uploadDateTime) return -1;

            // Sort by upload date descending (most recent first)
            return new Date(b.uploadDateTime) - new Date(a.uploadDateTime);
        });
    };

    // * ============================================================================
    // * FETCH TASKS ON MOUNT
    // * ============================================================================
    // ? Fetches all tasks and separates them into pending and submitted

    useEffect(() => {
        if (!isDesktop) return; // Don't fetch if not desktop

        const fetchTasks = async () => {
            try {
                const response = await apiService.getAllTasks();
                const allTasks = response.data;

                // Separate tasks by status
                const pending = allTasks.filter((t) => t.status === "PENDING");
                const submitted = allTasks.filter((t) => t.status !== "PENDING");

                // Sort tasks by their respective dates
                setPendingTasks(sortPendingByDueDate(pending));
                setSubmittedTasks(sortSubmittedByUploadDate(submitted));

                console.log("Pending tasks:", pending);
                console.log("Submitted tasks:", submitted);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load tasks");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [isDesktop]);

    // * ============================================================================
    // * REFETCH TASKS FUNCTION
    // * ============================================================================
    // ? Re-fetches all tasks after edit/delete

    const refetchTasks = async () => {
        try {
            const response = await apiService.getAllTasks();
            const allTasks = response.data;

            const pending = allTasks.filter((t) => t.status === "PENDING");
            const submitted = allTasks.filter((t) => t.status !== "PENDING");

            setPendingTasks(sortPendingByDueDate(pending));
            setSubmittedTasks(sortSubmittedByUploadDate(submitted));
        } catch (err) {
            console.error(err);
            toast.error("Failed to refresh tasks");
        }
    };

    // * ============================================================================
    // * FILTERED TASKS (WITH SEARCH)
    // * ============================================================================
    // ? Filters tasks based on search terms (taskName, assignedToUser, assignedToRole)

    const filteredPendingTasks = pendingTasks.filter((task) => {
        const searchLower = searchTermPending.toLowerCase();
        return (
            (task.taskName || "").toLowerCase().includes(searchLower) ||
            (task.assignedToUser || "").toLowerCase().includes(searchLower) ||
            (task.assignedToRole || "").toLowerCase().includes(searchLower)
        );
    });

    const filteredSubmittedTasks = submittedTasks.filter((task) => {
        const searchLower = searchTermSubmitted.toLowerCase();
        return (
            (task.taskName || "").toLowerCase().includes(searchLower) ||
            (task.assignedToUser || "").toLowerCase().includes(searchLower) ||
            (task.assignedToRole || "").toLowerCase().includes(searchLower)
        );
    });

    // * ============================================================================
    // * OVERDUE TASKS
    // * ============================================================================
    // ? Filters pending tasks that are overdue

    const overdueTasks = filteredPendingTasks.filter(isOverdue);

    // * ============================================================================
    // * SECTION VISIBILITY (BASED ON FILTER)
    // * ============================================================================
    // ? Determines which sections to show based on selected filter

    const showPendingSection = filter === "ALL" || filter === "PENDING";
    const showSubmittedSection = filter === "ALL" || filter === "SUBMITTED";
    const showOverdueSection = filter === "OVERDUE";

    // * ============================================================================
    // * DELETE TASK HANDLER
    // * ============================================================================
    // ! Deletes task from the system

    const handleDelete = async () => {
        if (!selectedTask) return;

        setActionLoading(selectedTask.id);

        try {
            await apiService.deleteTask(selectedTask.id);
            toast.success("Task deleted successfully");

            // Remove from appropriate list
            if (selectedTask.status === "PENDING") {
                setPendingTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
            } else {
                setSubmittedTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
            }

            setShowDeleteModal(false);
            setSelectedTask(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete task");
        } finally {
            setActionLoading(null);
        }
    };

    // * ============================================================================
    // * FILTER BAR COMPONENT
    // * ============================================================================
    // ? Four filter buttons: All, Pending, Submitted, Overdue

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
                onClick={() => setFilter("PENDING")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "PENDING"
                    ? "bg-yellow-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-yellow-100"
                    }`}
            >
                <FaFilter /> Pending
            </button>
            <button
                onClick={() => setFilter("SUBMITTED")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "SUBMITTED"
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-green-100"
                    }`}
            >
                <FaFilter /> Submitted
            </button>
            <button
                onClick={() => setFilter("OVERDUE")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "OVERDUE"
                    ? "bg-red-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-red-100"
                    }`}
            >
                <FaFilter /> Overdue
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
                        The <span className="font-semibold">Manage Tasks</span> functionality is only accessible on a desktop or a large screen.
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
    // ? Shows skeleton loader while fetching tasks

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
                    Manage Tasks
                </h1>
            </div>

            {/* Filter Bar */}
            <FilterBar />

            {/* No tasks message when filtered */}
            {filter !== "ALL" &&
                ((filter === "PENDING" && filteredPendingTasks.length === 0) ||
                    (filter === "SUBMITTED" && filteredSubmittedTasks.length === 0) ||
                    (filter === "OVERDUE" && overdueTasks.length === 0)) && (
                    <main className="w-full h-full flex flex-col items-center justify-center p-4">
                        <h3 className="text-xl font-bold text-[#522320] mb-1.5 text-center">
                            No {filter === "PENDING" ? "Pending" : filter === "SUBMITTED" ? "Submitted" : "Overdue"} Tasks Found
                        </h3>
                        <p className="text-[#522320]/60 text-sm text-center">
                            {filter === "PENDING"
                                ? "No pending tasks to display."
                                : filter === "SUBMITTED"
                                    ? "No submitted tasks to display."
                                    : "No overdue tasks to display."}
                        </p>
                    </main>
                )}

            {/* ============================================================================ */}
            {/* OVERDUE TASKS TABLE */}
            {/* ============================================================================ */}
            {/* ? Shows overdue pending tasks with red highlighting */}

            {showOverdueSection && overdueTasks.length > 0 && (
                <div className="border rounded-xl p-4 bg-white/80 shadow-sm border-red-500">
                    <div className="mb-3">
                        <h2 className="text-xl font-bold text-red-700">Overdue Tasks</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-red-100 text-red-900">
                                    <th className="p-3 text-center">Task Name</th>
                                    <th className="p-3 text-center">Assigned To</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-center">Due Date</th>
                                    <th className="p-3 text-center">Assigned On</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overdueTasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        className="border-t hover:bg-red-50 transition-colors"
                                    >
                                        <td className="p-3 font-medium text-center">
                                            {task.taskName || "(Untitled)"}
                                        </td>
                                        <td className="p-3 text-center">
                                            {task.assignedToUser ? (
                                                <span className="text-gray-800">{task.assignedToUser}</span>
                                            ) : task.assignedToRole ? (
                                                <span className="inline-flex items-center rounded-full bg-[#FCE0D6] px-2.5 py-1 text-xs font-medium text-[#8c432b]">
                                                    {task.assignedToRole}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center text-xs text-red-600 font-medium">
                                            {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                }) + " (OVERDUE)"
                                                : "—"}
                                        </td>
                                        <td className="p-3 text-center text-xs text-yellow-800 font-medium">
                                            {task.assignDate
                                                ? new Date(task.assignDate).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "—"}
                                        </td>
                                        <td className="p-3 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="px-3 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 hover:scale-95 transition-transform"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setShowEditModal(true);
                                                }}
                                                className="px-3 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 hover:scale-95 transition-transform"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="px-3 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 hover:scale-95 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ============================================================================ */}
            {/* PENDING TASKS TABLE */}
            {/* ============================================================================ */}
            {/* ? Shows pending tasks with search and action buttons */}

            {showPendingSection && pendingTasks.length > 0 && (
                <div className="border rounded-xl p-4 bg-white/80 shadow-sm border-yellow-500">
                    <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h2 className="text-xl font-bold text-yellow-700">Pending Tasks</h2>
                        <input
                            type="text"
                            placeholder="Search by task name or assignee..."
                            value={searchTermPending}
                            onChange={(e) => setSearchTermPending(e.target.value)}
                            className="w-full md:w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>

                    {filteredPendingTasks.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">
                            {searchTermPending ? "No tasks match your search." : "No pending tasks found."}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-yellow-100 text-yellow-900">
                                        <th className="p-3 text-center">Task Name</th>
                                        <th className="p-3 text-center">Assigned To</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-center">Due Date</th>
                                        <th className="p-3 text-center">Assigned On</th>
                                        <th className="p-3 text-center">Submitted On</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPendingTasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            className={`border-t hover:bg-yellow-50 transition-colors ${isOverdue(task) ? "bg-red-50" : ""
                                                }`}
                                        >
                                            <td className="p-3 font-medium text-center">
                                                {task.taskName || "(Untitled)"}
                                            </td>
                                            <td className="p-3 text-center">
                                                {task.assignedToUser ? (
                                                    <span className="text-gray-800">{task.assignedToUser}</span>
                                                ) : task.assignedToRole ? (
                                                    <span className="inline-flex items-center rounded-full bg-[#FCE0D6] px-2.5 py-1 text-xs font-medium text-[#8c432b]">
                                                        {task.assignedToRole}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className={`p-3 text-center text-xs font-medium ${isOverdue(task) ? "text-red-600" : "text-yellow-800"
                                                }`}>
                                                {task.dueDate
                                                    ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    }) + (isOverdue(task) ? " (OVERDUE)" : "")
                                                    : "—"}
                                            </td>
                                            <td className="p-3 text-center text-xs text-yellow-800 font-medium">
                                                {task.assignDate
                                                    ? new Date(task.assignDate).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>
                                            <td className="p-3 text-center text-xs text-gray-500">
                                                {task.uploadDateTime
                                                    ? new Date(task.uploadDateTime).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>
                                            <td className="p-3 flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 hover:scale-95 transition-transform"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 hover:scale-95 transition-transform"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 hover:scale-95 transition-all"
                                                >
                                                    Delete
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
            {/* SUBMITTED TASKS TABLE */}
            {/* ============================================================================ */}
            {/* ? Shows submitted tasks with search - NO EDIT BUTTON */}

            {showSubmittedSection && submittedTasks.length > 0 && (
                <div className="border rounded-xl p-4 bg-white/80 shadow-sm border-green-300">
                    <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h2 className="text-xl font-bold text-green-700">Submitted Tasks</h2>
                        <input
                            type="text"
                            placeholder="Search by task name or assignee..."
                            value={searchTermSubmitted}
                            onChange={(e) => setSearchTermSubmitted(e.target.value)}
                            className="w-full md:w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {filteredSubmittedTasks.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">
                            {searchTermSubmitted ? "No tasks match your search." : "Submitted tasks will appear here."}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-green-100 text-green-900">
                                        <th className="p-3 text-center">Task Name</th>
                                        <th className="p-3 text-center">Assigned To</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-center">Due Date</th>
                                        <th className="p-3 text-center">Assigned On</th>
                                        <th className="p-3 text-center">Submitted On</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubmittedTasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            className="border-t hover:bg-green-50 transition-colors"
                                        >
                                            <td className="p-3 font-medium text-center">
                                                {task.taskName || "(Untitled)"}
                                            </td>
                                            <td className="p-3 text-center">
                                                {task.assignedToUser ? (
                                                    <span className="text-gray-800">{task.assignedToUser}</span>
                                                ) : task.assignedToRole ? (
                                                    <span className="inline-flex items-center rounded-full bg-[#FCE0D6] px-2.5 py-1 text-xs font-medium text-[#8c432b]">
                                                        {task.assignedToRole}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center text-xs text-green-800 font-medium">
                                                {task.dueDate
                                                    ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>
                                            <td className="p-3 text-center text-xs text-yellow-800 font-medium">
                                                {task.assignDate
                                                    ? new Date(task.assignDate).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>
                                            <td className="p-3 text-center text-xs text-green-800 font-medium">
                                                {task.uploadDateTime
                                                    ? new Date(task.uploadDateTime).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>
                                            <td className="p-3 flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 hover:scale-95 transition-transform"
                                                >
                                                    View
                                                </button>
                                                {/* NO EDIT BUTTON FOR SUBMITTED TASKS */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 hover:scale-95 transition-all"
                                                >
                                                    Delete
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

            {/* DELETE MODAL */}
            {showDeleteModal && selectedTask && (
                <DeleteTaskModal
                    task={selectedTask}
                    loading={actionLoading === selectedTask.id}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedTask(null);
                    }}
                    onConfirm={handleDelete}
                />
            )}

            {/* EDIT MODAL */}
            {showEditModal && selectedTask && (
                <EditTaskModal
                    task={selectedTask}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedTask(null);
                    }}
                    onSuccess={refetchTasks}
                />
            )}

            {/* DETAILS MODAL */}
            {showDetailsModal && selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedTask(null);
                    }}
                />
            )}
        </div>
    );
};

export default ManageTasks;

// * ============================================================================
// * DELETE TASK MODAL
// * ============================================================================
// ! Confirmation modal before deleting a task
// ? Shows task's name and requires explicit confirmation

const DeleteTaskModal = ({ task, onClose, onConfirm, loading }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-[90%] sm:w-[400px] animate-slideUp">
                <div className="bg-white rounded-xl p-5 shadow-xl border border-red-300">
                    <h3 className="text-xl font-bold text-red-700 text-center">Delete Task</h3>
                    <p className="text-sm text-gray-700 mt-3 text-center">
                        Are you sure you want to delete <span className="font-semibold">{task.taskName || "(Untitled)"}</span>?
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-5 flex gap-2">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold hover:scale-95 transition"
                        >
                            {loading ? "Deleting..." : "Yes, Delete"}
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
// * EDIT TASK MODAL (WITH SELECT DROPDOWNS)
// * ============================================================================
// ! Modal for editing task details by admin
// ? Allows editing with 3 separate assignment options like CreateTask

const EditTaskModal = ({ task, onClose, onSuccess }) => {
    // * State Management
    const [taskName, setTaskName] = useState(task.taskName || "");
    const [description, setDescription] = useState(task.description || "");
    const [assignDate, setAssignDate] = useState(task.assignDate || "");
    const [dueDate, setDueDate] = useState(task.dueDate || "");
    const [assignedUser, setAssignedUser] = useState(task.assignedToUser || "");
    const [assignedRole, setAssignedRole] = useState(task.assignedToRole || "");
    const [assignedRoleByUsers, setAssignedRoleByUsers] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // * Role Options for Dropdown
    const roleOptions = [
        { value: "", label: "Select Role..." },
        { value: "USER", label: "User" },
        { value: "HR", label: "HR" },
        { value: "STUDENT", label: "Student" },
    ];

    // * User Options for Dropdown (dynamically populated)
    const userOptions = [
        { value: "", label: "Select User..." },
        ...users.filter(user => !user.roles.includes("ADMIN"))
            .map(user => ({
                value: user.username,
                label: `${user.username} (${user.email})`
            }))
    ];

    // * Custom Styles for React-Select (matching input styling)
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: "40px",
            borderRadius: "0.5rem",
            borderWidth: "1px",
            borderColor: state.isFocused ? "#eab308" : "#d1d5db",
            boxShadow: state.isFocused
                ? "0 0 0 2px rgba(234, 179, 8, 0.5)"
                : "none",
            padding: "0.5rem 0.75rem",
            fontSize: "0.875rem",
            backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
            opacity: state.isDisabled ? 0.6 : 1,
            cursor: state.isDisabled ? "not-allowed" : "default",
            "&:hover": {
                borderColor: state.isFocused ? "#eab308" : "#d1d5db",
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

    // * Fetch Active Users on Component Mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRes = await apiService.getAllActiveUsers();
                const fetchedUsers = usersRes.data || [];

                // Natural sort by username
                const naturalSort = (a, b) => {
                    const regex = /^([a-zA-Z]+)(\d*)$/;
                    const [, textA = "", numA = "0"] = a.username.match(regex) || [];
                    const [, textB = "", numB = "0"] = b.username.match(regex) || [];

                    const textCompare = textA.localeCompare(textB);
                    if (textCompare !== 0) return textCompare;
                    return Number(numA) - Number(numB);
                };

                const sortedUsers = fetchedUsers.sort(naturalSort);
                setUsers(sortedUsers);
            } catch (err) {
                toast.error("Failed to fetch active users");
            }
        };
        fetchUsers();
    }, []);

    // * Handle Task Update
    const handleUpdateTask = async () => {
        try {
            setLoading(true);

            // ? Assign to all users with selected role
            if (assignedRoleByUsers) {
                const usersWithRole = users.filter(user =>
                    user.roles.includes(assignedRoleByUsers)
                );

                if (usersWithRole.length === 0) {
                    toast.error(`No users found with role ${assignedRoleByUsers}`);
                    return;
                }

                // First, delete the original task
                await apiService.deleteTask(task.id);

                // Then create new tasks for each user with that role
                for (const user of usersWithRole) {
                    const taskData = {
                        taskName: taskName.trim() || null,
                        description: description.trim() || null,
                        assignDate: assignDate || null,
                        dueDate: dueDate || null,
                        assignedToUser: user.username,
                        assignedToRole: null,
                        status: "PENDING",
                    };

                    await apiService.createTask(taskData);
                }

                toast.success(`Task reassigned to all users with role ${assignedRoleByUsers}`);
            } else {
                // ? Normal single assignment update (user or role)
                const updateData = {
                    taskName: taskName.trim() || null,
                    description: description.trim() || null,
                    assignDate: assignDate || null,
                    dueDate: dueDate || null,
                    assignedToUser: assignedUser.trim() || null,
                    assignedToRole: assignedRole.trim() || null,
                };

                await apiService.updateTask(task.id, updateData);
                toast.success("Task updated successfully");
            }

            onSuccess(); // Refresh task list
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.error || "Failed to update task");
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
                        <h3 className="text-2xl font-bold text-amber-950">Edit Task</h3>
                        <p className="text-sm text-gray-700 mt-1">
                            Update task details for <span className="font-semibold">{task.taskName || "(Untitled)"}</span>
                        </p>
                    </div>

                    {/* * Body Section - Form Inputs */}
                    <div className="flex-1 flex flex-col gap-3">
                        {/* Task Name Input */}
                        <label className="text-sm font-semibold text-gray-800">Task Name</label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder="Enter task name"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />

                        {/* Description Input */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description"
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                        />

                        {/* Assign Date Input */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Assign Date</label>
                        <input
                            type="date"
                            value={assignDate}
                            onChange={(e) => setAssignDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />

                        {/* Due Date Input */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />

                        {/* Assign to User Select */}
                        <label className="text-sm font-semibold text-gray-800 mt-1">
                            Assign to User
                        </label>
                        <Select
                            styles={selectStyles}
                            isDisabled={assignedRoleByUsers !== "" || assignedRole !== ""}
                            placeholder="Select User..."
                            value={
                                assignedUser
                                    ? userOptions.find(u => u.value === assignedUser)
                                    : null
                            }
                            onChange={(opt) => {
                                setAssignedUser(opt?.value || "");
                                if (opt) {
                                    setAssignedRole("");
                                    setAssignedRoleByUsers("");
                                }
                            }}
                            options={userOptions}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />

                        {/* OR Separator */}
                        <div className="flex items-center my-1">
                            <div className="flex-grow border-t border-[#522320]/40"></div>
                            <span className="mx-2 text-xs text-[#522320]/60 font-medium bg-white px-2">OR</span>
                            <div className="flex-grow border-t border-[#522320]/40"></div>
                        </div>

                        {/* Assign to Users by Role Select */}
                        <label className="text-sm font-semibold text-gray-800">
                            Assign to Users by Role
                        </label>
                        <Select
                            styles={selectStyles}
                            isDisabled={assignedUser !== "" || assignedRole !== ""}
                            placeholder="Select Role..."
                            value={
                                assignedRoleByUsers
                                    ? roleOptions.find(r => r.value === assignedRoleByUsers)
                                    : null
                            }
                            onChange={(opt) => {
                                setAssignedRoleByUsers(opt?.value || "");
                                if (opt) {
                                    setAssignedUser("");
                                    setAssignedRole("");
                                }
                            }}
                            options={roleOptions}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />

                        {/* OR Separator */}
                        <div className="flex items-center my-1">
                            <div className="flex-grow border-t border-[#522320]/40"></div>
                            <span className="mx-2 text-xs text-[#522320]/60 font-medium bg-white px-2">OR</span>
                            <div className="flex-grow border-t border-[#522320]/40"></div>
                        </div>

                        {/* Assign to Role Select */}
                        <label className="text-sm font-semibold text-gray-800">Assign to Role</label>
                        <Select
                            styles={selectStyles}
                            isDisabled={assignedUser !== "" || assignedRoleByUsers !== ""}
                            placeholder="Select Role..."
                            value={
                                assignedRole
                                    ? roleOptions.find(r => r.value === assignedRole)
                                    : null
                            }
                            onChange={(opt) => {
                                setAssignedRole(opt?.value || "");
                                if (opt) {
                                    setAssignedUser("");
                                    setAssignedRoleByUsers("");
                                }
                            }}
                            options={roleOptions}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>

                    {/* * Footer Section - Action Buttons */}
                    <div className="mt-4 flex-shrink-0 flex gap-2">
                        <button
                            onClick={handleUpdateTask}
                            disabled={loading}
                            className={`flex-1 py-2 rounded-lg text-white font-semibold hover:scale-95 transition-transform duration-300 shadow ${loading ? "bg-yellow-500/60 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"
                                }`}
                        >
                            {loading ? "Updating..." : "Update Task"}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold hover:scale-95 transition-transform duration-300 shadow"
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

// * ============================================================================
// * TASK DETAILS MODAL
// * ============================================================================
// ! Modal for viewing full task details including description and drive URL
// ? Shows all task information in a read-only format

const TaskDetailsModal = ({ task, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* * Background Overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* * Modal Container */}
            <div className="relative w-[90%] sm:w-[80%] md:w-1/2 max-h-[95vh] animate-slideUp">
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-xl border border-orange-500/30 max-h-[95vh] overflow-y-auto">
                    {/* * Header */}
                    <div className="mb-4 text-center">
                        <h3 className="text-2xl font-bold text-amber-950">Task Details</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.taskName || "(Untitled)"}</p>
                    </div>

                    {/* * Details Grid */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-semibold text-gray-800">Description:</label>
                            <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg">
                                {task.description || "No description provided"}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-semibold text-gray-800">Assigned Date:</label>
                                <p className="text-sm text-gray-700 mt-1">
                                    {task.assignDate
                                        ? new Date(task.assignDate).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-800">Due Date:</label>
                                <p className="text-sm text-gray-700 mt-1">
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-semibold text-gray-800">Assigned To User:</label>
                                <p className="text-sm text-gray-700 mt-1">{task.assignedToUser || "—"}</p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-800">Assigned To Role:</label>
                                <p className="text-sm text-gray-700 mt-1">{task.assignedToRole || "—"}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-800">Status:</label>
                            <p className="text-sm text-gray-700 mt-1">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${task.status === "PENDING"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    {task.status}
                                </span>
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-800">Submitted On:</label>
                            <p className="text-sm text-gray-700 mt-1">
                                {task.uploadDateTime
                                    ? new Date(task.uploadDateTime).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })
                                    : "Not submitted yet"}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-800">Drive URL:</label>
                            {task.driveUrl ? (
                                <a
                                    href={task.driveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-orange-600 hover:text-orange-800 underline mt-1 block"
                                >
                                    View Submission
                                </a>
                            ) : (
                                <p className="text-sm text-gray-700 mt-1">No submission URL</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-800">Created By:</label>
                            <p className="text-sm text-gray-700 mt-1">{task.createdBy || "—"}</p>
                        </div>
                    </div>

                    {/* * Close Button */}
                    <div className="mt-6">
                        <button
                            onClick={onClose}
                            className="w-full py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold hover:scale-95 transition duration-300 shadow"
                        >
                            Close
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
