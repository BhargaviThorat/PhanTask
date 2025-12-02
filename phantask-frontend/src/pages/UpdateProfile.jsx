import React, { useEffect, useState } from "react";
import mascot from "../assets/Mascot-Phantask.png";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-hot-toast';

const UserProfile = () => {
    const { user, refreshProfile } = useAuth();
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        fullName: user.fullName || "",
        department: user.department || "",
        phone: user.phone || "",
        yearOfStudy: user.yearOfStudy || ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // State for image preview
    const [previewImage, setPreviewImage] = useState(null);

    // Function to handle image selection
    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    let navigate = useNavigate();
    const handleUpdateProfile = async () => {
        try {
            let photoUrl = user.photoUrl;

            // If user uploaded a new file, you might need to upload it first
            // For simplicity, we assume backend can handle base64 or file object
            if (file) {
                const formDataFile = new FormData();
                formDataFile.append("file", file);

                // Replace with your file upload endpoint if separate
                const uploadRes = await apiService.uploadProfilePicture
                    ? await apiService.uploadProfilePicture(formDataFile)
                    : null;

                if (uploadRes && uploadRes.data?.url) {
                    photoUrl = uploadRes.data.url;
                } else {
                    // Fallback: use preview as base64
                    photoUrl = previewImage;
                }
            }

            // Build update object
            const updateData = {
                fullName: formData.fullName,
                department: formData.department,
                phone: formData.phone,
                yearOfStudy: formData.yearOfStudy,
                photoUrl: "photoUrl",
            };

            await apiService.updateProfile(updateData);

            // Refresh context to reflect changes immediately
            await refreshProfile();

            toast.success("Profile updated successfully!");
            navigate("/profile");
        } catch (err) {
            console.error("Failed to update profile", err);
            toast.error("Failed to update profile. Please try again.");
        }
    };


    // console.log("Rendering UserProfile with user:", user);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-3 md:p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-center py-8">
                {/* Main profile card */}
                <section className="w-full rounded-2xl border-2 border-[#522320] bg-[#ffffff]/40 p-3 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#522320]/30 hover:-translate-y-0.5 px-5 sm:px-6 md:px-8 py-6 flex flex-col gap-6 relative">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row items-center md:justify-between gap-4">
                        <div className="flex flex-col flex-1 text-center w-full">
                            <h2 className="text-2xl md:text-3xl font-bold text-amber-950">
                                Edit Profile
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
                    <div className="text-base text-[#522320] pb-4 pt-2">
                        {/* Top Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    Username
                                </span>
                                <span className="text-[#5b3627] break-all">{user.username || "N/A"}</span>
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">
                                    Email
                                </span>
                                <span className="text-[#5b3627] break-all">{user.email || "N/A"}</span>
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
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">All Roles</span>
                                <span className="text-[#5b3627]">{user.roles && user.roles.length > 0 ? user.roles.join(", ") : "N/A"}</span>
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-[#E7B9AE]/30 my-4"></div>

                        {/* Bottom Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">Full Name</span>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full bg-orange-50 border-2 outline-none focus:border-red-800 rounded-2xl px-3 py-1 text-[#5b3627]"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">Department</span>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full bg-orange-50 border-2 outline-none focus:border-red-800 rounded-2xl px-3 py-1 text-[#5b3627]"
                                    placeholder="Enter department"
                                    required
                                />
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">Phone</span>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-orange-50 border-2 outline-none focus:border-red-800 rounded-2xl px-3 py-1 text-[#5b3627]"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>

                            <div className="bg-white/40 rounded-lg p-3 border border-[#E7B9AE]/80">
                                <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">Year of Study</span>
                                <input
                                    type="text"
                                    name="yearOfStudy"
                                    value={formData.yearOfStudy}
                                    onChange={handleChange}
                                    className="w-full bg-orange-50 border-2 outline-none focus:border-red-800 rounded-2xl px-3 py-1 text-[#5b3627]"
                                    placeholder="Enter year of study"
                                />
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-[#E7B9AE]/30 my-4"></div>
                    </div>

                    {/* Profile Picture Upload */}
                    <div className="bg-orange-50 rounded-2xl p-4 border-2 border-stone-200 shadow-sm flex flex-col items-center justify-center gap-3 hover:border-red-800 transition-colors duration-300">
                        <span className="block text-sm font-semibold text-[#3b1d18] mb-1.5">Profile Picture</span>
                        <div className="h-24 w-24 rounded-full border-2 border-orange-400 overflow-hidden flex items-center justify-center">
                            <img
                                src={previewImage || user.photoUrl || mascot}
                                alt="profile preview"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className=" mt-2 block w-full text-sm text-[#5b3627] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-700 file:text-white hover:file:bg-red-800 hover:file:cursor-pointer cursor-pointer hover:file:scale-95 file:transition-transform file:duration-300"
                        />
                    </div>



                    {/* Footer – Edit button in bottom right */}
                    <div className="flex justify-center md:justify-end pt-2 border-t border-[#E7B9AE]/30">
                        <button
                            type="button"
                            onClick={handleUpdateProfile}
                            className="w-full md:w-auto hover:scale-95 transition-transform duration-300 bg-red-700 hover:bg-red-800 text-white font-semibold py-2.5 px-6 rounded-lg shadow flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-pen"></i>
                            <span>Update</span>
                        </button>

                    </div>
                </section>
            </div >
        </div >
    );
};

export default UserProfile;