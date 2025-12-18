import React, { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext.jsx';
import PhanAI from "../../components/PhanAI.jsx";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const userNameDisplay = user?.fullName
    ? user?.fullName.split(" ")[0]
    : ((user?.username)?.charAt(0).toUpperCase() + (user?.username).slice(1));
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

        {/* Conditional Dashboard Rendering */}
        {isAdmin ? (
          <AdminDashboard attendancePercentage={attendancePercentage} />
        ) : (
          <UserDashboard attendancePercentage={attendancePercentage} />
        )}

        <PhanAI />
      </div>
    </div>
  );
};

export default Dashboard;
