import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  MdDashboard, MdEventNote, MdGrade, MdSchedule, MdBeachAccess,
  MdNotifications, MdEmojiEvents, MdLogout, MdArrowUpward, MdArrowDownward,
  MdSearch, MdNoteAdd, MdWarning
} from 'react-icons/md';
import ExamScheduleBanner from '../components/ExamScheduleBanner';

const API = 'http://localhost:8000';

const C = {
  primary:     '#0891b2',
  primaryDark: '#155e75',
  primaryMid:  '#06b6d4',
  light:       '#ecfeff',
  accent:      '#0ea5e9',
  amber:       '#f59e0b',
  sidebar:     'linear-gradient(180deg, #164e63 0%, #083344 100%)',
  sidebarBdr:  'rgba(255,255,255,0.12)',
  bg:          '#F8FAFC',
};
const primaryRgb = '8,145,178';

const subjectAttendance = [
  { subject: 'Data Structures', class: 45, attended: 42, pct: 93 },
  { subject: 'OS & Networks',   class: 40, attended: 34, pct: 85 },
  { subject: 'DBMS',            class: 42, attended: 40, pct: 95 },
  { subject: 'Compiler Design', class: 38, attended: 29, pct: 76 },
];

const subjectMarks = [
  { subject: 'DSA',      ia1: 78, ia2: 86 },
  { subject: 'OS',       ia1: 72, ia2: 75 },
  { subject: 'DBMS',     ia1: 88, ia2: 91 },
  { subject: 'Compiler', ia1: 65, ia2: 70 },
];

const sgpaProgression = [
  { sem: 'Sem 1', sgpa: 8.1 }, { sem: 'Sem 2', sgpa: 8.3 },
  { sem: 'Sem 3', sgpa: 8.0 }, { sem: 'Sem 4', sgpa: 8.5 },
  { sem: 'Sem 5', sgpa: 8.4 },
];

const exams = [
  { subject: 'Data Structures', type: 'Unit 3', date: 'Apr 19', days: 4,  time: '10:00 AM' },
  { subject: 'OS & Networks',   type: 'Unit 2', date: 'Apr 18', days: 8,  time: '10:00 AM' },
  { subject: 'DBMS',            type: 'Final',  date: 'Apr 25', days: 15, time: '01:30 PM' },
  { subject: 'Compiler Design', type: 'Final',  date: 'May 3',  days: 22, time: '10:00 AM' },
];

const awards = [
  { icon: '⭐', text: 'Best project — Dept level', date: 'Mar 2025' },
  { icon: '🏆', text: 'Hackathon finalist',        date: 'Feb 2025' },
  { icon: '🏅', text: '100% Attendance Award',     date: 'Dec 2024' },
];

const STATUS_COLOR = { Approved: '#10b981', Pending: '#f59e0b', Rejected: '#ef4444' };
const STATUS_BG    = { Approved: '#ecfdf5', Pending: '#fffbeb', Rejected: '#fef2f2' };

const NAV = [
  { label: 'Dashboard',        icon: <MdDashboard />,   id: 'dash'   },
  { label: 'My Risk Profile',  icon: <MdWarning />,     id: 'risk'   },
  { label: 'My Attendance',    icon: <MdEventNote />,   id: 'attend' },
  { label: 'My Grades',        icon: <MdGrade />,       id: 'grades' },
  { label: 'Examinations',     icon: <MdSchedule />,    id: 'exams'  },
  { label: 'Leave Requests',   icon: <MdBeachAccess />, id: 'leave'  },
  { label: 'Events',           icon: <MdEmojiEvents />, id: 'events' },
  { label: 'Awards & Honours', icon: <MdEmojiEvents />, id: 'awards' },
];

function dayBadge(d) {
  if (d <= 5)  return { bg: '#fef2f2', color: '#ef4444' };
  if (d <= 10) return { bg: '#fffbeb', color: '#f59e0b' };
  return { bg: '#f0fdf4', color: '#10b981' };
}

