import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { MdReportProblem, MdApartment, MdBarChart, MdFiberManualRecord } from 'react-icons/md';

const API = 'http://localhost:8000';
const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: '#94a3b8', marginBottom: 2 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || '#6366f1', fontWeight: 600 }}>{p.name}: {p.value}%</p>)}
    </div>
  );
};

function getRiskColor(v) { return v >= 60 ? '#ef4444' : v >= 30 ? '#f59e0b' : '#10b981'; }
function getRiskLevel(v) { if (v >= 0.6) return 'High'; if (v >= 0.3) return 'Medium'; return 'Low'; }

export default function RiskInsights() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All Departments');

  useEffect(() => {
    fetch(`${API}/students/all`)
      .then(r => r.json())
      .then(data => { setStudents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading risk insights...</div>;

  const depts = ['All Departments', ...Array.from(new Set(students.map(s => s.department)))];
  const filteredStudents = selectedDept === 'All Departments' ? students : students.filter(s => s.department === selectedDept);
  const sortedByRisk = [...filteredStudents].sort((a, b) => b.overall_risk_probability - a.overall_risk_probability);

  const deptNames = Array.from(new Set(students.map(s => s.department)));
  const deptRisk = deptNames.map((name, i) => {
    const dStudents = students.filter(s => s.department === name);
    const avg = dStudents.length ? Math.round(dStudents.reduce((a, s) => a + s.overall_risk_probability * 100, 0) / dStudents.length) : 0;
    return { name, overall: avg, color: DEPT_COLORS[i % DEPT_COLORS.length] };
  });

  const highCount = students.filter(s => getRiskLevel(s.overall_risk_probability) === 'High').length;
  const mediumCount = students.filter(s => getRiskLevel(s.overall_risk_probability) === 'Medium').length;
  const lowCount = students.filter(s => getRiskLevel(s.overall_risk_probability) === 'Low').length;

  return (
    <div>
      <div className="page-header">
        <h1>Performance Insights</h1>
        <p>Multi-dimensional risk analysis and student performance monitoring</p>
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="section-title"><MdReportProblem style={{ marginRight: 6, verticalAlign: 'middle', color: '#ef4444' }} />Highest Risk Students</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedByRisk.slice(0, 5).map((s, i) => {
            const overall = Math.round(s.overall_risk_probability * 100);
            return (
              <div key={s.student_id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: 13, width: 20 }}>#{i + 1}</div>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, background: `${getRiskColor(overall)}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: getRiskColor(overall)
                }}>{s.student_name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{s.student_name}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{s.student_id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { l: 'CGPA', v: Math.round(s.cgpa_risk_probability * 100) },
                      { l: 'Backlog', v: Math.round(s.backlog_risk_probability * 100) },
                      { l: 'Attend', v: Math.round(s.attendance_risk_probability * 100) },
                      { l: 'Assign', v: Math.round(s.assignment_risk_probability * 100) }
                    ].map(r => (
                      <span key={r.l} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                        background: `${getRiskColor(r.v)}20`, color: getRiskColor(r.v)
                      }}>{r.l}: {r.v}%</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: getRiskColor(overall) }}>{overall}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Overall</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Risk Breakdown by Student</div>
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, background: 'white', cursor: 'pointer' }}>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>CGPA Risk</th><th>Backlog Risk</th><th>Attendance Risk</th><th>Assignment Risk</th><th>Overall Risk</th></tr>
            </thead>
            <tbody>
              {sortedByRisk.map(s => {
                const risks = {
                  cgpa: Math.round(s.cgpa_risk_probability * 100),
                  backlog: Math.round(s.backlog_risk_probability * 100),
                  attendance: Math.round(s.attendance_risk_probability * 100),
                  assignment: Math.round(s.assignment_risk_probability * 100),
                  overall: Math.round(s.overall_risk_probability * 100),
                };
                return (
                  <tr key={s.student_id} style={{ cursor: 'default' }}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.student_name}</td>
                    {['cgpa', 'backlog', 'attendance', 'assignment', 'overall'].map(k => (
                      <td key={k}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar-wrap" style={{ width: 60 }}>
                            <div className="progress-bar-fill" style={{ width: `${risks[k]}%`, background: getRiskColor(risks[k]) }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: getRiskColor(risks[k]) }}>{risks[k]}%</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title"><MdApartment style={{ marginRight: 6, verticalAlign: 'middle' }} />Department Risk Comparison</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptRisk} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="overall" name="Overall Risk %" radius={[6, 6, 0, 0]}>
                {deptRisk.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title"><MdBarChart style={{ marginRight: 6, verticalAlign: 'middle' }} />Risk Distribution</div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
            {[
              { label: 'High Risk', count: highCount, color: '#ef4444' },
              { label: 'Medium Risk', count: mediumCount, color: '#f59e0b' },
              { label: 'Low Risk', count: lowCount, color: '#10b981' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                <MdFiberManualRecord style={{ fontSize: 28, color: r.color, marginBottom: 8 }} />
                <div style={{ fontSize: 36, fontWeight: 900, color: r.color, marginBottom: 4 }}>{r.count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>students</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            {[['High', highCount, '#ef4444'], ['Medium', mediumCount, '#f59e0b'], ['Low', lowCount, '#10b981']].map(([level, count, color]) => {
              const pct = students.length ? Math.round((count / students.length) * 100) : 0;
              return (
                <div key={level} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{level} Risk</span>
                    <span style={{ color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}