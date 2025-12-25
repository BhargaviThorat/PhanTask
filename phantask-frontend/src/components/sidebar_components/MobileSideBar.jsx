import React from 'react'
import { Link } from "react-router-dom";

const MobileSideBar = ({ menuItems, isMobileOpen, setIsMobileOpen, onLogoClick }) => {

    return (
        <div className="md:hidden">
            {/* Mobile toggle button */}
            {!isMobileOpen && (
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="fixed top-3 left-2 sm:top-5 sm:left-5 bg-[#992D2D] text-[#FFEAEA] p-2 rounded-lg z-50 md:hidden shadow-lg hover:bg-[#B13A3A] transition"
                >
                    <i className="fa-solid fa-bars text-lg"></i>
                </button>
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-0 bg-[#662222] text-[#FFEAEA] w-64 h-full transform transition-transform duration-300 z-40 overflow-y-auto sidebar-scroll ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Mobile Header */}
                <div className="flex justify-between items-center p-4 border-b border-[#C96A6A]">
                    <img
                        src="/rectangular-logo.png"
                        alt="PhanTask Logo"
                        className="w-3/4"
                        onClick={onLogoClick}
                    />

                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="text-[#FFEAEA] text-xl hover:text-[#FFD0D0] transition"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <nav className="p-4 pt-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-md transition hover:bg-[#992D2D] text-[#FFEAEA]"
                        >
                            <i
                                className={`fa-solid ${item.icon} text-[#FFD0D0] text-lg w-5 text-center`}
                            ></i>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Dim overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-30"
                    onClick={() => setIsMobileOpen(false)}
                ></div>
            )}
        </div>
    )
}

export default MobileSideBar