function getRiskColor(v) {
  return v >= 70 ? '#ef4444' : v >= 40 ? '#f59e0b' : '#10b981';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) return (
    <div style={{ background: '#fff', border: `1px solid rgba(${primaryRgb},0.2)`, borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
      <p style={{ color: '#64748B', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}{p.unit || ''}</p>)}
    </div>
  );
  return null;
};

function RiskRing({ value, label }) {
  const r = 38, circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = getRiskColor(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke={`rgba(${primaryRgb},0.1)`} strokeWidth={8} />
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        <text x={45} y={45} textAnchor="middle" dominantBaseline="central"
          fill="#0F172A" fontSize={14} fontWeight={800}
          style={{ transform: 'rotate(90deg)', transformOrigin: '45px 45px' }}>{value}%</text>
      </svg>
      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

const RiskProfileView = ({ profile }) => {
  if (!profile) return null;
  const overall  = Math.round(profile.overall_risk_probability    * 100);
  const cgpa     = Math.round(profile.cgpa_risk_probability       * 100);
  const attend   = Math.round(profile.attendance_risk_probability  * 100);
  const backlog  = Math.round(profile.backlog_risk_probability     * 100);
  const assign   = Math.round(profile.assignment_risk_probability  * 100);

  const radarData = [
    { subject: 'CGPA',       risk: cgpa    },
    { subject: 'Attendance', risk: attend  },
    { subject: 'Backlog',    risk: backlog },
    { subject: 'Assignment', risk: assign  },
  ];

  const riskLabel = overall >= 60 ? 'High' : overall >= 30 ? 'Medium' : 'Low';
  const riskMsg   = overall >= 60 ? 'Your risk is High. Please consult your mentor immediately.' :
                    overall >= 30 ? 'Your risk is Moderate. Stay focused!' :
                    'Your risk level is Low. Keep up the good work!';
  const riskMsgBg = overall >= 60 ? '#fef2f2' : overall >= 30 ? '#fffbeb' : '#ecfdf5';
  const riskMsgColor = getRiskColor(overall);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>My Risk Profile</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>AI-driven insight into your academic standing and potential risk indicators.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 16, textAlign: 'center', border: `1px solid rgba(${primaryRgb},0.1)` }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Overall Academic Risk</h2>
          <RiskRing value={overall} label="Overall Risk" />
          <div style={{ marginTop: 24, fontSize: 13, color: riskMsgColor, background: riskMsgBg, padding: '10px', borderRadius: 8, fontWeight: 600 }}>
            {riskMsg}
          </div>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)` }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Risk Dimensions</h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '80%' }}>
            {[['CGPA', cgpa], ['Attendance', attend], ['Backlog', backlog], ['Assignment', assign]].map(([label, val]) => (
              <RiskRing key={label} value={val} label={label} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: 24, borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)` }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Risk Radar</h2>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke={`rgba(${primaryRgb},0.1)`} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12 }} />
            <Radar name="Risk Level" dataKey="risk" stroke={C.primary} fill={C.primary} fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

