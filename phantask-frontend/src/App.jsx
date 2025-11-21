import React from 'react';
import SideBar from './components/SideBar';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Assignments from './pages/Assignments';
import Attendance from './pages/Attendance';
import SocialHub from './pages/SocialHub';
import FocusZone from './pages/FocusZone';
import Helpline from './pages/Helpline';
import Feedback from './pages/Feedback';
import Settings from './pages/Settings';
import Login from './pages/login_signup/Login';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

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
          path="/assignments"
          element={
            <PrivateRoute>
              <SideBar>
                <Assignments />
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
          path="/focuszone"
          element={
            <PrivateRoute>
              <SideBar>
                <FocusZone />
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
    </BrowserRouter>
  );
};

export default App;
