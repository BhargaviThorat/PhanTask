import React, { useState } from 'react'
import { Link } from "react-router-dom";

const DesktopSideBar = ({ menuItems, onLogoClick }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div
            className={`hidden md:flex flex-col transition-all duration-300 bg-[#662222] text-[#FFEAEA] ${isOpen ? "w-60" : "w-20"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-around p-2 border-b border-[#C96A6A] min-h-16">
                {isOpen ? (
                    <>
                        <img
                            src="/rectangular-logo.png"
                            alt="PhanTask Logo"
                            className="w-3/4 cursor-pointer"
                            onClick={onLogoClick}
                        />

                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-lg text-[#FFEAEA] hover:bg-[#992D2D] transition"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </>
                ) : (
                    <div className="flex justify-center w-full">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="p-2 rounded-lg text-[#FFEAEA] hover:bg-[#992D2D] transition"
                        >
                            <i className="fa-solid fa-bars text-xl"></i>
                        </button>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden sidebar-scroll">
                <ul className="space-y-1.5">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                to={item.path}
                                className={`flex items-center gap-4 p-3 rounded-lg transition hover:bg-[#992D2D] text-[#FFEAEA] ${isOpen ? "justify-start" : "justify-center"
                                    }`}
                            >
                                <i
                                    className={`fa-solid ${item.icon} text-[#FFD0D0] text-lg w-5 text-center`}
                                ></i>
                                {isOpen && <span className="font-medium">{item.name}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}

export default DesktopSideBar
