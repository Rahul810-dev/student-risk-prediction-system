import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  MdDashboard, MdPeople, MdTrendingUp, MdEventNote, MdEmojiEvents,
  MdNotifications, MdLogout, MdSearch,
  MdCheck, MdClose, MdArrowUpward, MdArrowDownward, MdAssignment, MdWarning
} from 'react-icons/md';
import ExamScheduleBanner from '../components/ExamScheduleBanner';

const API = 'http://localhost:8000';

const C = {
  primary:     '#1CA99B',
  primaryDark: '#0D5E54',
  primaryMid:  '#147A6F',
  light:       '#F0FCFA',
  accent:      '#34D399',
  amber:       '#F59E0B',
  sidebar:     'linear-gradient(180deg, #0A4A42 0%, #052A25 100%)',
  sidebarBdr:  'rgba(255,255,255,0.05)',
  bg:          '#F4FAFA',
};

const NAV = [
  { label: 'Dashboard',         icon: <MdDashboard />,   id: 'dash'     },
  { label: 'My Students',       icon: <MdPeople />,      id: 'students' },
  { label: 'Class Insights',    icon: <MdTrendingUp />,  id: 'insights' },
  { label: 'Leave Approvals',   icon: <MdAssignment />,  id: 'leave'    },
  { label: 'Events & Programs', icon: <MdEventNote />,   id: 'events'   },
  { label: 'Achievements',      icon: <MdEmojiEvents />, id: 'awards'   },
];

function getRiskColor(v) {
  return v >= 70 ? '#ef4444' : v >= 40 ? '#f59e0b' : '#10b981';
}

function getRiskLevel(prob) {
  if (prob >= 0.6) return 'High';
  if (prob >= 0.3) return 'Medium';
  return 'Low';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) return (
    <div style={{ background: '#fff', border: '1px solid #E0EBEA', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
      <p style={{ color: '#4A7A74', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}{p.unit || ''}</p>)}
    </div>
  );
  return null;
};

const performance = [
  { subject: 'Data Structures', ia1: 75, ia2: 82 },
  { subject: 'OS & Networks',   ia1: 71, ia2: 78 },
  { subject: 'DBMS',            ia1: 85, ia2: 88 },
  { subject: 'Compiler Design', ia1: 63, ia2: 69 },
];

const attendanceTrend = [
  { month: 'Nov', pct: 88 }, { month: 'Dec', pct: 84 },
  { month: 'Jan', pct: 81 }, { month: 'Feb', pct: 86 },
  { month: 'Mar', pct: 83 }, { month: 'Apr', pct: 85 },
];

