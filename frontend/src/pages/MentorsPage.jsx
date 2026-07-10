import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowForward, MdPerson, MdWarning } from 'react-icons/md';

const API = 'http://localhost:8000';

const DEPT_STYLE = {
  CSE: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  ECE: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'  },
  ME:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CE:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  IT:  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

export default function MentorsPage() {
  const { deptName, year } = useParams();
  const navigate  = useNavigate();
  const dept      = decodeURIComponent(deptName);
  const batchYear = decodeURIComponent(year);
  const style     = DEPT_STYLE[dept] || { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' };

  const [teachers, setTeachers] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch(`${API}/admin/departments/${encodeURIComponent(dept)}/teachers`)
      .then(r => r.json())
      .then(d => { setTeachers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dept]);

  return (
    <div>
      <div className="hb-breadcrumb">
        <span className="hb-bc-link" onClick={() => navigate('/departments')}>Departments</span>
        <span className="hb-bc-sep">›</span>
        <span className="hb-bc-link" onClick={() => navigate(`/departments/${encodeURIComponent(dept)}/years`)}>{dept}</span>
        <span className="hb-bc-sep">›</span>
        <span className="hb-bc-active">Year {batchYear}</span>
      </div>

      <div className="page-header">
        <h1>Year {batchYear} — Mentors</h1>
        <p>{dept} · Select a mentor to view their students</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading mentors...</div>
      ) : (
        <div className="grid-3" style={{ gap: 20 }}>
          {teachers.map(t => (
            <div key={t.employee_id} className="mentor-nav-card" style={{ borderTop: `4px solid ${style.color}`, cursor: 'pointer' }}
              onClick={() => navigate(`/departments/${encodeURIComponent(dept)}/years/${batchYear}/mentors/${encodeURIComponent(t.employee_id)}/students`)}>

              <div className="mentor-nav-avatar" style={{ background: style.bg, color: style.color }}>
                <MdPerson size={28} />
              </div>
              <div className="mentor-nav-name">{t.teacher_name}</div>
              <div className="mentor-nav-dept">{t.designation}</div>

              <div className="mentor-nav-stats">
                <div className="mentor-stat-item">
                  <div className="mentor-stat-val" style={{ color: style.color }}>{t.student_count}</div>
                  <div className="mentor-stat-lbl">Students</div>
                </div>
                <div className="mentor-stat-item">
                  <div className="mentor-stat-val" style={{ color: '#10b981' }}>{t.avg_cgpa}</div>
                  <div className="mentor-stat-lbl">Avg GPA</div>
                </div>
                <div className="mentor-stat-item">
                  <div className="mentor-stat-val" style={{ color: t.avg_attendance >= 75 ? '#06b6d4' : '#ef4444' }}>{t.avg_attendance}%</div>
                  <div className="mentor-stat-lbl">Avg Att</div>
                </div>
              </div>

              {t.high_risk_count > 0 && (
                <div className="mentor-risk-alert">
                  <MdWarning style={{ color: '#ef4444' }} size={13} />
                  <span>{t.high_risk_count} high risk student{t.high_risk_count > 1 ? 's' : ''}</span>
                </div>
              )}

              <div className="dept-nav-cta" style={{ color: style.color, marginTop: 12 }}>
                View Students <MdArrowForward />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}