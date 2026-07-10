import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdTrendingUp,
  MdEventNote, MdSchool, MdAssessment,
  MdCalendarToday, MdLogout, MdCloudUpload, MdGridView, MdAccountBalance,
  MdGroups, MdPersonAdd
} from 'react-icons/md';

const navItems = [
  { section: 'Overview', items: [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/dashboard' },
  ]},
  { section: 'Students', items: [
    { label: 'Student List',     icon: <MdPeople />,    path: '/students' },
    { label: 'Departments',      icon: <MdGridView />,  path: '/departments' },
    { label: 'Mentor Allocation', icon: <MdGroups />,   path: '/mentor-allocation' },
  ]},
  { section: 'Academics', items: [
    { label: 'Academic Performance', icon: <MdTrendingUp />, path: '/academics' },
    { label: 'Attendance Monitoring', icon: <MdEventNote />, path: '/attendance' },
    { label: 'Examination Monitoring', icon: <MdSchool />, path: '/examinations' },
  ]},
  { section: 'Insights', items: [
    { label: 'Performance Insights', icon: <MdAssessment />, path: '/risk-insights' },
    { label: 'Reports', icon: <MdAssessment />, path: '/reports' },
  ]},
  { section: 'Campus Life', items: [
    { label: 'Events & Activities', icon: <MdCalendarToday />, path: '/events' },
  ]},
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><MdAccountBalance size={20} /></div>
        <div>
          <div className="sidebar-logo-text">Dr. Arjun Sharma</div>
          <div className="sidebar-logo-sub">Head of Department</div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {navItems.map((section) => (
          <div className="sidebar-section" key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <div className="nav-item" onClick={handleSignOut}>
          <span className="nav-icon"><MdLogout /></span>
          <span>Sign Out</span>
        </div>
      </div>
    </aside>
  );
}