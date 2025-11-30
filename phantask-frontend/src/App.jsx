import React from 'react';
import SideBar from './components/SideBar';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import SocialHub from './pages/SocialHub';
import Helpline from './pages/Helpline';
import Feedback from './pages/Feedback';
import Settings from './pages/Settings';
import Login from './pages/login_signup/Login';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import ForgotPassword from './components/login_signup_components/ForgotPassword';
import AssignedTasks from './pages/AssignedTasks';
import Schedule from './pages/Schedule';
import { ApiProvider } from './context/ApiContext';
import { AuthProvider } from './context/AuthContext';


const App = () => {
  return (
    <BrowserRouter>
      <ApiProvider>
        <AuthProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Private routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <SideBar>
                    <Dashboard />
                  </SideBar>
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <SideBar>
                    <AssignedTasks />
                  </SideBar>
                </PrivateRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <PrivateRoute>
                  <SideBar>
                    <Attendance />
                  </SideBar>
                </PrivateRoute>
              }
            />
            <Route
              path="/socialhub"
              element={
                <PrivateRoute>
                  <SideBar>
                    <SocialHub />
                  </SideBar>
                </PrivateRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <PrivateRoute>
                  <SideBar>
                    <Schedule />
                  </SideBar>
                </PrivateRoute>
              }
            />
            <Route
              path="/helpline"
              element={
                <PrivateRoute>
                  <SideBar>
                    <Helpline />
                  </SideBar>
                </PrivateRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <PrivateRoute>
                  <SideBar>
                    <Feedback />
                  </SideBar>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SideBar>
                    <Settings />
                  </SideBar>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </ApiProvider>
    </BrowserRouter>
  );
};

export default App;
