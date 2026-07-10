import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';

const DEPT_STYLE = {
  CSE: { icon: '💻', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  ECE: { icon: '📡', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'  },
  ME:  { icon: '⚙️', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CE:  { icon: '🏗️', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  IT:  { icon: '🖥️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

const years = [
  { value: '1', label: 'First Year',  sem: 'Semester 1 & 2' },
  { value: '2', label: 'Second Year', sem: 'Semester 3 & 4' },
  { value: '3', label: 'Third Year',  sem: 'Semester 5 & 6' },
  { value: '4', label: 'Fourth Year', sem: 'Semester 7 & 8' },
];

export default function YearsPage() {
  const { deptName } = useParams();
  const navigate = useNavigate();
  const dept  = decodeURIComponent(deptName);
  const style = DEPT_STYLE[dept] || { icon: '🏫', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' };

  return (
    <div>
      <div className="hb-breadcrumb">
        <span className="hb-bc-link" onClick={() => navigate('/departments')}>Departments</span>
        <span className="hb-bc-sep">›</span>
        <span className="hb-bc-active">{dept}</span>
      </div>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div className="drill-dept-icon" style={{ background: style.bg, color: style.color, fontSize: 28 }}>{style.icon}</div>
          <div>
            <h1>{dept} — Select Year</h1>
            <p>Choose a batch year to view mentors and students</p>
          </div>
        </div>
      </div>

      <div className="grid-4" style={{ gap: 20 }}>
        {years.map(y => (
          <div key={y.value} className="dept-nav-card" style={{ borderTop: `4px solid ${style.color}`, cursor: 'pointer' }}
            onClick={() => navigate(`/departments/${encodeURIComponent(dept)}/years/${y.value}/mentors`)}>
            <div style={{ fontSize: 42, fontWeight: 900, color: style.color, marginBottom: 8 }}>Y{y.value}</div>
            <div className="dept-nav-name">{y.label}</div>
            <div className="dept-nav-desc">{y.sem}</div>
            <div className="dept-nav-cta" style={{ color: style.color, marginTop: 16 }}>
              View Mentors <MdArrowForward />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}