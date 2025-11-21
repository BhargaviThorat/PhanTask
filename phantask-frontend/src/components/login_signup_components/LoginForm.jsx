import React, { useState } from "react";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem("authToken", "open");
    console.log("Submitted data:", formData);
  };

  const handleReset = () => {
    setFormData({
      email: "",
      password: "",
      otp: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-stone-100 bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-md mx-auto"
    >
      <h2 className="text-3xl font-bold text-amber-950 mb-6 text-center">Login</h2>

      <label htmlFor="email" className="block mb-1 font-semibold text-gray-800">
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
        required
        value={formData.email}
        onChange={handleChange}
        placeholder="you@example.com"
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
      />

      <label htmlFor="password" className="block mb-1 font-semibold text-gray-800">
        Password
      </label>
      <input
        type="password"
        id="password"
        name="password"
        required
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter password"
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
      />

      <label htmlFor="otp" className="block mb-1 font-semibold text-gray-800">
        OTP
      </label>
      <input
        type="text"
        id="otp"
        name="otp"
        inputMode="numeric"
        pattern="\d*"
        maxLength={6}
        value={formData.otp}
        onChange={handleChange}
        placeholder="Enter 6-digit OTP"
        className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
      />

      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-red-700 hover:bg-red-800 text-white font-semibold py-2 rounded-lg shadow transition-colors"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg shadow transition-colors"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
