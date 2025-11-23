import React, { useState, useRef, useEffect } from "react";

// ! ProfileDropDown: Dropdown menu for user profile/avatar menu (logout, profile, etc)
const ProfileDropDown = ({ imageUrl }) => {
  // * Dropdown open/close state
  const [open, setOpen] = useState(false);

  // * Reference to dropdown wrapper (for outside click detection)
  const dropdownRef = useRef(null);

  // ! Detect and close dropdown if mouse clicks outside of dropdown area
  useEffect(() => {
    function handleClickOutside(event) {
      // ? If clicked outside dropdown -> close menu
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    // * Cleanup event on unmount
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // * Handle user logout logic (! clears session and redirects)
  let handleLogout = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  // ! Main render: avatar button and animated dropdown menu
  return (
    <div className="relative" ref={dropdownRef}>
      {/* * Avatar trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full focus:shadow focus:shadow-yellow-400"
      >
        <img
          src={imageUrl || "/default-avatar.png"}
          alt="Profile"
          className="h-10 w-10 rounded-full border-2 bg-white border-[#d4b397] object-cover"
        />
      </button>

      {/* * Dropdown popover with fade/scale animation */}
      <div
        className={`absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-lg py-2 z-50 transform transition-all duration-200 ease-out origin-top ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* * Profile navigation option (expand as needed) */}
        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-orange-100 text-[#42260b]">
          Profile
        </button>
        {/* ! Logout option uses attention color and triggers full logout */}
        <button
          className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-100 text-[#c0392b]"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropDown;
