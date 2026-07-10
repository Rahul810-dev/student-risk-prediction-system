import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdArrowForward, MdPeople, MdWarning, MdComputer, MdMemory, MdSettingsInputComponent, MdEngineering, MdDeveloperBoard, MdSchool } from 'react-icons/md';

const API = 'http://localhost:8000';

const DEPT_STYLE = {
  CSE: { icon: <MdComputer />,             color: '#6366f1', bg: 'rgba(99,102,241,0.1)', desc: 'Computer Science & Engineering' },
  ECE: { icon: <MdSettingsInputComponent />, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', desc: 'Electronics & Communication' },
  ME:  { icon: <MdEngineering />,          color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', desc: 'Mechanical Engineering' },
  CE:  { icon: <MdMemory />,               color: '#10b981', bg: 'rgba(16,185,129,0.1)', desc: 'Civil Engineering' },
  IT:  { icon: <MdDeveloperBoard />,        color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', desc: 'Information Technology' },
};

const getStyle = (dept) =>
  DEPT_STYLE[dept] || { icon: <MdSchool />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', desc: dept };

export default function DepartmentsPage() {
  const navigate = useNavigate();
  const [search,  setSearch]  = useState('');
  const [depts,   setDepts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/admin/departments`)
      .then(r => r.json())
      .then(d => { setDepts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = depts.filter(d =>
    d.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Departments</h1>
        <p>Select a department to explore its academic hierarchy</p>
      </div>

      <div className="glass-card" style={{ padding: 16, marginBottom: 24 }}>
        <div className="search-bar" style={{ width: '100%', maxWidth: 420 }}>
          <MdSearch style={{ color: 'var(--text-muted)', fontSize: 18 }} />
          <input placeholder="Search department..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading departments...</div>
      ) : (
        <div className="grid-3" style={{ gap: 20 }}>
          {filtered.map(dept => {
            const style = getStyle(dept.department);
            return (
              <div key={dept.department} className="dept-nav-card" style={{ borderTop: `4px solid ${style.color}` }}
                onClick={() => navigate(`/departments/${encodeURIComponent(dept.department)}/years`)}>
                <div className="dept-nav-icon" style={{ background: style.bg, color: style.color, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 12 }}>
                  {style.icon}
                </div>
                <div className="dept-nav-name">{dept.department}</div>
                <div className="dept-nav-desc">{style.desc}</div>

                <div className="dept-nav-stats">
                  <div className="dept-nav-stat">
                    <MdPeople style={{ color: style.color }} />
                    <span>{dept.total_students} students</span>
                  </div>
                  <div className="dept-nav-stat">
                    <span style={{ color: '#64748b' }}>Avg Att:</span>
                    <span style={{ fontWeight: 700, color: dept.avg_attendance >= 75 ? '#10b981' : '#ef4444' }}>
                      {dept.avg_attendance}%
                    </span>
                  </div>
                  <div className="dept-nav-stat">
                    <span style={{ color: '#64748b' }}>Avg CGPA:</span>
                    <span style={{ fontWeight: 700, color: '#6366f1' }}>{dept.avg_cgpa}</span>
                  </div>
                  {dept.high_risk_count > 0 && (
                    <div className="dept-nav-stat">
                      <MdWarning style={{ color: '#ef4444' }} />
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>{dept.high_risk_count} high risk</span>
                    </div>
                  )}
                </div>

                <div className="dept-nav-cta" style={{ color: style.color }}>
                  Explore <MdArrowForward />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}