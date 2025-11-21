import React from 'react'
import SideBar from './components/SideBar'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Assignments from './pages/Assignments'
import Attendance from './pages/Attendance'
import SocialHub from './pages/SocialHub'
import FocusZone from './pages/FocusZone'
import Helpline from './pages/Helpline'
import Feedback from './pages/Feedback'
import Settings from './pages/Settings'
import ProfileDropdown from './components/ProfileDropDown'
import Login from './pages/login_signup/Login'

const App = () => {
  return (
    <>
      {/* <BrowserRouter>
        <SideBar>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/socialhub" element={<SocialHub />} />
            <Route path="/focuszone" element={<FocusZone />} />
            <Route path="/helpline" element={<Helpline />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </SideBar>
      </BrowserRouter> */}

      <Login />
    </>
  )
}

export default App