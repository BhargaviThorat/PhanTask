import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import mascot from "../assets/Mascot-Phantask.png";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useLocation, useNavigate } from "react-router-dom";

const UserProfile = () => {
    const { user, loading, refreshProfile } = useAuth();
    const location = useLocation();

    useEffect(() => {
        refreshProfile();
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-3 md:p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-center">
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-3 md:p-4 flex items-center justify-center">
                <div className="w-full max-w-sm rounded-2xl bg-white/60 backdrop-blur-sm border border-[#E7B9AE] shadow-md shadow-[#522320]/20 p-8 text-center">
                    <div className="mb-4">
                        <i className="fa-solid fa-circle-exclamation text-5xl text-red-700"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-amber-950 mb-2">
                        Unable to Load Profile
                    </h3>
                    <p className="text-sm text-[#5b3627] mb-6">
                        We couldn't retrieve your profile information.<br /> Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    // console.log("Rendering UserProfile with user:", user);
    let navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-3 md:p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-center py-8">
                {/* Main profile card */}
                <section className="w-full rounded-2xl border-2 border-[#522320] bg-[#ffffff]/40 p-3 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#522320]/30 hover:-translate-y-0.5 px-5 sm:px-6 md:px-8 py-6 flex flex-col gap-6 relative">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row items-center md:justify-between gap-4">
                        <div className="flex flex-col flex-1 text-center w-full">
                            <h2 className="text-2xl md:text-3xl font-bold text-amber-950">
                                My Profile
                            </h2>
                            <p className="text-sm font-normal text-amber-950 mt-1">
                                Manage your PhanTask account details.
                            </p>
                        </div>
                        <div className="h-16 w-16 md:absolute md:top-6 md:right-6 rounded-full border-2 border-orange-400 flex items-center justify-center flex-shrink-0">
                            <img
                                className="h-full w-full rounded-full object-cover"
                                src={user.photoUrl || mascot}
                                alt="profile"
                            />
                        </div>
                    </header>

                    {/* Content - Two Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-4 text-base text-[#522320] pb-4 pt-2 border-t border-[#E7B9AE]/30">
                        {/* Left column */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    Username
                                </span>
                                <span className="text-[#5b3627] break-all">
                                    {user.username || "N/A"}
                                </span>
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    Email
                                </span>
                                <span className="text-[#5b3627] break-all">
                                    {user.email || "N/A"}
                                </span>
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    Primary Role
                                </span>
                                <span className="inline-flex items-center rounded-full bg-[#FCE0D6] px-2.5 py-1 text-xs font-medium text-[#8c432b]">
                                    {user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : "N/A")}
                                </span>
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    All Roles
                                </span>
                                <span className="text-[#5b3627]">
                                    {user.roles && user.roles.length > 0 ? user.roles.join(", ") : "N/A"}
                                </span>
                            </div>
                        </div>

                        {/* Separator for mobile - after first 4 fields */}
                        <div className="md:hidden border-t border-[#E7B9AE]/30 my-2"></div>

                        {/* Right column */}
                        <div className="space-y-4">
                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    Full Name
                                </span>
                                <span className="text-[#5b3627]">
                                    {user.fullName || "N/A"}
                                </span>
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    Department
                                </span>
                                <span className="text-[#5b3627]">
                                    {user.department || "N/A"}
                                </span>
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    Phone
                                </span>
                                <span className="text-[#5b3627]">
                                    {user.phone || "N/A"}
                                </span>
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    Year of Study
                                </span>
                                <span className="text-[#5b3627]">
                                    {user.yearOfStudy || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer – Edit button in bottom right */}
                    <div className="flex justify-center md:justify-end pt-2 border-t border-[#E7B9AE]/30">
                        <button
                            type="button"
                            onClick={() => { navigate("/update-profile") }}
                            className="w-full md:w-auto hover:scale-95 transition-transform duration-300 bg-red-700 hover:bg-red-800 text-white font-semibold py-2.5 px-6 rounded-lg shadow flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-pen"></i>
                            <span>Edit Details</span>
                        </button>
                    </div>
                </section>
            </div >
        </div >
    );
};

export default UserProfile;