import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { MdSchool, MdStar, MdAssignment, MdWarning, MdBarChart, MdApartment, MdEmojiEvents } from 'react-icons/md';

const API = 'http://localhost:8000';
const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: '#94a3b8', marginBottom: 2 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || '#6366f1', fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

function bucketGpa(students) {
  const buckets = [
    { range: '0-5', min: 0, max: 5, count: 0 },
    { range: '5-6', min: 5, max: 6, count: 0 },
    { range: '6-7', min: 6, max: 7, count: 0 },
    { range: '7-8', min: 7, max: 8, count: 0 },
    { range: '8-9', min: 8, max: 9, count: 0 },
    { range: '9-10', min: 9, max: 10.01, count: 0 },
  ];
  students.forEach(s => {
    const b = buckets.find(b => s.cgpa_current >= b.min && s.cgpa_current < b.max);
    if (b) b.count++;
  });
  return buckets;
}

export default function Academics() {
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading academic data...</div>;

  const gpaDistribution = bucketGpa(students);
  const topStudents = [...students].sort((a, b) => b.cgpa_current - a.cgpa_current).slice(0, 5);
  const needsAttention = students.filter(s => s.cgpa_current < 6.5 || s.backlogs > 0).sort((a, b) => a.cgpa_current - b.cgpa_current);
  const avgCgpa = students.length ? (students.reduce((a, s) => a + s.cgpa_current, 0) / students.length).toFixed(2) : '0.00';
  const totalBacklogs = students.reduce((a, s) => a + s.backlogs, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Academic Performance</h1>
        <p>Institution-wide academic statistics and performance indicators</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Average CGPA', value: avgCgpa, icon: <MdSchool />, color: '#6366f1' },
          { label: 'Students Above 8.0', value: students.filter(s => s.cgpa_current >= 8).length, icon: <MdStar />, color: '#10b981' },
          { label: 'Total Backlogs', value: totalBacklogs, icon: <MdAssignment />, color: '#ef4444' },
          { label: 'Students with Backlogs', value: students.filter(s => s.backlogs > 0).length, icon: <MdWarning />, color: '#f59e0b' },
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
          <div className="chart-title"><MdBarChart style={{ marginRight: 6, verticalAlign: 'middle' }} />CGPA Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gpaDistribution} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: '#4a5568', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                {gpaDistribution.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title"><MdApartment style={{ marginRight: 6, verticalAlign: 'middle' }} />Avg CGPA by Department</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptStats} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4a5568', fontSize: 11 }} domain={[0, 10]} axisLine={false} tickLine={false} />
              <YAxis dataKey="department" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_cgpa" name="Avg CGPA" radius={[0, 6, 6, 0]}>
                {deptStats.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="glass-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="chart-title" style={{ marginBottom: 0 }}><MdEmojiEvents style={{ marginRight: 6, verticalAlign: 'middle' }} />Top Performing Students</div>
          </div>
          {topStudents.map((s, i) => (
            <div key={s.student_id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
              borderBottom: i < topStudents.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, fontWeight: 800, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? 'rgba(245,158,11,0.2)' : i === 1 ? 'rgba(148,163,184,0.15)' : 'rgba(205,127,50,0.15)',
                color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#cd7f32'
              }}>#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.student_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.student_id} · {s.department}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{s.cgpa_current.toFixed(1)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>CGPA</div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="chart-title" style={{ marginBottom: 0 }}><MdWarning style={{ marginRight: 6, verticalAlign: 'middle', color: '#ef4444' }} />Students Needing Attention</div>
          </div>
          {needsAttention.slice(0, 20).map((s, i) => (
            <div key={s.student_id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
              borderBottom: i < Math.min(needsAttention.length, 20) - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(239,68,68,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#ef4444'
              }}>{s.student_name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.student_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {s.backlogs > 0 ? `${s.backlogs} backlog${s.backlogs > 1 ? 's' : ''}` : ''}{s.backlogs > 0 && s.cgpa_current < 6.5 ? ' · ' : ''}
                  {s.cgpa_current < 6.5 ? `CGPA: ${s.cgpa_current.toFixed(1)}` : ''}
                </div>
              </div>
              <span className={`badge ${s.overall_risk_probability >= 0.6 ? 'badge-red' : 'badge-orange'}`}>
                {s.overall_risk_probability >= 0.6 ? 'High' : 'Medium'}
              </span>
            </div>
          ))}
          {needsAttention.length > 20 && (
            <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              Showing 20 of {needsAttention.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}