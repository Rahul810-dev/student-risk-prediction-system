import { useParams, useNavigate } from 'react-router-dom';
import { students } from '../data/students';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { MdArrowBack, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Mar'];

function RiskRing({ value, label, color }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x={45} y={45} textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize={14} fontWeight={800} style={{ transform: 'rotate(90deg)', transformOrigin: '45px 45px' }}>
          {value}%
        </text>
      </svg>
      <div className="risk-label">{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: '#94a3b8', marginBottom: 2 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || '#6366f1', fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

function getRiskColor(val) {
  return val >= 70 ? '#ef4444' : val >= 40 ? '#f59e0b' : '#10b981';
}

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const s = students.find(st => st.id === parseInt(id));

  if (!s) return (
    <div className="empty-state">
      <div className="empty-state-icon">🔍</div>
      <p>Student not found.</p>
    </div>
  );

  const attendanceData = MONTHS.map((m, i) => ({ month: m, value: s.attendanceTrend[i] }));
  const gpaData = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((sem, i) => ({ sem, gpa: s.gpaHistory[i] }));
  const radarData = [
    { subject: 'CGPA', A: s.risk.cgpa },
    { subject: 'Backlog', A: s.risk.backlog },
    { subject: 'Attendance', A: s.risk.attendance },
    { subject: 'Assignment', A: s.risk.assignment },
    { subject: 'Overall', A: s.risk.overall },
  ];

  const riskBg = s.riskLevel === 'High' ? '#ef4444' : s.riskLevel === 'Medium' ? '#f59e0b' : '#10b981';

  return (
    <div>
      <div className="breadcrumb">
        <a onClick={() => navigate('/students')}>Students</a>
        <span>›</span>
        <span>{s.name}</span>
      </div>

      {/* Profile Header */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: `linear-gradient(135deg, ${riskBg}40, ${riskBg}20)`,
            border: `2px solid ${riskBg}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: 'white',
          }}>{s.name.charAt(0)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{s.name}</h2>
              <span className={`badge ${s.riskLevel === 'High' ? 'badge-red' : s.riskLevel === 'Medium' ? 'badge-orange' : 'badge-green'}`}>
                {s.riskLevel} Risk
              </span>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{s.rollNo}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📚 {s.department}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📅 Year {s.year}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><MdEmail size={12} />{s.email}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><MdPhone size={12} />{s.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Current CGPA', value: s.cgpa.toFixed(1), sub: `Prev: ${s.prevGpa}`, color: s.cgpa >= 8 ? '#10b981' : s.cgpa >= 6.5 ? '#f59e0b' : '#ef4444' },
          { label: 'Attendance', value: `${s.attendance}%`, sub: `${s.consecutiveAbsences} consec. absences`, color: s.attendance >= 75 ? '#10b981' : '#ef4444' },
          { label: 'Backlogs', value: s.backlogs, sub: s.backlogs === 0 ? 'All clear ✓' : 'Needs attention', color: s.backlogs === 0 ? '#10b981' : '#ef4444' },
          { label: 'Assignments', value: `${s.assignments.percentage}%`, sub: `${s.assignments.submitted}/${s.assignments.total} submitted`, color: s.assignments.percentage >= 80 ? '#10b981' : s.assignments.percentage >= 60 ? '#f59e0b' : '#ef4444' },
        ].map(m => (
          <div className="glass-card" key={m.label} style={{ padding: 18 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Risk Indicators */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div className="section-title">Risk Analysis</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          {[
            { label: 'CGPA Risk', val: s.risk.cgpa },
            { label: 'Backlog Risk', val: s.risk.backlog },
            { label: 'Attendance Risk', val: s.risk.attendance },
            { label: 'Assignment Risk', val: s.risk.assignment },
            { label: 'Overall Risk', val: s.risk.overall },
          ].map(r => <RiskRing key={r.label} value={r.val} label={r.label} color={getRiskColor(r.val)} />)}
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title">📈 GPA Progress</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={gpaData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="sem" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} domain={[4, 10]} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="gpa" name="GPA" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title">📅 Attendance History</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} domain={[40, 100]} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Attendance %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Radar + Exam Scores */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title">🎯 Risk Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar name="Risk" dataKey="A" stroke={getRiskColor(s.risk.overall)} fill={getRiskColor(s.risk.overall)} fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title">📝 Exam Scores</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={s.examScores} layout="vertical">
              <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4a5568', fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <YAxis dataKey="subject" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="marks" name="Marks" radius={[0, 4, 4, 0]}
                fill={s.riskLevel === 'High' ? '#ef4444' : s.riskLevel === 'Medium' ? '#f59e0b' : '#10b981'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leave History */}
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="chart-title" style={{ marginBottom: 0 }}>📋 Leave History</div>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {s.leaveHistory.map((l, i) => (
                <tr key={i} style={{ cursor: 'default' }}>
                  <td><span className="badge badge-blue">{l.type}</span></td>
                  <td>{l.from}</td>
                  <td>{l.to}</td>
                  <td>{l.days} day{l.days > 1 ? 's' : ''}</td>
                  <td>
                    <span className={`badge ${l.status === 'Approved' ? 'badge-green' : l.status === 'Pending' ? 'badge-orange' : 'badge-red'}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Awards */}
      {s.awards.length > 0 && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="section-title">🏆 Awards & Recognition</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {s.awards.map((a, i) => (
              <span key={i} className="badge badge-purple" style={{ fontSize: 12, padding: '5px 12px' }}>🏅 {a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
