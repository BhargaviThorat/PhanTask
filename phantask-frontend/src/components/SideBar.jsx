import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import DesktopSideBar from "./sidebar_components/DesktopSideBar";
import MobileSideBar from "./sidebar_components/MobileSideBar";
import TopRightIcons from "./sidebar_components/TopRightIcons";
import MainContent from "./sidebar_components/MainContent";
import { useAuth } from "../context/AuthContext";

const CLICK_WINDOW_MS = 4000;   // time window for 3 clicks
const REQUIRED_CLICKS = 3;

const SideBar = ({ children }) => {
  const { isAdmin } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [clickCount, setClickCount] = useState(0);
  const [firstClickTime, setFirstClickTime] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: "fa-house", path: "/" },

    // ! Tasks
    isAdmin
      ? { name: "Manage Tasks", icon: "fa-list-check", path: "/admin/manage-tasks" }
      : { name: "Assigned Tasks", icon: "fa-clipboard-list", path: "/tasks" },

    // ! Users (admin only)
    isAdmin ?
      { name: "Manage Users", icon: "fa-users-gear", path: "/admin/manage-users" } :
      null,

    // ! Attendance/Timesheet
    isAdmin
      ? { name: "Timesheet", icon: "fa-calendar-check", path: "/admin/manage-attendance" }
      : { name: "Attendance", icon: "fa-calendar-days", path: "/attendance" },

    // ! Notices
    isAdmin
      ? { name: "Manage Notices", icon: "fa-bullhorn", path: "/admin/manage-notices" }
      : { name: "Notices", icon: "fa-clipboard", path: "/notices" },

    { name: "SocialHub", icon: "fa-comments", path: "/socialhub" },
    { name: "Helpline", icon: "fa-headset", path: "/helpline" },
    { name: "Feedback", icon: "fa-comment-dots", path: "/feedback" },
    { name: "Settings", icon: "fa-gear", path: "/settings" },
  ].filter(Boolean); // remove nulls


  // Called when logo <img> is clicked (desktop or mobile)
  const handleLogoClick = () => {
    const now = Date.now();

    if (!firstClickTime || now - firstClickTime > CLICK_WINDOW_MS) {
      setFirstClickTime(now);
      setClickCount(1);
      return;
    }

    const next = clickCount + 1;
    setClickCount(next);

    if (next >= REQUIRED_CLICKS) {
      setShowConfetti(true);
      setIsFading(false);
      setClickCount(0);
      setFirstClickTime(null);

      // show for 10s, then fade out over 1s
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setShowConfetti(false);
          setIsFading(false);
        }, 1000);
      }, 10000);
    }
  };

  // Reset click streak if user waits too long
  useEffect(() => {
    if (!firstClickTime) return;
    const t = setTimeout(() => {
      setClickCount(0);
      setFirstClickTime(null);
    }, CLICK_WINDOW_MS);
    return () => clearTimeout(t);
  }, [firstClickTime]);

  return (
    <>
      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Confetti overlay */}
      {showConfetti && (
        <div
          className={`fixed inset-0 pointer-events-none ${isFading ? "animate-confetti-fade-out" : ""
            }`}
        >
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>
        {`
    /* Scrollbar styling ONLY for sidebars */
    .sidebar-scroll::-webkit-scrollbar {
      width: 8px;
    }

    .sidebar-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-scroll::-webkit-scrollbar-thumb {
      background: #8b3333;
      border-radius: 8px;
    }

    .sidebar-scroll::-webkit-scrollbar-thumb:hover {
      background: #a83c3c;
    }

    /* Firefox scrollbar for sidebar only */
    .sidebar-scroll {
      scrollbar-width: thin;
      scrollbar-color: #8b3333 transparent;
    }
  `}
      </style>


      <div className="flex h-screen bg-[#fff9f8] font-sans">
        {/* Desktop Sidebar */}
        <DesktopSideBar
          menuItems={menuItems}
          onLogoClick={handleLogoClick}
        />

        {/* Mobile Sidebar */}
        <MobileSideBar
          menuItems={menuItems}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onLogoClick={handleLogoClick}
        />

        {/* Top Right Icons (Hide when Mobile Sidebar is Open) */}
        <TopRightIcons isMobileOpen={isMobileOpen} />

        {/* Main Content */}
        <MainContent>{children}</MainContent>
      </div>
    </>
  );

};

export default SideBar;
