import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Attendance from './pages/Attendance';
import Academics from './pages/Academics';
import LeaveManagement from './pages/LeaveManagement';
import RiskInsights from './pages/RiskInsights';
import Examinations from './pages/Examinations';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Awards from './pages/Awards';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import DepartmentDrillDown from './pages/DepartmentDrillDown';
import DepartmentsPage from './pages/DepartmentsPage';
import YearsPage from './pages/YearsPage';
import MentorsPage from './pages/MentorsPage';
import MentorStudentsPage from './pages/MentorStudentsPage';
import MentorAllocation from "./pages/MentorAllocation";

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('userRole');
  
  if (!userRole) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to their respective dashboards if they try to access unauthorized routes
    if (userRole === 'Student') return <Navigate to="/student-dashboard" replace />;
    if (userRole === 'Staff') return <Navigate to="/staff-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Role-specific dashboards */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute allowedRoles={['Student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/staff-dashboard" element={
          <ProtectedRoute allowedRoles={['Staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        
        <Route path="/students" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><Students /></AppLayout></ProtectedRoute>} />
        <Route path="/students/:id" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><StudentDetails /></AppLayout></ProtectedRoute>} />
        
        <Route path="/attendance" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><Attendance /></AppLayout></ProtectedRoute>} />
        <Route path="/academics" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><Academics /></AppLayout></ProtectedRoute>} />
        <Route path="/leave-management" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><LeaveManagement /></AppLayout></ProtectedRoute>} />
        <Route path="/risk-insights" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><RiskInsights /></AppLayout></ProtectedRoute>} />
        <Route path="/examinations" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><Examinations /></AppLayout></ProtectedRoute>} />
        
        <Route path="/events" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><Events /></AppLayout></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><EventDetails /></AppLayout></ProtectedRoute>} />
        <Route path="/awards" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><Awards /></AppLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
        <Route path="/department/:deptName" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><DepartmentDrillDown /></AppLayout></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><DepartmentsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/departments/:deptName/years" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><YearsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/departments/:deptName/years/:year/mentors" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><MentorsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/departments/:deptName/years/:year/mentors/:mentorName/students" element={<ProtectedRoute allowedRoles={['Admin']}><AppLayout><MentorStudentsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/mentor-allocation" element={<ProtectedRoute allowedRoles={["Admin"]}><AppLayout><MentorAllocation /></AppLayout></ProtectedRoute>}/>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
