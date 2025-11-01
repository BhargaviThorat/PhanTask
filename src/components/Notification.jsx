import React, { useState, useRef, useEffect } from "react";

const Notification = () => {
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
            {/* Notification bell button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative  h-10 w-10 rounded-full focus:shadow focus:shadow-yellow-400 p-2"
            >
                <i className="fa-solid fa-bell text-yellow-500 text-2xl"></i>

                {/* Notification badge */}
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5">
                    3
                </span>
            </button>

            {/* Dropdown menu with transition */}
            <div
                className={`absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg py-2 z-50 transform transition-all duration-200 ease-out origin-top ${open
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
            >
                <p className="px-4 py-2 text-sm text-center font-semibold text-[#42260b] border-b">
                    Notifications
                </p>

                {/* Example notifications */}
                <div className="max-h-60 overflow-y-auto">
                    <div className="px-4 py-2 text-sm rounded-lg hover:bg-orange-100 cursor-pointer">
                        📩 New assignment posted
                    </div>
                    <div className="px-4 py-2 text-sm rounded-lg hover:bg-orange-100 cursor-pointer">
                        ✅ Attendance updated
                    </div>
                    <div className="px-4 py-2 text-sm rounded-lg hover:bg-orange-100 cursor-pointer">
                        💬 New message in SocialHub
                    </div>
                </div>

                <button className="w-full text-center hover:rounded-lg text-[#42260b] text-sm font-medium border-t mt-1  py-2 hover:bg-red-100">
                    View all
                </button>
            </div>
        </div>
    );
};

export default Notification;
