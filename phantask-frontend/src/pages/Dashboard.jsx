import React, { useEffect, useState } from "react";
import AttendanceCard from "../components/dashboard_cards/AttendanceCard";
import SocialHighlightsCard from "../components/dashboard_cards/SocialHighlightsCard";
import FocusReminderCard from "../components/dashboard_cards/FocusReminderCard";
import NoticeBoardCard from "../components/dashboard_cards/NoticeBoardCard";
import FeedbackSummaryCard from "../components/dashboard_cards/FeedbackSummaryCard";
import AssignedTasksCard from "../components/dashboard_cards/AssignedTasksCard";
import ScheduleCard from "../components/dashboard_cards/ScheduleCard.jsx";
import { useAuth } from '../context/AuthContext';
import PhanAI from "../components/PhanAI.jsx";
import AdminCreateUser from "../components/dashboard_cards/CreateUserCard.jsx";
import AdminTasksCard from "../components/dashboard_cards/CreateTasksCard.jsx";
import AddRoleCard from "../components/dashboard_cards/AddRoleCard.jsx";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const userNameDisplay = user?.fullName ? user?.fullName.split(" ")[0] : ((user?.username)?.charAt(0).toUpperCase() + (user?.username).slice(1));
  const attendancePercentage = 80; // Example value for dynamic border color


  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();

    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    setCurrentDate(now.toLocaleDateString("en-US", options));
  }, []);

  // console.log(user);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-950">
            {greeting}, {userNameDisplay}!
          </h1>
          <p className="text-xs md:text-sm text-amber-950 mt-1">{currentDate}</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          {/* Left Column - Assignment & Social (spans 1 column) */}
          {isAdmin ?
            <div className="h-72"><AdminCreateUser /></div> :
            <div className="h-72"><ScheduleCard /></div>
          }

          {/* Middle Column - Attendance (spans 1 column) */}
          {isAdmin ?
            <div className="h-72"><AdminTasksCard /></div> :
            <div className="h-72"><AssignedTasksCard /></div>
          }

          {/* Right Column - Focus Reminder (spans 1 column) */}
          <div className="h-72">
            <AttendanceCard attendancePercentage={attendancePercentage} />
          </div>
        </div>

        {/* Middle Section - 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="h-48">
            <FeedbackSummaryCard />
          </div>
          <div className="h-48">
            <NoticeBoardCard />
          </div>
        </div>

        {/* Bottom Section - 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

          {isAdmin ?
            <div className="h-72"><AddRoleCard /></div> :
            <div className="h-72"><SocialHighlightsCard /></div>
          }

          <div className="h-72">
            <FocusReminderCard />
          </div>
        </div>

        <PhanAI />
      </div>
    </div>
  );
};

export default Dashboard;