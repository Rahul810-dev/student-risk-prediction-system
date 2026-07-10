import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdSearch, MdNotifications, MdSettings, MdLogout, MdAccountCircle, MdCloudUpload } from 'react-icons/md';
import UploadExcelModal from './UploadExcelModal';
import { students } from '../data/students';

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/students': 'Student List',
  '/academics': 'Academic Performance',
  '/attendance': 'Attendance Monitoring',
  '/examinations': 'Examination Monitoring',
  '/leave-management': 'Leave Management',
  '/risk-insights': 'Performance Insights',
  '/events': 'Events & Activities',
  '/awards': 'Awards & Recognition',
  '/notifications': 'Notifications',
  '/reports': 'Reports',
};

// Dummy courses to search
const courses = [
  { id: 'C101', name: 'Data Structures and Algorithms', dept: 'Computer Science' },
  { id: 'C102', name: 'Database Management Systems', dept: 'Computer Science' },
  { id: 'C201', name: 'Thermodynamics', dept: 'Mechanical' },
  { id: 'C301', name: 'Basic Electronics Engineering (BEEE)', dept: 'Electronics' },
  { id: 'C401', name: 'Structural Analysis', dept: 'Civil' }
];

export default function Header() {
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  
  const title = pageTitles[location.pathname] || '';

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Compute search results instantly
  const term = search.trim().toLowerCase();
  const matchedStudents = term ? students.filter(s => 
    s.name.toLowerCase().includes(term) || 
    s.rollNo.toLowerCase().includes(term) ||
    s.department.toLowerCase().includes(term)
  ).slice(0, 5) : [];
  
  const matchedCourses = term ? courses.filter(c => 
    c.name.toLowerCase().includes(term) || 
    c.id.toLowerCase().includes(term) ||
    c.dept.toLowerCase().includes(term)
  ).slice(0, 3) : [];

  return (
    <header className="header" style={{ alignItems: 'center', height: 'var(--header-height)' }}>
      <span className="header-title">{title}</span>
      <div className="header-spacer" />
      
      {/* Global Search Bar */}
      <div ref={searchRef} style={{ position: 'relative' }}>
        <div className="search-bar" style={{ width: 340, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '10px 14px' }}>
          <MdSearch style={{ color: '#64748b', fontSize: 18 }} />
          <input
            placeholder="Search students, roll no, courses..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSearchFocused(true); }}
            onFocus={() => setSearchFocused(true)}
            style={{ fontSize: 13, color: '#0f172a' }}
          />
        </div>

        {/* Global Search Dropdown */}
        {searchFocused && search.trim() && (matchedStudents.length > 0 || matchedCourses.length > 0) && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: 8,
            background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden'
          }}>
            {matchedStudents.length > 0 && (
              <div style={{ padding: '8px 0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 16px', textTransform: 'uppercase' }}>Students</div>
                {matchedStudents.map(s => (
                  <div key={s.id} onClick={() => { navigate(`/students/${s.id}`); setSearchFocused(false); setSearch(''); }}
                    style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{s.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{s.rollNo} • {s.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {matchedCourses.length > 0 && (
              <div style={{ padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 16px', textTransform: 'uppercase' }}>Courses</div>
                {matchedCourses.map(c => (
                  <div key={c.id} onClick={() => { setSearchFocused(false); setSearch(''); navigate('/academics'); }}
                    style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{c.id.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{c.id} • {c.dept}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="header-icon-btn" onClick={() => setShowUploadModal(true)} title="Upload Excel Data">
        <MdCloudUpload />
      </div>

      <div className="header-icon-btn" onClick={() => navigate('/notifications')}>
        <MdNotifications />
        <div className="notif-dot" />
      </div>

      <div className="profile-btn" ref={profileRef} onClick={() => setShowProfile(!showProfile)}>
        <div className="profile-avatar">AD</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span className="profile-name">Admin User</span>
          <span style={{ fontSize: 10, color: '#64748b' }}>Administration</span>
        </div>
        {showProfile && (
          <div className="dropdown-menu">
            <div className="dropdown-item"><MdAccountCircle /> My Profile</div>
            <div className="dropdown-item"><MdSettings /> Settings</div>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <div className="dropdown-item danger" onClick={() => navigate('/')}><MdLogout /> Sign Out</div>
          </div>
        )}
      </div>
      
      <UploadExcelModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </header>
  );
}
