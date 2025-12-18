import React from "react";
import AttendanceCard from "../../components/dashboard_cards/AttendanceCard";
import FocusReminderCard from "../../components/dashboard_cards/FocusReminderCard";
import NoticeBoardCard from "../../components/dashboard_cards/NoticeBoardCard";
import CreateUserCard from "../../components/dashboard_cards/CreateUserCard.jsx";
import CreateTasksCard from "../../components/dashboard_cards/CreateTasksCard.jsx";
import AddRoleCard from "../../components/dashboard_cards/AddRoleCard.jsx";
import CreateFeedbackCard from "../../components/dashboard_cards/CreateFeedbackCard.jsx";
import CreateNoticeCard from "../../components/dashboard_cards/CreateNoticeCard.jsx";

const AdminDashboard = ({ attendancePercentage }) => {
    return (
        <>
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="h-72"><CreateUserCard /></div>
                <div className="h-72"><CreateTasksCard /></div>
                {/* <div className="h-72">
                    <AttendanceCard attendancePercentage={attendancePercentage} />
                </div> */}
            </div>

            {/* Middle Section - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="h-72"><CreateFeedbackCard /></div>
                <div className="h-72"><CreateNoticeCard /></div>
            </div>

            {/* Bottom Section - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="h-72"><AddRoleCard /></div>
                <div className="h-72"><FocusReminderCard /></div>
            </div>
        </>
    );
};

export default AdminDashboard;
