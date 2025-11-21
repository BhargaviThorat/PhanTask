import React, { useState } from "react";
import DesktopSideBar from "./sidebar_components/DesktopSideBar";
import MobileSideBar from "./sidebar_components/MobileSideBar";
import TopRightIcons from "./sidebar_components/TopRightIcons";
import MainContent from "./sidebar_components/MainContent";

const SideBar = ({ children }) => {

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: "fa-house", path: "/" },
    { name: "Assignments", icon: "fa-clipboard", path: "/assignments" },
    { name: "Attendance", icon: "fa-circle-check", path: "/attendance" },
    { name: "SocialHub", icon: "fa-comments", path: "/socialhub" },
    { name: "Focus Zone", icon: "fa-clock", path: "/focuszone" },
    { name: "Helpline", icon: "fa-phone", path: "/helpline" },
    { name: "Feedback", icon: "fa-message", path: "/feedback" },
    { name: "Settings", icon: "fa-gear", path: "/settings" },
  ];

  return (
    <>
      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="flex h-screen bg-[#fff9f8] font-sans">
        {/* Desktop Sidebar */}
        <DesktopSideBar menuItems={menuItems} />


        {/* Mobile Sidebar */}
        <MobileSideBar menuItems={menuItems}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen} />

        {/* Top Right Icons (Hide when Mobile Sidebar is Open) */}
        <TopRightIcons isMobileOpen={isMobileOpen} />

        {/* Main Content */}
        <MainContent>
          {children}
        </MainContent>
      </div>
    </>
  );
};

export default SideBar;
