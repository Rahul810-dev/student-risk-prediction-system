import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { MdSchool, MdEventNote, MdAssignment, MdWarning, MdApartment, MdBarChart, MdDownload, MdPrint, MdDescription } from 'react-icons/md';

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

function downloadCSV(filename, headers, rows) {
  const escape = v => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(row => row.map(v => escape(v ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printReport() { window.print(); }

export default function Reports() {
  const [students, setStudents] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDownloadDept, setSelectedDownloadDept] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/students/all`).then(r => r.json()),
      fetch(`${API}/admin/departments`).then(r => r.json()),
      fetch(`${API}/admin/leaves/pending-count`).then(r => r.json()),
    ]).then(([studentsData, deptData, leavesData]) => {
      const s = Array.isArray(studentsData) ? studentsData : [];
      const d = Array.isArray(deptData) ? deptData : [];
      setStudents(s);
      setDeptStats(d);
      setPendingLeaves(leavesData.pending_count || 0);
      setSelectedDownloadDept(d[0]?.department || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading reports...</div>;

  const avgCgpa = students.length ? (students.reduce((a, s) => a + s.cgpa_current, 0) / students.length).toFixed(2) : '0.00';
  const avgAtt = students.length ? Math.round(students.reduce((a, s) => a + s.attendance_percent, 0) / students.length) : 0;
  const totalBacklogs = students.reduce((a, s) => a + s.backlogs, 0);
  const highRiskCount = students.filter(s => s.overall_risk_probability >= 0.6).length;

  const riskDist = [
    { name: 'High Risk', value: highRiskCount, color: '#ef4444' },
    { name: 'Medium Risk', value: students.filter(s => s.overall_risk_probability >= 0.3 && s.overall_risk_probability < 0.6).length, color: '#f59e0b' },
    { name: 'Low Risk', value: students.filter(s => s.overall_risk_probability < 0.3).length, color: '#10b981' },
  ];

  const reportRows = [
    { category: 'Total Enrolled Students', value: students.length, status: 'Current', color: '#6366f1' },
    { category: 'Students with CGPA ≥ 8.0', value: students.filter(s => s.cgpa_current >= 8).length, status: 'Excellent', color: '#10b981' },
    { category: 'Students with CGPA 6.5–8.0', value: students.filter(s => s.cgpa_current >= 6.5 && s.cgpa_current < 8).length, status: 'Good', color: '#3b82f6' },
    { category: 'Students with CGPA < 6.5', value: students.filter(s => s.cgpa_current < 6.5).length, status: 'At Risk', color: '#ef4444' },
    { category: 'Students with Backlogs', value: students.filter(s => s.backlogs > 0).length, status: 'Attention', color: '#f59e0b' },
    { category: 'Students Below 75% Attendance', value: students.filter(s => s.attendance_percent < 75).length, status: 'Critical', color: '#ef4444' },
    { category: 'High Risk Students', value: highRiskCount, status: 'Action Needed', color: '#ef4444' },
    { category: 'Pending Leave Requests', value: pendingLeaves, status: 'Pending', color: '#f59e0b' },
  ];

  function downloadStudentReport() {
    const headers = ['Student ID', 'Name', 'Department', 'Section', 'Year', 'Semester', 'Current CGPA', 'Previous GPA', 'Backlogs', 'Attendance Percent', 'Consecutive Absences', 'CGPA Risk %', 'Backlog Risk %', 'Attendance Risk %', 'Assignment Risk %', 'Overall Risk %'];
    const rows = students.map(s => [
      s.student_id, s.student_name, s.department, s.section, s.year, s.semester,
      s.cgpa_current, s.gpa_previous, s.backlogs, s.attendance_percent, s.consecutive_absences,
      Math.round(s.cgpa_risk_probability * 100), Math.round(s.backlog_risk_probability * 100),
      Math.round(s.attendance_risk_probability * 100), Math.round(s.assignment_risk_probability * 100),
      Math.round(s.overall_risk_probability * 100)
    ]);
    downloadCSV('student_full_report.csv', headers, rows);
  }

  function downloadSummaryReport() {
    const headers = ['Report Category', 'Count / Value', '% of Total', 'Status'];
    const rows = reportRows.map(r => [
      r.category, r.value,
      typeof r.value === 'number' && r.value <= students.length ? `${((r.value / students.length) * 100).toFixed(0)}%` : '—',
      r.status
    ]);
    downloadCSV('summary_report.csv', headers, rows);
  }

  function downloadAttendanceReport() {
    const headers = ['Student ID', 'Name', 'Department', 'Year', 'Attendance %', 'Consecutive Absences', 'Status'];
    const rows = students.map(s => [
      s.student_id, s.student_name, s.department, s.year, s.attendance_percent, s.consecutive_absences,
      s.attendance_percent < 75 ? 'Critical' : s.attendance_percent < 85 ? 'Low' : 'Good'
    ]);
    downloadCSV('attendance_report.csv', headers, rows);
  }

  function downloadDepartmentReport(deptName) {
    const deptStudents = students.filter(s => s.department === deptName);
    const headers = ['Student ID', 'Name', 'Department', 'Year', 'CGPA', 'Backlogs', 'Attendance %', 'Overall Risk %'];
    const rows = deptStudents.map(s => [s.student_id, s.student_name, s.department, s.year, s.cgpa_current, s.backlogs, s.attendance_percent, Math.round(s.overall_risk_probability * 100)]);
    downloadCSV(`${deptName.replace(/\s+/g, '_')}_Report.csv`, headers, rows);
  }

  function downloadOverallExcelReport() {
    const wb = XLSX.utils.book_new();
    const depts = Array.from(new Set(students.map(s => s.department)));
    depts.forEach(dept => {
      const deptStudents = students.filter(s => s.department === dept);
      const data = deptStudents.map(s => ({
        'Student ID': s.student_id, 'Name': s.student_name, 'Department': s.department, 'Year': s.year,
        'CGPA': s.cgpa_current, 'Backlogs': s.backlogs, 'Attendance %': s.attendance_percent,
        'Overall Risk %': Math.round(s.overall_risk_probability * 100)
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, dept.substring(0, 31));
    });
    XLSX.writeFile(wb, 'Overall_College_Performance_Report.xlsx');
  }

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Comprehensive academic and administrative reports · Live data</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Institution Avg CGPA', value: avgCgpa, icon: <MdSchool />, color: '#6366f1' },
          { label: 'Institution Avg Attendance', value: `${avgAtt}%`, icon: <MdEventNote />, color: '#06b6d4' },
          { label: 'Total Backlogs', value: totalBacklogs, icon: <MdAssignment />, color: '#ef4444' },
          { label: 'High Risk Students', value: highRiskCount, icon: <MdWarning />, color: '#f59e0b' },
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
          <div className="chart-title"><MdApartment style={{ marginRight: 6, verticalAlign: 'middle' }} />Students per Department</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptStats} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="department" tick={{ fill: '#4a5568', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total_students" name="Students" radius={[6, 6, 0, 0]}>
                {deptStats.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title"><MdBarChart style={{ marginRight: 6, verticalAlign: 'middle' }} />Risk Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={riskDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {riskDist.map((r, i) => <Cell key={i} fill={r.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} formatter={v => <span style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="section-title"><MdDownload style={{ marginRight: 6, verticalAlign: 'middle' }} />Download Reports</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Export departmental data as CSV or generate a comprehensive institutional Excel report — pulled live from the database.
        </p>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Department</label>
            <select value={selectedDownloadDept} onChange={(e) => setSelectedDownloadDept(e.target.value)} className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: 13, minWidth: 200, textAlign: 'left' }}>
              {deptStats.map(d => <option key={d.department} value={d.department}>{d.department}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => downloadDepartmentReport(selectedDownloadDept)} style={{ fontSize: 13 }}>
            <MdDownload style={{ verticalAlign: 'middle', marginRight: 4 }} />Download Dept Report (.csv)
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Overall College Report (.xlsx)', action: downloadOverallExcelReport, style: 'primary', icon: <MdBarChart /> },
            { label: 'Full Student Data (.csv)', action: downloadStudentReport, style: 'secondary', icon: <MdDescription /> },
            { label: 'Summary Report (.csv)', action: downloadSummaryReport, style: 'secondary', icon: <MdAssignment /> },
            { label: 'Attendance Report (.csv)', action: downloadAttendanceReport, style: 'secondary', icon: <MdEventNote /> },
            { label: 'Print / Save as PDF', action: printReport, style: 'secondary', icon: <MdPrint /> },
          ].map(btn => (
            <button key={btn.label} className={`btn btn-${btn.style}`} onClick={btn.action} style={{ fontSize: 13 }}>
              {btn.icon} <span style={{ marginLeft: 6 }}>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div className="chart-title" style={{ marginBottom: 0 }}><MdAssignment style={{ marginRight: 6, verticalAlign: 'middle' }} />Institutional Summary Report</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={downloadSummaryReport}><MdDownload style={{ verticalAlign: 'middle' }} /> Export CSV</button>
            <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={printReport}><MdPrint style={{ verticalAlign: 'middle' }} /> Print / PDF</button>
          </div>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead><tr><th>Report Category</th><th>Count / Value</th><th>% of Total</th><th>Status</th></tr></thead>
            <tbody>
              {reportRows.map((r, i) => (
                <tr key={i} style={{ cursor: 'default' }}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.category}</td>
                  <td style={{ fontWeight: 800, color: r.color, fontSize: 16 }}>{r.value}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {typeof r.value === 'number' && r.value <= students.length ? `${((r.value / students.length) * 100).toFixed(0)}%` : '—'}
                  </td>
                  <td>
                    <span className={`badge ${
                      r.status === 'Excellent' ? 'badge-green' :
                      r.status === 'Good' ? 'badge-blue' :
                      r.status === 'Current' ? 'badge-purple' :
                      r.status === 'Action Needed' || r.status === 'Critical' ? 'badge-red' : 'badge-orange'
                    }`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
          Report generated live · Data source: PostgreSQL via FastAPI
        </div>
      </div>
    </div>
  );
}