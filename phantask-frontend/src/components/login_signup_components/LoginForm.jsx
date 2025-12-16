import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useApi } from '../../context/ApiContext';
import { useNavigate } from 'react-router-dom';
import { refreshRolesFromBackend } from "../../constants/roles"

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username) {
      toast.error('Please enter your username to login.');
      return;
    }
    if (!formData.password) {
      toast.error('Please enter your password to login.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login(formData.username, formData.password);

      // backend: { token, refreshToken, role, requirePasswordChange }
      const { token, refreshToken, role, requirePasswordChange } = response.data;

      if (token) sessionStorage.setItem("authToken", token);
      if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
      if (role) sessionStorage.setItem("userRole", JSON.stringify(role));

      // Fetch roles from backend if user is ADMIN
      if (Array.isArray(role) && role.includes("ADMIN")) {
        await refreshRolesFromBackend();
      }

      toast.success('Login successful!');

      onLoginSuccess(response.data, formData.username, requirePasswordChange);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ username: '', password: '' });
  };

  // Handler for forgot password click
  const navigate = useNavigate();
  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");  // Navigate to forgot password route
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md h-auto bg-stone-100 bg-opacity-80 backdrop-blur-sm rounded-xl pt-4 pb-6 px-6 shadow-md flex flex-col">
      {/* Form Heading */}
      <h2 className="text-3xl font-bold text-amber-950 mb-6 text-center">Login</h2>

      {/* Username Field */}
      <div className="w-full">
        <label htmlFor="username" className="block mb-1 font-semibold text-gray-800">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter username"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
        />
      </div>

      {/* Password Field */}
      <div className="w-full">
        <label htmlFor="password" className="block mb-1 font-semibold text-gray-800">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
          className="w-full mb-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
          required
        />
      </div>

      {/* Forgot Password div */}
      <div
        onClick={handleForgotPasswordClick}
        className="mb-6 pr-2 text-sm font-semibold text-red-800 cursor-pointer hover:underline select-none text-right"
      >
        Forgot Password?
      </div>

      {/* Submit and Reset Buttons */}
      <div className="w-full flex mb-1 gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="hover:scale-95 transition-transform-colors duration-300 flex-1 bg-red-700 hover:bg-red-800 text-white font-semibold py-2 rounded-lg shadow"
        >
          {isLoading ? 'Signing in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="hover:scale-95 transition-transform-colors duration-300 flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg shadow"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
