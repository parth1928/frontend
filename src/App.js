import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import ChooseUser from './pages/ChooseUser';
import CoordinatorLogin from './pages/coordinator/CoordinatorLogin';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import CoordinatorProfile from './pages/coordinator/CoordinatorProfile';
import CoordinatorStudents from './pages/coordinator/CoordinatorStudents';
import AttendanceAnalysis from './pages/coordinator/AttendanceAnalysis';
import AttendanceReports from './pages/coordinator/AttendanceReports';
import Logout from './pages/Logout';

const App = () => {
  const { currentRole } = useSelector(state => state.user);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        {currentRole === null &&
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/choose" element={<ChooseUser visitor="normal" />} />
            <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />
            <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
            <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
            <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />
            <Route path="/Coordinatorlogin" element={<CoordinatorLogin />} />
            <Route path="/Adminregister" element={<AdminRegisterPage />} />
            <Route path="/logout" element={<Logout />} />
            <Route path='*' element={<Navigate to="/" />} />
          </Routes>
        }

        {currentRole === "Admin" && <AdminDashboard />}
        {currentRole === "Student" && <StudentDashboard />}
        {currentRole === "Teacher" && <TeacherDashboard />}
        
        {currentRole === "Coordinator" && 
          <Routes>
            <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
            <Route path="/coordinator/students" element={<CoordinatorStudents />} />
            <Route path="/coordinator/attendance-analysis" element={<AttendanceAnalysis />} />
            <Route path="/coordinator/attendance-reports" element={<AttendanceReports />} />
            <Route path="/coordinator/profile" element={<CoordinatorProfile />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/coordinator/*" element={<Navigate to="/coordinator/dashboard" />} />
            <Route path="*" element={<Navigate to="/coordinator/dashboard" />} />
          </Routes>
        }
      </Router>
    </LocalizationProvider>
  );
};

export default App;