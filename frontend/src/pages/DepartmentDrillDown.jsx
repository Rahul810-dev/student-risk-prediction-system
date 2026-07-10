import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildHierarchy, students } from '../data/students';
import { MdChevronRight, MdExpandMore, MdSearch, MdDownload, MdArrowBack, MdPerson, MdCalendarToday, MdSchool, MdFilterList } from 'react-icons/md';

const DEPT_META = {
  'Computer Science':       { icon: '💻', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  'Electronics':            { icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  'Mechanical':             { icon: '⚙️', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  'Civil':                  { icon: '🏗️', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)'  },
  'Information Technology': { icon: '🖥️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
};

function attBadge(pct) {
  if (pct >= 85) return { cls: 'badge-green',  label: `${pct}%` };
  if (pct >= 75) return { cls: 'badge-orange', label: `${pct}%` };
  return             { cls: 'badge-red',    label: `${pct}%` };
}

function riskBadge(level) {
  if (level === 'High')   return 'badge-red';
  if (level === 'Medium') return 'badge-orange';
  return 'badge-green';
}

function exportCSV(mentorName, rows) {
  const header = 'Name,Roll No,Attendance %,CGPA,Backlogs,Risk Level,Leave Records';
  const lines = rows.map(s =>
    `"${s.name}","${s.rollNo}",${s.attendance},${s.cgpa},${s.backlogs},"${s.riskLevel}",${s.leaveHistory.length}`
  );
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${mentorName.replace(/\s/g,'_')}_students.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Student Row ── */
function StudentRow({ s }) {
  const att = attBadge(s.attendance);
  const leaves = s.leaveHistory.length;
  const pendingLeaves = s.leaveHistory.filter(l => l.status === 'Pending').length;
  return (
    <tr className="drill-student-row">
      <td>
        <div className="drill-student-name-cell">
          <div className="drill-avatar">{s.name.charAt(0)}</div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
          </div>
        </div>
      </td>
      <td><span className="badge badge-blue">{s.rollNo}</span></td>
      <td><span className={`badge ${att.cls}`}>{att.label}</span></td>
      <td>
        <span style={{ fontWeight: 700, color: s.cgpa >= 8 ? '#10b981' : s.cgpa >= 6 ? '#f59e0b' : '#ef4444' }}>
          {s.cgpa}
        </span>
      </td>
      <td>
        <span className={`badge ${s.backlogs > 0 ? 'badge-red' : 'badge-green'}`}>
          {s.backlogs > 0 ? `${s.backlogs} backlogs` : 'Clear'}
        </span>
      </td>
      <td><span className={`badge ${riskBadge(s.riskLevel)}`}>{s.riskLevel}</span></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="badge badge-gray">{leaves} total</span>
          {pendingLeaves > 0 && <span className="badge badge-orange">{pendingLeaves} pending</span>}
        </div>
      </td>
    </tr>
  );
}

/* ── Mentor Section ── */
function MentorSection({ mentorName, mentorStudents, search, riskFilter, attFilter }) {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => mentorStudents.filter(s => {
    const q = search.toLowerCase();
    const matchQ = s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
    const matchRisk = riskFilter === 'All' || s.riskLevel === riskFilter;
    const matchAtt = attFilter === 'All'
      ? true : attFilter === 'low' ? s.attendance < 75
      : attFilter === 'medium' ? (s.attendance >= 75 && s.attendance < 85) : s.attendance >= 85;
    return matchQ && matchRisk && matchAtt;
  }), [mentorStudents, search, riskFilter, attFilter]);

  const highRisk = mentorStudents.filter(s => s.riskLevel === 'High').length;
  const avgAtt = Math.round(mentorStudents.reduce((a, s) => a + s.attendance, 0) / mentorStudents.length);

  return (
    <div className="drill-mentor-block">
      <div className="drill-mentor-header" onClick={() => setOpen(o => !o)}>
        <div className="drill-mentor-left">
          <div className="drill-mentor-icon"><MdPerson /></div>
          <div>
            <div className="drill-mentor-name">{mentorName}</div>
            <div className="drill-mentor-meta">
              {mentorStudents.length} students &nbsp;·&nbsp; Avg Att: {avgAtt}%
              {highRisk > 0 && <span className="badge badge-red" style={{ marginLeft: 8 }}>{highRisk} high risk</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="drill-export-btn" onClick={e => { e.stopPropagation(); exportCSV(mentorName, mentorStudents); }}>
            <MdDownload size={13} /> Export CSV
          </button>
          <span className="drill-chevron" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            <MdChevronRight size={20} />
          </span>
        </div>
      </div>

      {open && (
        <div className="drill-mentor-body">
          {filtered.length === 0
            ? <div className="drill-empty">No students match current filters.</div>
            : (
              <div className="table-container">
                <table className="data-table drill-student-table">
                  <thead>
                    <tr>
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
                    {filtered.map(s => <StudentRow key={s.id} s={s} />)}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

/* ── Year Section ── */
function YearSection({ year, mentorsMap, search, riskFilter, attFilter }) {
  const [open, setOpen] = useState(false);
  const totalStudents = Object.values(mentorsMap).flat().length;

  return (
    <div className="drill-year-block">
      <div className="drill-year-header" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="drill-year-icon"><MdCalendarToday /></div>
          <div>
            <div className="drill-year-label">Academic Year {year}</div>
            <div className="drill-year-meta">{Object.keys(mentorsMap).length} mentors · {totalStudents} students</div>
          </div>
        </div>
        <span className="drill-chevron" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <MdChevronRight size={20} />
        </span>
      </div>

      {open && (
        <div className="drill-year-body">
          {Object.entries(mentorsMap).map(([mentor, studs]) => (
            <MentorSection
              key={mentor}
              mentorName={mentor}
              mentorStudents={studs}
              search={search}
              riskFilter={riskFilter}
              attFilter={attFilter}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function DepartmentDrillDown() {
  const { deptName } = useParams();
  const navigate = useNavigate();
  const dept = decodeURIComponent(deptName || '');
  const meta = DEPT_META[dept] || { icon: '🏫', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' };

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [attFilter, setAttFilter] = useState('All');

  const hierarchy = useMemo(() => buildHierarchy(dept), [dept]);
  const deptStudents = useMemo(() => students.filter(s => s.department === dept), [dept]);

  const totalStudents = deptStudents.length;
  const avgGpa = deptStudents.length ? (deptStudents.reduce((a, s) => a + s.cgpa, 0) / deptStudents.length).toFixed(2) : 0;
  const avgAtt = deptStudents.length ? Math.round(deptStudents.reduce((a, s) => a + s.attendance, 0) / deptStudents.length) : 0;
  const highRiskCount = deptStudents.filter(s => s.riskLevel === 'High').length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button className="drill-back-btn" onClick={() => navigate('/dashboard')}>
            <MdArrowBack /> Back to Dashboard
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="drill-dept-icon" style={{ background: meta.bg, color: meta.color }}>
            {meta.icon}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{dept}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Department · Academic Hierarchy View
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: totalStudents, color: meta.color, bg: meta.bg, icon: '👥' },
          { label: 'Avg CGPA',       value: avgGpa,         color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: '🎓' },
          { label: 'Avg Attendance', value: `${avgAtt}%`,   color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', icon: '📅' },
          { label: 'High Risk',      value: highRiskCount,  color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: '⚠️' },
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

      {/* Search & Filters */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
        <div className="filter-row">
          <div className="search-bar" style={{ width: 280 }}>
            <MdSearch style={{ color: 'var(--text-muted)', fontSize: 17 }} />
            <input
              placeholder="Search student name or roll number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
            <option value="low">Below 75% (Critical)</option>
            <option value="medium">75–85% (Warning)</option>
            <option value="high">Above 85% (Good)</option>
          </select>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <span className="badge badge-red" style={{ fontSize: 11 }}>🔴 &lt;75% Critical</span>
            <span className="badge badge-orange" style={{ fontSize: 11 }}>🟠 75–85% Warning</span>
            <span className="badge badge-green" style={{ fontSize: 11 }}>🟢 ≥85% Good</span>
          </div>
        </div>
      </div>

      {/* Hierarchy Drill-Down */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div className="section-title">
          <MdSchool style={{ color: meta.color }} />
          Department Hierarchy — Year → Mentor → Students
        </div>

        {Object.keys(hierarchy).length === 0
          ? <div className="drill-empty">No student data found for this department.</div>
          : Object.entries(hierarchy).map(([year, mentorsMap]) => (
            <YearSection
              key={year}
              year={year}
              mentorsMap={mentorsMap}
              search={search}
              riskFilter={riskFilter}
              attFilter={attFilter}
            />
          ))
        }
      </div>
    </div>
  );
}