const AttendanceView = ({ profile }) => {
  const overall = profile ? profile.attendance_percent.toFixed(1) : 0;
  const attendanceTrend = [
    { month: 'Nov', pct: 91 }, { month: 'Dec', pct: 88 },
    { month: 'Jan', pct: Math.round(overall - 3) },
    { month: 'Feb', pct: Math.round(overall + 2) },
    { month: 'Mar', pct: Math.round(overall - 1) },
    { month: 'Apr', pct: Math.round(overall) },
  ];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Attendance Details</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Monitor your daily class presence and subject-specific thresholds.</p>
      </div>

      <div style={{ background: 'white', padding: 20, borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)`, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: parseFloat(overall) >= 75 ? C.primary : '#ef4444' }}>{overall}%</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Overall Attendance</div>
          </div>
          <div style={{ flex: 1, height: 12, background: '#E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: `${overall}%`, height: '100%', background: parseFloat(overall) >= 75 ? C.primaryMid : '#ef4444', borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: parseFloat(overall) >= 75 ? '#10b981' : '#ef4444' }}>
            {parseFloat(overall) >= 75 ? 'On Track' : 'Below Threshold'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {subjectAttendance.map((s, i) => (
          <div key={i} style={{ background: 'white', padding: 20, borderRadius: 16, border: `1px solid ${s.pct < 80 ? 'rgba(239,68,68,0.3)' : `rgba(${primaryRgb},0.1)`}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>{s.subject}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${s.pct}%`, height: '100%', background: s.pct < 80 ? '#ef4444' : C.primaryMid }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: s.pct < 80 ? '#ef4444' : C.primaryDark }}>{s.pct}%</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 10 }}>{s.attended}/{s.class} classes</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: 24, borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Semester Trend</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={attendanceTrend} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.primaryMid} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.primaryMid} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={`rgba(${primaryRgb},0.06)`} />
            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} domain={[60, 100]} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="pct" name="Attendance %" stroke={C.primaryMid} strokeWidth={3} fill="url(#aGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

const GradesView = ({ profile }) => (
  <>
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Academic Performance</h1>
      <p style={{ fontSize: 13, color: '#64748B' }}>Semester results, GPA progression, and internal marks breakdown.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
      {[
        { label: 'Current CGPA',  value: profile?.cgpa_current?.toFixed(2)  || '--', color: '#10b981' },
        { label: 'Previous GPA',  value: profile?.gpa_previous?.toFixed(2)  || '--', color: C.primary  },
        { label: 'Active Backlogs', value: profile?.backlogs || 0,                  color: profile?.backlogs > 0 ? '#ef4444' : '#10b981' },
      ].map(c => (
        <div key={c.label} style={{ background: 'white', padding: 24, borderRadius: 16, textAlign: 'center', border: `1px solid rgba(${primaryRgb},0.1)` }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: c.color, marginBottom: 8 }}>{c.value}</div>
          <div style={{ fontSize: 13, color: '#64748B' }}>{c.label}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>GPA Progression</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={sgpaProgression} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={`rgba(${primaryRgb},0.06)`} />
            <XAxis dataKey="sem" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} domain={[0, 10]} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sgpa" name="GPA" fill={C.primaryDark} radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: 'white', padding: 24, borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Internal Marks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {subjectMarks.map(s => (
            <div key={s.subject}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
                <span>{s.subject}</span>
                <span style={{ color: C.primary }}>IA2: {s.ia2}/100</span>
              </div>
              <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${s.ia2}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.primary})`, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

const ExamsView = ({ profile }) => (
  <>
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Examinations</h1>
      <p style={{ fontSize: 13, color: '#64748B' }}>Your upcoming exam schedule and hall ticket info.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: C.light }}>
            <tr>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Subject</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e, i) => {
              const b = dayBadge(e.days);
              return (
                <tr key={i} style={{ borderBottom: i < exams.length - 1 ? `1px solid rgba(${primaryRgb},0.06)` : 'none' }}>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{e.subject}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748B' }}>{e.type}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#0F172A' }}>{e.date} · {e.time}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: b.bg, color: b.color }}>In {e.days}d</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, padding: 24, borderRadius: 16, color: 'white' }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, borderBottom: '1px dashed rgba(255,255,255,0.3)', paddingBottom: 16 }}>Hall Ticket</h2>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, opacity: 0.8, textTransform: 'uppercase' }}>Candidate Name</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{profile?.student_name || '--'}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, opacity: 0.8, textTransform: 'uppercase' }}>Register Number</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{profile?.student_id || '--'}</div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, opacity: 0.8, textTransform: 'uppercase' }}>Department</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{profile?.department || '--'}</div>
        </div>
        <button style={{ width: '100%', padding: '10px 0', background: 'white', color: C.primaryDark, borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Download PDF</button>
      </div>
    </div>
  </>
);

const LeaveView = ({ studentId, leaves, refreshLeaves }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [submitting, setSubmitting]  = useState(false);
  const [message,    setMessage]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target;

    try {
      const res  = await fetch(`${API}/leave/request`, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({
          student_id : studentId,
          leave_type : form.leaveType.value,
          leave_date : form.leaveDate.value,
          reason     : form.reason.value
        })
      });
      const data = await res.json();
      if (data.leave_id) {
        setMessage('Leave request submitted successfully.');
        setIsApplying(false);
        refreshLeaves();
      } else {
        setMessage(data.error || 'Failed to submit.');
      }
    } catch {
      setMessage('Connection error.');
    }
    setSubmitting(false);
  };

  return (
    <>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Leave Management</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Manage your absence requests and view approval status.</p>
        </div>
        <button onClick={() => setIsApplying(true)} style={{ padding: '10px 20px', borderRadius: 8, background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MdNoteAdd size={16} /> Apply for Leave
        </button>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {isApplying && (
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)`, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>New Leave Application</h2>
            <button onClick={() => setIsApplying(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748B' }}>x</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>Leave Type</label>
              <select name="leaveType" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid rgba(${primaryRgb},0.2)`, fontSize: 13, outline: 'none' }} required>
                <option value="Medical">Medical Leave</option>
                <option value="Personal">Personal Reasons</option>
                <option value="OD">On-Duty (OD)</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>Date of Absence</label>
              <input name="leaveDate" type="date" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid rgba(${primaryRgb},0.2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>Reason</label>
              <textarea name="reason" rows="3" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid rgba(${primaryRgb},0.2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'none' }} placeholder="Provide specific details..." required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => setIsApplying(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: C.primary, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: C.light }}>
            <tr>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Reason</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No leave requests yet.</td></tr>
            ) : leaves.map((l, i) => (
              <tr key={l.id} style={{ borderBottom: i < leaves.length - 1 ? `1px solid rgba(${primaryRgb},0.06)` : 'none' }}>
                <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748B' }}>REQ-{l.id}</td>
                <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{l.leave_type}</td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: '#475569' }}>{l.leave_date || '--'}</td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748B', maxWidth: 200 }}>{l.reason}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20, color: STATUS_COLOR[l.status] || '#64748B', background: STATUS_BG[l.status] || '#f8fafc' }}>
                    {l.status}
                  </span>
                  {l.teacher_comment && (
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{l.teacher_comment}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const AwardsView = () => (
  <>
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Awards & Honours</h1>
      <p style={{ fontSize: 13, color: '#64748B' }}>Your digital badges, certificates, and academic achievements.</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
      {awards.map((a, i) => (
        <div key={i} style={{ background: 'white', padding: 24, borderRadius: 16, border: `1px solid rgba(${primaryRgb},0.1)`, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: C.light, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{a.icon}</div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{a.text}</h3>
          <div style={{ fontSize: 11, color: '#64748B' }}>Awarded {a.date}</div>
        </div>
      ))}
    </div>
  </>
);

const StudentEventsView = ({ studentId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadEvents = () => {
    if (!studentId) { setLoading(false); return; }
    fetch(`${API}/events/student/${studentId}`)
      .then(r => r.json())
      .then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, [studentId]);

  const handleRegister = async (eventId) => {
    const res = await fetch(`${API}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });
    const data = await res.json();
    setMessage(data.error || 'Registered successfully!');
    loadEvents();
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading events...</div>;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Events & Activities</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Events for your department and year.</p>
      </div>

      {message && (
        <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#155e75', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {events.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', color: '#64748B', border: `1px solid rgba(${primaryRgb},0.1)` }}>
          No events scheduled right now.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {events.map(e => {
            const isFull = e.max_participants && e.participant_count >= e.max_participants;
            return (
              <div key={e.id} style={{ background: 'white', border: `1px solid rgba(${primaryRgb},0.1)`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{e.title}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, color: e.status === 'Completed' ? '#10b981' : e.status === 'Upcoming' ? C.primary : '#f59e0b', background: e.status === 'Completed' ? '#ecfdf5' : e.status === 'Upcoming' ? C.light : '#fffbeb' }}>{e.status}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>📅 {e.event_date} {e.event_time}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>📍 {e.venue}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                  👥 {e.participant_count}{e.max_participants ? ` / ${e.max_participants}` : ''} registered
                </div>
                {e.status !== 'Completed' && (
                  <button
                    onClick={() => handleRegister(e.id)}
                    disabled={isFull}
                    style={{
                      width: '100%', padding: '8px 0', borderRadius: 8, border: 'none',
                      background: isFull ? '#e2e8f0' : C.primary,
                      color: isFull ? '#94a3b8' : 'white',
                      fontSize: 13, fontWeight: 700, cursor: isFull ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isFull ? 'Event Full' : 'Register'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

const DashboardView = ({ profile, leaves, setActiveNav }) => {
  const overall  = profile ? Math.round(profile.overall_risk_probability    * 100) : 0;
  const attendRisk = profile ? Math.round(profile.attendance_risk_probability * 100) : 0;

  const attendanceTrend = profile ? [
    { month: 'Nov', pct: Math.round(profile.attendance_percent - 4) },
    { month: 'Dec', pct: Math.round(profile.attendance_percent - 2) },
    { month: 'Jan', pct: Math.round(profile.attendance_percent - 5) },
    { month: 'Feb', pct: Math.round(profile.attendance_percent + 2) },
    { month: 'Mar', pct: Math.round(profile.attendance_percent - 1) },
    { month: 'Apr', pct: Math.round(profile.attendance_percent)     },
  ] : [];

  const pending = leaves.filter(l => l.status === 'Pending').length;

  return (
    <>
      <ExamScheduleBanner role="student" id={profile?.student_id} />
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Dashboard Overview</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>
          {profile?.department} · {profile?.section} · {profile?.student_id}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Attendance',      value: profile ? `${profile.attendance_percent.toFixed(1)}%` : '--', icon: <MdEventNote />, color: C.primary,  bg: `rgba(${primaryRgb},0.12)`, hint: profile?.consecutive_absences + ' consec. absences' },
          { label: 'CGPA',            value: profile?.cgpa_current?.toFixed(2) || '--',                    icon: <MdGrade />,    color: '#7C3AED',  bg: 'rgba(124,58,237,0.12)',    hint: `Prev: ${profile?.gpa_previous?.toFixed(2) || '--'}` },
          { label: 'Backlogs',        value: profile?.backlogs ?? '--',                                     icon: <MdWarning />, color: profile?.backlogs > 0 ? '#ef4444' : '#10b981', bg: profile?.backlogs > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', hint: profile?.backlogs > 0 ? 'Needs attention' : 'All clear' },
          { label: 'Overall Risk',    value: `${overall}%`,                                                 icon: <MdSchedule />,color: getRiskColor(overall), bg: `${getRiskColor(overall)}20`, hint: overall >= 60 ? 'High risk' : overall >= 30 ? 'Medium risk' : 'Low risk' },
        ].map(c => (
          <div key={c.label} style={{ background: 'white', border: `1px solid rgba(${primaryRgb},0.10)`, borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: 4 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{c.hint}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', border: `1px solid rgba(${primaryRgb},0.10)`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Attendance Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendanceTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.primary} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={`rgba(${primaryRgb},0.07)`} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} domain={[60, 100]} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pct" name="Attendance %" unit="%" stroke={C.primary} fill="url(#dGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', border: `1px solid rgba(${primaryRgb},0.10)`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Upcoming Exams</div>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 14 }}>CSE dept · 2024</div>
          {exams.map((e, i) => {
            const b = dayBadge(e.days);
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < exams.length - 1 ? `1px solid rgba(${primaryRgb},0.08)` : 'none' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{e.subject}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>{e.type} · {e.date}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: b.bg, color: b.color }}>{e.days}d</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: 'white', border: `1px solid rgba(${primaryRgb},0.10)`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Recent Leave Requests</div>
          <button onClick={() => setActiveNav('leave')} style={{ fontSize: 12, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All</button>
        </div>
        {leaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748B', fontSize: 13 }}>No leave requests yet.</div>
        ) : leaves.slice(0, 3).map((l, i) => (
          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? `1px solid rgba(${primaryRgb},0.06)` : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{l.leave_type}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>{l.leave_date || 'Date not set'} · {l.reason?.slice(0, 40)}{l.reason?.length > 40 ? '...' : ''}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, color: STATUS_COLOR[l.status] || '#64748B', background: STATUS_BG[l.status] || '#f8fafc' }}>
              {l.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default function StudentDashboard() {
  const [activeNav,   setActiveNav]   = useState('dash');
  const [profile,     setProfile]     = useState(null);
  const [leaves,      setLeaves]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate    = useNavigate();
  const profileRef  = useRef(null);

  const studentId = localStorage.getItem('studentId');
  const userName  = localStorage.getItem('userName') || 'Student';

  const refreshLeaves = () => {
    if (!studentId) return;
    fetch(`${API}/leave/student/${studentId}`)
      .then(r => r.json())
      .then(d => setLeaves(Array.isArray(d) ? d : []));
  };

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    Promise.all([
      fetch(`${API}/student/${studentId}/profile`).then(r => r.json()),
      fetch(`${API}/leave/student/${studentId}`).then(r => r.json()),
    ]).then(([profileData, leavesData]) => {
      setProfile(profileData.error ? null : profileData);
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const renderContent = () => {
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, color: '#64748B' }}>Loading your profile...</div>;
    switch (activeNav) {
      case 'dash':   return <DashboardView profile={profile} leaves={leaves} setActiveNav={setActiveNav} />;
      case 'risk':   return <RiskProfileView profile={profile} />;
      case 'attend': return <AttendanceView profile={profile} />;
      case 'grades': return <GradesView profile={profile} />;
      case 'exams':  return <ExamsView profile={profile} />;
      case 'leave':  return <LeaveView studentId={studentId} leaves={leaves} refreshLeaves={refreshLeaves} />;
      case 'awards': return <AwardsView />;
      case 'events': return <StudentEventsView studentId={studentId} />;
      default:       return <DashboardView profile={profile} leaves={leaves} setActiveNav={setActiveNav} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      <div style={{ width: 240, height: '100vh', position: 'fixed', left: 0, top: 0, background: C.sidebar, display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto', boxShadow: '4px 0 20px rgba(69,10,10,0.2)' }}>
        <div style={{ padding: '24px 16px 8px', borderBottom: `1px solid ${C.sidebarBdr}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>{initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{userName}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{profile?.department} · {profile?.student_id}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 12px 0', flex: 1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer', width: '100%', border: 'none', marginBottom: 2, background: activeNav === n.id ? 'rgba(255,255,255,0.15)' : 'transparent', color: activeNav === n.id ? 'white' : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500, textAlign: 'left', transition: 'all 0.15s', borderLeft: activeNav === n.id ? '3px solid #818CF8' : '3px solid transparent' }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
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
        <div style={{ height: 60, position: 'fixed', top: 0, left: 240, right: 0, background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid rgba(${primaryRgb},0.12)`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, zIndex: 99 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Student Dashboard</span>
          <div style={{ flex: 1 }} />
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: `1px solid rgba(${primaryRgb},0.15)`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>{initials}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{userName}</div>
                <div style={{ fontSize: 10, color: '#64748B' }}>Student</div>
              </div>
            </button>
            {profileOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: `1px solid rgba(${primaryRgb},0.15)`, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.12)', minWidth: 160, padding: 6, zIndex: 200 }}>
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