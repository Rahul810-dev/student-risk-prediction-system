import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  MdPeople, MdWarning, MdTrendingDown, MdAssignment, MdSchedule,
  MdArrowUpward, MdArrowDownward, MdBarChart, MdShowChart, MdSchool
} from 'react-icons/md';

const API = 'http://localhost:8000';
const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#ffffff', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#6366f1', fontWeight: 600 }}>{p.name}: {p.value}{p.unit || ''}</p>
        ))}
      </div>
    );
  }
  return null;
};

const attendanceTrendData = [
  { month: 'Aug', attendance: 88 }, { month: 'Sep', attendance: 85 },
  { month: 'Oct', attendance: 82 }, { month: 'Nov', attendance: 79 },
  { month: 'Dec', attendance: 76 }, { month: 'Jan', attendance: 80 },
  { month: 'Feb', attendance: 78 }, { month: 'Mar', attendance: 81 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [leaves,   setLeaves]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch(`${API}/students/all`)
      .then(r => r.json())
      .then(d => { setStudents(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalStudents  = students.length;
  const lowAttendance  = students.filter(s => s.attendance_percent < 75).length;
  const withBacklogs   = students.filter(s => s.backlogs > 0).length;
  const highRisk       = students.filter(s => s.overall_risk_probability >= 0.6).length;

  const deptMap = {};
  students.forEach(s => { deptMap[s.department] = (deptMap[s.department] || 0) + 1; });
  const departmentStats = Object.entries(deptMap).map(([name, count]) => ({ name, students: count }));

  const gpaMap = { '< 5.0': 0, '5.0-5.9': 0, '6.0-6.9': 0, '7.0-7.9': 0, '8.0-8.9': 0, '9.0+': 0 };
  students.forEach(s => {
    const c = s.cgpa_current;
    if (c < 5) gpaMap['< 5.0']++; else if (c < 6) gpaMap['5.0-5.9']++;
    else if (c < 7) gpaMap['6.0-6.9']++; else if (c < 8) gpaMap['7.0-7.9']++;
    else if (c < 9) gpaMap['8.0-8.9']++; else gpaMap['9.0+']++;
  });
  const gpaDistribution = Object.entries(gpaMap).map(([range, count]) => ({ range, count }));

  const topRisk = [...students].sort((a, b) => b.overall_risk_probability - a.overall_risk_probability).slice(0, 5);

  const statCards = [
    { label: 'Total Students',     value: loading ? '...' : totalStudents, icon: <MdPeople />,      color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    { label: 'Low Attendance',     value: loading ? '...' : lowAttendance, icon: <MdWarning />,      color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'With Backlogs',      value: loading ? '...' : withBacklogs,  icon: <MdTrendingDown />, color: '#ef4444', bg: 'rgba(239,68,68,0.15)'  },
    { label: 'High Risk Students', value: loading ? '...' : highRisk,      icon: <MdAssignment />,   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Academic year 2025-26 · CSE Department</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {statCards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="stat-card-header">
              <div className="stat-icon-wrap" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            </div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdBarChart /> Students by Department
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={departmentStats} dataKey="students" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                {departmentStats.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} formatter={v => <span style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdShowChart /> Attendance Trend
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendanceTrendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} domain={[70, 95]} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="attendance" name="Attendance %" stroke="#6366f1" fill="url(#attGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdSchool /> GPA Distribution
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gpaDistribution} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: '#4a5568', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Students" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div className="section-title">Risk Overview - Top 5</div>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
        ) : topRisk.map((s) => {
          const overall   = Math.round(s.overall_risk_probability * 100);
          const riskLevel = overall >= 60 ? 'High' : overall >= 30 ? 'Medium' : 'Low';
          return (
            <div key={s.student_id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: riskLevel === 'High' ? 'rgba(239,68,68,0.15)' : riskLevel === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
                color: riskLevel === 'High' ? '#ef4444' : riskLevel === 'Medium' ? '#f59e0b' : '#10b981',
              }}>{s.student_name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {s.student_name} <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>{s.student_id}</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{
                    width: `${overall}%`,
                    background: overall >= 70 ? 'linear-gradient(90deg,#ef4444,#dc2626)' :
                      overall >= 40 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#10b981,#059669)'
                  }} />
                </div>
              </div>
              <span className={`badge ${riskLevel === 'High' ? 'badge-red' : riskLevel === 'Medium' ? 'badge-orange' : 'badge-green'}`}>{overall}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}