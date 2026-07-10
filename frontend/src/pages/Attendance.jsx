import { useState, useEffect } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { MdWarning, MdReportProblem, MdCheckCircle, MdBarChart, MdTrendingUp } from 'react-icons/md';

const API = 'http://localhost:8000';
const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: '#94a3b8', marginBottom: 2 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || '#6366f1', fontWeight: 600 }}>{p.name}: {p.value}{p.unit || ''}</p>)}
    </div>
  );
};

// No monthly attendance history exists in the DB — illustrative only.
const monthlyTrendPlaceholder = [
  { month: 'Aug', pct: 88 }, { month: 'Sep', pct: 86 }, { month: 'Oct', pct: 84 },
  { month: 'Nov', pct: 82 }, { month: 'Dec', pct: 79 }, { month: 'Jan', pct: 81 },
  { month: 'Feb', pct: 80 }, { month: 'Mar', pct: 82 },
];

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/students/all`).then(r => r.json()),
      fetch(`${API}/admin/departments`).then(r => r.json()),
    ]).then(([studentsData, deptData]) => {
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setDeptStats(Array.isArray(deptData) ? deptData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading attendance data...</div>;

  const overall = students.length ? Math.round(students.reduce((a, s) => a + s.attendance_percent, 0) / students.length) : 0;
  const critical = students.filter(s => s.attendance_percent < 75);
  const low = students.filter(s => s.attendance_percent >= 75 && s.attendance_percent < 85);
  const good = students.filter(s => s.attendance_percent >= 85);

  return (
    <div>
      <div className="page-header">
        <h1>Attendance Monitoring</h1>
        <p>Institutional attendance trends and student-level analytics</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Overall Attendance', value: `${overall}%`, color: overall >= 80 ? '#10b981' : '#f59e0b', icon: <MdBarChart /> },
          { label: 'Critical (< 75%)', value: critical.length, color: '#ef4444', icon: <MdReportProblem /> },
          { label: 'Low (75–85%)', value: low.length, color: '#f59e0b', icon: <MdWarning /> },
          { label: 'Good (> 85%)', value: good.length, color: '#10b981', icon: <MdCheckCircle /> },
        ].map(c => (
          <div className="glass-card" key={c.label} style={{ padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8, color: c.color }}>{c.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title"><MdBarChart style={{ marginRight: 6, verticalAlign: 'middle' }} />Department-wise Attendance</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptStats} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="department" tick={{ fill: '#4a5568', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} domain={[60, 100]} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_attendance" name="Avg Attendance %" radius={[6, 6, 0, 0]}>
                {deptStats.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title"><MdTrendingUp style={{ marginRight: 6, verticalAlign: 'middle' }} />Monthly Attendance Trend</div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -6, marginBottom: 8 }}>
            Illustrative only — monthly history isn't tracked in the database yet.
          </p>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={monthlyTrendPlaceholder} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} domain={[60, 100]} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pct" name="Attendance %" stroke="#6366f1" fill="url(#attGrad)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdWarning style={{ color: '#ef4444', fontSize: 18 }} />
          <div className="chart-title" style={{ marginBottom: 0 }}>Students with Critical Attendance (&lt; 75%)</div>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th><th>Roll No.</th><th>Department</th>
                <th>Attendance %</th><th>Consec. Absences</th><th>Risk Level</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {critical.sort((a, b) => a.attendance_percent - b.attendance_percent).map(s => (
                <tr key={s.student_id} style={{ cursor: 'default' }}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.student_name}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-indigo)', fontSize: 12 }}>{s.student_id}</td>
                  <td>{s.department}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar-wrap" style={{ width: 60 }}>
                        <div className="progress-bar-fill" style={{ width: `${s.attendance_percent}%`, background: '#ef4444' }} />
                      </div>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>{s.attendance_percent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style={{ color: s.consecutive_absences >= 7 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                    {s.consecutive_absences} days
                  </td>
                  <td><span className={`badge ${s.overall_risk_probability >= 0.6 ? 'badge-red' : 'badge-orange'}`}>{s.overall_risk_probability >= 0.6 ? 'High' : 'Medium'}</span></td>
                  <td><span className="badge badge-red"><MdReportProblem style={{ verticalAlign: 'middle', marginRight: 4 }} />Action Required</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}