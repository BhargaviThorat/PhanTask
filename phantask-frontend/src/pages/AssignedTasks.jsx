import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import { FaFilter } from "react-icons/fa";


const AssignedTasks = () => {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);


  // Filter state: ALL, PENDING, SUBMITTED
  const [filter, setFilter] = useState("ALL");


  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      try {
        const res = await apiService.getMyTasks();
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        toast.error("Failed to fetch tasks.");
      } finally {
        setTaskLoading(false);
      }
    };
    fetchTasks();
  }, [user]);


  // console.log(tasks);



  if (loading || taskLoading) return <div>Loading tasks...</div>;


  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return t.status === "PENDING";
    if (filter === "SUBMITTED") return t.status === "SUBMITTED";
    return true;
  });


  const pendingTasks = filteredTasks
    .filter((t) => t.status === "PENDING")
    .sort((a, b) => new Date(b.assignDate) - new Date(a.assignDate));


  const completedTasks = filteredTasks
    .filter((t) => t.status === "SUBMITTED")
    .sort((a, b) => new Date(b.uploadDateTime) - new Date(a.uploadDateTime));


  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getFullYear()}`;
  };


  // Modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  const openModal = (task) => {
    setSelectedTask(task);
    setConfirmVisible(false);
    setConfirmed(false);
  };


  const closeModal = () => {
    setSelectedTask(null);
    setConfirmVisible(false);
    setConfirmed(false);
    setSubmitting(false);
  };


  const handleSubmitClick = async () => {
    if (!confirmed || !selectedTask) return;


    setSubmitting(true);
    try {
      await apiService.submitTask(selectedTask.id, null);
      toast.success(`${selectedTask.taskName} submitted successfully!`);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? { ...t, status: "SUBMITTED", uploadDateTime: new Date().toISOString() }
            : t
        )
      );
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit task.");
      setSubmitting(false);
    }
  };


  // Task Card Component
  const TaskCard = ({ task, isPending }) => (
    <div
      className="border rounded-xl p-4 bg-white shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between items-center"
      style={{ borderColor: isPending ? "#FACC15" : "#22C55E" }}
    >
      <div>
        <h3 className="font-semibold text-lg text-center">{task.taskName}</h3>
        <p className="text-sm text-center mt-1">
          {isPending ? `Assign Date: ${formatDate(task.assignDate)}` : `Upload Date: ${formatDate(task.uploadDateTime)}`}
        </p>
        <p className="text-sm text-center mt-1">Due Date: {formatDate(task.dueDate)}</p>
      </div>
      <button
        onClick={() => openModal(task)}
        className={`mt-4 w-[80%] py-2 rounded-lg text-white text-md hover:scale-95 transition-transform duration-300 ${isPending ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
          }`}
      >
        View Details
      </button>
    </div>
  );


  // Modal Component
  const Modal = () => {
    if (!selectedTask) return null;
    const isPending = selectedTask.status === "PENDING";


    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        aria-modal="true"
        role="dialog"
      >
        <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
        <div className="relative w-[90%] sm:w-[85%] md:w-3/5 lg:w-2/5 max-h-[95vh] animate-slideUp">
          <div
            className="bg-white rounded-xl p-4 md:p-6 shadow-xl max-h-[95vh] overflow-y-auto flex flex-col"
            style={{ border: `2px solid ${isPending ? "#FACC15" : "#22C55E"}` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedTask.taskName}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Created By:</span> {selectedTask.createdBy}
                </p>
              </div>
            </div>


            <div className="mt-4 flex-1 overflow-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Assign Date</p>
                  <p className="text-sm">{formatDate(selectedTask.assignDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Upload Date</p>
                  <p className="text-sm">{selectedTask.uploadDateTime ? formatDate(selectedTask.uploadDateTime) : "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Due Date</p>
                  <p className="text-sm">{formatDate(selectedTask.dueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Status</p>
                  <p className="text-sm">{selectedTask.status}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-600 font-medium">Description</p>
                <p className="text-sm whitespace-pre-wrap mt-1">{selectedTask.description}</p>
              </div>
            </div>


            <div className="mt-4">
              {isPending ? (
                <>
                  {!confirmVisible ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmVisible(true)}
                        className="flex-1 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500 hover:scale-95 transition-transform duration-300"
                      >
                        Submit Task
                      </button>
                      <button
                        onClick={closeModal}
                        className="hover:scale-95 transition-transform duration-300 flex-1 py-2 rounded-lg border bg-stone-200 border-gray-200"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 border-t pt-3">
                      <label className="flex items-center gap-2 justify-center text-sm">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          onChange={(e) => setConfirmed(e.target.checked)}
                          className="accent-yellow-800"
                        />
                        I hereby declare the task is completed to the best of my ability.
                      </label>


                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitClick}
                          disabled={!confirmed || submitting}
                          className={`hover:scale-95 transition-transform duration-300 flex-1 py-2 rounded-lg text-white ${confirmed ? "bg-green-600 hover:bg-green-700" : "bg-green-600/60 cursor-not-allowed"
                            }`}
                        >
                          {submitting ? "Submitting..." : "Confirm & Submit"}
                        </button>
                        <button
                          onClick={() => {
                            setConfirmVisible(false);
                            setConfirmed(false);
                          }}
                          className="hover:scale-95 transition-transform duration-300 flex-1 py-2 rounded-lg border bg-stone-200 border-stone-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={closeModal}
                    className="hover:scale-95 transition-transform duration-300 flex-1 py-2 rounded-lg border bg-stone-200 border-gray-200"
                  >
                    Close
                  </button>
                </div>
              )}
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


  // Task Section Component
  const TaskSection = ({ tasks, isPending }) => (
    <div
      className="border rounded-xl p-4 bg-white/80 shadow-sm"
      style={{ borderColor: isPending ? "#FACC15" : "#22C55E" }}
    >
      <h2
        className="text-xl font-bold mb-3 text-center md:text-left"
        style={{ color: isPending ? "#B45309" : "#166534" }}
      >
        {isPending ? "Pending Tasks" : "Completed Tasks"}
      </h2>


      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          {isPending ? "No pending tasks." : "No completed tasks."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} isPending={isPending} />
          ))}
        </div>
      )}
    </div>
  );


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
        onClick={() => setFilter("PENDING")}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${filter === "PENDING"
          ? "bg-yellow-500 text-white"
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
    </div>
  );


  return (
    <div className="space-y-6 p-4">
      <div className="mb-3 bg-white/60 rounded-xl p-4 shadow-sm border border-gray-100">
        <h1 className="text-2xl text-center md:text-3xl font-bold text-amber-950">
          Assigned Tasks
        </h1>
      </div>


      {/* Filter Bar */}
      <FilterBar />


      {filteredTasks.length === 0 && (
        <main className="w-full h-full flex flex-col items-center justify-center p-4">
          <h3 className="text-xl font-bold text-[#522320] mb-1.5 text-center">
            All Caught Up!
          </h3>
          <p className="text-[#522320]/60 text-xm text-center">No Tasks To Show Till Now.</p>
        </main>
      )}


      {pendingTasks.length > 0 && <TaskSection tasks={pendingTasks} isPending={true} />}
      {completedTasks.length > 0 && <TaskSection tasks={completedTasks} isPending={false} />}


      <Modal />
    </div>
  );
};


export default AssignedTasks;
  