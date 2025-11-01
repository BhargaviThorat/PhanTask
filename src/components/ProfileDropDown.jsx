import React, { useState, useRef, useEffect } from "react";

const ProfileDropDown = ({ imageUrl }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown if clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
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

            {/* Dropdown menu with transition */}
            <div
                className={`absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-lg py-2 z-50 transform transition-all duration-200 ease-out origin-top ${open
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
            >
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-orange-100 text-[#42260b]">
                    Profile
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-100 text-[#c0392b]">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileDropDown;