const StudentsView = ({ students }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    s.student_name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2622', marginBottom: 4 }}>My Students</h1>
          <p style={{ fontSize: 13, color: '#4A7A74' }}>{students.length} students under your mentorship.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.light, border: `1px solid rgba(28,169,155,0.15)`, borderRadius: 8, padding: '7px 12px', width: 220 }}>
          <MdSearch style={{ color: '#4A7A74', fontSize: 16 }} />
          <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#0D2622', width: '100%' }} />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(28,169,155,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: C.light }}>
            <tr>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#4A7A74', textTransform: 'uppercase' }}>Name & Roll No</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#4A7A74', textTransform: 'uppercase' }}>Attendance</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#4A7A74', textTransform: 'uppercase' }}>CGPA</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#4A7A74', textTransform: 'uppercase' }}>Risk</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#4A7A74', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const riskLevel = getRiskLevel(s.overall_risk_probability);
              const riskPct   = Math.round(s.overall_risk_probability * 100);
              return (
                <tr key={s.student_id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(28,169,155,0.06)' : 'none' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0D2622' }}>{s.student_name}</div>
                    <div style={{ fontSize: 11, color: '#4A7A74', marginTop: 2 }}>{s.student_id}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 40, height: 6, background: '#E0EBEA', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.attendance_percent}%`, background: s.attendance_percent < 75 ? '#ef4444' : C.primaryMid }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.attendance_percent < 75 ? '#ef4444' : '#0D2622' }}>{s.attendance_percent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#0D2622', fontWeight: 600 }}>{s.cgpa_current.toFixed(1)}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, color: getRiskColor(riskPct), background: `${getRiskColor(riskPct)}20` }}>{riskLevel}</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button onClick={() => setSelectedStudent(s)} style={{ padding: '6px 12px', borderRadius: 6, background: C.light, color: C.primaryDark, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,42,37,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 460, background: 'white', borderRadius: 20, boxShadow: '0 24px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: C.primaryDark, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>{selectedStudent.student_name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{selectedStudent.student_name}</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>{selectedStudent.student_id} · Sem {selectedStudent.semester}</div>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer', opacity: 0.8 }}>x</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[
                  { label: 'CGPA',        value: selectedStudent.cgpa_current.toFixed(2), color: '#10b981' },
                  { label: 'Attendance',  value: `${selectedStudent.attendance_percent.toFixed(1)}%`, color: selectedStudent.attendance_percent < 75 ? '#ef4444' : '#10b981' },
                  { label: 'Backlogs',    value: selectedStudent.backlogs, color: selectedStudent.backlogs > 0 ? '#ef4444' : '#10b981' },
                  { label: 'Overall Risk', value: `${Math.round(selectedStudent.overall_risk_probability * 100)}%`, color: getRiskColor(Math.round(selectedStudent.overall_risk_probability * 100)) },
                ].map(m => (
                  <div key={m.label} style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, color: '#4A7A74', fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const InsightsView = ({ students }) => {
  const sorted = [...students].sort((a, b) => b.overall_risk_probability - a.overall_risk_probability);
  const highCount   = students.filter(s => getRiskLevel(s.overall_risk_probability) === 'High').length;
  const mediumCount = students.filter(s => getRiskLevel(s.overall_risk_probability) === 'Medium').length;
  const lowCount    = students.filter(s => getRiskLevel(s.overall_risk_probability) === 'Low').length;

  const riskDistribution = [
    { risk: 'High',   count: highCount,   color: '#ef4444' },
    { risk: 'Medium', count: mediumCount, color: '#f59e0b' },
    { risk: 'Low',    count: lowCount,    color: '#10b981' },
  ];

  return (
    <>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2622', marginBottom: 4 }}>Risk Prediction and Insights</h1>
          <p style={{ fontSize: 13, color: '#4A7A74' }}>AI-driven analysis identifying students at academic risk.</p>
        </div>
        {highCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: 20, color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
            <MdWarning size={14} /> {highCount} High Risk Students
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid rgba(28,169,155,0.1)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0D2622', marginBottom: 16 }}>Highest Risk (Top 5)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sorted.slice(0, 5).map((s, i) => {
              const riskPct = Math.round(s.overall_risk_probability * 100);
              return (
                <div key={s.student_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: `${getRiskColor(riskPct)}10`, borderRadius: 12, border: `1px solid ${getRiskColor(riskPct)}30` }}>
                  <div style={{ width: 34, height: 34, background: `${getRiskColor(riskPct)}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: getRiskColor(riskPct), fontWeight: 800 }}>{s.student_name.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0D2622' }}>{s.student_name}</div>
                    <div style={{ fontSize: 11, color: '#4A7A74' }}>CGPA: {s.cgpa_current.toFixed(1)} · Attend: {s.attendance_percent.toFixed(1)}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: getRiskColor(riskPct) }}>{riskPct}%</div>
                    <div style={{ fontSize: 10, color: '#4A7A74' }}>Risk</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid rgba(28,169,155,0.1)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0D2622', marginBottom: 16 }}>Risk Distribution</h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
            {riskDistribution.map(r => (
              <div key={r.risk} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: r.color }}>{r.count}</div>
                <div style={{ fontSize: 12, color: '#4A7A74', fontWeight: 600 }}>{r.risk} Risk</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={riskDistribution} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="risk" type="category" hide />
              <Bar dataKey="count" radius={10} barSize={20}>
                {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
              <Tooltip content={<CustomTooltip />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

const LeaveStaffView = ({ leaves, handleLeave }) => (
  <>
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2622', marginBottom: 4 }}>Leave Processing Hub</h1>
      <p style={{ fontSize: 13, color: '#4A7A74' }}>Review pending leaves and view complete history.</p>
    </div>

    <div style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(28,169,155,0.1)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: C.light }}>
          <tr>
            <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#4A7A74', textTransform: 'uppercase' }}>Student</th>
            <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#4A7A74', textTransform: 'uppercase' }}>Type / Date</th>
            <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#4A7A74', textTransform: 'uppercase' }}>Reason</th>
            <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#4A7A74', textTransform: 'uppercase' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {leaves.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#4A7A74', fontSize: 13 }}>No leave requests found.</td></tr>
          ) : leaves.map((l, i) => (
            <tr key={l.id} style={{ borderBottom: i < leaves.length - 1 ? '1px solid rgba(28,169,155,0.06)' : 'none' }}>
              <td style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0D2622' }}>{l.student_name}</div>
                <div style={{ fontSize: 11, color: '#4A7A74', marginTop: 2 }}>{l.student_id}</div>
              </td>
              <td style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 13, color: '#0D2622', fontWeight: 600 }}>{l.leave_type}</div>
                <div style={{ fontSize: 12, color: '#4A7A74', marginTop: 2 }}>{l.leave_date || '--'}</div>
              </td>
              <td style={{ padding: '16px 20px', fontSize: 12, color: '#4A7A74', maxWidth: 200 }}>{l.reason}</td>
              <td style={{ padding: '16px 20px' }}>
                {l.status === 'Pending' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleLeave(l.id, 'Approved')} style={{ padding: '6px 14px', borderRadius: 6, border: '1.5px solid #10b981', background: '#ecfdf5', color: '#10b981', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MdCheck size={14} /> Approve
                    </button>
                    <button onClick={() => handleLeave(l.id, 'Rejected')} style={{ padding: '6px 14px', borderRadius: 6, border: '1.5px solid #dc2626', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MdClose size={14} /> Reject
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 700, color: l.status === 'Approved' ? '#10b981' : '#dc2626', padding: '5px 12px', background: l.status === 'Approved' ? '#f0fdf4' : '#fef2f2', borderRadius: 20, display: 'inline-block' }}>
                    {l.status === 'Approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

const StaffEventsView = ({ employeeId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) { setLoading(false); return; }
    fetch(`${API}/events/teacher/${employeeId}`)
      .then(r => r.json())
      .then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [employeeId]);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#4A7A74' }}>Loading events...</div>;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2622', marginBottom: 4 }}>Events & Programs</h1>
        <p style={{ fontSize: 13, color: '#4A7A74' }}>Events published for your department.</p>
      </div>

      {events.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', color: '#4A7A74', border: '1px solid rgba(28,169,155,0.1)' }}>
          No events scheduled right now.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {events.map(e => (
            <div key={e.id} style={{ background: 'white', border: '1px solid rgba(28,169,155,0.1)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0D2622' }}>{e.title}</div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, color: e.status === 'Completed' ? '#10b981' : e.status === 'Upcoming' ? '#0891b2' : '#f59e0b', background: e.status === 'Completed' ? '#ecfdf5' : e.status === 'Upcoming' ? '#ecfeff' : '#fffbeb' }}>{e.status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#4A7A74', marginBottom: 4 }}>📅 {e.event_date} {e.event_time}</div>
              <div style={{ fontSize: 12, color: '#4A7A74', marginBottom: 4 }}>📍 {e.venue}</div>
              <div style={{ fontSize: 12, color: '#4A7A74' }}>
                👥 {e.participant_count}{e.max_participants ? ` / ${e.max_participants}` : ''} registered
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const DashboardView = ({ teacherData, leaves, handleLeave, employeeId }) => {
  const students    = teacherData?.students || [];
  const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  const lowAttend   = students.filter(s => s.attendance_percent < 75).length;
  const highRisk    = students.filter(s => s.overall_risk_probability >= 0.6).length;
  const avgAttend   = students.length
    ? (students.reduce((a, s) => a + s.attendance_percent, 0) / students.length).toFixed(1)
    : 0;

  return (
    <>
      <ExamScheduleBanner role="staff" id={employeeId} />
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2622', marginBottom: 4 }}>Section Overview</h1>
          <p style={{ fontSize: 13, color: '#4A7A74' }}>Academic year 2024-25 · CSE</p>
        </div>
        <span style={{ fontSize: 11, color: C.primaryMid, background: C.light, padding: '5px 12px', borderRadius: 20, fontWeight: 600 }}>Live Data</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Students',    value: students.length,     icon: <MdPeople />,     color: C.primaryMid, bg: `rgba(28,169,155,0.12)`, hint: 'Under your mentorship' },
          { label: 'Avg Attendance',    value: `${avgAttend}%`,     icon: <MdEventNote />,  color: '#0891b2',    bg: 'rgba(8,145,178,0.12)',   hint: 'Section average' },
          { label: 'Pending Leaves',    value: pendingLeaves.length, icon: <MdAssignment />, color: C.amber,      bg: 'rgba(245,158,11,0.12)', hint: 'Needs your action' },
          { label: 'High Risk Students', value: highRisk,            icon: <MdWarning />,    color: '#ef4444',    bg: 'rgba(239,68,68,0.12)',  hint: 'Require attention' },
        ].map(c => (
          <div key={c.label} style={{ background: 'white', border: '1px solid rgba(28,169,155,0.10)', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{c.icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0D2622', lineHeight: 1, marginBottom: 4 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#4A7A74', fontWeight: 500 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: '#94b3af', marginTop: 2 }}>{c.hint}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'white', border: '1px solid rgba(28,169,155,0.10)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0D2622', marginBottom: 16 }}>Pending Leave Approvals</div>
          {pendingLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 13, color: '#0D2622', fontWeight: 600 }}>All caught up!</div>
              <div style={{ fontSize: 11, color: '#4A7A74' }}>No pending leave requests.</div>
            </div>
          ) : pendingLeaves.slice(0, 4).map((l, i) => (
            <div key={l.id} style={{ padding: '12px 0', borderBottom: i < pendingLeaves.slice(0, 4).length - 1 ? '1px solid rgba(28,169,155,0.08)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0D2622' }}>{l.student_name}</div>
                <div style={{ fontSize: 11, color: '#4A7A74', marginTop: 2 }}>{l.leave_type} · {l.leave_date || '--'}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleLeave(l.id, 'Approved')} style={{ padding: '5px 10px', borderRadius: 6, border: '1.5px solid #10b981', background: '#ecfdf5', color: '#10b981', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MdCheck size={12} />
                </button>
                <button onClick={() => handleLeave(l.id, 'Rejected')} style={{ padding: '5px 10px', borderRadius: 6, border: '1.5px solid #dc2626', background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MdClose size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', border: '1px solid rgba(28,169,155,0.10)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0D2622', marginBottom: 16 }}>Section Performance</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performance} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(28,169,155,0.06)" vertical={false} />
              <XAxis dataKey="subject" tick={{ fill: '#4A7A74', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4A7A74', fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="ia1" name="IA 1" fill={C.primaryMid} radius={[4,4,0,0]} barSize={16} />
              <Bar dataKey="ia2" name="IA 2" fill={C.accent}     radius={[4,4,0,0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid rgba(28,169,155,0.10)', borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0D2622', marginBottom: 16 }}>Attendance Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={attendanceTrend} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.primaryMid} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.primaryMid} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(28,169,155,0.06)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#4A7A74', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4A7A74', fontSize: 11 }} domain={[70, 100]} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="pct" name="Avg Attendance" unit="%" stroke={C.primaryMid} fill="url(#tGrad)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default function StaffDashboard() {
  const [activeNav,   setActiveNav]   = useState('dash');
  const [teacherData, setTeacherData] = useState(null);
  const [leaves,      setLeaves]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate   = useNavigate();
  const profileRef = useRef(null);

  const employeeId = localStorage.getItem('employeeId');
  const userName   = localStorage.getItem('userName') || 'Staff';

  const refreshLeaves = () => {
    if (!employeeId) return;
    fetch(`${API}/leave/teacher/${employeeId}`)
      .then(r => r.json())
      .then(d => setLeaves(Array.isArray(d) ? d : []));
  };

  useEffect(() => {
    if (!employeeId) { setLoading(false); return; }
    Promise.all([
      fetch(`${API}/teacher/${employeeId}/students`).then(r => r.json()),
      fetch(`${API}/leave/teacher/${employeeId}`).then(r => r.json()),
    ]).then(([teacherRes, leavesRes]) => {
      setTeacherData(teacherRes.error ? null : teacherRes);
      setLeaves(Array.isArray(leavesRes) ? leavesRes : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [employeeId]);

  // Poll every 10 seconds for new leave requests (real-time simulation)
  useEffect(() => {
    const interval = setInterval(refreshLeaves, 10000);
    return () => clearInterval(interval);
  }, [employeeId]);

  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLeave = async (leaveId, status) => {
    try {
      await fetch(`${API}/leave/${leaveId}`, {
        method  : 'PATCH',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({ status, comment: '' })
      });
      setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status } : l));
    } catch {
      console.error('Failed to update leave');
    }
  };

  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const students  = teacherData?.students || [];

  const renderContent = () => {
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, color: '#4A7A74' }}>Loading your dashboard...</div>;
    switch (activeNav) {
      case 'dash': return <DashboardView teacherData={teacherData} leaves={leaves} handleLeave={handleLeave} employeeId={employeeId} />;
      case 'students': return <StudentsView students={students} />;
      case 'insights': return <InsightsView students={students} />;
      case 'leave':    return <LeaveStaffView leaves={leaves} handleLeave={handleLeave} />;
      case 'events': return <StaffEventsView employeeId={employeeId} />;
      default: return <DashboardView teacherData={teacherData} leaves={leaves} handleLeave={handleLeave} employeeId={employeeId} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      <div style={{ width: 240, height: '100vh', position: 'fixed', left: 0, top: 0, background: C.sidebar, display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto', boxShadow: '4px 0 20px rgba(5,42,37,0.2)' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.sidebarBdr}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>{initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{userName}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{teacherData?.designation || 'Staff'}</div>
          </div>
        </div>

        <div style={{ padding: '12px 12px 0', flex: 1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer', width: '100%', border: 'none', marginBottom: 2, background: activeNav === n.id ? 'rgba(255,255,255,0.12)' : 'transparent', color: activeNav === n.id ? 'white' : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500, textAlign: 'left', transition: 'all 0.15s', borderLeft: activeNav === n.id ? `3px solid ${C.accent}` : '3px solid transparent' }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
              {n.id === 'leave' && leaves.filter(l => l.status === 'Pending').length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, background: '#ef4444', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {leaves.filter(l => l.status === 'Pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: 12, borderTop: `1px solid ${C.sidebarBdr}` }}>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', width: '100%', border: 'none', borderRadius: 8, background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            <MdLogout size={16} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, marginLeft: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ height: 60, position: 'fixed', top: 0, left: 240, right: 0, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(28,169,155,0.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, zIndex: 99 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0D2622' }}>Staff Dashboard</span>
          <div style={{ flex: 1 }} />
          {leaves.filter(l => l.status === 'Pending').length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fcd34d', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#92400e' }}>
              {leaves.filter(l => l.status === 'Pending').length} pending leaves
            </div>
          )}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.light, border: '1px solid rgba(28,169,155,0.15)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>{initials}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0D2622' }}>{userName}</div>
                <div style={{ fontSize: 10, color: '#4A7A74' }}>Staff</div>
              </div>
            </button>
            {profileOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: '1px solid rgba(28,169,155,0.15)', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.12)', minWidth: 160, padding: 6, zIndex: 200 }}>
                <div onClick={() => { localStorage.clear(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#ef4444' }}>
                  <MdLogout size={14} /> Sign out
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '84px 24px 24px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}