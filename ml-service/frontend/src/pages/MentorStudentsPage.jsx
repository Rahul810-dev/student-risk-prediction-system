import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdSearch, MdDownload, MdFilterList, MdPerson } from 'react-icons/md';

const API = 'http://localhost:8000';

const DEPT_STYLE = {
  CSE: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  ECE: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'  },
  ME:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CE:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  IT:  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

function getRiskLevel(prob) {
  if (prob >= 0.6) return 'High';
  if (prob >= 0.3) return 'Medium';
  return 'Low';
}

function attBadge(pct) {
  if (pct >= 85) return { cls: 'badge-green',  label: `${pct.toFixed(1)}%` };
  if (pct >= 75) return { cls: 'badge-orange', label: `${pct.toFixed(1)}%` };
  return             { cls: 'badge-red',    label: `${pct.toFixed(1)}%` };
}

function exportCSV(teacherName, rows) {
  const header = 'Name,Roll No,Attendance %,CGPA,Backlogs,Risk Level,Total Leaves,Pending Leaves';
  const lines = rows.map(s => {
    const risk = getRiskLevel(s.overall_risk_probability);
    return `"${s.student_name}","${s.student_id}",${s.attendance_percent.toFixed(1)},${s.cgpa_current.toFixed(2)},${s.backlogs},"${risk}",${s.total_leaves},${s.pending_leaves}`;
  });
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${teacherName.replace(/\s/g, '_')}_students.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MentorStudentsPage() {
  const { deptName, year, mentorName } = useParams();
  const navigate  = useNavigate();
  const dept      = decodeURIComponent(deptName);
  const batchYear = decodeURIComponent(year);
  const employeeId = decodeURIComponent(mentorName);
  const style     = DEPT_STYLE[dept] || { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' };

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [attFilter,  setAttFilter]  = useState('All');

  useEffect(() => {
    fetch(`${API}/admin/teacher/${employeeId}/full-students`)
      .then(r => r.json())
      .then(d => { setData(d.error ? null : d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [employeeId]);

  const students = data?.students || [];

  const filtered = useMemo(() => students.filter(s => {
    const q         = search.toLowerCase();
    const riskLevel = getRiskLevel(s.overall_risk_probability);
    const matchQ    = s.student_name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q);
    const matchRisk = riskFilter === 'All' || riskLevel === riskFilter;
    const matchAtt  = attFilter === 'All'    ? true
      : attFilter === 'low'    ? s.attendance_percent < 75
      : attFilter === 'medium' ? (s.attendance_percent >= 75 && s.attendance_percent < 85)
      : s.attendance_percent >= 85;
    return matchQ && matchRisk && matchAtt;
  }), [students, search, riskFilter, attFilter]);

  const avgGpa  = students.length ? (students.reduce((a, s) => a + s.cgpa_current,       0) / students.length).toFixed(2) : '0';
  const avgAtt  = students.length ? Math.round(students.reduce((a, s) => a + s.attendance_percent, 0) / students.length) : 0;
  const highRisk = students.filter(s => s.overall_risk_probability >= 0.6).length;

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading students...</div>;

  return (
    <div>
      <div className="hb-breadcrumb">
        <span className="hb-bc-link" onClick={() => navigate('/departments')}>Departments</span>
        <span className="hb-bc-sep">›</span>
        <span className="hb-bc-link" onClick={() => navigate(`/departments/${encodeURIComponent(dept)}/years`)}>{dept}</span>
        <span className="hb-bc-sep">›</span>
        <span className="hb-bc-link" onClick={() => navigate(`/departments/${encodeURIComponent(dept)}/years/${batchYear}/mentors`)}>Year {batchYear}</span>
        <span className="hb-bc-sep">›</span>
        <span className="hb-bc-active">{data?.teacher_name || employeeId}</span>
      </div>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div className="drill-dept-icon" style={{ background: style.bg, color: style.color }}>
            <MdPerson size={26} />
          </div>
          <div>
            <h1>{data?.teacher_name || employeeId}</h1>
            <p>{data?.designation} · {dept} · {students.length} students</p>
          </div>
          <button className="drill-export-btn" style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: 13 }}
            onClick={() => exportCSV(data?.teacher_name || employeeId, students)}>
            <MdDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: students.length, color: style.color, bg: style.bg,                icon: '👥' },
          { label: 'Avg CGPA',       value: avgGpa,           color: '#10b981',   bg: 'rgba(16,185,129,0.08)', icon: '🎓' },
          { label: 'Avg Attendance', value: `${avgAtt}%`,     color: '#06b6d4',   bg: 'rgba(6,182,212,0.08)',  icon: '📅' },
          { label: 'High Risk',      value: highRisk,         color: '#ef4444',   bg: 'rgba(239,68,68,0.08)',  icon: '⚠️' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon-wrap" style={{ background: c.bg, color: c.color, fontSize: 18 }}>{c.icon}</div>
            </div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 14, marginBottom: 20 }}>
        <div className="filter-row">
          <div className="search-bar" style={{ width: 300 }}>
            <MdSearch style={{ color: 'var(--text-muted)', fontSize: 17 }} />
            <input placeholder="Search by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdFilterList style={{ color: 'var(--text-muted)' }} />
            <select className="input-field" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
          <select className="input-field" value={attFilter} onChange={e => setAttFilter(e.target.value)}>
            <option value="All">All Attendance</option>
            <option value="low">Below 75%</option>
            <option value="medium">75-85%</option>
            <option value="high">Above 85%</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {students.length}
          </span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="drill-empty">No students match the current filters.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Attendance</th>
                  <th>CGPA</th>
                  <th>Backlogs</th>
                  <th>Risk</th>
                  <th>Leaves</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  const att      = attBadge(s.attendance_percent);
                  const risk     = getRiskLevel(s.overall_risk_probability);
                  const riskPct  = Math.round(s.overall_risk_probability * 100);
                  const riskCls  = risk === 'High' ? 'badge-red' : risk === 'Medium' ? 'badge-orange' : 'badge-green';
                  return (
                    <tr key={s.student_id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <div className="drill-student-name-cell">
                          <div className="drill-avatar" style={{ background: `${style.color}20`, color: style.color }}>
                            {s.student_name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{s.student_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-blue">{s.student_id}</span></td>
                      <td><span className={`badge ${att.cls}`}>{att.label}</span></td>
                      <td>
                        <span style={{ fontWeight: 700, color: s.cgpa_current >= 8 ? '#10b981' : s.cgpa_current >= 6 ? '#f59e0b' : '#ef4444' }}>
                          {s.cgpa_current.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${s.backlogs > 0 ? 'badge-red' : 'badge-green'}`}>
                          {s.backlogs > 0 ? `${s.backlogs} backlogs` : 'Clear'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${riskCls}`}>{risk} ({riskPct}%)</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <span className="badge badge-gray">{s.total_leaves} total</span>
                          {s.pending_leaves > 0 && <span className="badge badge-orange">{s.pending_leaves} pending</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}